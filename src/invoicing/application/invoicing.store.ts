import {create} from 'zustand';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import {InvoiceAssembler} from '../infrastructure/invoice.assembler';
import {InvoicingApi} from '../infrastructure/invoicing-api';
import type {UploadInvoiceCommand} from '../domain/model/upload-invoice.command';

const invoicingApi = new InvoicingApi({requestInterceptors: [iamInterceptor]});

/** State and use cases of the invoicing bounded context. */
export interface InvoicingState {
    submitting: boolean;
    errors: Error[];
    /** The id the backend answered with, so the view can confirm the upload succeeded. */
    uploadedInvoiceId: string | null;
    uploadInvoice: (command: UploadInvoiceCommand) => Promise<boolean>;
    clearErrors: () => void;
    /** Forgets the last upload, so the dropzone can be used again. */
    reset: () => void;
}

/**
 * The application layer of the invoicing context.
 *
 * The only thing that talks to `InvoicingApi`, and the only place `InvoiceAssembler`
 * is called.
 */
export const useInvoicingStore = create<InvoicingState>()(set => ({
    submitting: false,
    errors: [],
    uploadedInvoiceId: null,

    uploadInvoice: async command => {
        set({submitting: true, errors: []});
        try {
            const response = await invoicingApi.uploadInvoice(command.file);
            const invoiceId = InvoiceAssembler.toInvoiceIdFromResponse(response);
            if (!invoiceId) {
                set({errors: [new Error('Upload answered without an invoice id')], submitting: false});
                return false;
            }
            set({uploadedInvoiceId: invoiceId, submitting: false});
            return true;
        } catch (error) {
            set({errors: [error as Error], submitting: false});
            return false;
        }
    },

    clearErrors: () => set({errors: []}),
    reset: () => set({uploadedInvoiceId: null, errors: [], submitting: false})
}));
