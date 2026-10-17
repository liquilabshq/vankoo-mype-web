import {create} from 'zustand';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import type {Company} from '../domain/model/company.entity';
import type {CompleteProfileCommand} from '../domain/model/complete-profile.command';
import {CompanyAssembler} from '../infrastructure/company.assembler';
import {ProfileApi} from '../infrastructure/profile-api';

const profileApi = new ProfileApi({requestInterceptors: [iamInterceptor]});

/** The certificate types profile-service signs an upload for. */
export const CERTIFICATE_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

/** Which step failed, so the view can say something precise. */
export type ProfileErrorKind = 'load' | 'save' | 'upload';

export interface ProfileError {
    kind: ProfileErrorKind;
    error: Error;
}

/** State and use cases of the profile bounded context. */
export interface ProfileState {
    company: Company | null;
    loading: boolean;
    loaded: boolean;
    saving: boolean;
    uploading: boolean;
    errors: ProfileError[];
    fetchCompany: () => Promise<void>;
    completeProfile: (command: CompleteProfileCommand) => Promise<boolean>;
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
    saving: false,
    uploading: false,
    errors: [],

    fetchCompany: async () => {
        set({loading: true, errors: []});
        try {
            const response = await profileApi.getMyCompany();
            set({company: CompanyAssembler.toCompanyFromResponse(response), loading: false, loaded: true});
        } catch (error) {
            set({errors: [{kind: 'load', error: error as Error}], loading: false, loaded: true});
        }
    },

    completeProfile: async command => {
        set({saving: true, errors: []});
        try {
            const response = await profileApi.completeMyProfile(CompanyAssembler.toRequestFromCommand(command));
            set({company: CompanyAssembler.toCompanyFromResponse(response), saving: false});
            return true;
        } catch (error) {
            set({errors: [{kind: 'save', error: error as Error}], saving: false});
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

    clearErrors: () => set({errors: []})
}));
