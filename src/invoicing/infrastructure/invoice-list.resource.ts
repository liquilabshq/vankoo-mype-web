/**
 * Wire shape of one row from `GET /invoices` (`InvoiceSummaryResponse` in
 * invoicing-service).
 *
 * Until the OCR has read the invoice it has no number, payer, dates or amount yet:
 * those come in null.
 */
export interface InvoiceListItemResource {
    id: string;
    number: string | null;
    payerName: string | null;
    payerRuc: string | null;
    issueDate: string | null;
    dueDate: string | null;
    status: string;
    amount: {value: number; currency: string} | null;
    uploadedAt: string;
}

/** Wire shape of `GET /invoices`: one page of the MYPE's own invoices, newest first. */
export interface InvoicePageResource {
    items: InvoiceListItemResource[];
    page: number;
    pageSize: number;
    totalItems: number;
}
