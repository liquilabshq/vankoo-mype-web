import {useId, useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {buttonVariants} from '@/components/ui/button';
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Field, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {isAddressFilled, type Company, type LegalAddress} from '../../domain/model/company.entity';
import type {IndustrySector} from '../../domain/model/industry-sector';
import {UpdateContactCommand} from '../../domain/model/update-contact.command';
import {AddressFields} from './AddressFields';
import {SectorSelect} from './SectorSelect';

interface EditContactDialogProps {
    company: Company;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saving: boolean;
    onSave: (command: UpdateContactCommand) => Promise<boolean>;
}

/**
 * «Editar datos»: sector, phone and tax address. The RUC and the business name are not
 * here on purpose — they are what was verified with SUNAT, and changing them would
 * have to go through the review again.
 *
 * The mockups draw the button but not the dialog; it follows the onboarding's fields.
 */
export function EditContactDialog({company, open, onOpenChange, saving, onSave}: EditContactDialogProps) {
    const {t} = useTranslation();
    const ids = {sector: useId(), phone: useId()};
    const [industrySector, setIndustrySector] = useState<IndustrySector | ''>(company.industrySector ?? '');
    const [contactPhone, setContactPhone] = useState(company.contactPhone ?? '');
    const [legalAddress, setLegalAddress] = useState<LegalAddress>(
        company.legalAddress ?? {street: '', city: '', state: '', postalCode: '', country: 'Perú'}
    );
    const canSave = industrySector !== '' && contactPhone.trim() !== '' && isAddressFilled(legalAddress) && !saving;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!canSave) return;
        const saved = await onSave(new UpdateContactCommand({industrySector, contactPhone, legalAddress}));
        if (saved) onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-140">
                <form onSubmit={event => void handleSubmit(event)} className="flex flex-col gap-6" noValidate>
                    <DialogHeader>
                        <DialogTitle className="text-h3 text-fg font-bold">{t('profile.edit.title')}</DialogTitle>
                        <DialogDescription className="text-body text-fg-muted">{t('profile.edit.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
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
                    <AddressFields value={legalAddress} onChange={setLegalAddress} disabled={saving} />
                    <DialogFooter>
                        <DialogClose disabled={saving} className={cn(buttonVariants({variant: 'ghost'}), 'border-border-strong')}>
                            {t('profile.edit.cancel')}
                        </DialogClose>
                        <button type="submit" disabled={!canSave} className={buttonVariants({variant: 'default'})}>
                            {saving && <Spinner data-icon="inline-start" />}
                            {saving ? t('profile.edit.saving') : t('profile.edit.save')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
