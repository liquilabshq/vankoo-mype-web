import {useTranslation} from 'react-i18next';
import {Alert, AlertDescription} from '@/components/ui/alert';
import type {ProfileError} from '../../application/profile.store';

/**
 * Says which step failed. profile-service answers `{message}` in Spanish without a
 * code, so the text shown is this app's own, by step, not the server's.
 */
export function ProfileErrorAlert({errors}: {errors: ProfileError[]}) {
    const {t} = useTranslation();
    const [first] = errors;
    if (!first) return null;
    return (
        <Alert variant="destructive" role="alert">
            <AlertDescription>{t(`profile.errors.${first.kind}`)}</AlertDescription>
        </Alert>
    );
}
