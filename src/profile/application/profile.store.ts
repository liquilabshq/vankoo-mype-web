import {create} from 'zustand';
import {useIamStore} from '../../iam/application/iam.store';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import type {Company} from '../domain/model/company.entity';
import type {CompleteProfileCommand} from '../domain/model/complete-profile.command';
import type {UpdateContactCommand} from '../domain/model/update-contact.command';
import {CompanyAssembler} from '../infrastructure/company.assembler';
import {ProfileApi} from '../infrastructure/profile-api';

const profileApi = new ProfileApi({requestInterceptors: [iamInterceptor]});

/** The certificate types profile-service signs an upload for. */
export const CERTIFICATE_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

/** The ficha RUC is checked by its digital signature, which only SUNAT's PDF carries. */
export const RUC_DOCUMENT_CONTENT_TYPE = 'application/pdf';

/** The logo types profile-service signs an upload for. */
export const LOGO_CONTENT_TYPES = ['image/jpeg', 'image/png'] as const;

/** Which step failed, so the view can say something precise. */
export type ProfileErrorKind = 'load' | 'save' | 'upload' | 'contact' | 'logo';

export interface ProfileError {
    kind: ProfileErrorKind;
    error: Error;
}

/** State and use cases of the profile bounded context. */
export interface ProfileState {
    company: Company | null;
    loading: boolean;
    loaded: boolean;
    /** The session token the company was read with: another account must not see it. */
    loadedWith: string | null;
    saving: boolean;
    uploading: boolean;
    errors: ProfileError[];
    fetchCompany: () => Promise<void>;
    /**
     * Loads the company once per session; the shell's guard calls it before every
     * protected route. Signing in with another account reads it again.
     */
    ensureCompany: () => Promise<Company | null>;
    /**
     * Sends the company's data and its ficha RUC for verification: a presigned URL,
     * the PDF straight to storage, then the data with the file's URL. The company comes
     * back `IN_REVIEW`.
     */
    submitForVerification: (command: CompleteProfileCommand, rucDocument: File) => Promise<boolean>;
    updateContact: (command: UpdateContactCommand) => Promise<boolean>;
    uploadLogo: (file: File) => Promise<boolean>;
    /** Like `refreshWhileUnderReview`, for the KYC: answers whether it is still in review. */
    refreshWhileKycInReview: () => Promise<boolean>;
    /**
     * Uploads the environmental certificate in the three steps profile-service
     * expects: a presigned URL, the file straight to storage, and the confirmation.
     */
    uploadCertificate: (file: File) => Promise<boolean>;
    /**
     * Reads the company again while its certificate is being reviewed, and answers
     * whether it still is. A failed read keeps the last known state: this runs on a
     * timer, and one dropped request is not worth an error on screen.
     */
    refreshWhileUnderReview: () => Promise<boolean>;
    clearErrors: () => void;
}

/**
 * The application layer of the profile context.
 *
 * The only thing that talks to `ProfileApi`, and the only place `CompanyAssembler` is
 * called.
 */
export const useProfileStore = create<ProfileState>()((set, get) => ({
    company: null,
    loading: false,
    loaded: false,
    loadedWith: null,
    saving: false,
    uploading: false,
    errors: [],

    fetchCompany: async () => {
        const loadedWith = useIamStore.getState().session?.token ?? null;
        set({loading: true, errors: []});
        try {
            const response = await profileApi.getMyCompany();
            set({company: CompanyAssembler.toCompanyFromResponse(response), loading: false, loaded: true, loadedWith});
        } catch (error) {
            set({company: null, errors: [{kind: 'load', error: error as Error}], loading: false, loaded: true, loadedWith});
        }
    },

    ensureCompany: async () => {
        const token = useIamStore.getState().session?.token ?? null;
        if (!get().loaded || get().loadedWith !== token) await get().fetchCompany();
        return get().company;
    },

    submitForVerification: async (command, rucDocument) => {
        set({saving: true, errors: []});
        try {
            const signed = await profileApi.requestRucDocumentUploadUrl();
            await profileApi.putFile(signed.data.uploadUrl, rucDocument);
            const response = await profileApi.submitMyProfile(
                CompanyAssembler.toRequestFromCommand(command, signed.data.fileUrl)
            );
            set({company: CompanyAssembler.toCompanyFromResponse(response), saving: false});
            return true;
        } catch (error) {
            set({errors: [{kind: 'save', error: error as Error}], saving: false});
            return false;
        }
    },

    updateContact: async command => {
        set({saving: true, errors: []});
        try {
            const response = await profileApi.updateMyContact(CompanyAssembler.toContactRequestFromCommand(command));
            set({company: CompanyAssembler.toCompanyFromResponse(response), saving: false});
            return true;
        } catch (error) {
            set({errors: [{kind: 'contact', error: error as Error}], saving: false});
            return false;
        }
    },

    uploadLogo: async file => {
        set({uploading: true, errors: []});
        try {
            const signed = await profileApi.requestLogoUploadUrl(file.type);
            await profileApi.putFile(signed.data.uploadUrl, file);
            const response = await profileApi.submitLogo(signed.data.fileUrl);
            set({company: CompanyAssembler.toCompanyFromResponse(response), uploading: false});
            return true;
        } catch (error) {
            set({errors: [{kind: 'logo', error: error as Error}], uploading: false});
            return false;
        }
    },

    uploadCertificate: async file => {
        set({uploading: true, errors: []});
        try {
            const signed = await profileApi.requestCertificateUploadUrl(file.type);
            await profileApi.putFile(signed.data.uploadUrl, file);
            const response = await profileApi.submitCertificate(signed.data.fileUrl);
            set({company: CompanyAssembler.toCompanyFromResponse(response), uploading: false});
            return true;
        } catch (error) {
            set({errors: [{kind: 'upload', error: error as Error}], uploading: false});
            return false;
        }
    },

    refreshWhileUnderReview: async () => {
        if (!get().company?.sustainability.isUnderReview) return false;
        try {
            const company = CompanyAssembler.toCompanyFromResponse(await profileApi.getMyCompany());
            if (company) set({company});
            return company?.sustainability.isUnderReview ?? false;
        } catch {
            return true;
        }
    },

    refreshWhileKycInReview: async () => {
        if (!get().company?.kyc.isInReview) return false;
        try {
            const company = CompanyAssembler.toCompanyFromResponse(await profileApi.getMyCompany());
            if (company) set({company});
            return company?.kyc.isInReview ?? false;
        } catch {
            return true;
        }
    },

    clearErrors: () => set({errors: []})
}));
