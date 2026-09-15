import type es from '@/locales/es.json';

/** Every key under `invoicing.status`, derived from the locale file rather than repeated. */
type InvoiceStatusKey = `invoicing.status.${keyof typeof es.invoicing.status & string}`;

/** The values `InvoiceStatus` can hold on the Invoicing service today. */
export type InvoiceStatus =
    | 'UPLOADED'
    | 'OCR_PROCESSING'
    | 'DATA_EXTRACTED'
    | 'SUNAT_VALIDATING'
    | 'SUNAT_VALIDATED'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'REJECTED';

const KNOWN_STATUSES: readonly InvoiceStatus[] = [
    'UPLOADED',
    'OCR_PROCESSING',
    'DATA_EXTRACTED',
    'SUNAT_VALIDATING',
    'SUNAT_VALIDATED',
    'APPROVED',
    'PUBLISHED',
    'REJECTED'
];

/** Narrows a string from the wire into a status this build understands. */
export function isInvoiceStatus(value: string): value is InvoiceStatus {
    return (KNOWN_STATUSES as readonly string[]).includes(value);
}

interface StatusPresentation {
    labelKey: InvoiceStatusKey;
    fgClass: string;
    bgClass: string;
}

/**
 * Copy and color for each status, for the `StatusPill`.
 *
 * The design documents eleven `InvoiceStatus` values grouped into five rail
 * milestones, including `CONSISTENCY_PASSED`, `REQUIRES_REVIEW` and `NOT_ELIGIBLE`.
 * The service's own enum only defines the eight below today, so only those are
 * mapped — though `index.css` already carries the color tokens for the other three,
 * ready for when the backend adds them.
 */
const PRESENTATION_BY_STATUS: Record<InvoiceStatus, StatusPresentation> = {
    UPLOADED: {labelKey: 'invoicing.status.UPLOADED', fgClass: 'text-status-uploaded', bgClass: 'bg-status-uploaded-bg'},
    OCR_PROCESSING: {
        labelKey: 'invoicing.status.OCR_PROCESSING',
        fgClass: 'text-status-ocr-processing',
        bgClass: 'bg-status-ocr-processing-bg'
    },
    DATA_EXTRACTED: {
        labelKey: 'invoicing.status.DATA_EXTRACTED',
        fgClass: 'text-status-data-extracted',
        bgClass: 'bg-status-data-extracted-bg'
    },
    SUNAT_VALIDATING: {
        labelKey: 'invoicing.status.SUNAT_VALIDATING',
        fgClass: 'text-status-sunat-validating',
        bgClass: 'bg-status-sunat-validating-bg'
    },
    SUNAT_VALIDATED: {
        labelKey: 'invoicing.status.SUNAT_VALIDATED',
        fgClass: 'text-status-sunat-validated',
        bgClass: 'bg-status-sunat-validated-bg'
    },
    APPROVED: {labelKey: 'invoicing.status.APPROVED', fgClass: 'text-status-approved', bgClass: 'bg-status-approved-bg'},
    PUBLISHED: {labelKey: 'invoicing.status.PUBLISHED', fgClass: 'text-status-published', bgClass: 'bg-status-published-bg'},
    REJECTED: {labelKey: 'invoicing.status.REJECTED', fgClass: 'text-status-rejected', bgClass: 'bg-status-rejected-bg'}
};

/** How to word and color one status, for `StatusPill`. */
export function presentationForStatus(status: InvoiceStatus): StatusPresentation {
    return PRESENTATION_BY_STATUS[status];
}

/** Every status, in the order the filter's `Select` should list them. */
export const ALL_INVOICE_STATUSES: readonly InvoiceStatus[] = KNOWN_STATUSES;
