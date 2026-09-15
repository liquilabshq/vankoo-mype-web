import {Bell, Search, Settings} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {PreferencesBar} from './PreferencesBar';

/**
 * The bar above the page content: search, notifications, settings, and the language
 * and theme switcher.
 *
 * Search, notifications and settings are visual only — none of the services behind
 * them exist on this frontend yet, so they render as plain icons rather than an
 * affordance that does nothing when pressed.
 */
export function TopBar() {
    const {t} = useTranslation();

    return (
        <div className="bg-surface-raised border-border-subtle flex h-16 shrink-0 items-center justify-between border-b px-6">
            <div className="bg-surface-sunken border-border-strong flex h-9 w-80 items-center gap-2 rounded-md border px-3">
                <Search className="text-fg-muted size-4 shrink-0" aria-hidden="true" />
                <input
                    type="search"
                    placeholder={t('common.topBar.searchPlaceholder')}
                    className="text-body text-fg placeholder:text-fg-muted w-full bg-transparent outline-none"
                />
            </div>

            <div className="flex items-center gap-6">
                <Bell className="text-fg size-5" aria-hidden="true" />
                <Settings className="text-fg size-5" aria-hidden="true" />
                <PreferencesBar />
            </div>
        </div>
    );
}
