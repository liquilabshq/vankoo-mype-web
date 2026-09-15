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
 * "received" has no "attention" entry, since `REQUIRES_REVIEW` never lands there.
 */
type RailCaptionKey =
    | 'invoicing.detail.railCaption.received.automatic'
    | 'invoicing.detail.railCaption.reading.automatic'
    | 'invoicing.detail.railCaption.reading.attention'
    | 'invoicing.detail.railCaption.validating.automatic'
    | 'invoicing.detail.railCaption.validating.attention'
    | 'invoicing.detail.railCaption.approved.automatic'
    | 'invoicing.detail.railCaption.approved.attention'
    | 'invoicing.detail.railCaption.inAuction.automatic'
    | 'invoicing.detail.railCaption.inAuction.attention';

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
    const invoiceFileUrl = useInvoicingStore(state => state.invoiceFileUrl);

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
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-h1 text-fg font-bold">{invoice.number}</h1>
                            <p className="text-body text-fg-muted">
                                {t('invoicing.detail.subtitle', {
                                    payer: invoice.payerName,
                                    date: new Intl.DateTimeFormat(i18n.language, {dateStyle: 'long'}).format(invoice.dueDate)
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusPill status={invoice.status} />
                            <a
                                href={invoiceFileUrl(invoice.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonVariants({variant: 'secondary'})}
                            >
                                {t('invoicing.detail.viewPdf')}
                            </a>
                        </div>
                    </div>

                    {invoice.status === 'REQUIRES_REVIEW' && (
                        <InlineAlert
                            variant="warning"
                            title={t('invoicing.detail.reviewAlert.title')}
                            message={invoice.reviewReason ?? t('invoicing.detail.reviewAlert.fallbackMessage')}
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
                            <div className="flex gap-6">
                                <FactField label={t('invoicing.detail.facts.issuer')} value={invoice.issuerName} />
                                <FactField label={t('invoicing.detail.facts.issuerRuc')} value={invoice.issuerRuc} />
                            </div>
                            <div className="flex gap-6">
                                <FactField label={t('invoicing.detail.facts.payer')} value={invoice.payerName} />
                                <FactField label={t('invoicing.detail.facts.payerRuc')} value={invoice.payerRuc} />
                            </div>
                            <div className="flex gap-6">
                                <FactField
                                    label={t('invoicing.detail.facts.issuedAt')}
                                    value={new Intl.DateTimeFormat(i18n.language, {dateStyle: 'long'}).format(invoice.issuedAt)}
                                />
                                <FactField
                                    label={t('invoicing.detail.facts.dueDate')}
                                    value={new Intl.DateTimeFormat(i18n.language, {dateStyle: 'long'}).format(invoice.dueDate)}
                                />
                            </div>
                            <div className="flex gap-6">
                                <FactField label={t('invoicing.detail.facts.currency')} value={invoice.currency} />
                                <FactField label={t('invoicing.detail.facts.fiscalNumber')} value={invoice.fiscalNumber} />
                            </div>
                        </div>

                        <SettlementPanel totalAmount={invoice.totals.total} settlement={invoice.settlement} />
                    </div>

                    <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
                        <p className="text-body text-fg font-semibold">{t('invoicing.detail.lineItems.title')}</p>
                        <InvoiceLineItemsTable lineItems={invoice.lineItems} totals={invoice.totals} />
                    </div>
                </>
            )}
        </div>
    );
}
