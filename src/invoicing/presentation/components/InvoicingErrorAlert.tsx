import {isAxiosError} from 'axios';
import {useTranslation} from 'react-i18next';
import {Alert, AlertDescription} from '@/components/ui/alert';

interface InvoicingErrorAlertProps {
    /** What the store caught. Nothing is rendered when it is empty. */
    errors: Error[];
}

/**
 * Turns whatever failed into words the user can act on.
 *
 * Simpler than `IamErrorAlert` on purpose: the invoicing service documents a single
 * per-code error for this endpoint, `MYPE_NOT_VERIFIED` (403) when the company's KYC
 * is not verified, and every other failure reads the same generic line.
 */
export function InvoicingErrorAlert({errors}: InvoicingErrorAlertProps) {
    const {t} = useTranslation();
    if (errors.length === 0) return null;
    const notVerified = errors.some(
        error => isAxiosError<{errorCode?: string}>(error) && error.response?.data?.errorCode === 'MYPE_NOT_VERIFIED'
    );
    return (
        <Alert variant="destructive" role="alert">
            <AlertDescription>{t(notVerified ? 'invoicing.errors.notVerified' : 'invoicing.errors.uploadFailed')}</AlertDescription>
        </Alert>
    );
}
