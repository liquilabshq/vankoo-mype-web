/**
 * Every URL the invoicing context owns, built in one place.
 *
 * React Router has no named routes, so a path typed into `navigate()` is a broken
 * link waiting for someone to rename a segment.
 */
export const invoicingPaths = {
    uploadInvoice: () => '/invoicing/upload'
} as const;
