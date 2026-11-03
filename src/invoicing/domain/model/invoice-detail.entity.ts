import type {InvoiceIssue, ReviewField} from './invoice-issue';
import {LOW_OCR_CONFIDENCE} from './invoice-issue';
import {railStateFor, type InvoiceStatus, type RailState} from './invoice-status';
import type {InvoiceAmount} from './invoice.entity';

/** One line of "Detalle de la factura". */
export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: InvoiceAmount;
    subtotal: InvoiceAmount;
}

/** The tax breakdown under the line items. */
export interface InvoiceTotals {
    subtotal: InvoiceAmount;
    igv: InvoiceAmount;
    commercialDiscount: InvoiceAmount;
    total: InvoiceAmount;
}

/** Attributes an invoice detail is built from. */
export interface InvoiceDetailAttributes {
    id: string;
    /** The fiscal number, e.g. F001-1283. Null until the OCR has read it. */
    number: string | null;
    status: InvoiceStatus;
    issuerName: string | null;
    issuerRuc: string | null;
    payerName: string | null;
    payerRuc: string | null;
    issuedAt: Date | null;
    dueDate: Date | null;
    /** Null until the OCR has read it: a currency nobody read is not PEN by default. */
    currency: string | null;
    fiscalNumber: string | null;
    lineItems: readonly InvoiceLineItem[];
    /** Null until the service has an amount. S/ 0.00 would be a figure nobody measured. */
    totals: InvoiceTotals | null;
    /** What the service found: why it needs a person, or why it cannot go on. */
    issues: readonly InvoiceIssue[];
}

/**
 * The full record behind one invoice — `MK · Detalle de factura` and its
 * `Requiere revisión` variant, as `GET /invoices/{id}` answers it.
 *
 * Every field the OCR fills in is optional: an invoice that was only uploaded, or
 * whose read failed, has an id and a status and nothing else, and the screen has to
 * render that without inventing a date.
 */
export class InvoiceDetail {
    readonly id: string;
    readonly number: string | null;
    readonly status: InvoiceStatus;
    readonly issuerName: string | null;
    readonly issuerRuc: string | null;
    readonly payerName: string | null;
    readonly payerRuc: string | null;
    readonly issuedAt: Date | null;
    readonly dueDate: Date | null;
    readonly currency: string | null;
    readonly fiscalNumber: string | null;
    readonly lineItems: readonly InvoiceLineItem[];
    readonly totals: InvoiceTotals | null;
    readonly issues: readonly InvoiceIssue[];

    constructor({
        id,
        number,
        status,
        issuerName,
        issuerRuc,
        payerName,
        payerRuc,
        issuedAt,
        dueDate,
        currency,
        fiscalNumber,
        lineItems,
        totals,
        issues
    }: InvoiceDetailAttributes) {
        this.id = id;
        this.number = number;
        this.status = status;
        this.issuerName = issuerName;
        this.issuerRuc = issuerRuc;
        this.payerName = payerName;
        this.payerRuc = payerRuc;
        this.issuedAt = issuedAt;
        this.dueDate = dueDate;
        this.currency = currency;
        this.fiscalNumber = fiscalNumber;
        this.lineItems = lineItems;
        this.totals = totals;
        this.issues = issues;
    }

    /** The findings that stop the invoice, in the service's order; warnings are only notes. */
    blockingIssues(): readonly InvoiceIssue[] {
        return this.issues.filter(issue => issue.severity !== 'warning');
    }

    /** The data Azure read with too little confidence, for the MYPE to check first. */
    doubtfulFields(): ReadonlySet<ReviewField> {
        return new Set(
            this.blockingIssues()
                .filter(issue => issue.code === LOW_OCR_CONFIDENCE && issue.field !== null)
                .map(issue => issue.field as ReviewField)
        );
    }

    /** Where `status` places this invoice on the rail, or null off it (`REJECTED`). */
    railState(): RailState | null {
        return railStateFor(this.status);
    }
}
