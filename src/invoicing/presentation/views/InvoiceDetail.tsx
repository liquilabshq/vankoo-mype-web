import {ChevronLeft} from 'lucide-react';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {buttonVariants} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';
import {useInvoicingStore} from '../../application/invoicing.store';
import type {InvoiceMilestone} from '../../domain/model/invoice-status';
import {FactField} from '../components/FactField';
import {InvoiceLineItemsTable} from '../components/InvoiceLineItemsTable';
import {InvoiceRail} from '../components/InvoiceRail';
import {SettlementPanel} from '../components/SettlementPanel';
import {StatusPill} from '../components/StatusPill';
import {invoicingPaths} from '../invoicing-paths';

const MILESTONES: readonly InvoiceMilestone[] = ['received', 'reading', 'validating', 'approved', 'inAuction'];

/**
 * Every key under `invoicing.detail.railCaption` — see `IamErrorAlert` for the same
 * dynamic-key-cast pattern. Written out rather than templated from `InvoiceMilestone`:
 * only the combinations a real status can actually produce (per `MILESTONE_BY_STATUS`)
 * have copy — "received" has no "attention" or "blocked" entry, and "blocked" only
 * exists on "validating", since `NOT_ELIGIBLE` is the only status mapped to it today.
 */
type RailCaptionKey =
    | 'invoicing.detail.railCaption.received.automatic'
    | 'invoicing.detail.railCaption.reading.automatic'
    | 'invoicing.detail.railCaption.reading.attention'
    | 'invoicing.detail.railCaption.validating.automatic'
    | 'invoicing.detail.railCaption.validating.attention'
    | 'invoicing.detail.railCaption.validating.blocked'
    | 'invoicing.detail.railCaption.approved.automatic'
    | 'invoicing.detail.railCaption.approved.attention'
    | 'invoicing.detail.railCaption.inAuction.automatic'
    | 'invoicing.detail.railCaption.inAuction.attention';

/**
 * A calendar date in the reader's language, or null when there is none to show.
 *
 * `Intl.DateTimeFormat.format` throws on an invalid date, and an invoice the OCR has
 * not read yet has no dates at all — so the null has to stop here, not in the view.
 */
function formatLongDate(date: Date | null, language: string): string | null {
    return date ? new Intl.DateTimeFormat(language, {dateStyle: 'long'}).format(date) : null;
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
    const clearInvoiceDetail = useInvoicingStore(state => state.clearInvoiceDetail);
    const openInvoiceFile = useInvoicingStore(state => state.openInvoiceFile);

    useEffect(() => {
        if (id) void fetchInvoiceDetail(id);
        return () => clearInvoiceDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const steps = MILESTONES.map(milestone => ({label: t(`invoicing.upload.steps.${milestone}`)}));
    const rail = invoice?.railState() ?? null;

    return (
        <div className="flex w-full flex-col gap-6">
            <button
                type="button"
                onClick={() => navigate(invoicingPaths.myInvoices())}
                className={cn(buttonVariants({variant: 'ghost', size: 'sm'}), 'border-border-strong w-fit')}
            >
                <ChevronLeft data-icon="inline-start" />
                {t('invoicing.detail.back')}
            </button>

            {loading && (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Spinner className="size-6" />
                    <p className="text-caption text-fg-muted">{t('invoicing.detail.loading')}</p>
                </div>
            )}

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
                            <StatusPill status={invoice.status} />
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
                        <InlineAlert
                            variant="warning"
                            title={t('invoicing.detail.reviewAlert.title')}
                            message={invoice.alertMessage ?? t('invoicing.detail.reviewAlert.fallbackMessage')}
                        />
                    )}

                    {invoice.status === 'NOT_ELIGIBLE' && (
                        <InlineAlert
                            variant="error"
                            title={t('invoicing.detail.notEligibleAlert.title')}
                            message={invoice.alertMessage ?? t('invoicing.detail.notEligibleAlert.fallbackMessage')}
                        />
                    )}

                    <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
                        <InvoiceRail steps={steps} currentIndex={rail?.currentIndex} currentState={rail?.currentState} />
                        {rail && (
                            <p className="text-caption text-fg-muted">
                                {t(
                                    `invoicing.detail.railCaption.${MILESTONES[rail.currentIndex]}.${rail.currentState}` as RailCaptionKey
                                )}
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
                            rather than print S/ 0.00, which would be a figure nobody measured. */}
                        {invoice.totals && (
                            <SettlementPanel totalAmount={invoice.totals.total} settlement={invoice.settlement} />
                        )}
                    </div>

                    {invoice.totals && (
                        <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
                            <p className="text-body text-fg font-semibold">{t('invoicing.detail.lineItems.title')}</p>
                            <InvoiceLineItemsTable lineItems={invoice.lineItems} totals={invoice.totals} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
