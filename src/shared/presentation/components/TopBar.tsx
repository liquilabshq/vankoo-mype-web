import {Bell, LogOut, Search, Settings} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {PreferencesBar} from './PreferencesBar';
import {Wordmark} from './Wordmark';

interface TopBarProps {
    /** Shown below `lg` only, where the sidebar that carries «Salir» is hidden. */
    onSignOut?: () => void;
}

/**
 * The bar above the page content: search, then the language and theme switcher,
 * notifications and settings, in the mockups' order.
 *
 * Search, notifications and settings are visual only — none of the services behind
 * them exist on this frontend yet, so they render as plain icons rather than an
 * affordance that does nothing when pressed.
 *
 * Below `lg` it is the mobile header instead: the wordmark on the left, since there
 * is no sidebar to carry it, and the preferences on the right. The mobile mockups
 * have no way out of the session there, so it adds a Ghost «Salir» next to them —
 * the same family of button, without inventing a screen to hold it.
 */
export function TopBar({onSignOut}: TopBarProps) {
    const {t} = useTranslation();

    return (
        <div className="bg-surface-raised border-border-subtle flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
            <Wordmark className="text-fg h-6 w-auto shrink-0 lg:hidden" />

            <div className="bg-surface-field border-border-strong hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-md border px-3 sm:flex md:max-w-80">
                <Search className="text-fg-muted size-4 shrink-0" aria-hidden="true" />
                <input
                    type="search"
                    placeholder={t('common.topBar.searchPlaceholder')}
                    className="text-body text-fg placeholder:text-fg-muted w-full bg-transparent outline-none"
                />
            </div>

            <div className="ml-auto flex items-center gap-4">
                <PreferencesBar />
                {onSignOut && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={onSignOut}
                        aria-label={t('common.signOut')}
                        className="-ml-2 lg:hidden"
                    >
                        <LogOut />
                    </Button>
                )}
                <Bell className="text-fg hidden size-5 shrink-0 sm:block" aria-hidden="true" />
                <Settings className="text-fg hidden size-5 shrink-0 sm:block" aria-hidden="true" />
            </div>
        </div>
    );
}
