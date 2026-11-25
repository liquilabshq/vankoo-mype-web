import {Banknote, FileText, FileUp, HandCoins} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {useInvestmentStore} from '../../../investment/application/investment.store';
import {useInvoicingStore} from '../../../invoicing/application/invoicing.store';
import {formatInvoiceAmount} from '../../../invoicing/domain/model/invoice.entity';
import {InvoiceRow} from '../../../invoicing/presentation/components/InvoiceRow';
import {InvoiceTableHeader} from '../../../invoicing/presentation/components/InvoiceTableHeader';
import {InvoicingErrorAlert} from '../../../invoicing/presentation/components/InvoicingErrorAlert';
import {KycGateAlert} from '../../../invoicing/presentation/components/KycGate';
import {invoicingPaths} from '../../../invoicing/presentation/invoicing-paths';
import {useCanUploadInvoices} from '../../../invoicing/presentation/use-can-upload-invoices';
import {useProfileStore} from '../../../profile/application/profile.store';
import {EmptyState} from '../components/EmptyState';
import {LoadingSkeleton} from '../components/LoadingSkeleton';
import {AttentionList} from '../home/AttentionList';
import {summarizeHome, type HomeBucket} from '../home/home-overview';
import {InvoicesByMonthChart} from '../home/InvoicesByMonthChart';
import {KpiTile} from '../home/KpiTile';

/** A total per currency, soles first; «S/ 0.00» when there is nothing yet. */
function formatTotals(totals: readonly {value: number; currency: string}[]): string {
    if (totals.length === 0) return formatInvoiceAmount({value: 0, currency: 'PEN'});
    return totals.map(formatInvoiceAmount).join(' · ');
}

/** The swatch beside each count, the same fill as its segment of the chart. */
const SWATCH_BY_BUCKET: Record<HomeBucket, string> = {
    inReview: 'bg-[var(--vk-indigo-700)] dark:bg-[var(--vk-indigo-400)]',
    inAuction: 'bg-[var(--vk-navy-500)] dark:bg-[var(--vk-navy-600)]',
    funded: 'bg-[var(--vk-green-600)]',
    notEligible: 'bg-[var(--vk-red-600)] dark:bg-[var(--vk-red-500)]'
};

