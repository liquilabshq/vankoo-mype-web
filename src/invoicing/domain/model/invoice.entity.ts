import type {InvoiceStatus} from './invoice-status';

/** An amount of money, as the backend's own `Money` value object carries it. */
export interface InvoiceAmount {
    value: number;
    currency: string;
}

/**
 * e.g. "S/ 18,400.00" — shared by every screen that shows an `InvoiceAmount`.
 *
 * Locked to `es-PE` rather than following `i18n.language`: every amount in this app is
 * Peruvian soles, on documents Peruvian users read, regardless of which UI language is
 * active — an invoice total should not restyle itself because someone switched to
 * English.
 */
export function formatInvoiceAmount(amount: InvoiceAmount): string {
    return new Intl.NumberFormat('es-PE', {style: 'currency', currency: amount.currency}).format(amount.value);
}

/** Attributes an invoice row is built from. */
export interface InvoiceAttributes {
    id: string;
    number: string | null;
    payerName: string | null;
    payerRuc: string | null;
    dueDate: Date | null;
    status: InvoiceStatus;
    amount: InvoiceAmount | null;
    uploadedAt: Date;
}

/**
 * One row of the MYPE's own invoice list, as `GET /invoices` returns it.
 *
 * Everything the OCR reads — number, payer, due date, amount — is null until it has
 * read the invoice, so a row just uploaded still shows, with its status.
 */
export class Invoice {
    readonly id: string;
    readonly number: string | null;
    readonly payerName: string | null;
    readonly payerRuc: string | null;
    readonly dueDate: Date | null;
    readonly status: InvoiceStatus;
    readonly amount: InvoiceAmount | null;
    readonly uploadedAt: Date;

    constructor({id, number, payerName, payerRuc, dueDate, status, amount, uploadedAt}: InvoiceAttributes) {
        this.id = id;
        this.number = number;
        this.payerName = payerName;
        this.payerRuc = payerRuc;
        this.dueDate = dueDate;
        this.status = status;
        this.amount = amount;
        this.uploadedAt = uploadedAt;
    }

    /** The amount column, e.g. "S/ 18,400.00"; null until the OCR read it. */
    formattedAmount(): string | null {
        return this.amount ? formatInvoiceAmount(this.amount) : null;
    }
}

/** One page of the list, and how many invoices match in all. */
export interface InvoicePage {
    invoices: Invoice[];
    totalItems: number;
}
