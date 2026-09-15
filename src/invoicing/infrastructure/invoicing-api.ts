import type {AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import type {InvoiceStatus} from '../domain/model/invoice-status';
import type {InvoiceDetailResource} from './invoice-detail.resource';
import type {InvoiceListItemResource} from './invoice-list.resource';
import type {InvoiceResource} from './invoice.resource';

const invoicesEndpointPath = import.meta.env.VITE_INVOICES_ENDPOINT_PATH;

/** Filters `GET /invoices` accepts, all optional. */
export interface InvoiceListQuery {
    search?: string;
    status?: InvoiceStatus;
    from?: string;
    page?: number;
}

/**
 * The API of the invoicing bounded context.
 *
 * Upload reaches `this.http` directly rather than composing a `BaseEndpoint`: the
 * backend expects `multipart/form-data`, not the JSON body every `BaseEndpoint`
 * method assumes, so the endpoint would earn nothing here.
 */
export class InvoicingApi extends BaseApi {
    constructor(options: BaseApiOptions = {}) {
        super(options);
    }

    /**
     * Uploads the PDF. No explicit `Content-Type` is set on purpose: axios detects a
     * `FormData` body and lets the browser generate the multipart boundary itself —
     * setting the header by hand here would omit that boundary and the backend would
     * fail to parse it.
     */
    uploadInvoice(file: File): Promise<AxiosResponse<InvoiceResource>> {
        const body = new FormData();
        body.append('File', file);
        return this.http.post<InvoiceResource>(invoicesEndpointPath, body);
    }

    /**
     * Lists the MYPE's own invoices, filtered and paginated server-side.
     *
     * Provisional, like `InvoiceListItemResource`: this endpoint is not implemented
     * on the backend yet, so a call here fails until it is.
     */
    getInvoices(
        query: InvoiceListQuery = {}
    ): Promise<AxiosResponse<InvoiceListItemResource[] | Record<string, InvoiceListItemResource[]>>> {
        return this.http.get(invoicesEndpointPath, {params: query});
    }

    /** Where the uploaded PDF can be downloaded from directly — `GET .../{id}/file`. */
    invoiceFileUrl(invoiceId: string): string {
        return `${import.meta.env.VITE_PLATFORM_API_URL}${invoicesEndpointPath}/${invoiceId}/file`;
    }

    /**
     * Reads one invoice in full.
     *
     * Provisional, like `InvoiceDetailResource`: this endpoint is not implemented on
     * the backend yet, so a call here fails until it is.
     */
    getInvoiceById(invoiceId: string): Promise<AxiosResponse<InvoiceDetailResource>> {
        return this.http.get(`${invoicesEndpointPath}/${invoiceId}`);
    }
}
