import {useTranslation} from 'react-i18next';
import {cn} from '@/lib/utils';
import type {KycReview} from '../../domain/model/kyc-review.entity';

const PRESENTATION = {
    PENDING: {fgClass: 'text-fg-muted', bgClass: 'bg-surface-sunken'},
    IN_REVIEW: {fgClass: 'text-status-sunat-validating', bgClass: 'bg-status-sunat-validating-bg'},
    VERIFIED: {fgClass: 'text-success', bgClass: 'bg-success-bg'},
    REJECTED: {fgClass: 'text-status-rejected', bgClass: 'bg-status-rejected-bg'},
    // A demo verification never looks like a real one: the warning tone, and its own label.
    DEMO: {fgClass: 'text-warning', bgClass: 'bg-warning-bg'}
} as const;

/** The KYC's state, colored like the other pills; «Verificado (demo)» is kept apart from «Verificado». */
export function KycPill({kyc}: {kyc: KycReview}) {
    const {t} = useTranslation();
    const key = kyc.isVerified && kyc.demo ? 'DEMO' : kyc.status;
    const presentation = PRESENTATION[key];
    return (
        <span
            className={cn(
                'text-caption inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold whitespace-nowrap',
                presentation.bgClass,
                presentation.fgClass
            )}
        >
            <span className="size-1.5 shrink-0 rounded-full bg-current" />
            {t(`profile.kyc.status.${key}`)}
        </span>
    );
}
