import type {AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import type {InvoiceResource} from './invoice.resource';

const invoicesEndpointPath = import.meta.env.VITE_INVOICES_ENDPOINT_PATH;

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
}
