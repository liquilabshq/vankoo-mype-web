/** The data the MYPE confirms in a review, named as the confirmation form names its fields. */
export type ReviewField = 'number' | 'issueDate' | 'dueDate' | 'issuerRuc' | 'payerRuc' | 'subtotal' | 'total';

/** A note on the record, a reason to ask the MYPE, or a reason the invoice cannot go on. */
export type InvoiceIssueSeverity = 'warning' | 'review' | 'error';

/** One of the service's findings about an invoice. */
export interface InvoiceIssue {
    /** The service's code, e.g. `LOW_OCR_CONFIDENCE`. */
    code: string;
    severity: InvoiceIssueSeverity;
    /** The datum a doubtful read is about; null for every other finding. */
    field: ReviewField | null;
    /** The service's own sentence, kept for codes this build has no copy for. */
    message: string;
}

/** The finding the service raises when Azure read a critical field with too little confidence. */
export const LOW_OCR_CONFIDENCE = 'LOW_OCR_CONFIDENCE';
