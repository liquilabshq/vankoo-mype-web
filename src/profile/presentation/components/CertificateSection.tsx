import {Leaf} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Spinner} from '@/components/ui/spinner';
import {InvoiceDropzone} from '../../../invoicing/presentation/components/InvoiceDropzone';
import {CERTIFICATE_CONTENT_TYPES} from '../../application/profile.store';
import type {Company} from '../../domain/model/company.entity';
import {isGreenStandard} from '../../domain/model/sustainability-certification.entity';
import {GreenCriteriaList} from './GreenCriteriaList';
import {SustainabilityPill} from './SustainabilityPill';

interface CertificateSectionProps {
    company: Company;
    uploading: boolean;
    onFileSelected: (file: File) => void;
}

/** A date from the risk service (`YYYY-MM-DD`), written the way the locale writes dates. */
function formatDay(day: string, locale: string): string {
    const [year, month, date] = day.split('-').map(Number);
    return new Intl.DateTimeFormat(locale, {dateStyle: 'long'}).format(new Date(year, month - 1, date));
}

/**
 * The company's environmental certificate: what it is worth, and where to upload it.
 * Only a verified company may upload one; until then the card says when it can.
 *
 * Only the risk service decides whether it is green; this section shows its answer
 * and, when it is not green, every check so the MYPE knows what to fix. The note
 * that the reading checks coherence, not authenticity, is there on purpose: the
 * screen should not promise more than the rules do.
 */
export function CertificateSection({company, uploading, onFileSelected}: CertificateSectionProps) {
    const {t, i18n} = useTranslation();
    const certification = company.sustainability;

    return (
        <section className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Leaf className="text-green-finance size-5" aria-hidden="true" />
                    <h2 className="text-body text-fg font-semibold">{t('profile.certificate.title')}</h2>
                </div>
                <SustainabilityPill status={certification.status} />
            </div>
            <p className="text-caption text-fg-secondary">{t('profile.certificate.intro')}</p>

            {certification.isGreen && certification.validUntil && (
                <dl className="grid gap-3">
                    <div>
                        <dt className="text-caption text-fg-muted">{t('profile.certificate.standard')}</dt>
                        <dd className="text-body text-fg font-semibold">
                            {isGreenStandard(certification.standard)
                                ? t(`profile.certificate.standards.${certification.standard}`)
                                : (certification.standard ?? '—')}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-caption text-fg-muted">{t('profile.certificate.issuer')}</dt>
                        <dd className="text-body text-fg font-semibold">{certification.issuer ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-caption text-fg-muted">{t('profile.certificate.validUntil')}</dt>
                        <dd className="text-body text-fg font-semibold">{formatDay(certification.validUntil, i18n.language)}</dd>
                    </div>
                </dl>
            )}

            {certification.status === 'NOT_GREEN' && (
                <p className="text-body text-fg">{t('profile.certificate.notGreenBody')}</p>
            )}
            {certification.criteria.length > 0 && <GreenCriteriaList criteria={certification.criteria} />}

            {certification.isUnderReview ? (
                <div className="flex items-center gap-3">
                    <Spinner className="size-5" />
                    <p className="text-caption text-fg-muted">{t('profile.certificate.reviewing')}</p>
                </div>
            ) : uploading ? (
                <div className="flex items-center gap-3">
                    <Spinner className="size-5" />
                    <p className="text-caption text-fg-muted">{t('profile.certificate.uploading')}</p>
                </div>
            ) : company.canUploadCertificate ? (
                <InvoiceDropzone
                    title={certification.status === 'NONE' ? t('profile.certificate.dropzone.cta') : t('profile.certificate.dropzone.replace')}
                    hint={t('profile.certificate.dropzone.hint')}
                    accept={CERTIFICATE_CONTENT_TYPES.join(',')}
                    onFileSelected={onFileSelected}
                />
            ) : (
                <p className="text-caption text-fg-muted">{t('profile.certificate.needsVerification')}</p>
            )}

            <p className="text-caption text-fg-muted">{t('profile.certificate.disclaimer')}</p>
        </section>
    );
}
