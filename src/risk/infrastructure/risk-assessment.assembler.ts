import type {AxiosResponse} from 'axios';
import {RiskAssessment} from '../domain/model/risk-assessment.entity';
import type {RiskAssessmentResource} from './risk-assessment.resource';

const GRADES = ['A', 'B', 'C'] as const;

/**
 * Anti-corruption layer between the risk service's API and this context's model.
 *
 * The only place that knows the service's snake_case. A grade this build does not
 * know reads as no grade, rather than a letter the screen cannot color.
 */
export class RiskAssessmentAssembler {
    static toRiskAssessmentFromResponse(response: AxiosResponse<RiskAssessmentResource>): RiskAssessment {
        const resource = response.data;
        const grade = GRADES.find(candidate => candidate === resource.risk_grade) ?? null;
        return new RiskAssessment({
            auctionId: resource.auction_id,
            invoiceId: resource.invoice_id,
            payerName: resource.payer_name,
            payerRuc: resource.payer_ruc,
            eligible: resource.eligible,
            riskGrade: grade,
            score: resource.score,
            factors: resource.factors.map(factor => ({code: factor.code, points: factor.points, detail: factor.detail})),
            rejectionCode: resource.rejection_code,
            rejectionReason: resource.rejection_reason,
            provisional: resource.provisional,
            assessedAt: new Date(resource.assessed_at)
        });
    }
}
