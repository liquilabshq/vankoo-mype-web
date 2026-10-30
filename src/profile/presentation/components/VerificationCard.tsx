import {FileText} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import type {Company} from '../../domain/model/company.entity';
import {profilePaths} from '../profile-paths';
import {formatLongDate} from './kyc-dates';
import {KycPill} from './KycPill';
import {KycReasonAlert} from './KycReasonAlert';

/**
 * «Verificación»: where the KYC stands, when it moved, and the ficha RUC that was sent.
 *
 * A demo verification says so in words too, not only in the pill's label: whoever
 * reads the profile during a demonstration must not take it for SUNAT's signature.
 */
export function VerificationCard({company}: {company: Company}) {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const kyc = company.kyc;
    const date = (value: Date) => formatLongDate(value, i18n.language);

    const when = kyc.isVerified && kyc.decidedAt
        ? t('profile.kyc.verifiedOn', {date: date(kyc.decidedAt)})
        : kyc.isRejected && kyc.decidedAt
          ? t('profile.kyc.rejectedOn', {date: date(kyc.decidedAt)})
          : kyc.submittedAt
            ? t('profile.kyc.submittedOn', {date: date(kyc.submittedAt)})
            : t('profile.kyc.notSubmitted');

    return (
        <section className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-body text-fg font-semibold">{t('profile.kyc.title')}</h2>
                <KycPill kyc={kyc} />
            </div>
            <p className="text-caption text-fg-muted">{when}</p>
            {kyc.isVerified && kyc.demo && <p className="text-caption text-warning">{t('profile.kyc.demoNote')}</p>}
            {kyc.isRejected && <KycReasonAlert kyc={kyc} />}

            {company.rucDocumentUrl && (
                <>
                    <div className="bg-border-subtle h-px w-full" />
                    <p className="text-caption text-fg font-semibold">{t('profile.kyc.rucDocument')}</p>
                    <div className="flex items-center gap-3">
                        <span className="bg-surface-sunken border-border-strong flex size-9 shrink-0 items-center justify-center rounded-xl border">
                            <FileText className="text-fg size-4" aria-hidden="true" />
                        </span>
                        <div className="text-caption flex min-w-0 flex-1 flex-col gap-1">
                            <p className="text-fg truncate font-semibold">{t('profile.kyc.rucDocumentName')}</p>
                            {kyc.submittedAt && (
                                <p className="text-fg-muted">{t('profile.kyc.uploadedOn', {date: date(kyc.submittedAt)})}</p>
                            )}
                        </div>
                        <a
                            href={company.rucDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={t('profile.kyc.viewLabel')}
                            className="text-caption text-fg bg-action-ghost border-border-strong hover:bg-accent inline-flex h-8 items-center rounded-md border px-3 font-semibold"
                        >
                            {t('profile.kyc.view')}
                        </a>
                    </div>
                </>
            )}

            {(kyc.isRejected || kyc.isPending) && (
                <Button type="button" variant="secondary" onClick={() => navigate(profilePaths.onboarding())}>
                    {kyc.isRejected ? t('profile.kyc.fix') : t('profile.kyc.complete')}
                </Button>
            )}
        </section>
    );
}
