import {Globe, Moon, Sun} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {useTheme} from '../../../theme';

interface PreferencesBarProps {
    className?: string;
}

/**
 * Language and theme, the two preferences the web has to offer and the app does not.
 *
 * The mobile app reads both from the device, so it carries no switcher at all. A
 * browser has no equivalent: `prefers-color-scheme` is a hint the user cannot override
 * per site, and reading the interface in the other language would mean changing the
 * browser's own settings.
 *
 * Two toggles rather than two menus, because there are two languages and two themes:
 * a dropdown to choose between two things is a click spent on nothing. The label shows
 * the language you are in (`ES`) while the accessible name says what pressing does
 * («Cambiar a inglés») — a screen reader announces the action, not the state.
 *
 * The theme icon follows the same rule and shows the destination, so a sun means
 * «switch to light» and appears only while the dark theme is on.
 */
export function PreferencesBar({className}: PreferencesBarProps) {
    const {t, i18n} = useTranslation();
    const {theme, toggleTheme} = useTheme();

    const language = i18n.resolvedLanguage === 'en' ? 'en' : 'es';
    const isDark = theme === 'dark';

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* The design system's Ghost button (`outline` here): a raised fill and
                border/strong, as Figma has it since September. The border is what
                draws it — border/strong clears 3:1 on every surface in both themes —
                and the fill only makes it read as something to press, not to type in. */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={t('common.preferences.switchLanguage')}
                onClick={() => void i18n.changeLanguage(language === 'es' ? 'en' : 'es')}
            >
                <Globe />
                {language.toUpperCase()}
            </Button>

            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={t(isDark ? 'common.preferences.switchToLight' : 'common.preferences.switchToDark')}
                onClick={toggleTheme}
            >
                {isDark ? <Sun /> : <Moon />}
            </Button>
        </div>
    );
}
