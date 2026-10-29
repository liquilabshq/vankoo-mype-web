import {useProfileStore} from '../../profile/application/profile.store';

/**
 * Whether the MYPE may upload invoices: only once its company is verified.
 *
 * Read from the profile context, which the shell's guard already loaded. The invoicing
 * service refuses an upload from an unverified MYPE anyway (403 `MYPE_NOT_VERIFIED`);
 * this only saves her the attempt. If the profile could not be read, the button stays
 * on and the service has the last word.
 */
export function useCanUploadInvoices(): boolean {
    const company = useProfileStore(state => state.company);
    return company?.kyc.canOperate ?? true;
}
