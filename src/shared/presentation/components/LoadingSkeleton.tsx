import type {ReactNode} from 'react';

interface LoadingSkeletonProps {
    /** What is loading, for screen readers; the blocks themselves are hidden from them. */
    label: string;
    children: ReactNode;
}

/**
 * Wraps the `Skeleton` blocks that stand in for a screen while it loads.
 *
 * It fades in after 200 ms: a read that answers sooner swaps straight to the content,
 * so a fast screen never flashes grey blocks. With reduced motion it simply appears.
 */
export function LoadingSkeleton({label, children}: LoadingSkeletonProps) {
    return (
        <div
            role="status"
            className="animate-in fade-in fill-mode-both flex flex-col gap-6 delay-200 duration-200 motion-reduce:animate-none"
        >
            <span className="sr-only">{label}</span>
            {children}
        </div>
    );
}
