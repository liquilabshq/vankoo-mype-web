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

/**
 * What the MYPE would receive if this invoice were auctioned today.
 *
 * Vankoo sets the discount and fee when it creates the auction, so this only exists
 * once the invoice has cleared SUNAT validation — before that there is nothing to
 * price yet, which is what tells the view to show the plain amount instead.
 */
export interface InvoiceSettlement {
    discountPercentage: number;
    discountAmount: InvoiceAmount;
    netAmount: InvoiceAmount;
    feePercentage: number;
    feeAmount: InvoiceAmount;
    receivableAmount: InvoiceAmount;
}

/** Attributes an invoice detail is built from. */
export interface InvoiceDetailAttributes {
    id: string;
    number: string;
    status: InvoiceStatus;
    issuerName: string;
    issuerRuc: string;
    payerName: string;
    payerRuc: string;
    issuedAt: Date;
    dueDate: Date;
    currency: string;
    fiscalNumber: string;
    lineItems: readonly InvoiceLineItem[];
    totals: InvoiceTotals;
    settlement: InvoiceSettlement | null;
    /** Set only while `status` is `REQUIRES_REVIEW`; null otherwise. */
    reviewReason: string | null;
}

/**
 * The full record behind one invoice — `MK · Detalle de factura` and its
 * `Requiere revisión` variant.
 *
 * Provisional, like `Invoice`: `GET /invoices/{id}` does not exist on the backend
 * yet, so this shape is inferred from the two detail screens rather than a real
 * response DTO.
 */
export class InvoiceDetail {
    readonly id: string;
    readonly number: string;
    readonly status: InvoiceStatus;
    readonly issuerName: string;
    readonly issuerRuc: string;
    readonly payerName: string;
    readonly payerRuc: string;
    readonly issuedAt: Date;
    readonly dueDate: Date;
    readonly currency: string;
    readonly fiscalNumber: string;
    readonly lineItems: readonly InvoiceLineItem[];
    readonly totals: InvoiceTotals;
    readonly settlement: InvoiceSettlement | null;
    readonly reviewReason: string | null;

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
        settlement,
        reviewReason
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
        this.settlement = settlement;
        this.reviewReason = reviewReason;
    }

    /** Where `status` places this invoice on the rail, or null off it (`REJECTED`). */
    railState(): RailState | null {
        return railStateFor(this.status);
    }
}
