import {ChevronRight} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router';
import {InvoiceRail} from '../../../invoicing/presentation/components/InvoiceRail';
import {invoicingPaths} from '../../../invoicing/presentation/invoicing-paths';
import {progressFor, RAIL_MILESTONES} from '../../../invoicing/presentation/rail-caption';
import type {HomeInvoice} from './home-overview';

interface AttentionListProps {
    entries: readonly HomeInvoice[];
}

/**
 * «Necesitan tu atención»: the invoices that only move once the MYPE does something,
 * as the design's home lists them — who owes, which invoice, the compact rail with what
 * she has to do in amber, the amount, and the way in.
 *
 * The amber bar on the left is the same «a person has to act» color the rail and the
 * pill use, so the rows read as different from the plain list below without a word;
 * the sentence says what the action is, so the color is never the only cue.
 */
export function AttentionList({entries}: AttentionListProps) {
    const {t} = useTranslation();
    const missing = '—';
    const steps = RAIL_MILESTONES.map(milestone => ({label: milestone}));

    return (
        <ul className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col overflow-hidden rounded-xl border">
            {entries.map(({invoice, auction, action}) => {
                const {rail} = progressFor(invoice, auction);
                return (
                    <li key={invoice.id} className="border-border-subtle border-b last:border-b-0">
                        <Link
                            to={invoicingPaths.invoiceDetail(invoice.id)}
                            className="hover:bg-accent flex items-center gap-4 border-l-4 border-l-[var(--vk-status-requires-review-fg)] px-4 py-3"
                        >
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                <p className="text-body text-fg truncate font-semibold">{invoice.payerName ?? missing}</p>
                                <p className="text-caption text-fg-secondary">
                                    {t('invoicing.myInvoices.invoiceNumber', {number: invoice.number ?? missing})}
                                </p>
                                <div className="flex items-center gap-2.5">
                                    {rail && (
                                        <div className="w-[72px] shrink-0">
                                            <InvoiceRail
                                                steps={steps}
                                                currentIndex={rail.currentIndex}
                                                currentState={rail.currentState}
                                                compact
                                            />
                                        </div>
                                    )}
                                    <p className="text-caption text-status-requires-review min-w-0 font-semibold">
                                        {action === 'review' ? t('home.attention.review') : t('home.attention.acceptQuote')}
                                    </p>
                                </div>
                            </div>
                            <p className="text-body text-fg shrink-0 font-medium tabular-nums">{invoice.formattedAmount() ?? missing}</p>
                            <span className="text-body text-fg-link hidden shrink-0 items-center gap-1 font-semibold sm:inline-flex">
                                {action === 'review' ? t('home.attention.reviewCta') : t('home.attention.acceptQuoteCta')}
                                <ChevronRight aria-hidden="true" className="size-4" />
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
