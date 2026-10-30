import {FileText, House, User, Wallet} from 'lucide-react';
import type {ComponentType} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router';
import {cn} from '@/lib/utils';
import {invoicingPaths} from '../../../invoicing/presentation/invoicing-paths';
import {profilePaths} from '../../../profile/presentation/profile-paths';

interface BottomTabProps {
    icon: ComponentType<{className?: string}>;
    label: string;
    /** Omitted for a screen that has not been built yet, as in `SidebarItem`. */
    to?: string;
    end?: boolean;
}

const baseClassName = 'flex h-14 w-18 flex-col items-center justify-center gap-1 text-caption';

/**
 * One tab, the design's `BottomNavItem`: a 24px icon over its label, 72 × 56, well
 * above the 44px touch minimum. The active tab is navy and semibold, so the state is
 * carried by weight as well as color. Resting tabs use `text/secondary` rather than
 * the frame's `text/muted`, which stays under AA for 13px text on white (4.1:1).
 */
function BottomTab({icon: Icon, label, to, end = true}: BottomTabProps) {
    if (!to) {
        return (
            <span className={cn(baseClassName, 'text-fg-disabled cursor-default')} aria-disabled="true">
                <Icon className="size-6" />
                {label}
            </span>
        );
    }

    return (
        <NavLink
            to={to}
            end={end}
            className={({isActive}) => cn(baseClassName, isActive ? 'text-fg font-semibold' : 'text-fg-secondary')}
        >
            <Icon className="size-6" />
            {label}
        </NavLink>
    );
}

/**
 * The app's navigation below `lg`, fixed to the bottom of the screen, as the mobile
 * mockups draw it. It replaces the sidebar drawer: the four destinations are always
 * one tap away, with no menu to open first.
 *
 * It pads itself by the bottom safe area, so on a phone with a home indicator the
 * tabs sit above it rather than under it; `Layout` reserves the same space below the
 * content so the bar never covers the end of a page.
 */
export function BottomTabBar() {
    const {t} = useTranslation();

    return (
        <nav className="bg-surface-raised border-border-subtle fixed inset-x-0 bottom-0 z-30 flex justify-between border-t px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden">
            <BottomTab icon={House} label={t('common.nav.home')} to="/" />
            <BottomTab icon={FileText} label={t('common.nav.invoices')} to={invoicingPaths.myInvoices()} end={false} />
            <BottomTab icon={Wallet} label={t('common.nav.wallet')} />
            <BottomTab icon={User} label={t('common.nav.profile')} to={profilePaths.myCompany()} />
        </nav>
    );
}
