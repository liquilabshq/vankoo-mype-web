import type {Auction} from '../../../investment/domain/model/auction.entity';
import type {InvoiceStatus} from '../../../invoicing/domain/model/invoice-status';
import type {Invoice, InvoiceAmount} from '../../../invoicing/domain/model/invoice.entity';
import {progressFor} from '../../../invoicing/presentation/rail-caption';

/**
 * Where an invoice stands, as the home counts it. Four buckets with no overlap, so they
 * add up to every invoice uploaded:
 *
 * - `inReview` — not out to investors yet: being read, validated, waiting on the MYPE
 *   to fix its data or to accept an offer;
 * - `inAuction` — published, investors still filling it;
 * - `funded` — the investors covered the whole target;
 * - `notEligible` — a dead end, whether Invoicing or the risk evaluation decided it.
 */
export type HomeBucket = 'inReview' | 'inAuction' | 'funded' | 'notEligible';

/** The buckets in pipeline order, which is also the chart's stacking order, bottom up. */
export const HOME_BUCKETS: readonly HomeBucket[] = ['funded', 'inAuction', 'inReview', 'notEligible'];

/**
 * What the MYPE has to do for the invoice to move on, if anything.
 *
 * `review` — the read data needs her confirmation (`REQUIRES_REVIEW`); `acceptQuote` —
 * the risk evaluation passed and the offer waits for her (auction `DRAFT`).
 */
export type HomeAction = 'review' | 'acceptQuote';

/** One invoice read together with its auction, as every part of the home shows it. */
export interface HomeInvoice {
    invoice: Invoice;
    auction: Auction | null;
    /** The status to pill: the auction's word once there is one, as in the list. */
    status: InvoiceStatus;
    bucket: HomeBucket;
    action: HomeAction | null;
}

/** Invoices uploaded in one calendar month, by bucket. */
export interface HomeMonth {
    /** `YYYY-MM`, in local time. */
    key: string;
    /** The first day of the month at local midnight, to word it. */
    start: Date;
    counts: Record<HomeBucket, number>;
    total: number;
}

/** Everything the home shows, computed once from the two reads. */
export interface HomeOverview {
    total: number;
    counts: Record<HomeBucket, number>;
    /** Invoices waiting on the MYPE, newest first. */
    needingAction: HomeInvoice[];
    /** The newest invoices that are not waiting on her, at most `recentLimit`. */
    recent: HomeInvoice[];
    /** What the invoices read so far add up to, one entry per currency, soles first. */
    submitted: InvoiceAmount[];
    /** What investors have put in across every auction, one entry per currency, soles first. */
    funded: InvoiceAmount[];
    /** The last `monthCount` months, oldest first, including the current one. */
    months: HomeMonth[];
}

export interface HomeOverviewOptions {
    now?: Date;
    monthCount?: number;
    recentLimit?: number;
}

function emptyCounts(): Record<HomeBucket, number> {
    return {inReview: 0, inAuction: 0, funded: 0, notEligible: 0};
}

function monthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Sums amounts per currency, soles first and the rest alphabetically. */
function totalsByCurrency(amounts: readonly InvoiceAmount[]): InvoiceAmount[] {
    const byCurrency = new Map<string, number>();
    for (const {value, currency} of amounts) byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + value);
    return [...byCurrency.entries()]
        .map(([currency, value]) => ({currency, value: Math.round(value * 100) / 100}))
        .sort((a, b) => (a.currency === 'PEN' ? -1 : b.currency === 'PEN' ? 1 : a.currency.localeCompare(b.currency)));
}

/**
 * Places one invoice in its bucket and says what it waits on.
 *
 * Reads the status the same way the list and the detail do (`progressFor`), so the home
 * never contradicts the screen a row opens. The one thing it adds is `funded`, which the
 * rail folds into «En subasta» and only the auction knows.
 */
export function readHomeInvoice(invoice: Invoice, auction: Auction | null): HomeInvoice {
    const {status} = progressFor(invoice, auction);
    const bucket: HomeBucket = auction?.isFullyFunded()
        ? 'funded'
        : status === 'PUBLISHED'
          ? 'inAuction'
          : status === 'NOT_ELIGIBLE' || status === 'REJECTED'
            ? 'notEligible'
            : 'inReview';
    const action: HomeAction | null =
        status === 'REQUIRES_REVIEW' ? 'review' : auction?.canBeQuoted() ? 'acceptQuote' : null;
    return {invoice, auction, status, bucket, action};
}

/**
 * The home's figures, from every invoice of the MYPE and every auction she owns.
 *
 * Invoices are expected newest first, as `GET /invoices` answers them. The funded
 * amount counts every auction, also those whose invoice fell outside what was read:
 * the money is hers either way.
 */
export function summarizeHome(
    invoices: readonly Invoice[],
    auctionsByInvoice: ReadonlyMap<string, Auction>,
    {now = new Date(), monthCount = 6, recentLimit = 5}: HomeOverviewOptions = {}
): HomeOverview {
    const read = invoices.map(invoice => readHomeInvoice(invoice, auctionsByInvoice.get(invoice.id) ?? null));

    const counts = emptyCounts();
    for (const {bucket} of read) counts[bucket]++;

    const months: HomeMonth[] = Array.from({length: monthCount}, (_, index) => {
        const start = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1);
        return {key: monthKey(start), start, counts: emptyCounts(), total: 0};
    });
    const monthByKey = new Map(months.map(month => [month.key, month]));
    for (const {invoice, bucket} of read) {
        const month = monthByKey.get(monthKey(invoice.uploadedAt));
        if (!month) continue;
        month.counts[bucket]++;
        month.total++;
    }

    return {
        total: read.length,
        counts,
        needingAction: read.filter(entry => entry.action !== null),
        recent: read.filter(entry => entry.action === null).slice(0, recentLimit),
        submitted: totalsByCurrency(read.flatMap(({invoice}) => (invoice.amount ? [invoice.amount] : []))),
        funded: totalsByCurrency(
            [...auctionsByInvoice.values()].map(auction => auction.currentFunding).filter(amount => amount.value > 0)
        ),
        months
    };
}
