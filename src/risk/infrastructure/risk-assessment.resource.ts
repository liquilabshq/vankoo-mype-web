/** One factor as the risk service sends it. */
export interface RiskFactorResource {
    code: string;
    points: number;
    detail: string;
}

/**
 * Body of `GET /api/v1/mype/risk-assessments/{auctionId}`.
 *
 * The risk service is FastAPI and answers in snake_case, unlike the other services.
 */
export interface RiskAssessmentResource {
    auction_id: string;
    invoice_id: string;
    payer_ruc: string;
    payer_name: string;
    eligible: boolean;
    risk_grade: string | null;
    score: number | null;
    factors: RiskFactorResource[];
    rejection_code: string | null;
    rejection_reason: string | null;
    provisional: boolean;
    assessed_at: string;
}
