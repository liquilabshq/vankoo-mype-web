import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

interface RailStep {
    label: string;
}

interface InvoiceRailProps {
    steps: readonly RailStep[];
    /**
     * Index of the milestone in progress. Steps before it read as done, steps after as
     * not yet reached. Omitted before anything has been uploaded, when there is no
     * progress to report and every dot reads the same neutral "not yet".
     */
    currentIndex?: number;
    /**
     * Automatic (indigo) — the system is working it. Attention (amber) — a person has
     * to. Blocked (solid red) — a dead end.
     */
    currentState?: 'automatic' | 'attention' | 'blocked';
    /**
     * Only the track, 8px dots and no labels — the design's `Riel · Compacto`, for a
     * list row. It is hidden from assistive tech: the row prints the status next to
     * it, and five unlabelled dots would only be noise read aloud.
     */
    compact?: boolean;
    /** The step whose panel is open. Only a step already reached can be. */
    selectedIndex?: number;
    /** Makes every reached step a button that opens its panel. */
    onSelect?: (index: number) => void;
    /**
     * What the open step says about itself. Below `sm` it opens under its own step, on
     * the vertical rail; from `sm` up, under the whole horizontal rail.
     */
    panel?: ReactNode;
}

type StepState = 'done' | 'current-automatic' | 'current-attention' | 'current-blocked' | 'pending';

function stateFor(
    index: number,
    currentIndex: number | undefined,
    currentState: 'automatic' | 'attention' | 'blocked'
): StepState {
    if (currentIndex === undefined) return 'pending';
    if (index < currentIndex) return 'done';
    if (index === currentIndex) {
        if (currentState === 'attention') return 'current-attention';
        if (currentState === 'blocked') return 'current-blocked';
        return 'current-automatic';
    }
    return 'pending';
}

const LINE_CLASS: Record<StepState, string> = {
    done: 'bg-fg',
    'current-automatic': 'bg-status-ocr-processing',
    'current-attention': 'bg-status-requires-review',
    // A dead end is a solid punctuation mark, not something actively moving through —
    // its segments stay the neutral "not yet" gray rather than taking its color.
    'current-blocked': 'bg-border-strong',
    pending: 'bg-border-strong'
};

/** Color changes between states are eased rather than snapped, so a step being reached reads as movement. */
const TRANSITION = 'transition-colors duration-500';

function dotClass(state: StepState, compact: boolean): string {
    const ring = compact ? 'border-[1.5px]' : 'border-2';
    return cn(
        'shrink-0 rounded-full',
        TRANSITION,
        compact ? 'size-2' : 'size-4',
        state === 'done' && 'bg-fg',
        state === 'current-automatic' && cn('bg-surface-raised border-status-ocr-processing', ring),
        state === 'current-attention' && cn('bg-surface-raised border-status-requires-review', ring),
        state === 'current-blocked' && 'bg-status-rejected',
        state === 'pending' && 'bg-border-strong'
    );
}

/**
 * One half-segment. `loading` paints the stretch toward the next milestone as work in
 * progress: an indigo stroke crosses the gray track and starts again. With reduced
 * motion the track simply stays gray.
 */
function Segment({className, loading, vertical}: {className: string; loading?: boolean; vertical?: boolean}) {
    return (
        <span className={cn('relative flex-1 overflow-hidden', vertical ? 'w-0.5' : 'h-0.5', TRANSITION, className)}>
            {loading && (
                <span
                    className={cn(
                        'bg-status-ocr-processing absolute inset-0 motion-reduce:hidden',
                        vertical ? 'animate-rail-loading-vertical' : 'animate-rail-loading'
                    )}
                />
            )}
        </span>
    );
}

