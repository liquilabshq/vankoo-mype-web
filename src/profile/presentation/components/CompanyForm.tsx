import {useId, useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Spinner} from '@/components/ui/spinner';
import {CompleteProfileCommand} from '../../domain/model/complete-profile.command';
import {INDUSTRY_SECTORS, type IndustrySector} from '../../domain/model/industry-sector';

const RUC_PATTERN = /^\d{11}$/;

interface CompanyFormProps {
    saving: boolean;
    onSubmit: (command: CompleteProfileCommand) => void;
}

/**
 * "Completa tu perfil": one screen with sections, not a wizard.
 *
 * profile-service asks for every field at once and keeps no draft, so steps would
 * promise a progress that is not saved.
 */
export function CompanyForm({saving, onSubmit}: CompanyFormProps) {
    const {t} = useTranslation();
    const ids = {
        ruc: useId(),
        name: useId(),
        sector: useId(),
        phone: useId(),
        street: useId(),
        city: useId(),
        state: useId(),
        postalCode: useId(),
        country: useId()
    };
    const [rucNumber, setRucNumber] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [industrySector, setIndustrySector] = useState<IndustrySector | ''>('');
    const [contactPhone, setContactPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Perú');

    const rucInvalid = rucNumber.length > 0 && !RUC_PATTERN.test(rucNumber);
    const filled = [businessName, contactPhone, street, city, state, postalCode, country].every(value => value.trim());
    const canSubmit = RUC_PATTERN.test(rucNumber) && industrySector !== '' && filled && !saving;

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        // canSubmit already rules out an empty sector.
        if (!canSubmit) return;
        onSubmit(
            new CompleteProfileCommand({
                rucNumber,
                businessName,
                industrySector,
                contactPhone,
                legalAddress: {street, city, state, postalCode, country}
            })
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>{t('profile.form.companySection')}</FieldLegend>
                    <Field data-invalid={rucInvalid || undefined}>
                        <FieldLabel htmlFor={ids.ruc}>{t('profile.fields.ruc')}</FieldLabel>
                        <Input
                            id={ids.ruc}
                            inputMode="numeric"
                            maxLength={11}
                            value={rucNumber}
                            onChange={event => setRucNumber(event.target.value.replace(/\D/g, ''))}
                            aria-invalid={rucInvalid || undefined}
                            disabled={saving}
                            required
                        />
                        <FieldDescription>
                            {rucInvalid ? t('profile.form.rucInvalid') : t('profile.form.rucHint')}
                        </FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={ids.name}>{t('profile.fields.businessName')}</FieldLabel>
                        <Input
                            id={ids.name}
                            value={businessName}
                            onChange={event => setBusinessName(event.target.value)}
                            autoComplete="organization"
                            disabled={saving}
                            required
                        />
                        <FieldDescription>{t('profile.form.businessNameHint')}</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={ids.sector}>{t('profile.fields.industrySector')}</FieldLabel>
                        <Select
                            value={industrySector}
                            onValueChange={value => setIndustrySector(value as IndustrySector)}
                            disabled={saving}
                        >
                            <SelectTrigger id={ids.sector} className="w-full">
                                <SelectValue placeholder={t('profile.form.sectorPlaceholder')}>
                                    {(value: IndustrySector | '') =>
                                        value ? t(`profile.sectors.${value}`) : t('profile.form.sectorPlaceholder')
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {INDUSTRY_SECTORS.map(sector => (
                                    <SelectItem key={sector} value={sector}>
                                        {t(`profile.sectors.${sector}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                </FieldSet>

                <FieldSet>
                    <FieldLegend>{t('profile.form.addressSection')}</FieldLegend>
                    <Field>
                        <FieldLabel htmlFor={ids.street}>{t('profile.fields.street')}</FieldLabel>
                        <Input
                            id={ids.street}
                            value={street}
                            onChange={event => setStreet(event.target.value)}
                            autoComplete="street-address"
                            disabled={saving}
                            required
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor={ids.city}>{t('profile.fields.city')}</FieldLabel>
                            <Input id={ids.city} value={city} onChange={event => setCity(event.target.value)} disabled={saving} required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={ids.state}>{t('profile.fields.state')}</FieldLabel>
                            <Input id={ids.state} value={state} onChange={event => setState(event.target.value)} disabled={saving} required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={ids.postalCode}>{t('profile.fields.postalCode')}</FieldLabel>
                            <Input
                                id={ids.postalCode}
                                value={postalCode}
                                onChange={event => setPostalCode(event.target.value)}
                                autoComplete="postal-code"
                                disabled={saving}
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={ids.country}>{t('profile.fields.country')}</FieldLabel>
                            <Input id={ids.country} value={country} onChange={event => setCountry(event.target.value)} disabled={saving} required />
                        </Field>
                    </div>
                </FieldSet>

                <Button type="submit" size="lg" className="self-start" disabled={!canSubmit}>
                    {saving && <Spinner data-icon="inline-start" />}
                    {saving ? t('profile.form.saving') : t('profile.form.submit')}
                </Button>
            </FieldGroup>
        </form>
    );
}
