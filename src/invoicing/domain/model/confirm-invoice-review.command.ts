/** Attributes a confirm-invoice-review command is built from. */
export interface ConfirmInvoiceReviewCommandAttributes {
    invoiceId: string;
    series: string;
    number: string;
    /** A calendar day, `YYYY-MM-DD`, as the date input gives it. */
    issueDate: string;
    /** A calendar day, `YYYY-MM-DD`. */
    dueDate: string;
    issuerRuc: string;
    payerRuc: string;
    subtotal: number;
    tax: number;
    total: number;
}

/**
 * The MYPE's own reading of an invoice the OCR was unsure about: every value it
 * checked against its PDF, corrected where the reading was wrong.
 *
 * The service checks it again without the OCR's doubts, so it carries the whole set
 * rather than only the fields that were flagged.
 */
export class ConfirmInvoiceReviewCommand {
    readonly invoiceId: string;
    readonly series: string;
    readonly number: string;
    readonly issueDate: string;
    readonly dueDate: string;
    readonly issuerRuc: string;
    readonly payerRuc: string;
    readonly subtotal: number;
    readonly tax: number;
    readonly total: number;

    constructor({
        invoiceId,
        series,
        number,
        issueDate,
        dueDate,
        issuerRuc,
        payerRuc,
        subtotal,
        tax,
        total
    }: ConfirmInvoiceReviewCommandAttributes) {
        this.invoiceId = invoiceId;
        this.series = series.trim();
        this.number = number.trim();
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.issuerRuc = issuerRuc.trim();
        this.payerRuc = payerRuc.trim();
        this.subtotal = subtotal;
        this.tax = tax;
        this.total = total;
    }
}
