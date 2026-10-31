import {isAxiosError} from 'axios';
import {useId, useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {buttonVariants} from '@/components/ui/button';
import {Field, FieldDescription, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {ConfirmInvoiceReviewCommand} from '../../domain/model/confirm-invoice-review.command';
import type {InvoiceDetail} from '../../domain/model/invoice-detail.entity';

interface ReviewConfirmationCardProps {
    invoice: InvoiceDetail;
    confirming: boolean;
    errors: Error[];
    onConfirm: (command: ConfirmInvoiceReviewCommand) => Promise<boolean>;
}

/** Same tolerance the service allows between the subtotal plus IGV and the total. */
const MONEY_TOLERANCE = 0.02;

/** A day as the date input wants it, `YYYY-MM-DD`, from a date at local midnight. */
function toInputDate(date: Date | null): string {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

/** An amount as a person types it, «5,959.00» or «5959», or NaN when it is not one. */
function parseAmount(value: string): number {
    const cleaned = value.replace(/,/g, '').trim();
    return cleaned === '' ? Number.NaN : Number(cleaned);
}

/** The series and the number apart, from «E001-2». The number is whatever follows the first dash. */
function splitFiscalNumber(fiscalNumber: string | null): [string, string] {
    if (!fiscalNumber) return ['', ''];
    const dash = fiscalNumber.indexOf('-');
    return dash < 0 ? [fiscalNumber, ''] : [fiscalNumber.slice(0, dash), fiscalNumber.slice(dash + 1)];
}

type ReviewErrorKey =
    | 'invoicing.review.errors.invalidRuc'
    | 'invoicing.review.errors.invalidFields'
    | 'invoicing.review.errors.notInReview'
    | 'invoicing.review.errors.generic';

/** The service's reason for refusing the confirmation, in the words the screen has for it. */
function errorMessageKey(errors: Error[]): ReviewErrorKey {
    const code = errors
        .map(error => (isAxiosError<{errorCode?: string}>(error) ? error.response?.data?.errorCode : undefined))
        .find(Boolean);
    switch (code) {
        case 'INVALID_RUC':
            return 'invoicing.review.errors.invalidRuc';
        case 'VALIDATION_FAILED':
            return 'invoicing.review.errors.invalidFields';
        case 'INVOICE_INVALID_STATE':
            return 'invoicing.review.errors.notInReview';
        default:
            return 'invoicing.review.errors.generic';
    }
}

/**
 * «Confirma los datos de tu factura»: the way out of `REQUIRES_REVIEW`.
 *
 * Azure read the invoice but was not sure enough of some field, so nothing moves until
 * a person looks. That person is the MYPE: every value comes prefilled with what was
 * read, it checks them against its PDF, corrects what is wrong and confirms. The service
 * checks them again and, if they add up, sends the invoice on to risk.
 */
export function ReviewConfirmationCard({invoice, confirming, errors, onConfirm}: ReviewConfirmationCardProps) {
    const {t} = useTranslation();
    const ids = {
        series: useId(),
        number: useId(),
        issueDate: useId(),
        dueDate: useId(),
        issuerRuc: useId(),
        payerRuc: useId(),
        subtotal: useId(),
        tax: useId(),
        total: useId()
    };
    const [initialSeries, initialNumber] = splitFiscalNumber(invoice.fiscalNumber);
    const [series, setSeries] = useState(initialSeries);
    const [number, setNumber] = useState(initialNumber);
    const [issueDate, setIssueDate] = useState(toInputDate(invoice.issuedAt));
    const [dueDate, setDueDate] = useState(toInputDate(invoice.dueDate));
    const [issuerRuc, setIssuerRuc] = useState(invoice.issuerRuc ?? '');
    const [payerRuc, setPayerRuc] = useState(invoice.payerRuc ?? '');
    const [subtotal, setSubtotal] = useState(invoice.totals ? invoice.totals.subtotal.value.toFixed(2) : '');
    const [tax, setTax] = useState(invoice.totals ? invoice.totals.igv.value.toFixed(2) : '');
    const [total, setTotal] = useState(invoice.totals ? invoice.totals.total.value.toFixed(2) : '');

    const discount = invoice.totals?.commercialDiscount.value ?? 0;
    const amounts = {subtotal: parseAmount(subtotal), tax: parseAmount(tax), total: parseAmount(total)};
    const amountsAreNumbers = Object.values(amounts).every(value => Number.isFinite(value) && value >= 0);
    const expectedTotal = amounts.subtotal - discount + amounts.tax;
    // Said before sending, so the MYPE fixes it here instead of bouncing off the service.
    const totalsDoNotAddUp = amountsAreNumbers && Math.abs(expectedTotal - amounts.total) > MONEY_TOLERANCE;
    const filled = [series, number, issueDate, dueDate, issuerRuc, payerRuc].every(value => value.trim() !== '');
    const canConfirm = filled && amountsAreNumbers && amounts.total > 0 && !confirming;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!canConfirm) return;
        await onConfirm(
            new ConfirmInvoiceReviewCommand({
                invoiceId: invoice.id,
                series,
                number,
                issueDate,
                dueDate,
                issuerRuc,
                payerRuc,
                ...amounts
            })
        );
    }

    return (
        <form
            onSubmit={event => void handleSubmit(event)}
            noValidate
            className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-6"
        >
            <div className="flex flex-col gap-1">
                <p className="text-body text-fg font-semibold">{t('invoicing.review.title')}</p>
                <p className="text-body text-fg-muted">{t('invoicing.review.description')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <Field>
                    <FieldLabel htmlFor={ids.series}>{t('invoicing.review.fields.series')}</FieldLabel>
                    <Input id={ids.series} value={series} onChange={event => setSeries(event.target.value)} disabled={confirming} required />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.number}>{t('invoicing.review.fields.number')}</FieldLabel>
                    <Input id={ids.number} value={number} onChange={event => setNumber(event.target.value)} disabled={confirming} required />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.issueDate}>{t('invoicing.review.fields.issueDate')}</FieldLabel>
                    <Input
                        id={ids.issueDate}
                        type="date"
                        value={issueDate}
                        onChange={event => setIssueDate(event.target.value)}
                        disabled={confirming}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.dueDate}>{t('invoicing.review.fields.dueDate')}</FieldLabel>
                    <Input
                        id={ids.dueDate}
                        type="date"
                        value={dueDate}
                        onChange={event => setDueDate(event.target.value)}
                        disabled={confirming}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.issuerRuc}>{t('invoicing.review.fields.issuerRuc')}</FieldLabel>
                    <Input
                        id={ids.issuerRuc}
                        inputMode="numeric"
                        maxLength={11}
                        value={issuerRuc}
                        onChange={event => setIssuerRuc(event.target.value)}
                        disabled={confirming}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.payerRuc}>{t('invoicing.review.fields.payerRuc')}</FieldLabel>
                    <Input
                        id={ids.payerRuc}
                        inputMode="numeric"
                        maxLength={11}
                        value={payerRuc}
                        onChange={event => setPayerRuc(event.target.value)}
                        disabled={confirming}
                        required
                    />
                </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                <Field>
                    <FieldLabel htmlFor={ids.subtotal}>{t('invoicing.review.fields.subtotal')}</FieldLabel>
                    <Input
                        id={ids.subtotal}
                        inputMode="decimal"
                        className="text-right tabular-nums"
                        value={subtotal}
                        onChange={event => setSubtotal(event.target.value)}
                        disabled={confirming}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.tax}>{t('invoicing.review.fields.tax')}</FieldLabel>
                    <Input
                        id={ids.tax}
                        inputMode="decimal"
                        className="text-right tabular-nums"
                        value={tax}
                        onChange={event => setTax(event.target.value)}
                        disabled={confirming}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.total}>{t('invoicing.review.fields.total')}</FieldLabel>
                    <Input
                        id={ids.total}
                        inputMode="decimal"
                        className="text-right tabular-nums"
                        value={total}
                        onChange={event => setTotal(event.target.value)}
                        aria-invalid={totalsDoNotAddUp || undefined}
                        disabled={confirming}
                        required
                    />
                    {totalsDoNotAddUp && (
                        <FieldDescription className="text-warning">
                            {t('invoicing.review.totalsDoNotAddUp', {expected: expectedTotal.toFixed(2)})}
                        </FieldDescription>
                    )}
                </Field>
            </div>

            {errors.length > 0 && (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{t(errorMessageKey(errors))}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-caption text-fg-muted">{t('invoicing.review.footnote')}</p>
                <button type="submit" disabled={!canConfirm} className={buttonVariants({variant: 'default'})}>
                    {confirming && <Spinner data-icon="inline-start" />}
                    {confirming ? t('invoicing.review.confirming') : t('invoicing.review.confirm')}
                </button>
            </div>
        </form>
    );
}
