import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Spinner} from '@/components/ui/spinner';
import {useProfileStore} from '../../application/profile.store';
import {CERTIFICATE_CONTENT_TYPES} from '../../application/profile.store';
import type {Company} from '../../domain/model/company.entity';
import {CertificateSection} from '../components/CertificateSection';
import {CompanyForm} from '../components/CompanyForm';
import {ProfileErrorAlert} from '../components/ProfileErrorAlert';

/**
 * How often, and for how long, the screen asks whether the certificate was decided.
 * Reading one takes the risk service a few seconds; after two minutes, reopening the
 * page asks again.
 */
const REVIEW_POLL_INTERVAL_MS = 3000;
const REVIEW_POLL_MAX_ATTEMPTS = 40;

function CompanySummary({company}: {company: Company}) {
    const {t} = useTranslation();
    const address = company.legalAddress;
    const rows: [string, string | null][] = [
        [t('profile.fields.ruc'), company.rucNumber],
        [t('profile.fields.businessName'), company.businessName],
        [t('profile.fields.industrySector'), company.industrySector ? t(`profile.sectors.${company.industrySector}`) : null],
        [t('profile.fields.contactPhone'), company.contactPhone],
        [t('profile.fields.contactEmail'), company.contactEmail],
        [
            t('profile.fields.legalAddress'),
            address ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}` : null
        ]
    ];
    return (
        <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
                <div key={label}>
                    <dt className="text-caption text-fg-muted">{label}</dt>
                    <dd className="text-body text-fg font-semibold break-words">{value ?? '—'}</dd>
                </div>
            ))}
        </dl>
    );
}

/** Routed view of the MYPE's own company: its data and its green certificate. */
export function CompanyProfile() {
    const {t} = useTranslation();
    const company = useProfileStore(state => state.company);
    const loading = useProfileStore(state => state.loading);
    const loaded = useProfileStore(state => state.loaded);
    const saving = useProfileStore(state => state.saving);
    const uploading = useProfileStore(state => state.uploading);
    const errors = useProfileStore(state => state.errors);
    const fetchCompany = useProfileStore(state => state.fetchCompany);
    const completeProfile = useProfileStore(state => state.completeProfile);
    const uploadCertificate = useProfileStore(state => state.uploadCertificate);
    const refreshWhileUnderReview = useProfileStore(state => state.refreshWhileUnderReview);
    const underReview = company?.sustainability.isUnderReview ?? false;

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
        <div className="flex w-full max-w-4xl flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-h1 text-fg font-bold">{t('profile.title')}</h1>
                {company && !company.profileComplete && (
                    <p className="text-body text-fg-secondary">{t('profile.completeSubtitle')}</p>
                )}
            </div>

            <ProfileErrorAlert errors={errors} />

            {company && (
                <>
                    <section className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                        <h2 className="text-h3 text-fg font-bold">{t('profile.companyTitle')}</h2>
                        {company.profileComplete ? (
                            <CompanySummary company={company} />
                        ) : (
                            <CompanyForm saving={saving} onSubmit={command => void completeProfile(command)} />
                        )}
                    </section>
                    <CertificateSection company={company} uploading={uploading} onFileSelected={handleFileSelected} />
                </>
            )}
        </div>
    );
}
