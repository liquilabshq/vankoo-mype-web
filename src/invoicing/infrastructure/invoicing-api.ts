import type {AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import type {InvoiceStatus} from '../domain/model/invoice-status';
import type {ConfirmInvoiceReviewResource, InvoiceDetailResource} from './invoice-detail.resource';
import type {InvoicePageResource} from './invoice-list.resource';
import type {InvoiceResource} from './invoice.resource';

const invoicesEndpointPath = import.meta.env.VITE_INVOICES_ENDPOINT_PATH;

/**
 * Filters `GET /invoices` accepts, all optional. `from` is a day, `YYYY-MM-DD`. An
 * invoice matches `statuses` if it has any of them.
 */
export interface InvoiceListQuery {
    search?: string;
    statuses?: readonly InvoiceStatus[];
    from?: string;
    page?: number;
    pageSize?: number;
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
     * Lists the MYPE's own invoices, filtered and paginated server-side. The service
     * reads the MYPE from the token the gateway checked, never from a parameter.
     */
    getInvoices(query: InvoiceListQuery = {}): Promise<AxiosResponse<InvoicePageResource>> {
        const {statuses, ...rest} = query;
        // The service reads several statuses as one comma-separated `status`; axios would
        // otherwise send an array as `status[]=…`, which it does not understand.
        return this.http.get(invoicesEndpointPath, {params: {...rest, status: statuses?.join(',') || undefined}});
    }

    /**
     * Fetches the uploaded PDF's bytes — `GET .../{id}/file`.
     *
     * A plain `<a href>` to this URL cannot carry the bearer token the gateway now
     * requires on this route, so the caller has to go through `this.http` (which does,
     * via the request interceptor) and hand the browser the bytes itself.
     */
    downloadInvoiceFile(invoiceId: string): Promise<AxiosResponse<Blob>> {
        return this.http.get(`${invoicesEndpointPath}/${invoiceId}/file`, {responseType: 'blob'});
    }

    /**
     * Reads one invoice in full — `GET .../{id}`.
     *
     * Answers for any invoice id: the service does not check that the caller owns it,
     * so any MYPE with a token can read another's by guessing an id. That is
     * invoicing-service's to fix, not something a client can guard against.
     */
    getInvoiceById(invoiceId: string): Promise<AxiosResponse<InvoiceDetailResource>> {
        return this.http.get(`${invoicesEndpointPath}/${invoiceId}`);
    }

    /**
     * Confirms, or corrects, the data of an invoice in review — `POST .../{id}/review`.
     * Answers with the invoice as it stands after the service checked them again.
     */
    confirmInvoiceReview(
        invoiceId: string,
        body: ConfirmInvoiceReviewResource
    ): Promise<AxiosResponse<InvoiceDetailResource>> {
        return this.http.post(`${invoicesEndpointPath}/${invoiceId}/review`, body);
    }
}
