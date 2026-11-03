import {cn} from '@/lib/utils';

/**
 * A block standing in for content that is still loading — the design system's
 * `Skeleton`. It is `surface/sunken`, so it shows on a raised card in both themes;
 * on the page background it would vanish in dark mode, where the two are the same.
 */
function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="skeleton"
            aria-hidden="true"
            className={cn('bg-surface-sunken rounded-md motion-safe:animate-pulse', className)}
            {...props}
        />
    );
}

export {Skeleton};
