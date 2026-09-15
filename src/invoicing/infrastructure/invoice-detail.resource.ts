/**
 * Wire shape of `GET /invoices/{id}`.
 *
 * Provisional — see `InvoiceDetail`'s own note: this endpoint does not exist on the
 * backend yet.
 */
export interface InvoiceDetailResource {
    id: string;
    number: string;
    status: string;
    issuerName: string;
    issuerRuc: string;
    payerName: string;
    payerRuc: string;
    issuedAt: string;
    dueDate: string;
    currency: string;
    fiscalNumber: string;
    lineItems: readonly {
        description: string;
        quantity: number;
        unitPrice: {value: number; currency: string};
        subtotal: {value: number; currency: string};
    }[];
    totals: {
        subtotal: {value: number; currency: string};
        igv: {value: number; currency: string};
        commercialDiscount: {value: number; currency: string};
        total: {value: number; currency: string};
    };
    settlement: {
        discountPercentage: number;
        discountAmount: {value: number; currency: string};
        netAmount: {value: number; currency: string};
        feePercentage: number;
        feeAmount: {value: number; currency: string};
        receivableAmount: {value: number; currency: string};
    } | null;
    reviewReason: string | null;
}
