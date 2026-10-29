import {CircleHelp} from 'lucide-react';
import {useId, useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {Field, FieldDescription, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {InvoiceDropzone} from '../../../invoicing/presentation/components/InvoiceDropzone';
import {RUC_DOCUMENT_CONTENT_TYPE} from '../../application/profile.store';
import {isAddressFilled, type Company, type LegalAddress} from '../../domain/model/company.entity';
import {CompleteProfileCommand} from '../../domain/model/complete-profile.command';
import type {IndustrySector} from '../../domain/model/industry-sector';
import {AddressFields} from './AddressFields';
import {SectorSelect} from './SectorSelect';

const RUC_PATTERN = /^\d{11}$/;
const EMPTY_ADDRESS: LegalAddress = {street: '', city: '', state: '', postalCode: '', country: 'Perú'};

interface OnboardingFormProps {
    /** The company as it is: what it typed last time comes back filled in after a correction or a rejection. */
    company: Company;
    saving: boolean;
    onSubmit: (command: CompleteProfileCommand, rucDocument: File) => void;
}

function formatFileSize(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * «Completa el perfil de tu empresa»: every field at once and the ficha RUC, as
 * profile-service asks for them. One screen with sections, not a wizard: there is no
 * draft on the server, so steps would promise a progress that is not saved.
 *
 * A RUC SUNAT does not know comes back from the risk service a few seconds after
 * sending, as a field error on the RUC, and a declared name that differs from SUNAT's
 * as one on the business name; both are shown where they belong. The file is never
 * kept: after a correction it has to be chosen again, because the old one may be the
 * reason.
 */
export function OnboardingForm({company, saving, onSubmit}: OnboardingFormProps) {
    const {t} = useTranslation();
    const ids = {ruc: useId(), name: useId(), sector: useId(), phone: useId(), help: useId()};
    const [rucNumber, setRucNumber] = useState(company.rucNumber ?? '');
    const [businessName, setBusinessName] = useState(company.businessName ?? '');
    const [industrySector, setIndustrySector] = useState<IndustrySector | ''>(company.industrySector ?? '');
    const [contactPhone, setContactPhone] = useState(company.contactPhone ?? '');
    const [legalAddress, setLegalAddress] = useState<LegalAddress>(company.legalAddress ?? EMPTY_ADDRESS);
    const [rucDocument, setRucDocument] = useState<File | null>(null);
    const [fileRejected, setFileRejected] = useState(false);
    // A field error is about the value that was sent: once it is edited, it no longer applies.
    const [sentRuc] = useState(company.rucNumber ?? '');
    const [sentName] = useState(company.businessName ?? '');

    const rucFormatInvalid = rucNumber.length > 0 && !RUC_PATTERN.test(rucNumber);
    const rucNotFound = company.kyc.hasFieldError('rucNumber') && rucNumber === sentRuc;
    const nameMismatch = company.kyc.hasFieldError('businessName') && businessName === sentName;
    const filled = [businessName, contactPhone].every(value => value.trim()) && isAddressFilled(legalAddress);
    const canSubmit = RUC_PATTERN.test(rucNumber) && industrySector !== '' && filled && rucDocument !== null && !saving;

    function handleFile(file: File) {
        const isPdf = file.type === RUC_DOCUMENT_CONTENT_TYPE;
        setFileRejected(!isPdf);
        setRucDocument(isPdf ? file : null);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        // canSubmit already rules out an empty sector and a missing file.
        if (!canSubmit) return;
        onSubmit(
            new CompleteProfileCommand({rucNumber, businessName, industrySector, contactPhone, legalAddress}),
            rucDocument
        );
    }

    const rucMessage = rucNotFound
        ? t('profile.onboarding.rucNotFound')
        : rucFormatInvalid
          ? t('profile.form.rucInvalid')
          : null;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <section className="flex flex-col gap-4">
                <h2 className="text-h3 text-fg font-semibold">{t('profile.onboarding.companySection')}</h2>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    <Field data-invalid={Boolean(rucMessage) || undefined}>
                        <FieldLabel htmlFor={ids.ruc} className="text-fg">{t('profile.fields.ruc')}</FieldLabel>
                        <Input
                            id={ids.ruc}
                            inputMode="numeric"
                            maxLength={11}
                            value={rucNumber}
                            onChange={event => setRucNumber(event.target.value.replace(/\D/g, ''))}
                            aria-invalid={Boolean(rucMessage) || undefined}
                            disabled={saving}
                            required
                        />
                        {rucMessage && <FieldDescription className="text-error">{rucMessage}</FieldDescription>}
                    </Field>
                    <Field data-invalid={nameMismatch || undefined}>
                        <FieldLabel htmlFor={ids.name} className="text-fg">{t('profile.fields.businessName')}</FieldLabel>
                        <Input
                            id={ids.name}
                            value={businessName}
                            onChange={event => setBusinessName(event.target.value)}
                            autoComplete="organization"
                            aria-invalid={nameMismatch || undefined}
                            disabled={saving}
                            required
                        />
                        {nameMismatch && (
                            <FieldDescription className="text-error">{t('profile.onboarding.nameMismatch')}</FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={ids.sector}>{t('profile.fields.industrySector')}</FieldLabel>
                        <SectorSelect id={ids.sector} value={industrySector} onChange={setIndustrySector} disabled={saving} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={ids.phone}>{t('profile.fields.contactPhone')}</FieldLabel>
                        <Input
                            id={ids.phone}
                            type="tel"
                            value={contactPhone}
                            onChange={event => setContactPhone(event.target.value)}
                            autoComplete="tel"
                            disabled={saving}
                            required
                        />
                    </Field>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-h3 text-fg font-semibold">{t('profile.onboarding.addressSection')}</h2>
                <AddressFields value={legalAddress} onChange={setLegalAddress} disabled={saving} />
            </section>

            <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-h3 text-fg font-semibold">{t('profile.onboarding.rucDocumentSection')}</h2>
                    {/* The help is a button so it is reachable by keyboard, and the tip shows on focus as on hover. */}
                    <span className="group relative inline-flex">
                        <button
                            type="button"
                            className="text-fg focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-3"
                            aria-label={t('profile.onboarding.rucDocumentHelpLabel')}
                            aria-describedby={ids.help}
                        >
                            <CircleHelp className="size-4.5" aria-hidden="true" />
                        </button>
                        <span
                            id={ids.help}
                            role="tooltip"
                            className="bg-surface-inverse text-fg-inverse text-caption shadow-elevation-2 pointer-events-none invisible absolute top-full left-1/2 z-20 mt-2 w-75 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md px-3 py-2.5 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 sm:left-0 sm:translate-x-0"
                        >
                            {t('profile.onboarding.rucDocumentHelp')}
                        </span>
                    </span>
                </div>
                <InvoiceDropzone
                    title={rucDocument ? rucDocument.name : t('profile.onboarding.dropzone.title')}
                    hint={
                        rucDocument
                            ? `${formatFileSize(rucDocument.size)} · ${t('profile.onboarding.dropzone.replace')}`
                            : t('profile.onboarding.dropzone.hint')
                    }
                    accept={RUC_DOCUMENT_CONTENT_TYPE}
                    onFileSelected={handleFile}
                    disabled={saving}
                />
                {fileRejected && <p className="text-caption text-error">{t('profile.onboarding.rucDocumentNotPdf')}</p>}
            </section>

            <div className="flex justify-end">
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!canSubmit}>
                    {saving && <Spinner data-icon="inline-start" />}
                    {saving ? t('profile.onboarding.sending') : t('profile.onboarding.submit')}
                </Button>
            </div>
        </form>
    );
}
