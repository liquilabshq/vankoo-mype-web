import {useTranslation} from 'react-i18next';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {INDUSTRY_SECTORS, type IndustrySector} from '../../domain/model/industry-sector';

interface SectorSelectProps {
    id: string;
    value: IndustrySector | '';
    onChange: (value: IndustrySector) => void;
    disabled?: boolean;
}

/** The six sectors profile-service accepts, labelled in the reader's language. */
export function SectorSelect({id, value, onChange, disabled = false}: SectorSelectProps) {
    const {t} = useTranslation();
    return (
        <Select value={value} onValueChange={next => onChange(next as IndustrySector)} disabled={disabled}>
            <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder={t('profile.form.sectorPlaceholder')}>
                    {(current: IndustrySector | '') =>
                        current ? t(`profile.sectors.${current}`) : t('profile.form.sectorPlaceholder')
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
    );
}
