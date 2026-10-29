import {useEffect, useState} from 'react';
import {Navigate} from 'react-router';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {useProfileStore} from '../../application/profile.store';
import {KycRejectedCard} from '../components/KycRejectedCard';
import {KycReviewCard} from '../components/KycReviewCard';
import {OnboardingForm} from '../components/OnboardingForm';
import {OnboardingLayout} from '../components/OnboardingLayout';
import {ProfileErrorAlert} from '../components/ProfileErrorAlert';
import {useTranslation} from 'react-i18next';

/**
 * How often, and for how long, the screen asks whether the KYC was decided. The risk
 * service answers in seconds when SUNAT's registries are loaded; after two minutes,
 * reopening the page asks again.
 */
const REVIEW_POLL_INTERVAL_MS = 3000;
const REVIEW_POLL_MAX_ATTEMPTS = 40;

/**
 * The onboarding: the company sends its data and its ficha RUC, waits for the review,
 * and if it is rejected, sees why and when it may send again.
 *
 * One route for the four mockups, chosen by the KYC status rather than by URL, so a
 * reload always lands on the right card. A verified company has nothing to do here
 * and goes home.
 */
export function CompanyOnboarding() {
    const {t} = useTranslation();
    const company = useProfileStore(state => state.company);
    const loaded = useProfileStore(state => state.loaded);
    const saving = useProfileStore(state => state.saving);
    const errors = useProfileStore(state => state.errors);
    const fetchCompany = useProfileStore(state => state.fetchCompany);
    const submitForVerification = useProfileStore(state => state.submitForVerification);
    const refreshWhileKycInReview = useProfileStore(state => state.refreshWhileKycInReview);
    const [correcting, setCorrecting] = useState(false);
    const inReview = company?.kyc.isInReview ?? false;

    useEffect(() => {
        void fetchCompany();
    }, [fetchCompany]);

    // Each read schedules the next only once it answered, as on the certificate.
    useEffect(() => {
        if (!inReview) return;
        let cancelled = false;
        let attempts = 0;
        let timer: ReturnType<typeof setTimeout>;
        const poll = async () => {
            const stillReviewing = await refreshWhileKycInReview();
            attempts += 1;
            if (!cancelled && stillReviewing && attempts < REVIEW_POLL_MAX_ATTEMPTS) {
                timer = setTimeout(() => void poll(), REVIEW_POLL_INTERVAL_MS);
            }
        };
        timer = setTimeout(() => void poll(), REVIEW_POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [inReview, refreshWhileKycInReview]);

    if (!loaded || !company) {
        return (
            <OnboardingLayout>
                <div className="flex flex-col items-center gap-4 py-16">
                    {loaded ? <ProfileErrorAlert errors={errors} /> : <Spinner className="size-6" />}
                    {loaded && <p className="sr-only">{t('profile.errors.load')}</p>}
                </div>
            </OnboardingLayout>
        );
    }

    const kyc = company.kyc;
    if (kyc.isVerified) return <Navigate to="/" replace />;
    const showForm = kyc.isPending || (kyc.isRejected && correcting);

    return (
        <OnboardingLayout>
            <div
                className={cn(
                    'bg-surface-raised shadow-elevation-2 mx-auto flex flex-col gap-4 rounded-xl',
                    showForm ? 'w-full px-5 py-6 sm:px-8 sm:py-7' : 'w-full max-w-150 px-5 py-7 sm:p-10'
                )}
            >
                {showForm && (
                    <div className="flex flex-col gap-2">
                        <h1 className="text-h1 text-fg font-bold">{t('profile.onboarding.title')}</h1>
                        <p className="text-body text-fg-secondary">{t('profile.onboarding.subtitle')}</p>
                    </div>
                )}
                <ProfileErrorAlert errors={errors} />
                {showForm ? (
                    <OnboardingForm
                        company={company}
                        saving={saving}
                        onSubmit={(command, rucDocument) =>
                            void submitForVerification(command, rucDocument).then(sent => sent && setCorrecting(false))
                        }
                    />
                ) : kyc.isInReview ? (
                    <KycReviewCard />
                ) : (
                    <KycRejectedCard kyc={kyc} onFix={() => setCorrecting(true)} />
                )}
            </div>
        </OnboardingLayout>
    );
}
