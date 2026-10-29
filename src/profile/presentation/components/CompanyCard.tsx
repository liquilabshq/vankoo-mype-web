import {Building2} from 'lucide-react';
import {useId, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {LOGO_CONTENT_TYPES} from '../../application/profile.store';
import type {Company} from '../../domain/model/company.entity';
import type {UpdateContactCommand} from '../../domain/model/update-contact.command';
import {EditContactDialog} from './EditContactDialog';

interface CompanyCardProps {
    company: Company;
    saving: boolean;
    uploading: boolean;
    onSaveContact: (command: UpdateContactCommand) => Promise<boolean>;
    onLogoSelected: (file: File) => void;
}

/**
 * The company's card: its logo, its name and RUC, and its contact.
 *
 * Two columns of label over value on a wide screen; on a phone each row puts the label
 * on the left and the value on the right, as the 390 mockup does. «Editar datos» is
 * only for a verified company: while it is in review nothing may change under the
 * reviewer, and before that there is the onboarding form instead.
 */
export function CompanyCard({company, saving, uploading, onSaveContact, onLogoSelected}: CompanyCardProps) {
    const {t} = useTranslation();
    const logoInputId = useId();
    const [editing, setEditing] = useState(false);
    const address = company.legalAddress;
    const rows: [string, string | null][] = [
        [t('profile.summary.sector'), company.industrySector ? t(`profile.sectors.${company.industrySector}`) : null],
        [t('profile.summary.phone'), company.contactPhone],
        [
            t('profile.summary.address'),
            address ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}` : null
        ],
        [t('profile.summary.email'), company.contactEmail]
    ];

    return (
        <section className="bg-surface-raised border-border-subtle shadow-elevation-1 flex min-w-0 flex-1 flex-col gap-4 rounded-xl border p-6">
            <div className="flex items-center gap-4">
                <label
                    htmlFor={logoInputId}
                    className="bg-surface-sunken border-border-strong focus-within:ring-ring/50 relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border focus-within:ring-3"
                    title={t('profile.logo.change')}
                >
                    {uploading ? (
                        <Spinner className="size-5" />
                    ) : company.logoUrl ? (
                        <img src={company.logoUrl} alt={t('profile.logo.alt', {name: company.businessName ?? ''})} className="size-full object-cover" />
                    ) : (
                        <Building2 className="text-fg-muted size-6" aria-hidden="true" />
                    )}
                    <input
                        id={logoInputId}
                        type="file"
                        accept={LOGO_CONTENT_TYPES.join(',')}
                        className="sr-only"
                        aria-label={t('profile.logo.change')}
                        disabled={uploading}
                        onChange={event => {
                            const file = event.target.files?.[0];
                            if (file) onLogoSelected(file);
                            event.target.value = '';
                        }}
                    />
                </label>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-h3 text-fg truncate font-semibold">{company.businessName ?? '—'}</p>
                    {company.rucNumber && (
                        <p className="text-caption text-fg-muted">{t('profile.summary.ruc', {ruc: company.rucNumber})}</p>
                    )}
                </div>
            </div>
            <div className="bg-border-subtle h-px w-full" />
            <dl className="grid gap-3 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 sm:flex-col sm:justify-start sm:gap-1">
                        <dt className="text-caption text-fg-muted">{label}</dt>
                        <dd className="text-caption sm:text-body text-fg text-right font-semibold break-words sm:text-left">
                            {value ?? '—'}
                        </dd>
                    </div>
                ))}
            </dl>
            <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto sm:self-start"
                disabled={!company.kyc.canOperate}
                onClick={() => setEditing(true)}
            >
                {t('profile.edit.button')}
            </Button>
            {editing && (
                <EditContactDialog
                    company={company}
                    open={editing}
                    onOpenChange={setEditing}
                    saving={saving}
                    onSave={onSaveContact}
                />
            )}
        </section>
    );
}
