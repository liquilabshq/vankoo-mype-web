import type {IndustrySector} from './industry-sector';
import {KycReview} from './kyc-review.entity';
import {SustainabilityCertification} from './sustainability-certification.entity';

export interface LegalAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

/** Whether every part of an address was given: profile-service asks for all five. */
export function isAddressFilled(address: LegalAddress): boolean {
    return Object.values(address).every(part => part.trim());
}

/** Attributes a company is built from. */
export interface CompanyAttributes {
    id: string;
    contactEmail: string;
    businessName?: string | null;
    rucNumber?: string | null;
    industrySector?: IndustrySector | null;
    contactPhone?: string | null;
    legalAddress?: LegalAddress | null;
    profileComplete?: boolean;
    sustainability?: SustainabilityCertification;
    kyc?: KycReview;
    logoUrl?: string | null;
    rucDocumentUrl?: string | null;
}

/**
 * The MYPE's company, as profile-service keeps it.
 *
 * It is born empty when the account is created and is sent for verification once, all
 * fields at a time together with its ficha RUC: the backend has no draft, so there is
 * nothing to save halfway. Once verified, only the contact can change.
 */
export class Company {
    readonly id: string;
    readonly contactEmail: string;
    readonly businessName: string | null;
    readonly rucNumber: string | null;
    readonly industrySector: IndustrySector | null;
    readonly contactPhone: string | null;
    readonly legalAddress: LegalAddress | null;
    readonly profileComplete: boolean;
    readonly sustainability: SustainabilityCertification;
    readonly kyc: KycReview;
    readonly logoUrl: string | null;
    readonly rucDocumentUrl: string | null;

    constructor(attributes: CompanyAttributes) {
        this.id = attributes.id;
        this.contactEmail = attributes.contactEmail;
        this.businessName = attributes.businessName || null;
        this.rucNumber = attributes.rucNumber || null;
        this.industrySector = attributes.industrySector ?? null;
        this.contactPhone = attributes.contactPhone || null;
        this.legalAddress = attributes.legalAddress ?? null;
        this.profileComplete = attributes.profileComplete ?? false;
        this.sustainability = attributes.sustainability ?? new SustainabilityCertification({status: 'NONE'});
        this.kyc = attributes.kyc ?? new KycReview({status: 'PENDING'});
        this.logoUrl = attributes.logoUrl || null;
        this.rucDocumentUrl = attributes.rucDocumentUrl || null;
    }

    /**
     * The certificate is compared with SUNAT's name for the RUC, so it needs both, and
     * only a verified company operates.
     */
    get canUploadCertificate(): boolean {
        return Boolean(this.rucNumber && this.businessName) && this.kyc.canOperate && this.sustainability.canUpload;
    }
}
