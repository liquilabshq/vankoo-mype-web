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
     * Uploads the PDF.
     *
     * `Content-Type` is explicitly cleared rather than left alone: `BaseApi` sets
     * `application/json` as an instance-wide default, and axios does not drop that
     * default just because this call's body is `FormData` — confirmed against the
     * real backend, which answered 415 until this line was added. Clearing it here
     * is what lets the browser generate the multipart boundary itself.
     */
    uploadInvoice(file: File): Promise<AxiosResponse<InvoiceResource>> {
        const body = new FormData();
        body.append('File', file);
        return this.http.post<InvoiceResource>(invoicesEndpointPath, body, {headers: {'Content-Type': null}});
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
        return `${import.meta.env.VITE_INVOICING_API_URL}${invoicesEndpointPath}/${invoiceId}/file`;
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
