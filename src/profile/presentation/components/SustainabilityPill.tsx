import {useTranslation} from 'react-i18next';
import {cn} from '@/lib/utils';
import type {SustainabilityStatus} from '../../domain/model/sustainability-certification.entity';

const PRESENTATION: Record<SustainabilityStatus, {fgClass: string; bgClass: string}> = {
    NONE: {fgClass: 'text-fg-muted', bgClass: 'bg-surface-sunken'},
    UNDER_REVIEW: {fgClass: 'text-status-sunat-validating', bgClass: 'bg-status-sunat-validating-bg'},
    GREEN: {fgClass: 'text-green-finance', bgClass: 'bg-green-finance-bg'},
    NOT_GREEN: {fgClass: 'text-status-rejected', bgClass: 'bg-status-rejected-bg'}
};

/** The certificate's state, colored like the invoice pills. */
export function SustainabilityPill({status}: {status: SustainabilityStatus}) {
    const {t} = useTranslation();
    const presentation = PRESENTATION[status];
    return (
        <span
            className={cn(
                'text-caption inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold whitespace-nowrap',
                presentation.bgClass,
                presentation.fgClass
            )}
        >
            <span className="size-1.5 shrink-0 rounded-full bg-current" />
            {t(`profile.certificate.status.${status}`)}
        </span>
    );
}
