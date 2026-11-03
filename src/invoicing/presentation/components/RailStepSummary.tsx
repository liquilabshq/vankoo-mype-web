import {FileText} from 'lucide-react';
import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import type {Auction} from '../../../investment/domain/model/auction.entity';
import type {FinancialQuote} from '../../../investment/domain/model/financial-quote.entity';
import type {InvoiceDetail} from '../../domain/model/invoice-detail.entity';
import type {InvoiceMilestone} from '../../domain/model/invoice-status';
import {formatInvoiceAmount} from '../../domain/model/invoice.entity';
import {issueReasonFor} from '../issue-copy';

/** Whether the step is behind the invoice, is where it stands, or is where it stopped. */
export type RailStepPhase = 'done' | 'current' | 'attention' | 'blocked';

interface RailStepSummaryProps {
    milestone: InvoiceMilestone;
    phase: RailStepPhase;
    invoice: InvoiceDetail;
    auction: Auction | null;
    /** The quote the MYPE can accept right now, if any. */
    quote: FinancialQuote | null;
    onOpenPdf: () => void;
}

/** A percentage in points with two decimals, as the offer prints it. */
function formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value);
}

/** Set by the service on an invoice whose doubtful read the MYPE confirmed. */
const MYPE_CONFIRMED_DATA = 'MYPE_CONFIRMED_DATA';

/**
 * What happened in one milestone of the rail, in two or three sentences.
 *
 * A summary, not the record: the read data, the offer and the line items keep their own
 * cards below, so this says what the step did and what came out of it. The current step
 * says what is going on now; a step behind says how it ended.
 */
export function RailStepSummary({milestone, phase, invoice, auction, quote, onOpenPdf}: RailStepSummaryProps) {
    const {t, i18n} = useTranslation();
    const dateTime = (value: Date) =>
        new Intl.DateTimeFormat(i18n.language, {dateStyle: 'medium', timeStyle: 'short'}).format(value);
    const payer = invoice.payerName ?? t('invoicing.steps.thePayer');

    const lines: string[] = [];
    let action: ReactNode = null;

    switch (milestone) {
        case 'received':
            lines.push(t('invoicing.steps.received'));
            action = (
                <Button type="button" variant="secondary" size="sm" onClick={onOpenPdf} className="w-fit">
                    <FileText data-icon="inline-start" />
                    {t('invoicing.detail.viewPdf')}
                </Button>
            );
            break;
        case 'reading':
            if (phase === 'current') lines.push(t('invoicing.steps.reading.working'));
            else if (phase === 'attention') {
                lines.push(issueReasonFor(invoice, t, i18n) ?? t('invoicing.detail.reviewAlert.fallbackMessage'));
                lines.push(t('invoicing.steps.reading.confirmBelow'));
            } else {
                lines.push(
                    t('invoicing.steps.reading.done', {
                        issuer: invoice.issuerName ?? '—',
                        payer,
                        total: invoice.totals ? formatInvoiceAmount(invoice.totals.total) : '—',
                        count: invoice.lineItems.length
                    })
                );
                if (invoice.issues.some(issue => issue.code === MYPE_CONFIRMED_DATA)) {
                    lines.push(t('invoicing.steps.reading.confirmedByYou'));
                }
            }
            break;
        case 'validating':
            if (auction?.isRejected()) {
                lines.push(t('invoicing.steps.validating.checked', {payer}));
                lines.push(t('invoicing.steps.validating.rejected'));
            } else if (phase === 'blocked') {
                lines.push(issueReasonFor(invoice, t, i18n) ?? t('invoicing.detail.notEligibleAlert.fallbackMessage'));
            } else if (phase === 'current') {
                lines.push(t('invoicing.steps.validating.working', {payer}));
            } else {
                lines.push(t('invoicing.steps.validating.checked', {payer}));
                if (auction && auction.riskGrade !== 'UNDER_EVALUATION') {
                    lines.push(t('invoicing.steps.validating.grade', {grade: auction.riskGrade}));
                }
            }
            break;
        case 'approved': {
            const accepted = auction?.acceptedQuote ?? null;
            if (accepted) {
                lines.push(t('invoicing.steps.approved.accepted', {amount: formatInvoiceAmount(accepted.mypeAdvance)}));
            } else if (quote) {
                lines.push(
                    t('invoicing.steps.approved.offer', {
                        amount: formatInvoiceAmount(quote.mypeAdvance),
                        tcea: formatPercentage(quote.mypeTceaPct),
                        validUntil: dateTime(quote.validUntil)
                    })
                );
                lines.push(t('invoicing.steps.approved.acceptBelow'));
            } else {
                lines.push(t('invoicing.steps.approved.pricing'));
            }
            break;
        }
        case 'inAuction':
            if (auction?.publishedAt) lines.push(t('invoicing.steps.inAuction.published', {date: dateTime(auction.publishedAt)}));
            if (auction?.targetAmount) {
                lines.push(
                    t('invoicing.steps.inAuction.funding', {
                        current: formatInvoiceAmount(auction.currentFunding),
                        target: formatInvoiceAmount(auction.targetAmount)
                    })
                );
            }
            if (auction?.expiresAt) lines.push(t('invoicing.steps.inAuction.closes', {date: dateTime(auction.expiresAt)}));
            break;
    }

    return (
        <div
            className={cn(
                'bg-surface-sunken animate-in fade-in flex flex-col gap-3 rounded-lg p-4 duration-200 motion-reduce:animate-none',
                phase === 'attention' && 'border-warning border',
                phase === 'blocked' && 'border-destructive border'
            )}
        >
            {lines.map(line => (
                <p key={line} className="text-body text-fg">
                    {line}
                </p>
            ))}
            {action}
        </div>
    );
}
