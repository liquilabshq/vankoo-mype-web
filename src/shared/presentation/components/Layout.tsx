import {FileText, House, LogOut, User, Wallet} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Outlet, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {useIamStore} from '../../../iam/application/iam.store';
import {iamPaths} from '../../../iam/presentation/iam-paths';
import {invoicingPaths} from '../../../invoicing/presentation/invoicing-paths';
import {useProfileStore} from '../../../profile/application/profile.store';
import {profilePaths} from '../../../profile/presentation/profile-paths';
import {BottomTabBar} from './BottomTabBar';
import {SidebarItem} from './SidebarItem';
import {TopBar} from './TopBar';
import {Wordmark} from './Wordmark';

/**
 * The app shell: a sidebar for navigation, a top bar, and whatever the router
 * puts in the outlet. Below `lg` the sidebar gives way to a tab bar fixed to the
 * bottom, as in the mobile mockups, and the top bar takes the wordmark and «Salir».
 *
 * The layout is the one place allowed to reach into a bounded context from outside,
 * and it does so through that context's store and its paths, which is the loosest
 * coupling available. The wallet has no screen yet, so its sidebar entry renders
 * inert instead of linking somewhere that would 404. The foot of the sidebar names the
 * company, as the mockups do, and falls back to the account's email until it has one.
 */
export function Layout() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const session = useIamStore(state => state.session);
    const signOut = useIamStore(state => state.signOut);
    const businessName = useProfileStore(state => state.company?.businessName ?? null);

    function handleSignOut() {
        signOut();
        navigate(iamPaths.signIn());
    }

    return (
        <div className="flex min-h-dvh">
            <aside className="bg-sidebar border-sidebar-border hidden w-60 shrink-0 flex-col gap-6 border-r p-6 lg:flex">
                <Wordmark className="text-sidebar-foreground h-8 w-auto" />

                <nav className="flex flex-col gap-1">
                    <SidebarItem icon={House} label={t('common.nav.home')} to="/" />
                    <SidebarItem
                        icon={FileText}
                        label={t('common.nav.invoices')}
                        to={invoicingPaths.myInvoices()}
                        end={false}
                    />
                    <SidebarItem icon={Wallet} label={t('common.nav.wallet')} />
                    <SidebarItem icon={User} label={t('common.nav.profile')} to={profilePaths.myCompany()} />
                </nav>

                <div className="flex-1" />

                {session && (
                    <div className="flex flex-col gap-4">
                        <p className="text-caption text-sidebar-foreground truncate font-semibold">
                            {businessName ?? session.user.email}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleSignOut}
                        >
                            <LogOut data-icon="inline-start" />
                            {t('common.signOut')}
                        </Button>
                    </div>
                )}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar onSignOut={session ? handleSignOut : undefined} />
                {/* The bottom padding below `lg` clears the tab bar: its 72px, the safe
                    area it pads itself by, and the usual 16px of breathing room. */}
                <main className="min-w-0 flex-1 p-4 pb-[calc(88px+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(96px+env(safe-area-inset-bottom))] lg:p-8">
                    <Outlet />
                </main>
            </div>

            <BottomTabBar />
        </div>
    );
}
