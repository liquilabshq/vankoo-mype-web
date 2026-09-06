import {LogOut} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Outlet, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {useIamStore} from '../../../iam/application/iam.store';
import {iamPaths} from '../../../iam/presentation/iam-paths';
import {PreferencesBar} from './PreferencesBar';
import {Wordmark} from './Wordmark';

/**
 * The app shell around whatever the router puts in the outlet.
 *
 * The layout is the one place allowed to reach into a bounded context from outside,
 * and it does so through that context's store and its paths, which is the loosest
 * coupling available.
 */
export function Layout() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const session = useIamStore(state => state.session);
    const signOut = useIamStore(state => state.signOut);

    function handleSignOut() {
        signOut();
        navigate(iamPaths.signIn());
    }

    return (
        <div className="bg-surface min-h-dvh">
            <header className="border-subtle flex items-center justify-between border-b px-6 py-4">
                <Wordmark className="text-fg text-2xl" />
                {/*
                  The switcher lives here too, and not only on the IAM screens: once a
                  session is open those screens are gone, and losing the way to change
                  language or theme with them would be a strange kind of reward for
                  signing in. This shell is not in Figma yet — see Home.
                */}
                <div className="flex items-center gap-4">
                    <PreferencesBar />
                    {session && (
                        <>
                            <span className="text-caption text-fg-secondary hidden sm:inline">
                                {session.user.email}
                            </span>
                            <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
                                <LogOut data-icon="inline-start" />
                                {t('common.signOut')}
                            </Button>
                        </>
                    )}
                </div>
            </header>
            <Outlet />
        </div>
    );
}