/**
 * The five-milestone rail (the design's `Riel`).
 *
 * Each dot draws its own two half-segments in its own color — the design's rule is
 * that a segment belongs to the dot it leaves, not the one it enters, so the color
 * change between two different states falls at the segment's midpoint. That rule has
 * one exception: a blocked (dead-end) dot's segments stay gray, per `LINE_CLASS`'s own
 * note. Done is navy, automatic progress is indigo with a hollow ring, attention (a
 * person has to act) is amber with a hollow ring, blocked is solid red with no ring,
 * and not-yet is gray. While the platform works on its own, the half-segment entering
 * the next milestone shows the work moving toward it.
 *
 * From `sm` up it is horizontal (`Riel · Horizontal`); below, vertical (`Riel ·
 * Vertical`), where five labels side by side would not fit. Reached steps are buttons
 * when `onSelect` is given, and the open one shows `panel`.
 */
export function InvoiceRail({
    steps,
    currentIndex,
    currentState = 'automatic',
    compact = false,
    selectedIndex,
    onSelect,
    panel
}: InvoiceRailProps) {
    const states = steps.map((_, index) => stateFor(index, currentIndex, currentState));
    // The stretch entering the milestone after the current one is where the work is going.
    const loadingInto = (index: number) => index > 0 && states[index - 1] === 'current-automatic';
    const reachable = (index: number) => onSelect !== undefined && currentIndex !== undefined && index <= currentIndex;

    const label = (step: RailStep, index: number, align: 'center' | 'start') => {
        const selected = selectedIndex === index;
        const text = cn(
            'text-fg w-full px-1 text-[11px] leading-4 break-words sm:text-caption',
            align === 'center' ? 'text-center' : 'text-left text-body sm:text-body',
            selected && 'font-semibold'
        );
        if (!reachable(index)) return <p className={text}>{step.label}</p>;
        return (
            <button
                type="button"
                onClick={() => onSelect?.(index)}
                aria-expanded={selected}
                className={cn(
                    text,
                    'hover:text-fg-secondary focus-visible:ring-ring cursor-pointer rounded-sm underline-offset-4 outline-none focus-visible:ring-2',
                    selected ? 'underline decoration-2' : 'hover:underline'
                )}
            >
                {step.label}
            </button>
        );
    };

    if (compact) {
        return (
            <ol className="flex w-full items-center" aria-hidden="true">
                {steps.map((step, index) => (
                    <li key={step.label} className="flex min-w-0 flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                            <Segment className={index === 0 ? 'bg-transparent' : LINE_CLASS[states[index]]} />
                            <span className={dotClass(states[index], true)} />
                            <Segment className={index === steps.length - 1 ? 'bg-transparent' : LINE_CLASS[states[index]]} />
                        </div>
                    </li>
                ))}
            </ol>
        );
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <ol className="hidden w-full items-start sm:flex">
                {steps.map((step, index) => (
                    <li key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
                        <div className="flex w-full items-center">
                            <Segment
                                className={index === 0 ? 'bg-transparent' : LINE_CLASS[states[index]]}
                                loading={loadingInto(index)}
                            />
                            <span className={dotClass(states[index], false)} />
                            <Segment className={index === steps.length - 1 ? 'bg-transparent' : LINE_CLASS[states[index]]} />
                        </div>
                        {label(step, index, 'center')}
                    </li>
                ))}
            </ol>
            {panel && selectedIndex !== undefined && <div className="hidden sm:block">{panel}</div>}

            <ol className="flex w-full flex-col sm:hidden">
                {steps.map((step, index) => (
                    <li key={step.label} className="flex gap-3">
                        <div className="flex w-4 shrink-0 flex-col items-center">
                            <span className={cn('mt-1', dotClass(states[index], false))} />
                            {/* Vertically the stretch below a dot is the whole way to the next
                                one, so the work in progress runs down it from the current dot. */}
                            <Segment
                                vertical
                                className={cn(
                                    'min-h-4',
                                    index === steps.length - 1
                                        ? 'bg-transparent'
                                        : loadingInto(index + 1)
                                          ? 'bg-border-strong'
                                          : LINE_CLASS[states[index]]
                                )}
                                loading={index < steps.length - 1 && loadingInto(index + 1)}
                            />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2 pb-4">
                            {label(step, index, 'start')}
                            {panel && selectedIndex === index && panel}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
