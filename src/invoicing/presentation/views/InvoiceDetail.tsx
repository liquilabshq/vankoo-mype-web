import {ChevronLeft} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {buttonVariants} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {cn} from '@/lib/utils';
import {useInvestmentStore} from '../../../investment/application/investment.store';
import {AcceptQuoteDialog} from '../../../investment/presentation/components/AcceptQuoteDialog';
import {AuctionRejectionAlert} from '../../../investment/presentation/components/AuctionRejectionAlert';
import {InvestmentErrorAlert} from '../../../investment/presentation/components/InvestmentErrorAlert';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';
import {LoadingSkeleton} from '../../../shared/presentation/components/LoadingSkeleton';
import {useInvoicingStore} from '../../application/invoicing.store';
import {isInvoiceInProgress} from '../../domain/model/invoice-status';
import {FactField} from '../components/FactField';
import {InvoiceLineItemsTable} from '../components/InvoiceLineItemsTable';
import {InvoiceRail} from '../components/InvoiceRail';
import {RailStepSummary, type RailStepPhase} from '../components/RailStepSummary';
import {ReviewConfirmationCard} from '../components/ReviewConfirmationCard';
import {SettlementPanel} from '../components/SettlementPanel';
import {StatusPill} from '../components/StatusPill';
import {invoicingPaths} from '../invoicing-paths';
import {issueReasonFor} from '../issue-copy';
import {isAwaitingAuction, progressFor, RAIL_MILESTONES, railCaptionKey} from '../rail-caption';

/**
 * A calendar date in the reader's language, or null when there is none to show.
 *
 * `Intl.DateTimeFormat.format` throws on an invalid date, and an invoice the OCR has
 * not read yet has no dates at all — so the null has to stop here, not in the view.
 */
function formatLongDate(date: Date | null, language: string): string | null {
    return date ? new Intl.DateTimeFormat(language, {dateStyle: 'long'}).format(date) : null;
}

/**
 * How often, and for how long, the detail follows an invoice that is still moving on
 * its own: Invoicing while Azure reads it, Investment while risk evaluates it. The
 * read takes about fifteen seconds and the evaluation up to a minute and a bit when it
 * searches the news, so two minutes covers both with room to spare; after that,
 * reopening the page asks again.
 */
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 60;

/** Stand-in for the header, rail and facts while the invoice loads. */
function InvoiceDetailSkeleton({label}: {label: string}) {
    return (
        <LoadingSkeleton label={label}>
            <div className="flex flex-col gap-2">
                <Skeleton className="bg-surface-raised h-9 w-40" />
                <Skeleton className="bg-surface-raised h-5 w-72 max-w-full" />
            </div>
            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 grid gap-6 rounded-xl border p-6 sm:grid-cols-2">
                {Array.from({length: 6}, (_, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-48 max-w-full" />
                    </div>
                ))}
            </div>
        </LoadingSkeleton>
    );
}

