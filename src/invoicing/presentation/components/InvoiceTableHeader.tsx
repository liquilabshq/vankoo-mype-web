import {useTranslation} from 'react-i18next';

/**
 * The column headings over `InvoiceRow`s, from `sm` up; below it each row is its own card
 * and needs none. Kept next to the row so their fixed widths cannot drift apart.
 */
export function InvoiceTableHeader() {
    const {t} = useTranslation();
    return (
        <div className="bg-surface-sunken border-border-subtle text-caption text-fg-secondary hidden gap-4 border-b px-4 py-3 font-semibold sm:flex">
            <p className="w-[140px] shrink-0">{t('invoicing.myInvoices.columns.number')}</p>
            <p className="min-w-0 flex-1">{t('invoicing.myInvoices.columns.payer')}</p>
            <p className="w-[150px] shrink-0">{t('invoicing.myInvoices.columns.payerRuc')}</p>
            <p className="w-[130px] shrink-0">{t('invoicing.myInvoices.columns.dueDate')}</p>
            <p className="w-[170px] shrink-0">{t('invoicing.myInvoices.columns.status')}</p>
            <p className="w-[150px] shrink-0 text-right">{t('invoicing.myInvoices.columns.amount')}</p>
        </div>
    );
}
