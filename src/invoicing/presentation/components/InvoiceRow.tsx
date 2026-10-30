import {useTranslation} from 'react-i18next';
import {Link} from 'react-router';
import type {Invoice} from '../../domain/model/invoice.entity';
import {presentationForStatus, railStateFor} from '../../domain/model/invoice-status';
import {invoicingPaths} from '../invoicing-paths';
import {RAIL_MILESTONES} from '../rail-caption';
import {InvoiceRail} from './InvoiceRail';
import {StatusPill} from './StatusPill';

interface InvoiceRowProps {
    invoice: Invoice;
}

/**
 * One row of the invoice table. The whole row links to the detail screen — no actions
 * column.
 *
 * From `sm` up it is a table row, striped on every other one as the design's
 * `TableRow · Alterna` is. The stripe is `surface/base`, not `surface/sunken`: in dark
 * the two are the same color and sunken would not show. Hover uses the Ghost hover
 * fill for the same reason, since it has to read over both stripes.
 *
 * Below `sm` there is no room for six columns, so it becomes the design's compact
 * list row: who owes, which invoice, the compact rail with the status in words, and
 * the amount on the right.
 */
export function InvoiceRow({invoice}: InvoiceRowProps) {
    const {t, i18n} = useTranslation();
    // Until the OCR reads it, an invoice has no number, payer, due date or amount yet.
    const missing = '—';
    const dueDate = invoice.dueDate
        ? new Intl.DateTimeFormat(i18n.language, {day: '2-digit', month: 'short', year: 'numeric'}).format(invoice.dueDate)
        : missing;
    const rail = railStateFor(invoice.status);
    const steps = RAIL_MILESTONES.map(milestone => ({label: milestone}));

    return (
        <Link
            to={invoicingPaths.invoiceDetail(invoice.id)}
            className="border-border-subtle hover:bg-accent sm:even:bg-surface flex border-b px-4 py-3 last:border-b-0 sm:last:border-b"
        >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:hidden">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="text-body text-fg truncate font-semibold">{invoice.payerName ?? missing}</p>
                    <p className="text-caption text-fg-muted">
                        {t('invoicing.myInvoices.invoiceNumber', {number: invoice.number ?? missing})}
                    </p>
                    <div className="flex items-center gap-2.5">
                        {rail && (
                            <div className="w-[72px] shrink-0">
                                <InvoiceRail steps={steps} currentIndex={rail.currentIndex} currentState={rail.currentState} compact />
                            </div>
                        )}
                        <p className="text-caption text-fg-muted min-w-0">{t(presentationForStatus(invoice.status).labelKey)}</p>
                    </div>
                </div>
                <p className="text-body text-fg shrink-0 font-medium">{invoice.formattedAmount() ?? missing}</p>
            </div>

            <div className="hidden w-full items-center gap-4 sm:flex">
                <p className="text-body text-fg-secondary w-[140px] shrink-0 font-medium">{invoice.number ?? missing}</p>
                <p className="text-body text-fg min-w-0 flex-1 truncate">{invoice.payerName ?? missing}</p>
                <p className="text-body text-fg-secondary w-[150px] shrink-0 font-medium">{invoice.payerRuc ?? missing}</p>
                <p className="text-body text-fg-secondary w-[130px] shrink-0">{dueDate}</p>
                <div className="flex w-[170px] shrink-0 items-center">
                    <StatusPill status={invoice.status} />
                </div>
                <p className="text-body text-fg-secondary w-[150px] shrink-0 text-right font-medium">
                    {invoice.formattedAmount() ?? missing}
                </p>
            </div>
        </Link>
    );
}
