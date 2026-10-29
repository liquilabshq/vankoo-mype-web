import {useId} from 'react';
import {useTranslation} from 'react-i18next';
import {Field, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import type {LegalAddress} from '../../domain/model/company.entity';

interface AddressFieldsProps {
    value: LegalAddress;
    onChange: (value: LegalAddress) => void;
    disabled?: boolean;
}

/**
 * The tax address as the mockups lay it out: the street on its own row, then city and
 * department, then postal code and country. Shared by the onboarding and «Editar
 * datos», which ask for the same five fields.
 */
export function AddressFields({value, onChange, disabled = false}: AddressFieldsProps) {
    const {t} = useTranslation();
    const ids = {street: useId(), city: useId(), state: useId(), postalCode: useId(), country: useId()};
    const set = (field: keyof LegalAddress) => (event: {target: {value: string}}) =>
        onChange({...value, [field]: event.target.value});

    return (
        <div className="flex flex-col gap-4">
            <Field>
                <FieldLabel htmlFor={ids.street}>{t('profile.fields.street')}</FieldLabel>
                <Input id={ids.street} value={value.street} onChange={set('street')} autoComplete="street-address" disabled={disabled} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <Field>
                    <FieldLabel htmlFor={ids.city}>{t('profile.fields.city')}</FieldLabel>
                    <Input id={ids.city} value={value.city} onChange={set('city')} autoComplete="address-level2" disabled={disabled} required />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.state}>{t('profile.fields.state')}</FieldLabel>
                    <Input id={ids.state} value={value.state} onChange={set('state')} autoComplete="address-level1" disabled={disabled} required />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.postalCode}>{t('profile.fields.postalCode')}</FieldLabel>
                    <Input id={ids.postalCode} value={value.postalCode} onChange={set('postalCode')} autoComplete="postal-code" disabled={disabled} required />
                </Field>
                <Field>
                    <FieldLabel htmlFor={ids.country}>{t('profile.fields.country')}</FieldLabel>
                    <Input id={ids.country} value={value.country} onChange={set('country')} autoComplete="country-name" disabled={disabled} required />
                </Field>
            </div>
        </div>
    );
}
