import type {AxiosResponse} from 'axios';
import type {InvoiceResource} from './invoice.resource';

/** Anti-corruption layer for the upload-invoice call. */
export class InvoiceAssembler {
    /** The id of the invoice just created, or null when the call did not succeed. */
    static toInvoiceIdFromResponse(response: AxiosResponse<InvoiceResource>): string | null {
        if (response.status !== 200 && response.status !== 201) return null;
        return response.data.invoiceId;
    }
}
