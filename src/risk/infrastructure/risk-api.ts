import type {AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import type {RiskAssessmentResource} from './risk-assessment.resource';

// The gateway exposes only the MYPE's own reads of the risk service. A default, so a
// build without the variable still finds the one route there is.
const riskAssessmentsEndpointPath =
    import.meta.env.VITE_RISK_ASSESSMENTS_ENDPOINT_PATH ?? '/risk/api/v1/mype/risk-assessments';

/**
 * The API of the risk bounded context, as far as a MYPE uses it.
 *
 * Behind the gateway's JWT: the gateway turns the token's subject into the
 * `X-User-Id` the risk service checks the auction's MYPE against, and another MYPE's
 * auction answers 404.
 */
export class RiskApi extends BaseApi {
    constructor(options: BaseApiOptions = {}) {
        super(options);
    }

    /** The assessment of one of the MYPE's auctions — `GET .../{auctionId}`. 404 until risk has graded it. */
    getRiskAssessment(auctionId: string): Promise<AxiosResponse<RiskAssessmentResource>> {
        return this.http.get(`${riskAssessmentsEndpointPath}/${auctionId}`);
    }
}
