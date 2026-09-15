import {cn} from '@/lib/utils';

interface UploadStep {
    label: string;
}

interface UploadStepsRailProps {
    steps: readonly UploadStep[];
}

/**
 * The five-milestone explainer shown before anything has been uploaded.
 *
 * Every dot renders in the same neutral "not yet" color: there is no real invoice to
 * report progress on at this point, so nothing here is meant to look further along
 * than anything else. A rail bound to an actual invoice's status belongs to the
 * invoice-detail screens, which are not designed yet.
 */
export function UploadStepsRail({steps}: UploadStepsRailProps) {
    return (
        <ol className="flex w-full items-start">
            {steps.map((step, index) => (
                <li key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
                    <div className="flex w-full items-center">
                        <span className={cn('h-0.5 flex-1', index === 0 ? 'bg-transparent' : 'bg-border-strong')} />
                        <span className="bg-border-strong size-4 shrink-0 rounded-full" />
                        <span className={cn('h-0.5 flex-1', index === steps.length - 1 ? 'bg-transparent' : 'bg-border-strong')} />
                    </div>
                    <p className="text-caption text-fg w-full text-center">{step.label}</p>
                </li>
            ))}
        </ol>
    );
}
