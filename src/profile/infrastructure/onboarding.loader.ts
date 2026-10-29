import {redirect} from 'react-router';
import {useProfileStore} from '../application/profile.store';
import {profilePaths} from '../presentation/profile-paths';

/**
 * Sends a company that has not sent its data yet to the onboarding, before any screen
 * of the shell renders.
 *
 * Only `PENDING` is sent there: a company in review may move around the app (the
 * mockup says so, «puedes entrar, pero aún no operar»), and a rejected one sees why
 * on its profile. If the profile cannot be read, the visitor is let through rather
 * than locked out by a failing service; the screens themselves say what failed.
 *
 * It runs after the authentication loader, so there is always a session here.
 */
export async function onboardingLoader() {
    const company = await useProfileStore.getState().ensureCompany();
    if (company?.kyc.isPending) return redirect(profilePaths.onboarding());
    return null;
}
