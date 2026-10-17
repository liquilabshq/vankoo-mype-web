/**
 * Where the company's environmental certificate is.
 *
 * `NONE` until it uploads one; `UNDER_REVIEW` while the risk service reads it; then
 * `GREEN` or `NOT_GREEN`. Profile only stores the answer: the rules (green-v1) are
 * the risk service's.
 */
export type SustainabilityStatus = 'NONE' | 'UNDER_REVIEW' | 'GREEN' | 'NOT_GREEN';

/** The checks of green-v1, in the order the risk service makes them. */
export const GREEN_CRITERIA = [
    'CERTIFICATE_READABLE',
    'ACCEPTED_STANDARD',
    'IN_FORCE',
    'HOLDER_MATCHES_SUNAT',
    'NOT_ENVIRONMENTAL_OFFENDER'
] as const;

export type GreenCriterionCode = (typeof GREEN_CRITERIA)[number];

export function isGreenCriterionCode(code: string): code is GreenCriterionCode {
    return (GREEN_CRITERIA as readonly string[]).includes(code);
}

/** The standards whose certificate makes a company green. */
export const GREEN_STANDARDS = ['ISO_14001', 'ISO_50001'] as const;

export type GreenStandard = (typeof GREEN_STANDARDS)[number];

export function isGreenStandard(value: string | null): value is GreenStandard {
    return value !== null && (GREEN_STANDARDS as readonly string[]).includes(value);
}

/** One check and what it found; `detail` comes in Spanish from the risk service. */
export interface GreenCriterion {
    code: string;
    passed: boolean;
    detail: string;
}

/** Attributes a certification is built from. */
export interface SustainabilityCertificationAttributes {
    status: SustainabilityStatus;
    submittedAt?: Date | null;
    standard?: string | null;
    issuer?: string | null;
    validUntil?: string | null;
    criteria?: readonly GreenCriterion[];
    reasonCodes?: readonly string[];
    decidedAt?: Date | null;
}

export class SustainabilityCertification {
    readonly status: SustainabilityStatus;
    readonly submittedAt: Date | null;
    readonly standard: string | null;
    readonly issuer: string | null;
    /** `YYYY-MM-DD`, as printed on the certificate. */
    readonly validUntil: string | null;
    readonly criteria: readonly GreenCriterion[];
    readonly reasonCodes: readonly string[];
    readonly decidedAt: Date | null;

    constructor(attributes: SustainabilityCertificationAttributes) {
        this.status = attributes.status;
        this.submittedAt = attributes.submittedAt ?? null;
        this.standard = attributes.standard ?? null;
        this.issuer = attributes.issuer ?? null;
        this.validUntil = attributes.validUntil ?? null;
        this.criteria = attributes.criteria ?? [];
        this.reasonCodes = attributes.reasonCodes ?? [];
        this.decidedAt = attributes.decidedAt ?? null;
    }

    get isGreen(): boolean {
        return this.status === 'GREEN';
    }

    get isUnderReview(): boolean {
        return this.status === 'UNDER_REVIEW';
    }

    /** Whether a new certificate can be uploaded: always, except while one is being read. */
    get canUpload(): boolean {
        return !this.isUnderReview;
    }
}
