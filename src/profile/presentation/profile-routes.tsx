import type {RouteObject} from 'react-router';
import {CompanyProfile} from './views/CompanyProfile';

/** Routes of the profile bounded context, mounted by the root router under `/profile`. */
export const profileRoutes: RouteObject[] = [{index: true, Component: CompanyProfile}];
