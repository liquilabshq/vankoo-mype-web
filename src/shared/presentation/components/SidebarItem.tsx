import type {ComponentType} from 'react';
import {NavLink} from 'react-router';
import {cn} from '@/lib/utils';

interface SidebarItemProps {
    icon: ComponentType<{className?: string}>;
    label: string;
    /** Omitted for a screen that has not been built yet — renders inert rather than link to a 404. */
    to?: string;
    /**
     * Whether the link only lights up on an exact match. Off for a section with
     * sub-routes (e.g. Facturas), so uploading or any other invoicing screen keeps it
     * highlighted; on for `/`, which would otherwise prefix-match every route.
     */
    end?: boolean;
}

const baseClassName = 'relative flex h-10 items-center gap-3 rounded-md px-3';

/**
 * One entry of the app's sidebar navigation.
 *
 * The sidebar is a raised surface, so a resting item reads in `text/secondary`; the
 * mockups still carry the on-inverse blue from when the sidebar was navy, and on white
 * it falls to 1.7:1. The active item is navy. It also gets a 3px accent bar next to
 * the fill change, because color alone would not carry the state for someone who
 * cannot distinguish it.
 */
export function SidebarItem({icon: Icon, label, to, end = true}: SidebarItemProps) {
    if (!to) {
        return (
            <span className={cn(baseClassName, 'text-fg-disabled cursor-default')} aria-disabled="true">
                <Icon className="size-5 shrink-0" />
                <span className="text-body flex-1 truncate">{label}</span>
            </span>
        );
    }

    return (
        <NavLink
            to={to}
            end={end}
            className={({isActive}) =>
                cn(
                    baseClassName,
                    isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                        : 'text-fg-secondary hover:bg-accent hover:text-accent-foreground'
                )
            }
        >
            {({isActive}) => (
                <>
                    <Icon className="size-5 shrink-0" />
                    <span className="text-body flex-1 truncate">{label}</span>
                    {isActive && <span className="bg-sidebar-primary absolute inset-y-2 left-0 w-[3px] rounded-sm" />}
                </>
            )}
        </NavLink>
    );
}
