import type {RouteObject} from 'react-router';
import {MyInvoices} from './views/MyInvoices';
import {UploadInvoice} from './views/UploadInvoice';

/**
 * Routes of the invoicing bounded context, mounted by the root router under
 * `/invoicing`. Paths stay relative here; `invoicing-paths.ts` owns the absolute ones.
 */
export const invoicingRoutes: RouteObject[] = [
    {index: true, Component: MyInvoices},
    {path: 'upload', Component: UploadInvoice}
];