/** Stand-ins as tall as the real blocks, so nothing jumps when the figures arrive. */
function HomeSkeleton() {
    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
                {Array.from({length: 5}, (_, index) => (
                    <Skeleton key={index} className={index === 0 ? 'col-span-2 h-[116px] rounded-xl xl:col-span-1' : 'h-[116px] rounded-xl'} />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <Skeleton className="h-[360px] rounded-xl lg:col-span-2" />
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-[116px] rounded-xl" />
                    <Skeleton className="h-[116px] rounded-xl" />
                </div>
            </div>
            <Skeleton className="h-[240px] rounded-xl" />
        </>
    );
}

/**
 * Where a signed-in MYPE lands: her invoices in figures, by month, and what waits on her.
 *
 * Follows the design's home (`MK · Inicio`) — the greeting, «Necesitan tu atención» and
 * the latest invoices with «Ver todas» — and adds what the course asked of a dashboard:
 * one count per bucket, the amounts submitted and funded, and a chart. Two parts of the
 * design are left out on purpose: the featured invoice card, which repeats the detail
 * screen, and the `MoneyPanel`, which belongs to the wallet.
 *
 * There is no summary endpoint: the figures are counted here from every invoice of the
 * MYPE (Invoicing, read a hundred at a time) and every auction she owns (Investment, one
 * call), read together the same way the list and the detail do.
 */
export function Home() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const businessName = useProfileStore(state => state.company?.businessName ?? null);
    const invoices = useInvoicingStore(state => state.overviewInvoices);
    const errors = useInvoicingStore(state => state.errors);
    const loadInvoiceOverview = useInvoicingStore(state => state.loadInvoiceOverview);
    const auctionsByInvoice = useInvestmentStore(state => state.auctionsByInvoice);
    const loadMyAuctions = useInvestmentStore(state => state.loadMyAuctions);
    const canUpload = useCanUploadInvoices();
    const [ready, setReady] = useState(false);

    // Both reads, every visit: the figures are only worth showing once they agree.
    useEffect(() => {
        let cancelled = false;
        void Promise.all([loadInvoiceOverview(), loadMyAuctions()]).then(() => {
            if (!cancelled) setReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [loadInvoiceOverview, loadMyAuctions]);

    const overview = useMemo(() => summarizeHome(invoices, auctionsByInvoice), [invoices, auctionsByInvoice]);
    const thisMonth = overview.months.at(-1)?.total ?? 0;
    const needingAction = overview.needingAction.length;

    const uploadButton = (
        <Button type="button" onClick={() => navigate(invoicingPaths.uploadInvoice())} disabled={!canUpload}>
            <FileUp data-icon="inline-start" />
            {t('invoicing.myInvoices.uploadInvoice')}
        </Button>
    );

    return (
        <div className="flex w-full flex-col gap-6 sm:gap-8">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-h1 text-fg min-w-0 font-bold">
                    {businessName ? t('home.greeting', {name: businessName}) : t('home.title')}
                </h1>
                {ready && overview.total > 0 && <div className="hidden shrink-0 sm:block">{uploadButton}</div>}
            </div>

            {!canUpload && <KycGateAlert />}
            <InvoicingErrorAlert errors={errors} />

            {!ready ? (
                <LoadingSkeleton label={t('home.loading')}>
                    <HomeSkeleton />
                </LoadingSkeleton>
            ) : overview.total === 0 && errors.length > 0 ? null : overview.total === 0 ? (
                // A failed read is not an empty account: the alert above says what failed.
                <div className="bg-surface-raised border-border-subtle shadow-elevation-1 rounded-xl border">
                    <EmptyState
                        icon={FileText}
                        title={t('invoicing.myInvoices.empty.title')}
                        description={t('invoicing.myInvoices.empty.description')}
                        action={uploadButton}
                    />
                </div>
            ) : (
                <>
                    <section aria-label={t('home.kpis.label')} className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
                        <KpiTile
                            className="col-span-2 xl:col-span-1"
                            icon={FileText}
                            label={t('home.kpis.total')}
                            value={overview.total}
                            caption={t('home.kpis.totalCaption', {count: thisMonth})}
                        />
                        <KpiTile
                            swatchClassName={SWATCH_BY_BUCKET.inReview}
                            label={t('home.kpis.inReview')}
                            value={overview.counts.inReview}
                            caption={
                                <span className={needingAction > 0 ? 'text-status-requires-review font-semibold' : undefined}>
                                    {t('home.kpis.inReviewCaption', {count: needingAction})}
                                </span>
                            }
                        />
                        <KpiTile
                            swatchClassName={SWATCH_BY_BUCKET.inAuction}
                            label={t('home.kpis.inAuction')}
                            value={overview.counts.inAuction}
                            caption={t('home.kpis.inAuctionCaption')}
                        />
                        <KpiTile
                            swatchClassName={SWATCH_BY_BUCKET.funded}
                            label={t('home.kpis.funded')}
                            value={overview.counts.funded}
                            caption={t('home.kpis.fundedCaption')}
                        />
                        <KpiTile
                            swatchClassName={SWATCH_BY_BUCKET.notEligible}
                            label={t('home.kpis.notEligible')}
                            value={overview.counts.notEligible}
                            caption={t('home.kpis.notEligibleCaption')}
                        />
                    </section>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="bg-surface-raised border-border-subtle shadow-elevation-1 flex min-w-0 flex-col gap-1 rounded-xl border p-4 sm:p-6 lg:col-span-2">
                            <h2 className="text-h3 text-fg font-semibold">{t('home.chart.title')}</h2>
                            <p className="text-caption text-fg-secondary mb-2">{t('home.chart.description')}</p>
                            <InvoicesByMonthChart months={overview.months} />
                        </section>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
                            <KpiTile
                                icon={Banknote}
                                label={t('home.kpis.submitted')}
                                value={formatTotals(overview.submitted)}
                                caption={t('home.kpis.submittedCaption')}
                            />
                            <KpiTile
                                highlighted
                                icon={HandCoins}
                                label={t('home.kpis.fundedAmount')}
                                value={formatTotals(overview.funded)}
                                caption={t('home.kpis.fundedAmountCaption')}
                            />
                        </div>
                    </div>

                    {needingAction > 0 && (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-h3 text-fg font-semibold">{t('home.attention.title')}</h2>
                            <AttentionList entries={overview.needingAction} />
                        </section>
                    )}

                    <section className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-h3 text-fg font-semibold">
                                {needingAction > 0 ? t('home.recent.titleOthers') : t('home.recent.title')}
                            </h2>
                            <Link to={invoicingPaths.myInvoices()} className="text-body text-fg-link font-semibold hover:underline">
                                {t('home.recent.viewAll')}
                            </Link>
                        </div>
                        <div className="bg-surface-raised border-border-subtle shadow-elevation-1 overflow-hidden rounded-xl border">
                            {overview.recent.length === 0 ? (
                                <p className="text-caption text-fg-secondary px-4 py-8 text-center">{t('home.recent.none')}</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className="sm:min-w-[1000px]">
                                        <InvoiceTableHeader />
                                        {overview.recent.map(({invoice, auction}) => (
                                            <InvoiceRow key={invoice.id} invoice={invoice} auction={auction} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
