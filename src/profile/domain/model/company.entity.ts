import type {IndustrySector} from './industry-sector';
import {SustainabilityCertification} from './sustainability-certification.entity';

export interface LegalAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
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
}

/**
 * The MYPE's company, as profile-service keeps it.
 *
 * It is born empty when the account is created and is completed once, all fields at
 * a time: the backend has no draft, so there is nothing to save halfway.
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
    }

    /** The certificate is compared with SUNAT's name for the RUC, so it needs both first. */
    get canUploadCertificate(): boolean {
        return Boolean(this.rucNumber && this.businessName) && this.sustainability.canUpload;
    }
}
