import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';
import type {KycReview} from '../../domain/model/kyc-review.entity';

/**
 * «Tu empresa está verificada»: the result of a review the MYPE just waited for.
 *
 * Only shown right after a review on this screen; a company that was already verified
 * when it opened the onboarding goes straight home. The MYPE leaves when it is ready,
 * not when the review answers.
 */
export function KycVerifiedCard({kyc}: {kyc: KycReview}) {
    const {t} = useTranslation();
    const navigate = useNavigate();
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <h1 className="text-h1 text-fg font-bold">{t('profile.onboarding.verified.title')}</h1>
                <p className="text-body text-fg-secondary">{t('profile.onboarding.verified.subtitle')}</p>
            </div>
            <InlineAlert
                variant="success"
                title={t('profile.onboarding.verified.alertTitle')}
                message={t('profile.onboarding.verified.alertMessage')}
            />
            {kyc.demo && <p className="text-caption text-warning">{t('profile.kyc.demoNote')}</p>}
            <Button type="button" size="lg" className="w-full" onClick={() => navigate('/', {replace: true})}>
                {t('profile.onboarding.verified.goHome')}
            </Button>
        </div>
    );
}
