import type {AxiosResponse} from 'axios';
import type {ConfirmInvoiceReviewCommand} from '../domain/model/confirm-invoice-review.command';
import {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import {LOW_OCR_CONFIDENCE, type InvoiceIssueSeverity, type ReviewField} from '../domain/model/invoice-issue';
import {isInvoiceStatus} from '../domain/model/invoice-status';
import {Invoice, type InvoicePage} from '../domain/model/invoice.entity';
import type {ConfirmInvoiceReviewResource, InvoiceDetailResource} from './invoice-detail.resource';
import type {InvoiceListItemResource, InvoicePageResource} from './invoice-list.resource';
import type {InvoiceResource} from './invoice.resource';

/** Anti-corruption layer for the invoicing calls. */
export class InvoiceAssembler {
    /** The id of the invoice just created, or null when the call did not succeed. */
    static toInvoiceIdFromResponse(response: AxiosResponse<InvoiceResource>): string | null {
        if (response.status !== 200 && response.status !== 201) return null;
        return response.data.invoiceId;
    }

    /** One row of the invoice list, or null when its status is not one this build knows. */
    static toInvoiceFromListResource(resource: InvoiceListItemResource): Invoice | null {
        if (!isInvoiceStatus(resource.status)) return null;
        return new Invoice({
            id: resource.id,
            number: resource.number,
            payerName: resource.payerName,
            payerRuc: resource.payerRuc,
            dueDate: toCalendarDateOrNull(resource.dueDate),
            status: resource.status,
            amount: resource.amount,
            uploadedAt: new Date(resource.uploadedAt)
        });
    }

    /**
     * One page of the invoice list. A row whose status this build does not recognise is
     * dropped rather than shown wrong; the total still counts it, as the server does.
     */
    static toInvoicePageFromResponse(response: AxiosResponse<InvoicePageResource>): InvoicePage {
        const body = response.data;
        return {
            invoices: (body?.items ?? [])
                .map(item => this.toInvoiceFromListResource(item))
                .filter((invoice): invoice is Invoice => invoice !== null),
            totalItems: body?.totalItems ?? 0
        };
    }

    /**
     * The full detail of one invoice, or null when its status is not one this build knows.
     *
     * The service sends amounts as plain decimals in one currency and leaves every
     * OCR-filled field null until the read succeeds; this is where both become the
     * `{value, currency}` pairs and the optional fields the entity carries.
     *
     * What the MYPE would receive is not here on purpose: that is the auction's
     * quote, which lives in Investment and is read through its own store.
     */
    static toInvoiceDetailFromResponse(response: AxiosResponse<InvoiceDetailResource>): InvoiceDetail | null {
        const resource = response.data;
        if (!isInvoiceStatus(resource.status)) return null;
        // The fallback only labels line items, which exist once the OCR has read the
        // invoice anyway; the currency the screen shows is the real one or nothing.
        const amountCurrency = resource.currency ?? DEFAULT_CURRENCY;
        const amount = (value: number | null) => ({value: value ?? 0, currency: amountCurrency});
        return new InvoiceDetail({
            id: resource.invoiceId,
            number: resource.fiscalInvoiceNumber,
            status: resource.status,
            issuerName: resource.issuerName ?? resource.issuerTradeName,
            issuerRuc: resource.issuerRuc,
            payerName: resource.payerName,
            payerRuc: resource.payerRuc,
            issuedAt: toCalendarDateOrNull(resource.issueDate),
            dueDate: toCalendarDateOrNull(resource.dueDate),
            currency: resource.currency,
            fiscalNumber: resource.fiscalInvoiceNumber,
            lineItems: resource.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: amount(item.unitPrice),
                subtotal: amount(item.subtotal)
            })),
            totals: resource.total === null
                ? null
                : {
                      subtotal: amount(resource.subtotal),
                      igv: amount(resource.tax),
                      commercialDiscount: amount(resource.discount),
                      total: amount(resource.total)
                  },
            issues: resource.validationIssues.map(issue => ({
                code: issue.code,
                severity: SEVERITY_BY_NUMBER[issue.severity] ?? 'review',
                field: issue.code === LOW_OCR_CONFIDENCE ? fieldNamedIn(issue.message) : null,
                message: issue.message
            }))
        });
    }

    /** What `POST /invoices/{id}/review` expects from the MYPE's confirmation. */
    static toConfirmInvoiceReviewResource(command: ConfirmInvoiceReviewCommand): ConfirmInvoiceReviewResource {
        return {
            series: command.series,
            number: command.number,
            issueDate: command.issueDate,
            dueDate: command.dueDate,
            issuerRuc: command.issuerRuc,
            payerRuc: command.payerRuc,
            subtotal: command.subtotal,
            tax: command.tax,
            total: command.total
        };
    }
}

/** The service's `InvoiceValidationSeverity`, which travels as a number. */
const SEVERITY_BY_NUMBER: Record<number, InvoiceIssueSeverity> = {1: 'warning', 2: 'review', 3: 'error'};

/** Azure's names for the critical fields, as the service quotes them, against the form's. */
const REVIEW_FIELD_BY_AZURE_NAME: Record<string, ReviewField> = {
    InvoiceId: 'number',
    InvoiceDate: 'issueDate',
    DueDate: 'dueDate',
    IssuerTaxId: 'issuerRuc',
    PayerTaxId: 'payerRuc',
    SubTotal: 'subtotal',
    InvoiceTotal: 'total'
};

/**
 * The field a low-confidence finding is about.
 *
 * The service names it only inside its sentence — «El campo crítico 'InvoiceTotal'
 * tiene confianza OCR de 74 %» — so it is read from between the quotes. A sentence
 * worded differently yields null, and the screen falls back to a general reason.
 */
function fieldNamedIn(message: string): ReviewField | null {
    const azureName = /'([A-Za-z]+)'/.exec(message)?.[1];
    return azureName ? (REVIEW_FIELD_BY_AZURE_NAME[azureName] ?? null) : null;
}

/** The product's currency, only to label line items the OCR read without one. */
const DEFAULT_CURRENCY = 'PEN';

/**
 * A calendar day from the wire, at local midnight, or null when the field is empty or
 * does not parse.
 *
 * Invoicing sends an issue or due date as UTC midnight. Read as an instant, that is
 * the evening before in Lima, so every date showed one day early; only the day part
 * is kept, so the 28th stays the 28th in any time zone.
 */
function toCalendarDateOrNull(value: string | null): Date | null {
    const match = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
}
