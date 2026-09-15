import {useTranslation} from 'react-i18next';
import type {Invoice} from '../../domain/model/invoice.entity';
import {StatusPill} from './StatusPill';

interface InvoiceRowProps {
    invoice: Invoice;
}

/** One row of the invoice table — presents, does not navigate: there is no detail screen yet. */
export function InvoiceRow({invoice}: InvoiceRowProps) {
    const {i18n} = useTranslation();
    const dueDate = new Intl.DateTimeFormat(i18n.language, {day: '2-digit', month: 'short', year: 'numeric'}).format(
        invoice.dueDate
    );

    return (
        <div className="border-border-subtle flex items-center gap-4 border-b px-4 py-3">
            <p className="text-body text-fg-secondary w-[140px] shrink-0 font-medium">{invoice.number}</p>
            <p className="text-body text-fg min-w-0 flex-1 truncate">{invoice.payerName}</p>
            <p className="text-body text-fg-secondary w-[150px] shrink-0 font-medium">{invoice.payerRuc}</p>
            <p className="text-body text-fg-secondary w-[130px] shrink-0">{dueDate}</p>
            <div className="flex w-[170px] shrink-0 items-center">
                <StatusPill status={invoice.status} />
            </div>
            <p className="text-body text-fg-secondary w-[150px] shrink-0 text-right font-medium">
                {invoice.formattedAmount(i18n.language)}
            </p>
        </div>
    );
}
