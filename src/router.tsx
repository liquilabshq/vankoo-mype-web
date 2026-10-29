import {createBrowserRouter} from 'react-router';
import {authenticationLoader} from './iam/infrastructure/authentication.loader';
import {iamRoutes} from './iam/presentation/iam-routes';
import {invoicingRoutes} from './invoicing/presentation/invoicing-routes';
import {onboardingLoader} from './profile/infrastructure/onboarding.loader';
import {profileRoutes} from './profile/presentation/profile-routes';
import {CompanyOnboarding} from './profile/presentation/views/CompanyOnboarding';
import {Layout} from './shared/presentation/components/Layout';
import {Home} from './shared/presentation/views/Home';
import {NotFound} from './shared/presentation/views/NotFound';

/**
 * The root router, composing the bounded contexts.
 *
 * IAM sits outside the app shell rather than inside it: its screens own the whole
 * viewport — brand panel on one side, form on the other — and wrapping them in a
 * header with a sign-out button would be nonsense on a sign-in page. It is also
 * outside the authentication loader, for the obvious reason that guarding the way in
 * would redirect the sign-in screen to itself.
 *
 * Everything else hangs off the shell route that carries the loader, so the next
 * context is protected by being added there rather than by someone remembering to.
 *
 * The onboarding sits outside the shell too, behind the session check only: it is
 * where the shell's guard sends a company that has not sent its data for
 * verification, so guarding it with that same check would loop.
 */

/** A session first, then a company that went past the onboarding. */
async function shellLoader() {
    return authenticationLoader() ?? (await onboardingLoader());
}
export const router = createBrowserRouter([
    {path: '/iam', children: iamRoutes},
    {path: '/onboarding', Component: CompanyOnboarding, loader: authenticationLoader},
    {
        path: '/',
        Component: Layout,
        children: [
            {index: true, Component: Home, loader: shellLoader},
            {path: 'invoicing', children: invoicingRoutes, loader: shellLoader},
            {path: 'profile', children: profileRoutes, loader: shellLoader},
            {path: '*', Component: NotFound}
        ]
    }
]);
