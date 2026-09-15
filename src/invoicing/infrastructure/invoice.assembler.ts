import type {AxiosResponse} from 'axios';
import {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import {isInvoiceStatus} from '../domain/model/invoice-status';
import {Invoice} from '../domain/model/invoice.entity';
import type {InvoiceDetailResource} from './invoice-detail.resource';
import type {InvoiceListItemResource} from './invoice-list.resource';
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
            dueDate: new Date(resource.dueDate),
            status: resource.status,
            amount: resource.amount
        });
    }

    /**
     * The rows of the invoice list.
     *
     * Tolerates both a bare array and an envelope keyed by the resource name, the
     * same as `BaseEndpoint.getAll()` does — a row whose status this build does not
     * recognise is dropped rather than shown wrong.
     */
    static toInvoicesFromResponse(
        response: AxiosResponse<InvoiceListItemResource[] | Record<string, InvoiceListItemResource[]>>
    ): Invoice[] {
        const body = response.data;
        const items = Array.isArray(body) ? body : Object.values(body).flat();
        return items
            .map(item => this.toInvoiceFromListResource(item))
            .filter((invoice): invoice is Invoice => invoice !== null);
    }

    /** The full detail of one invoice, or null when its status is not one this build knows. */
    static toInvoiceDetailFromResponse(response: AxiosResponse<InvoiceDetailResource>): InvoiceDetail | null {
        const resource = response.data;
        if (!isInvoiceStatus(resource.status)) return null;
        return new InvoiceDetail({
            id: resource.id,
            number: resource.number,
            status: resource.status,
            issuerName: resource.issuerName,
            issuerRuc: resource.issuerRuc,
            payerName: resource.payerName,
            payerRuc: resource.payerRuc,
            issuedAt: new Date(resource.issuedAt),
            dueDate: new Date(resource.dueDate),
            currency: resource.currency,
            fiscalNumber: resource.fiscalNumber,
            lineItems: resource.lineItems,
            totals: resource.totals,
            settlement: resource.settlement,
            alertMessage: resource.alertMessage
        });
    }
}
