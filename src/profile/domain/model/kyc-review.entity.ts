/**
 * Where the company's KYC is, as profile-service decides it.
 *
 * `PENDING` until it sends its data and its ficha RUC (and again after a correction),
 * `IN_REVIEW` while the risk service checks them, then `VERIFIED` or `REJECTED`. The
 * risk service only recommends; profile-service keeps the status and the wait before a
 * rejected company may send again (24 h, 72 h, then 7 days).
 */
export type KycStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';

export const KYC_STATUSES: readonly KycStatus[] = ['PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED'];

/** The checks of kyc-v1, in the order the risk service makes them. */
export const KYC_CHECKS = [
    'TAXPAYER_FOUND',
    'RUC_DOCUMENT_SIGNED',
    'RUC_DOCUMENT_RECENT',
    'RUC_DOCUMENT_MATCHES',
    'NAME_MATCHES',
    'TAXPAYER_ACTIVE',
    'DOMICILE_FOUND',
    'NOT_SHELL_COMPANY'
] as const;

export type KycCheckCode = (typeof KYC_CHECKS)[number];

export function isKycCheckCode(code: string): code is KycCheckCode {
    return (KYC_CHECKS as readonly string[]).includes(code);
}

/** One check and what it found; `detail` comes in Spanish from the risk service. */
export interface KycCheck {
    code: string;
    passed: boolean;
    detail: string;
}

/** A field the company has to fix before sending again, e.g. `rucNumber`/`RUC_NOT_FOUND`. */
export interface KycFieldError {
    field: string;
    code: string;
}

export interface KycReviewAttributes {
    status: KycStatus;
    submittedAt?: Date | null;
    decidedAt?: Date | null;
    checks?: KycCheck[];
    reasonCodes?: string[];
    fieldErrors?: KycFieldError[];
    demo?: boolean;
    attempts?: number;
    retryAvailableAt?: Date | null;
}

export class KycReview {
    readonly status: KycStatus;
    readonly submittedAt: Date | null;
    readonly decidedAt: Date | null;
    readonly checks: KycCheck[];
    readonly reasonCodes: string[];
    readonly fieldErrors: KycFieldError[];
    /**
     * The ficha was signed by Vankoo's demonstration CA, not by SUNAT: a temporary
     * patch for demos. A demo verification is always shown apart from a real one.
     */
    readonly demo: boolean;
    readonly attempts: number;
    readonly retryAvailableAt: Date | null;

    constructor(attributes: KycReviewAttributes) {
        this.status = attributes.status;
        this.submittedAt = attributes.submittedAt ?? null;
        this.decidedAt = attributes.decidedAt ?? null;
        this.checks = attributes.checks ?? [];
        this.reasonCodes = attributes.reasonCodes ?? [];
        this.fieldErrors = attributes.fieldErrors ?? [];
        this.demo = attributes.demo ?? false;
        this.attempts = attributes.attempts ?? 0;
        this.retryAvailableAt = attributes.retryAvailableAt ?? null;
    }

    get isPending(): boolean {
        return this.status === 'PENDING';
    }

    get isInReview(): boolean {
        return this.status === 'IN_REVIEW';
    }

    get isVerified(): boolean {
        return this.status === 'VERIFIED';
    }

    get isRejected(): boolean {
        return this.status === 'REJECTED';
    }

    /** Only a verified company may upload invoices, a green certificate or change its contact. */
    get canOperate(): boolean {
        return this.isVerified;
    }

    /** The first check that failed: the reason shown first on a rejection. */
    get firstFailedCheck(): KycCheck | null {
        return this.checks.find(check => !check.passed) ?? null;
    }

    hasFieldError(field: string): boolean {
        return this.fieldErrors.some(error => error.field === field);
    }

    /** Whether the form may be sent: pending, or rejected and the wait is over. */
    canSubmitAt(now: Date): boolean {
        if (this.isPending) return true;
        if (!this.isRejected) return false;
        return !this.retryAvailableAt || now >= this.retryAvailableAt;
    }
}
