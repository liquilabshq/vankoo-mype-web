import type es from '@/locales/es.json';

/** Every key under `invoicing.status`, derived from the locale file rather than repeated. */
type InvoiceStatusKey = `invoicing.status.${keyof typeof es.invoicing.status & string}`;

/**
 * The values `InvoiceStatus` can hold.
 *
 * `REQUIRES_REVIEW` is the exception: the service's own enum does not define it yet
 * (only the other eight), but the design has a whole screen for it — `MK · Detalle ·
 * Requiere revisión` — so it is modeled here as what the frontend needs to render,
 * ahead of the backend. Treat it as provisional the same way `InvoiceListItemResource`
 * and `InvoiceDetailResource` are.
 */
export type InvoiceStatus =
    | 'UPLOADED'
    | 'OCR_PROCESSING'
    | 'DATA_EXTRACTED'
    | 'SUNAT_VALIDATING'
    | 'SUNAT_VALIDATED'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'REQUIRES_REVIEW'
    | 'REJECTED';

const KNOWN_STATUSES: readonly InvoiceStatus[] = [
    'UPLOADED',
    'OCR_PROCESSING',
    'DATA_EXTRACTED',
    'SUNAT_VALIDATING',
    'SUNAT_VALIDATED',
    'APPROVED',
    'PUBLISHED',
    'REQUIRES_REVIEW',
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
    REQUIRES_REVIEW: {
        labelKey: 'invoicing.status.REQUIRES_REVIEW',
        fgClass: 'text-status-requires-review',
        bgClass: 'bg-status-requires-review-bg'
    },
    REJECTED: {labelKey: 'invoicing.status.REJECTED', fgClass: 'text-status-rejected', bgClass: 'bg-status-rejected-bg'}
};

/** How to word and color one status, for `StatusPill`. */
export function presentationForStatus(status: InvoiceStatus): StatusPresentation {
    return PRESENTATION_BY_STATUS[status];
}

/** Every status, in the order the filter's `Select` should list them. */
export const ALL_INVOICE_STATUSES: readonly InvoiceStatus[] = KNOWN_STATUSES;

/** The five milestones of the rail (`Riel`), left to right. */
export type InvoiceMilestone = 'received' | 'reading' | 'validating' | 'approved' | 'inAuction';

const MILESTONE_ORDER: readonly InvoiceMilestone[] = ['received', 'reading', 'validating', 'approved', 'inAuction'];

/**
 * Which milestone each status belongs to.
 *
 * Three statuses have no entry: `REJECTED` has no place on this rail — the design's
 * "sin salida" (red, dead-end) treatment is not modeled yet — and `CONSISTENCY_PASSED`
 * / `NOT_ELIGIBLE` are not real statuses (see `InvoiceStatus`'s own note).
 */
const MILESTONE_BY_STATUS: Partial<Record<InvoiceStatus, InvoiceMilestone>> = {
    UPLOADED: 'received',
    OCR_PROCESSING: 'reading',
    DATA_EXTRACTED: 'reading',
    REQUIRES_REVIEW: 'reading',
    SUNAT_VALIDATING: 'validating',
    SUNAT_VALIDATED: 'validating',
    APPROVED: 'approved',
    PUBLISHED: 'inAuction'
};

/** Where a status places the rail: which milestone, and how it reads. */
export interface RailState {
    currentIndex: number;
    /** Automatic (indigo) — the system is working it. Attention (amber) — a person has to. */
    currentState: 'automatic' | 'attention';
}

/**
 * Computes the rail state for a status, or null when the status has no place on it
 * (`REJECTED` today).
 *
 * `REQUIRES_REVIEW` always lands on "Leyendo datos": the backend does not carry which
 * stage triggered the review, and the frontend has no other signal to place it more
 * precisely. Treat this as a simplification to revisit once it does.
 */
export function railStateFor(status: InvoiceStatus): RailState | null {
    const milestone = MILESTONE_BY_STATUS[status];
    if (!milestone) return null;
    return {
        currentIndex: MILESTONE_ORDER.indexOf(milestone),
        currentState: status === 'REQUIRES_REVIEW' ? 'attention' : 'automatic'
    };
}
