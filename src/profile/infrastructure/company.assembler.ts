import type {AxiosResponse} from 'axios';
import {Company} from '../domain/model/company.entity';
import {isIndustrySector} from '../domain/model/industry-sector';
import {KYC_STATUSES, KycReview} from '../domain/model/kyc-review.entity';
import {SustainabilityCertification, type SustainabilityStatus} from '../domain/model/sustainability-certification.entity';
import type {CompleteProfileCommand} from '../domain/model/complete-profile.command';
import type {UpdateContactCommand} from '../domain/model/update-contact.command';
import type {CompanyResource} from './company.resource';

const STATUSES: readonly SustainabilityStatus[] = ['NONE', 'UNDER_REVIEW', 'GREEN', 'NOT_GREEN'];

function dateOrNull(value: string | undefined): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/** Turns profile-service's wire shapes into the context's model and back. */
export class CompanyAssembler {
    static toCompanyFromResource(resource: CompanyResource): Company {
        const sustainability = resource.sustainability;
        // An unknown state is shown as no certificate rather than guessed at.
        const status = STATUSES.find(candidate => candidate === sustainability?.status) ?? 'NONE';
        const kyc = resource.kyc;
        // Likewise an unknown KYC state reads as not sent yet: the form, never a false «verified».
        const kycStatus = KYC_STATUSES.find(candidate => candidate === kyc?.status) ?? 'PENDING';
        return new Company({
            id: resource.id,
            contactEmail: resource.contactEmail,
            businessName: resource.businessName,
            rucNumber: resource.rucNumber,
            industrySector: isIndustrySector(resource.industrySector) ? resource.industrySector : null,
            contactPhone: resource.contactPhone,
            legalAddress: resource.legalAddress?.street ? resource.legalAddress : null,
            profileComplete: resource.profileComplete,
            logoUrl: resource.logoUrl,
            rucDocumentUrl: resource.rucDocumentUrl,
            kyc: new KycReview({
                status: kycStatus,
                submittedAt: dateOrNull(kyc?.submittedAt),
                decidedAt: dateOrNull(kyc?.decidedAt),
                checks: kyc?.checks ?? [],
                reasonCodes: kyc?.reasonCodes ?? [],
                fieldErrors: kyc?.fieldErrors ?? [],
                demo: kyc?.demo === true,
                attempts: kyc?.attempts ?? 0,
                retryAvailableAt: dateOrNull(kyc?.retryAvailableAt)
            }),
            sustainability: new SustainabilityCertification({
                status,
                submittedAt: dateOrNull(sustainability?.submittedAt),
                standard: sustainability?.standard,
                issuer: sustainability?.issuer,
                validUntil: sustainability?.validUntil,
                criteria: sustainability?.criteria ?? [],
                reasonCodes: sustainability?.reasonCodes ?? [],
                decidedAt: dateOrNull(sustainability?.decidedAt)
            })
        });
    }

    static toCompanyFromResponse(response: AxiosResponse<CompanyResource>): Company | null {
        if (response.status !== 200 || !response.data?.id) return null;
        return this.toCompanyFromResource(response.data);
    }

    static toRequestFromCommand(command: CompleteProfileCommand, rucDocumentUrl: string) {
        return {
            rucNumber: command.rucNumber,
            businessName: command.businessName,
            industrySector: command.industrySector,
            contactPhone: command.contactPhone,
            legalAddress: {...command.legalAddress},
            rucDocumentUrl
        };
    }

    static toContactRequestFromCommand(command: UpdateContactCommand) {
        return {
            industrySector: command.industrySector,
            contactPhone: command.contactPhone,
            legalAddress: {...command.legalAddress}
        };
    }
}
