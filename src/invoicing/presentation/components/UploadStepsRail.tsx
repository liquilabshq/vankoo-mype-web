import {cn} from '@/lib/utils';

interface UploadStep {
    label: string;
}

interface UploadStepsRailProps {
    steps: readonly UploadStep[];
    /**
     * Index of the milestone in progress. Steps before it read as done, steps after as
     * not yet reached. Omitted before anything has been uploaded, when there is no
     * progress to report and every dot reads the same neutral "not yet".
     */
    currentIndex?: number;
}

type StepState = 'done' | 'current' | 'pending';

function stateFor(index: number, currentIndex: number | undefined): StepState {
    if (currentIndex === undefined) return 'pending';
    if (index < currentIndex) return 'done';
    if (index === currentIndex) return 'current';
    return 'pending';
}

/**
 * The five-milestone rail: neutral before an upload exists, and tracking real
 * progress once one does. Matches the design's Riel color rule — done is navy,
 * in-progress is indigo with a hollow ring, not-yet is gray — for the two states this
 * app can show today. A rejected invoice's "sin salida" (red) state belongs to the
 * detail screens, not designed yet.
 */
export function UploadStepsRail({steps, currentIndex}: UploadStepsRailProps) {
    return (
        <ol className="flex w-full items-start">
            {steps.map((step, index) => {
                const state = stateFor(index, currentIndex);
                const previousState = stateFor(index - 1, currentIndex);
                return (
                    <li key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
                        <div className="flex w-full items-center">
                            <span
                                className={cn(
                                    'h-0.5 flex-1',
                                    index === 0
                                        ? 'bg-transparent'
                                        : previousState === 'pending'
                                          ? 'bg-border-strong'
                                          : 'bg-fg'
                                )}
                            />
                            <span
                                className={cn(
                                    'size-4 shrink-0 rounded-full',
                                    state === 'done' && 'bg-fg',
                                    state === 'current' && 'bg-surface-raised border-2 border-status-ocr-processing',
                                    state === 'pending' && 'bg-border-strong'
                                )}
                            />
                            <span
                                className={cn(
                                    'h-0.5 flex-1',
                                    index === steps.length - 1 ? 'bg-transparent' : state === 'pending' ? 'bg-border-strong' : 'bg-fg'
                                )}
                            />
                        </div>
                        <p className="text-caption text-fg w-full text-center">{step.label}</p>
                    </li>
                );
            })}
        </ol>
    );
}
