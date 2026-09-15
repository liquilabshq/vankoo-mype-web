import {create} from 'zustand';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import type {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import type {Invoice} from '../domain/model/invoice.entity';
import {InvoiceAssembler} from '../infrastructure/invoice.assembler';
import {InvoicingApi, type InvoiceListQuery} from '../infrastructure/invoicing-api';
import type {UploadInvoiceCommand} from '../domain/model/upload-invoice.command';

const invoicingApi = new InvoicingApi({requestInterceptors: [iamInterceptor]});

/** State and use cases of the invoicing bounded context. */
export interface InvoicingState {
    submitting: boolean;
    errors: Error[];
    /** The id the backend answered with, so the view can confirm the upload succeeded. */
    uploadedInvoiceId: string | null;
    uploadInvoice: (command: UploadInvoiceCommand) => Promise<boolean>;
    /** Where that invoice's PDF can be downloaded from — a plain URL, not a fetch. */
    invoiceFileUrl: (invoiceId: string) => string;
    clearErrors: () => void;
    /** Forgets the last upload, so the dropzone can be used again. */
    reset: () => void;

    invoices: Invoice[];
    invoicesLoading: boolean;
    invoicesLoaded: boolean;
    fetchInvoices: (query?: InvoiceListQuery) => Promise<void>;

    invoiceDetail: InvoiceDetail | null;
    invoiceDetailLoading: boolean;
    invoiceDetailLoaded: boolean;
    fetchInvoiceDetail: (invoiceId: string) => Promise<void>;
    /** Forgets the last detail read, so leaving the screen does not flash stale data on the next visit. */
    clearInvoiceDetail: () => void;
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
    invoices: [],
    invoicesLoading: false,
    invoicesLoaded: false,
    invoiceDetail: null,
    invoiceDetailLoading: false,
    invoiceDetailLoaded: false,

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

    invoiceFileUrl: (invoiceId: string) => invoicingApi.invoiceFileUrl(invoiceId),

    clearErrors: () => set({errors: []}),
    reset: () => set({uploadedInvoiceId: null, errors: [], submitting: false}),

    fetchInvoices: async (query = {}) => {
        set({invoicesLoading: true, errors: []});
        try {
            const response = await invoicingApi.getInvoices(query);
            const invoices = InvoiceAssembler.toInvoicesFromResponse(response);
            set({invoices, invoicesLoading: false, invoicesLoaded: true});
        } catch (error) {
            set({errors: [error as Error], invoices: [], invoicesLoading: false, invoicesLoaded: true});
        }
    },

    fetchInvoiceDetail: async invoiceId => {
        set({invoiceDetailLoading: true, errors: []});
        try {
            const response = await invoicingApi.getInvoiceById(invoiceId);
            const invoiceDetail = InvoiceAssembler.toInvoiceDetailFromResponse(response);
            set({invoiceDetail, invoiceDetailLoading: false, invoiceDetailLoaded: true});
        } catch (error) {
            set({errors: [error as Error], invoiceDetail: null, invoiceDetailLoading: false, invoiceDetailLoaded: true});
        }
    },

    clearInvoiceDetail: () => set({invoiceDetail: null, invoiceDetailLoaded: false})
}));
