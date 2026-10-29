import axios, {type AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import type {CompanyResource, UploadUrlResource} from './company.resource';

const companyEndpointPath = import.meta.env.VITE_COMPANY_ENDPOINT_PATH;

/**
 * The API of the profile bounded context: the caller's own company.
 *
 * Every route is under `/companies/me`, which profile-service resolves from the
 * `X-User-Id` the gateway puts in after checking the token. There is no company id in
 * any URL here, so a session cannot reach another company's profile by editing one.
 */
export class ProfileApi extends BaseApi {
    constructor(options: BaseApiOptions = {}) {
        super(options);
    }

    getMyCompany(): Promise<AxiosResponse<CompanyResource>> {
        return this.http.get(companyEndpointPath);
    }

    /** Sends the data and the ficha RUC already in storage: the company goes `IN_REVIEW`. */
    submitMyProfile(body: object): Promise<AxiosResponse<CompanyResource>> {
        return this.http.patch(`${companyEndpointPath}/profile`, body);
    }

    updateMyContact(body: object): Promise<AxiosResponse<CompanyResource>> {
        return this.http.patch(`${companyEndpointPath}/contact`, body);
    }

    requestRucDocumentUploadUrl(): Promise<AxiosResponse<UploadUrlResource>> {
        return this.http.post(`${companyEndpointPath}/ruc/upload-url`, {contentType: 'application/pdf'});
    }

    requestLogoUploadUrl(contentType: string): Promise<AxiosResponse<UploadUrlResource>> {
        return this.http.post(`${companyEndpointPath}/logo/upload-url`, {contentType});
    }

    submitLogo(logoUrl: string): Promise<AxiosResponse<CompanyResource>> {
        return this.http.patch(`${companyEndpointPath}/logo`, {logoUrl});
    }

    requestCertificateUploadUrl(contentType: string): Promise<AxiosResponse<UploadUrlResource>> {
        return this.http.post(`${companyEndpointPath}/sustainability-certificate/upload-url`, {contentType});
    }

    submitCertificate(fileUrl: string): Promise<AxiosResponse<CompanyResource>> {
        return this.http.put(`${companyEndpointPath}/sustainability-certificate`, {fileUrl});
    }

    /**
     * Puts the file straight into storage with the presigned URL.
     *
     * A bare axios call, not `this.http`: the URL is MinIO's or S3's, not the gateway's,
     * and the bearer token must not travel to it (the signature in the URL is the only
     * credential the storage expects).
     */
    putFile(uploadUrl: string, file: File): Promise<AxiosResponse<unknown>> {
        return axios.put(uploadUrl, file, {headers: {'Content-Type': file.type}});
    }
}
