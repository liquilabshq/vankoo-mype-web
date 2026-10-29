import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Spinner} from '@/components/ui/spinner';
import {useProfileStore} from '../../application/profile.store';
import {CERTIFICATE_CONTENT_TYPES} from '../../application/profile.store';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';
import {LOGO_CONTENT_TYPES} from '../../application/profile.store';
import {CertificateSection} from '../components/CertificateSection';
import {CompanyCard} from '../components/CompanyCard';
import {VerificationCard} from '../components/VerificationCard';
import {ProfileErrorAlert} from '../components/ProfileErrorAlert';

/**
 * How often, and for how long, the screen asks whether the certificate was decided.
 * Reading one takes the risk service a few seconds; after two minutes, reopening the
 * page asks again.
 */
const REVIEW_POLL_INTERVAL_MS = 3000;
const REVIEW_POLL_MAX_ATTEMPTS = 40;

/**
 * «Mi perfil»: the company on the left, and on the right where its verification
 * stands and its green certificate. Stacked on a phone, the company first.
 *
 * While the KYC is in review the page says so on top and nothing can be edited, as the
 * mockup draws it; the screen keeps asking, so the banner goes away by itself.
 */
export function CompanyProfile() {
    const {t} = useTranslation();
    const company = useProfileStore(state => state.company);
    const loading = useProfileStore(state => state.loading);
    const loaded = useProfileStore(state => state.loaded);
    const saving = useProfileStore(state => state.saving);
    const uploading = useProfileStore(state => state.uploading);
    const errors = useProfileStore(state => state.errors);
    const fetchCompany = useProfileStore(state => state.fetchCompany);
    const updateContact = useProfileStore(state => state.updateContact);
    const uploadLogo = useProfileStore(state => state.uploadLogo);
    const uploadCertificate = useProfileStore(state => state.uploadCertificate);
    const refreshWhileUnderReview = useProfileStore(state => state.refreshWhileUnderReview);
    const refreshWhileKycInReview = useProfileStore(state => state.refreshWhileKycInReview);
    const underReview = company?.sustainability.isUnderReview ?? false;
    const kycInReview = company?.kyc.isInReview ?? false;

    useEffect(() => {
        void fetchCompany();
    }, [fetchCompany]);

    // Each read schedules the next only once it answered, as on the invoice upload.
    useEffect(() => {
        if (!underReview) return;
        let cancelled = false;
        let attempts = 0;
        let timer: ReturnType<typeof setTimeout>;
        const poll = async () => {
            const stillReviewing = await refreshWhileUnderReview();
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
    }, [underReview, refreshWhileUnderReview]);

    useEffect(() => {
        if (!kycInReview) return;
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
    }, [kycInReview, refreshWhileKycInReview]);

    function handleLogoSelected(file: File) {
        if (!(LOGO_CONTENT_TYPES as readonly string[]).includes(file.type)) {
            useProfileStore.setState({errors: [{kind: 'logo', error: new Error(`Unsupported type ${file.type}`)}]});
            return;
        }
        void uploadLogo(file);
    }

    function handleFileSelected(file: File) {
        if (!(CERTIFICATE_CONTENT_TYPES as readonly string[]).includes(file.type)) {
            useProfileStore.setState({errors: [{kind: 'upload', error: new Error(`Unsupported type ${file.type}`)}]});
            return;
        }
        void uploadCertificate(file);
    }

    if (!loaded || (loading && !company)) {
        return (
            <div className="flex justify-center py-16">
                <Spinner className="size-6" />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6">
            <h1 className="text-h1 text-fg font-bold">{t('profile.title')}</h1>

            {kycInReview && (
                <InlineAlert
                    variant="warning"
                    title={t('profile.reviewBanner.title')}
                    message={t('profile.reviewBanner.message')}
                />
            )}
            <ProfileErrorAlert errors={errors} />

            {company && (
                <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start">
                    <CompanyCard
                        company={company}
                        saving={saving}
                        uploading={uploading}
                        onSaveContact={updateContact}
                        onLogoSelected={handleLogoSelected}
                    />
                    <div className="flex w-full shrink-0 flex-col gap-6 lg:w-90">
                        <VerificationCard company={company} />
                        <CertificateSection company={company} uploading={uploading} onFileSelected={handleFileSelected} />
                    </div>
                </div>
            )}
        </div>
    );
}
