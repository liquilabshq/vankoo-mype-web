import {LogOut} from 'lucide-react';
import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {useIamStore} from '../../../iam/application/iam.store';
import {DotField} from '../../../iam/presentation/components/DotField';
import {iamPaths} from '../../../iam/presentation/iam-paths';
import {PreferencesBar} from '../../../shared/presentation/components/PreferencesBar';
import {Wordmark} from '../../../shared/presentation/components/Wordmark';

/**
 * The shell of the onboarding, outside the app's own: a bare header with the logo,
 * the preferences and «Salir», and the card centred on the dot field.
 *
 * Outside the sidebar on purpose, as the mockups draw it. Until the company is sent
 * for verification there is nothing in the sidebar it may use, and a menu of dead
 * links is worse than none. Signing out stays, because a MYPE that signed up with the
 * wrong account has no other way back.
 *
 * The two lights are the brand panel's tokens, softened for a light surface: at the
 * bottom-left and top-right, blurred far enough to read as tint rather than shapes.
 */
export function OnboardingLayout({children}: {children: ReactNode}) {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const signOut = useIamStore(state => state.signOut);

    function handleSignOut() {
        signOut();
        navigate(iamPaths.signIn());
    }

    return (
        <div className="bg-surface relative isolate flex min-h-dvh flex-col overflow-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-30 -left-40 -z-10 size-105 rounded-full opacity-12 blur-[160px] lg:size-155 lg:blur-[240px]"
                style={{backgroundColor: 'var(--vk-decor-light-primary)'}}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -top-10 -right-20 -z-10 size-75 rounded-full opacity-10 blur-[140px] lg:size-105 lg:blur-[200px]"
                style={{backgroundColor: 'var(--vk-decor-light-secondary)'}}
            />

            <header className="bg-surface-raised border-border relative z-10 flex h-16 items-center justify-between gap-4 border-b px-4 lg:h-18 lg:px-16">
                <Wordmark className="text-fg h-6 w-auto lg:h-7.5" />
                <div className="flex items-center gap-4">
                    <PreferencesBar />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="bg-surface-raised border-border-strong"
                        onClick={handleSignOut}
                    >
                        <LogOut data-icon="inline-start" />
                        {t('common.signOut')}
                    </Button>
                </div>
            </header>

            <main className="relative flex flex-1 items-start justify-center px-4 py-4 lg:items-center lg:py-8">
                <DotField everywhere />
                <div className="relative w-full max-w-180">{children}</div>
            </main>
        </div>
    );
}
