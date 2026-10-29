import {useTranslation} from 'react-i18next';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';
import {isKycCheckCode, type KycReview} from '../../domain/model/kyc-review.entity';

/**
 * Why the company was rejected, in this app's words: the first rule of kyc-v1 that
 * failed, with what to do about it. The risk service's own detail is Spanish and
 * written for whoever reviews the case, so it is not shown to the MYPE as is.
 */
export function KycReasonAlert({kyc}: {kyc: KycReview}) {
    const {t} = useTranslation();
    const code = kyc.firstFailedCheck?.code ?? kyc.reasonCodes[0] ?? '';
    const reason = isKycCheckCode(code) ? code : 'UNKNOWN';
    return (
        <InlineAlert
            variant="error"
            title={t(`profile.onboarding.reasons.${reason}.title`)}
            message={t(`profile.onboarding.reasons.${reason}.message`)}
        />
    );
}
