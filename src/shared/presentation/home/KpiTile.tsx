import type {ComponentType, ReactNode} from 'react';
import {cn} from '@/lib/utils';

interface KpiTileProps {
    label: string;
    value: ReactNode;
    caption?: ReactNode;
    /** A small mark beside the label tying the tile to its color in the chart. */
    swatchClassName?: string;
    icon?: ComponentType<{className?: string}>;
    /**
     * The design's `KpiTile` «Destacado»: the surface inverts, to single out ONE figure per
     * row, never several. Its label and caption take the `/on-inverse` text, since the
     * usual tokens know the theme but not that the surface under them flipped.
     */
    highlighted?: boolean;
    className?: string;
}

/**
 * One dashboard figure: a label, the number as the hero, and a line of context.
 *
 * The text classes are joined by hand, not with `cn`: `tailwind-merge` takes the
 * design's type scale (`text-h1`, `text-caption`) for a text color and drops it when a
 * real color (`text-fg`) follows.
 */
export function KpiTile({label, value, caption, swatchClassName, icon: Icon, highlighted = false, className}: KpiTileProps) {
    return (
        <div
            className={cn(
                'flex min-w-0 flex-col gap-2 rounded-xl border p-4 sm:p-5',
                highlighted
                    ? 'bg-surface-inverse border-transparent'
                    : 'bg-surface-raised border-border-subtle shadow-elevation-1',
                className
            )}
        >
            <div className="flex items-center gap-2">
                {swatchClassName && <span aria-hidden="true" className={cn('size-2.5 shrink-0 rounded-sm', swatchClassName)} />}
                {Icon && <Icon aria-hidden="true" className={cn('size-4 shrink-0', highlighted ? 'text-fg-on-inverse' : 'text-fg-secondary')} />}
                <p className={`text-caption truncate font-semibold ${highlighted ? 'text-fg-on-inverse' : 'text-fg-secondary'}`}>
                    {label}
                </p>
            </div>
            <p className={`text-h1 font-bold tabular-nums ${highlighted ? 'text-fg-inverse' : 'text-fg'}`}>{value}</p>
            {caption && (
                <p className={`text-caption ${highlighted ? 'text-fg-on-inverse' : 'text-fg-secondary'}`}>{caption}</p>
            )}
        </div>
    );
}
