import type {RouteObject} from 'react-router';
import {UploadInvoice} from './views/UploadInvoice';

/**
 * Routes of the invoicing bounded context, mounted by the root router under
 * `/invoicing`. Paths stay relative here; `invoicing-paths.ts` owns the absolute ones.
 */
export const invoicingRoutes: RouteObject[] = [
    {path: 'upload', Component: UploadInvoice}
];
