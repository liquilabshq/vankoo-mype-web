import type {InvoiceStatus} from './invoice-status';

/** An amount of money, as the backend's own `Money` value object carries it. */
export interface InvoiceAmount {
    value: number;
    currency: string;
}

/** Attributes an invoice row is built from. */
export interface InvoiceAttributes {
    id: string;
    number: string;
    payerName: string;
    payerRuc: string;
    dueDate: Date;
    status: InvoiceStatus;
    amount: InvoiceAmount;
}

/**
 * One row of the MYPE's own invoice list.
 *
 * Provisional: the Invoicing service exposes upload, file download and synchronous
 * OCR today, but no `GET /invoices` yet — the design's own canvas notes it as pending
 * backend work. This shape is inferred from what `MK · Mis facturas` needs to show,
 * not read off a real response DTO; expect field names to move once the endpoint and
 * its resource exist.
 */
export class Invoice {
    readonly id: string;
    readonly number: string;
    readonly payerName: string;
    readonly payerRuc: string;
    readonly dueDate: Date;
    readonly status: InvoiceStatus;
    readonly amount: InvoiceAmount;

    constructor({id, number, payerName, payerRuc, dueDate, status, amount}: InvoiceAttributes) {
        this.id = id;
        this.number = number;
        this.payerName = payerName;
        this.payerRuc = payerRuc;
        this.dueDate = dueDate;
        this.status = status;
        this.amount = amount;
    }

    /** The amount column, e.g. "S/ 18,400.00". */
    formattedAmount(locale: string): string {
        return new Intl.NumberFormat(locale, {style: 'currency', currency: this.amount.currency}).format(this.amount.value);
    }
}
