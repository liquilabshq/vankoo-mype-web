import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';

/**
 * «Estamos revisando tu perfil»: the company may come in, but not operate yet.
 *
 * The review usually takes seconds, so the card says so and shows it working: the
 * MYPE waits for the result here instead of leaving, and whatever it is replaces
 * this card in place.
 */
export function KycReviewCard() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <h1 className="text-h1 text-fg font-bold">{t('profile.onboarding.review.title')}</h1>
                <p className="text-body text-fg-secondary">{t('profile.onboarding.review.subtitle')}</p>
            </div>
            <div role="status" className="text-caption text-fg-muted flex items-center gap-2">
                <Spinner className="size-4" />
                <span>{t('profile.onboarding.review.working')}</span>
            </div>
            <InlineAlert
                variant="warning"
                title={t('profile.onboarding.review.alertTitle')}
                message={t('profile.onboarding.review.alertMessage')}
            />
            <Button type="button" size="lg" variant="secondary" className="w-full" onClick={() => navigate('/')}>
                {t('profile.onboarding.review.goHome')}
            </Button>
        </div>
    );
}
