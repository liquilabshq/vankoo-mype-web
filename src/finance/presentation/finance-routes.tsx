import type {RouteObject} from 'react-router';
import {MyWallet} from './views/MyWallet';

/** Routes of the finance bounded context, mounted by the root router under `/finance`. */
export const financeRoutes: RouteObject[] = [{index: true, Component: MyWallet}];
