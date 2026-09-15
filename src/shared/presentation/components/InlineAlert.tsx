import {CircleAlert, CircleCheck} from 'lucide-react';
import {cn} from '@/lib/utils';

interface InlineAlertProps {
    variant: 'success' | 'warning';
    title?: string;
    message: string;
}

/**
 * A notice that stays next to what it explains — the design's `Alert`, sibling of
 * Toast rather than a replacement for it: Toast floats and dismisses itself, this
 * stays put and can carry a title.
 */
export function InlineAlert({variant, title, message}: InlineAlertProps) {
    const isWarning = variant === 'warning';
    const Icon = isWarning ? CircleAlert : CircleCheck;

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-md border px-4 py-3',
                isWarning ? 'bg-warning-bg border-[var(--vk-state-warning-border)]' : 'bg-success-bg border-[var(--vk-state-success-border)]'
            )}
        >
            <Icon className={cn('size-5 shrink-0', isWarning ? 'text-warning' : 'text-success')} aria-hidden="true" />
            <div className={cn('text-body flex flex-1 flex-col gap-1', isWarning ? 'text-warning' : 'text-success')}>
                {title && <p className="font-semibold">{title}</p>}
                <p>{message}</p>
            </div>
        </div>
    );
}
