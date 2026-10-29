import type {LegalAddress} from './company.entity';
import type {IndustrySector} from './industry-sector';

/** Everything `PATCH /companies/me/profile` asks for, at once, besides the ficha RUC itself. */
export class CompleteProfileCommand {
    readonly rucNumber: string;
    readonly businessName: string;
    readonly industrySector: IndustrySector;
    readonly contactPhone: string;
    readonly legalAddress: LegalAddress;

    constructor(attributes: {
        rucNumber: string;
        businessName: string;
        industrySector: IndustrySector;
        contactPhone: string;
        legalAddress: LegalAddress;
    }) {
        this.rucNumber = attributes.rucNumber.trim();
        this.businessName = attributes.businessName.trim();
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