/** Routed view with everything the platform knows about one invoice. */
export function InvoiceDetail() {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const {id} = useParams<{id: string}>();

    const invoice = useInvoicingStore(state => state.invoiceDetail);
    const loading = useInvoicingStore(state => state.invoiceDetailLoading);
    const loaded = useInvoicingStore(state => state.invoiceDetailLoaded);
    const fetchInvoiceDetail = useInvoicingStore(state => state.fetchInvoiceDetail);
    const refreshInvoiceDetail = useInvoicingStore(state => state.refreshInvoiceDetail);
    const clearInvoiceDetail = useInvoicingStore(state => state.clearInvoiceDetail);
    const openInvoiceFile = useInvoicingStore(state => state.openInvoiceFile);
    const confirmingReview = useInvoicingStore(state => state.confirmingReview);
    const reviewErrors = useInvoicingStore(state => state.reviewErrors);
    const confirmInvoiceReview = useInvoicingStore(state => state.confirmInvoiceReview);

    const auction = useInvestmentStore(state => state.auction);
    const quote = useInvestmentStore(state => state.quote);
    const offerLoaded = useInvestmentStore(state => state.offerLoaded);
    const loadOffer = useInvestmentStore(state => state.loadOffer);
    const refreshAuction = useInvestmentStore(state => state.refreshAuction);
    const acceptQuote = useInvestmentStore(state => state.acceptQuote);
    const accepting = useInvestmentStore(state => state.accepting);
    const offerErrors = useInvestmentStore(state => state.errors);
    const clearOffer = useInvestmentStore(state => state.clearOffer);

    const [confirmingAccept, setConfirmingAccept] = useState(false);
    // The step the MYPE opened, and where the invoice stood when it did: once the invoice
    // moves on, the panel follows it to the new step instead of staying on an old one.
    const [picked, setPicked] = useState<{index: number; atCurrent: number} | null>(null);

    async function handleConfirmAccept() {
        // Closed either way: on success the panel moves on to "published", and on a
        // refusal the alert under the header says why, next to the reloaded offer.
        await acceptQuote();
        setConfirmingAccept(false);
    }

    useEffect(() => {
        if (id) {
            void fetchInvoiceDetail(id);
            void loadOffer(id);
        }
        return () => {
            clearInvoiceDetail();
            clearOffer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // While Azure reads it and the service checks it, the invoice moves on its own: the
    // screen follows it, so a review or a read that failed shows up here as it happens.
    const invoiceInProgress = invoice !== null && invoice.id === id && isInvoiceInProgress(invoice.status);
    useEffect(() => {
        if (!invoiceInProgress || !id) return;
        let cancelled = false;
        let attempts = 0;
        let timer: ReturnType<typeof setTimeout>;

        const poll = async () => {
            const status = await refreshInvoiceDetail(id);
            attempts += 1;
            if (cancelled) return;
            if (status && isInvoiceInProgress(status) && attempts < POLL_MAX_ATTEMPTS) {
                timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
            }
        };

        timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [invoiceInProgress, id, refreshInvoiceDetail]);

    // Only while the auction is on its way: created by an event once the invoice
    // passes its checks, evaluated by another. Each read schedules the next only once
    // it has answered, so a slow response never stacks a second one behind it.
    const awaitingAuction = invoice !== null && offerLoaded && isAwaitingAuction(invoice, auction);
    useEffect(() => {
        if (!awaitingAuction || !id) return;
        let cancelled = false;
        let attempts = 0;
        let timer: ReturnType<typeof setTimeout>;

        const poll = async () => {
            const refreshed = await refreshAuction(id);
            attempts += 1;
            if (cancelled) return;
            const stillWaiting = refreshed === null || refreshed.isAwaitingEvaluation();
            if (stillWaiting && attempts < POLL_MAX_ATTEMPTS) {
                timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
            }
        };

        timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [awaitingAuction, id, refreshAuction]);

    const steps = RAIL_MILESTONES.map(milestone => ({label: t(`invoicing.upload.steps.${milestone}`)}));
    // The rail and the pill follow the auction once there is one; see `progressFor`.
    const progress = invoice ? progressFor(invoice, auction) : null;
    const rail = progress?.rail ?? null;
    const selectedStep =
        rail === null ? undefined : picked !== null && picked.atCurrent === rail.currentIndex ? picked.index : rail.currentIndex;
    const stepPhase = (index: number): RailStepPhase => {
        if (rail === null || index < rail.currentIndex) return 'done';
        if (rail.currentState === 'attention') return 'attention';
        if (rail.currentState === 'blocked') return 'blocked';
        // The last milestone is where the work ends: once there, the invoice is in auction, not "being published".
        return 'current';
    };
    const issueReason = invoice ? issueReasonFor(invoice, t, i18n) : null;

    return (
        <div className="flex w-full flex-col gap-6">
            <button
                type="button"
                onClick={() => navigate(invoicingPaths.myInvoices())}
                className={cn(buttonVariants({variant: 'outline', size: 'sm'}), 'w-fit')}
            >
                <ChevronLeft data-icon="inline-start" />
                {t('invoicing.detail.back')}
            </button>

            {loading && <InvoiceDetailSkeleton label={t('invoicing.detail.loading')} />}

            {!loading && loaded && !invoice && (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{t('invoicing.detail.loadFailed')}</AlertDescription>
                </Alert>
            )}

            {!loading && invoice && (
                <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-col gap-1">
                            <h1 className="text-h1 text-fg font-bold">
                                {invoice.number ?? t('invoicing.detail.untitled')}
                            </h1>
                            {/* Only once both halves exist: «null · vence el —» reads like a bug. */}
                            {invoice.payerName && invoice.dueDate && (
                                <p className="text-body text-fg-muted">
                                    {t('invoicing.detail.subtitle', {
                                        payer: invoice.payerName,
                                        date: formatLongDate(invoice.dueDate, i18n.language)
                                    })}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <StatusPill status={progress?.status ?? invoice.status} />
                            <button
                                type="button"
                                onClick={() => void openInvoiceFile(invoice.id)}
                                className={buttonVariants({variant: 'secondary'})}
                            >
                                {t('invoicing.detail.viewPdf')}
                            </button>
                        </div>
                    </div>

                    {invoice.status === 'REQUIRES_REVIEW' && (
                        <>
                            <InlineAlert
                                variant="warning"
                                title={t('invoicing.detail.reviewAlert.title')}
                                message={`${issueReason ?? t('invoicing.detail.reviewAlert.fallbackMessage')} ${t('invoicing.issues.reviewAction')}`}
                            />
                            <ReviewConfirmationCard
                                key={invoice.id}
                                invoice={invoice}
                                doubtfulFields={invoice.doubtfulFields()}
                                confirming={confirmingReview}
                                errors={reviewErrors}
                                onConfirm={confirmInvoiceReview}
                            />
                        </>
                    )}

                    <InvestmentErrorAlert errors={offerErrors} />

                    {/* When risk rejected the auction, Invoicing marks the invoice NOT_ELIGIBLE too,
                        but the reason is Investment's: AuctionRejectionAlert says it, once. */}
                    {invoice.status === 'NOT_ELIGIBLE' && !auction?.isRejected() && (
                        <InlineAlert
                            variant="error"
                            title={t('invoicing.detail.notEligibleAlert.title')}
                            message={issueReason ?? t('invoicing.detail.notEligibleAlert.fallbackMessage')}
                        />
                    )}

                    <AuctionRejectionAlert auction={auction} />

                    <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
                        <InvoiceRail
                            steps={steps}
                            currentIndex={rail?.currentIndex}
                            currentState={rail?.currentState}
                            selectedIndex={selectedStep}
                            onSelect={index => rail && setPicked({index, atCurrent: rail.currentIndex})}
                            panel={
                                selectedStep !== undefined && (
                                    <RailStepSummary
                                        key={selectedStep}
                                        milestone={RAIL_MILESTONES[selectedStep]}
                                        phase={stepPhase(selectedStep)}
                                        invoice={invoice}
                                        auction={auction}
                                        quote={quote}
                                        onOpenPdf={() => void openInvoiceFile(invoice.id)}
                                    />
                                )
                            }
                        />
                        {rail && (
                            <p className="text-caption text-fg-muted">
                                {t(railCaptionKey(rail))}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-start gap-6 lg:flex-row">
                        <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex w-full flex-1 flex-col gap-4 rounded-xl border p-6">
                            <p className="text-body text-fg font-semibold">{t('invoicing.detail.facts.title')}</p>
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                <FactField label={t('invoicing.detail.facts.issuer')} value={invoice.issuerName} />
                                <FactField label={t('invoicing.detail.facts.issuerRuc')} value={invoice.issuerRuc} />
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                <FactField label={t('invoicing.detail.facts.payer')} value={invoice.payerName} />
                                <FactField label={t('invoicing.detail.facts.payerRuc')} value={invoice.payerRuc} />
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                <FactField
                                    label={t('invoicing.detail.facts.issuedAt')}
                                    value={formatLongDate(invoice.issuedAt, i18n.language)}
                                />
                                <FactField
                                    label={t('invoicing.detail.facts.dueDate')}
                                    value={formatLongDate(invoice.dueDate, i18n.language)}
                                />
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                <FactField label={t('invoicing.detail.facts.currency')} value={invoice.currency} />
                                <FactField label={t('invoicing.detail.facts.fiscalNumber')} value={invoice.fiscalNumber} />
                            </div>
                        </div>

                        {/* An unread invoice has no amount: the panel and the table wait for one
                            rather than print S/ 0.00, which would be a figure nobody measured. A
                            rejected one will never be priced, so the panel would only promise an
                            offer that is not coming. */}
                        {invoice.totals && !auction?.isRejected() && (
                            <SettlementPanel
                                totalAmount={invoice.totals.total}
                                auction={auction}
                                quote={quote}
                                onAccept={() => setConfirmingAccept(true)}
                                accepting={accepting}
                            />
                        )}
                    </div>

                    {invoice.totals && (
                        <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
                            <p className="text-body text-fg font-semibold">{t('invoicing.detail.lineItems.title')}</p>
                            <InvoiceLineItemsTable lineItems={invoice.lineItems} totals={invoice.totals} />
                        </div>
                    )}

                    {quote && (
                        <AcceptQuoteDialog
                            open={confirmingAccept}
                            onOpenChange={setConfirmingAccept}
                            quote={quote}
                            onConfirm={() => void handleConfirmAccept()}
                            confirming={accepting}
                        />
                    )}
                </>
            )}
        </div>
    );
}
