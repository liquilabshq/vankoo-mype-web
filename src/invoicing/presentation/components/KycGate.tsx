import {useTranslation} from 'react-i18next';
import {Link} from 'react-router';
import {profilePaths} from '../../../profile/presentation/profile-paths';

/** Why «Subir factura» is off, with the way to the profile where the KYC stands. */
export function KycGateAlert() {
    const {t} = useTranslation();
    return (
        <div className="bg-warning-bg flex flex-col gap-1 rounded-md border border-[var(--vk-state-warning-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="text-body text-warning flex flex-col gap-1">
                <p className="font-semibold">{t('invoicing.kycGate.title')}</p>
                <p>{t('invoicing.kycGate.message')}</p>
            </div>
            <Link to={profilePaths.myCompany()} className="text-body text-fg-link shrink-0 font-semibold hover:underline">
                {t('invoicing.kycGate.link')}
            </Link>
        </div>
    );
}
