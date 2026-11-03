/** Whether a factor pushed the grade up, down, or only said something. */
export type RiskFactorEffect = 'positive' | 'neutral' | 'negative';

/** One reason behind the decision, and how much it weighed. */
export interface RiskFactor {
    /** The risk service's code, e.g. `WITHHOLDING_AGENT`. */
    code: string;
    points: number;
    /** The reason in the risk service's words, e.g. «Domicilio fiscal HABIDO en SUNAT.». */
    detail: string;
}

/** Attributes a risk assessment is built from. */
export interface RiskAssessmentAttributes {
    auctionId: string;
    invoiceId: string;
    payerName: string;
    payerRuc: string;
    eligible: boolean;
    /** A, B or C; null when the invoice was not eligible. */
    riskGrade: 'A' | 'B' | 'C' | null;
    score: number | null;
    factors: readonly RiskFactor[];
    rejectionCode: string | null;
    rejectionReason: string | null;
    /** Graded by the early stand-in that did not look at the payer. */
    provisional: boolean;
    assessedAt: Date;
}

/**
 * What the risk service decided about one invoice's auction, and why — the risk
 * context's own aggregate, read through the gateway for the MYPE that owns it.
 *
 * Every factor carries its points, and the score is what they add up to on top of a
 * starting value the policy gives every payer; `startingPoints` recovers it, so the
 * card can show a sum that closes.
 */
export class RiskAssessment {
    readonly auctionId: string;
    readonly invoiceId: string;
    readonly payerName: string;
    readonly payerRuc: string;
    readonly eligible: boolean;
    readonly riskGrade: 'A' | 'B' | 'C' | null;
    readonly score: number | null;
    readonly factors: readonly RiskFactor[];
    readonly rejectionCode: string | null;
    readonly rejectionReason: string | null;
    readonly provisional: boolean;
    readonly assessedAt: Date;

    constructor(attributes: RiskAssessmentAttributes) {
        this.auctionId = attributes.auctionId;
        this.invoiceId = attributes.invoiceId;
        this.payerName = attributes.payerName;
        this.payerRuc = attributes.payerRuc;
        this.eligible = attributes.eligible;
        this.riskGrade = attributes.riskGrade;
        this.score = attributes.score;
        this.factors = attributes.factors;
        this.rejectionCode = attributes.rejectionCode;
        this.rejectionReason = attributes.rejectionReason;
        this.provisional = attributes.provisional;
        this.assessedAt = attributes.assessedAt;
    }

    /** The points every payer starts from, or null when there is no score to explain. */
    startingPoints(): number | null {
        if (this.score === null) return null;
        return this.score - this.factors.reduce((sum, factor) => sum + factor.points, 0);
    }

    static effectOf(factor: RiskFactor): RiskFactorEffect {
        if (factor.points > 0) return 'positive';
        if (factor.points < 0) return 'negative';
        return 'neutral';
    }
}
