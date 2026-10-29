import type {LegalAddress} from './company.entity';
import type {IndustrySector} from './industry-sector';

/** What `PATCH /companies/me/contact` lets a verified company change: never its RUC or name. */
export class UpdateContactCommand {
    readonly industrySector: IndustrySector;
    readonly contactPhone: string;
    readonly legalAddress: LegalAddress;

    constructor(attributes: {industrySector: IndustrySector; contactPhone: string; legalAddress: LegalAddress}) {
        this.industrySector = attributes.industrySector;
        this.contactPhone = attributes.contactPhone.trim();
        this.legalAddress = {
            street: attributes.legalAddress.street.trim(),
            city: attributes.legalAddress.city.trim(),
            state: attributes.legalAddress.state.trim(),
            postalCode: attributes.legalAddress.postalCode.trim(),
            country: attributes.legalAddress.country.trim()
        };
    }
}
