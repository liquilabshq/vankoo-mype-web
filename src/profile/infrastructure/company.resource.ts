/** Wire shape of `GET /profile/api/v1/companies/me`. */
export interface CompanyResource {
    id: string;
    businessName: string;
    rucNumber: string;
    industrySector: string;
    contactEmail: string;
    contactPhone?: string;
    legalAddress?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    profileComplete: boolean;
    sustainability: {
        status: string;
        submittedAt?: string;
        certificationId?: string;
        standard?: string;
        issuer?: string;
        validUntil?: string;
        criteria: {code: string; passed: boolean; detail: string}[];
        reasonCodes: string[];
        decidedAt?: string;
    };
}

/** Wire shape of the presigned upload answer. */
export interface UploadUrlResource {
    uploadUrl: string;
    fileUrl: string;
    expiresInSeconds: number;
}
