import {FileText, FileUp} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useInvestmentStore} from '../../../investment/application/investment.store';
import {EmptyState} from '../../../shared/presentation/components/EmptyState';
import {Pagination} from '../../../shared/presentation/components/Pagination';
import {useInvoicingStore, type InvoiceListQuery} from '../../application/invoicing.store';
import {ALL_INVOICE_STATUSES, presentationForStatus, type InvoiceStatus} from '../../domain/model/invoice-status';
import {InvoicingErrorAlert} from '../components/InvoicingErrorAlert';
import {InvoiceRow} from '../components/InvoiceRow';
import {KycGateAlert} from '../components/KycGate';
import {useCanUploadInvoices} from '../use-can-upload-invoices';
import {invoicingPaths} from '../invoicing-paths';

const PAGE_SIZE = 10;

/** Routed view listing the MYPE's own invoices, filterable and paginated. */
export function MyInvoices() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const invoices = useInvoicingStore(state => state.invoices);
    const invoicesTotal = useInvoicingStore(state => state.invoicesTotal);
    const invoicesLoading = useInvoicingStore(state => state.invoicesLoading);
    const invoicesLoaded = useInvoicingStore(state => state.invoicesLoaded);
    const errors = useInvoicingStore(state => state.errors);
    const fetchInvoices = useInvoicingStore(state => state.fetchInvoices);
    const canUpload = useCanUploadInvoices();
    const auctionsByInvoice = useInvestmentStore(state => state.auctionsByInvoice);
    const loadMyAuctions = useInvestmentStore(state => state.loadMyAuctions);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');
    const [from, setFrom] = useState('');
    const [page, setPage] = useState(1);
    // The filters last applied with «Filtrar», kept apart from what is being typed so a
    // page change asks for the same filters, not for whatever the inputs hold now.
    const [applied, setApplied] = useState<InvoiceListQuery>({});
    const [hasFiltered, setHasFiltered] = useState(false);

    useEffect(() => {
        void fetchInvoices({...applied, page, pageSize: PAGE_SIZE});
    }, [applied, page, fetchInvoices]);

    // Invoicing stops at CONSISTENCY_PASSED; what happens next lives in Investment.
    // One call covers every page, so it runs once per visit, not per page.
    useEffect(() => {
        void loadMyAuctions();
    }, [loadMyAuctions]);

    function handleFilter(nextStatus = status) {
        setPage(1);
        setHasFiltered(true);
        setApplied({
            search: search.trim() || undefined,
            status: nextStatus === 'all' ? undefined : nextStatus,
            from: from || undefined
        });
    }

    // Below `sm` the status is the only filter and there is no «Filtrar» button, as in
    // the mobile mockup, so choosing one applies it at once.
    function handleStatusChange(value: InvoiceStatus | 'all') {
        setStatus(value);
        if (!window.matchMedia('(min-width: 40rem)').matches) handleFilter(value);
    }

    const totalPages = Math.max(1, Math.ceil(invoicesTotal / PAGE_SIZE));

    return (
        <div className="flex w-full flex-col gap-4 sm:gap-8">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-h1 text-fg font-bold">{t('invoicing.myInvoices.title')}</h1>
                <Button type="button" onClick={() => navigate(invoicingPaths.uploadInvoice())} disabled={!canUpload}>
                    <FileUp data-icon="inline-start" />
                    <span className="sm:hidden">{t('invoicing.myInvoices.uploadShort')}</span>
                    <span className="hidden sm:inline">{t('invoicing.myInvoices.uploadInvoice')}</span>
                </Button>
            </div>

            {!canUpload && <KycGateAlert />}
            <InvoicingErrorAlert errors={errors} />

            {!invoicesLoading && invoicesLoaded && invoices.length === 0 && !hasFiltered ? (
                <div className="bg-surface-raised border-border-subtle shadow-elevation-1 rounded-xl border">
                    <EmptyState
                        icon={FileText}
                        title={t('invoicing.myInvoices.empty.title')}
                        description={t('invoicing.myInvoices.empty.description')}
                        action={
                            <Button type="button" onClick={() => navigate(invoicingPaths.uploadInvoice())} disabled={!canUpload}>
                                <FileUp data-icon="inline-start" />
                                {t('invoicing.myInvoices.uploadInvoice')}
                            </Button>
                        }
                    />
                </div>
            ) : (
                <>
                    <div className="sm:bg-surface-raised sm:border-border-subtle flex flex-col gap-4 sm:flex-row sm:items-end sm:rounded-xl sm:border sm:p-4">
                        <div className="hidden flex-1 flex-col gap-1 sm:flex">
                            <label className="text-caption text-fg-secondary font-semibold">
                                {t('invoicing.myInvoices.filters.search')}
                            </label>
                            <Input
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder={t('invoicing.myInvoices.filters.searchPlaceholder')}
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <label className="text-caption text-fg-secondary font-semibold max-sm:sr-only">
                                {t('invoicing.myInvoices.filters.status')}
                            </label>
                            <Select value={status} onValueChange={value => handleStatusChange(value as InvoiceStatus | 'all')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('invoicing.myInvoices.filters.allStatuses')}>
                                        {(value: InvoiceStatus | 'all') =>
                                            value === 'all'
                                                ? t('invoicing.myInvoices.filters.allStatuses')
                                                : t(presentationForStatus(value).labelKey)
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('invoicing.myInvoices.filters.allStatuses')}</SelectItem>
                                    {ALL_INVOICE_STATUSES.map(candidate => (
                                        <SelectItem key={candidate} value={candidate}>
                                            {t(presentationForStatus(candidate).labelKey)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="hidden flex-1 flex-col gap-1 sm:flex">
                            <label className="text-caption text-fg-secondary font-semibold">
                                {t('invoicing.myInvoices.filters.dateRange')}
                            </label>
                            <Input type="date" value={from} onChange={event => setFrom(event.target.value)} />
                        </div>

                        <Button type="button" variant="secondary" onClick={() => handleFilter()} className="hidden sm:inline-flex">
                            {t('invoicing.myInvoices.filters.submit')}
                        </Button>
                    </div>

                    <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col overflow-hidden rounded-xl border">
                        {/* Below `sm` each row stacks as its own card (see InvoiceRow) and needs no
                            min-width; from `sm` up the fixed-width columns need more room than a
                            tablet screen has, so this scrolls horizontally rather than squeezing the
                            payer name column into overlapping its neighbor. */}
                        <div className="overflow-x-auto">
                            <div className="sm:min-w-[1000px]">
                                <div className="bg-surface-sunken border-border-subtle text-caption text-fg-secondary hidden gap-4 border-b px-4 py-3 font-semibold sm:flex">
                                    <p className="w-[140px] shrink-0">{t('invoicing.myInvoices.columns.number')}</p>
                                    <p className="min-w-0 flex-1">{t('invoicing.myInvoices.columns.payer')}</p>
                                    <p className="w-[150px] shrink-0">{t('invoicing.myInvoices.columns.payerRuc')}</p>
                                    <p className="w-[130px] shrink-0">{t('invoicing.myInvoices.columns.dueDate')}</p>
                                    <p className="w-[170px] shrink-0">{t('invoicing.myInvoices.columns.status')}</p>
                                    <p className="w-[150px] shrink-0 text-right">{t('invoicing.myInvoices.columns.amount')}</p>
                                </div>

                                {!invoicesLoading && (
                                    <div className="flex flex-col">
                                        {invoices.map(invoice => (
                                            <InvoiceRow key={invoice.id} invoice={invoice} auction={auctionsByInvoice.get(invoice.id) ?? null} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {invoicesLoading && (
                            <p className="text-caption text-fg-muted px-4 py-8 text-center">{t('invoicing.myInvoices.loading')}</p>
                        )}

                        {!invoicesLoading && invoicesLoaded && invoices.length === 0 && (
                            <p className="text-caption text-fg-muted px-4 py-8 text-center">{t('invoicing.myInvoices.noMatches')}</p>
                        )}

                        {invoices.length > 0 && (
                            <div className="p-4">
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    summary={t('invoicing.myInvoices.resultsSummary', {count: invoicesTotal})}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
