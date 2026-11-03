import {create} from 'zustand';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import type {RiskAssessment} from '../domain/model/risk-assessment.entity';
import {RiskAssessmentAssembler} from '../infrastructure/risk-assessment.assembler';
import {RiskApi} from '../infrastructure/risk-api';

const riskApi = new RiskApi({requestInterceptors: [iamInterceptor]});

/** State and use cases of the risk bounded context. */
export interface RiskState {
    /** The assessment of the auction last asked about; null until it answers, or if it cannot. */
    assessment: RiskAssessment | null;
    /**
     * Reads the assessment of one auction.
     *
     * A failed read leaves no assessment and no error on screen: the card is an
     * explanation on top of a decision the detail already shows, and its absence
     * is not something the MYPE can act on.
     */
    loadRiskAssessment: (auctionId: string) => Promise<void>;
    clearRiskAssessment: () => void;
}

/** The application layer of the risk context: the only thing that talks to `RiskApi`. */
export const useRiskStore = create<RiskState>()((set, get) => ({
    assessment: null,

    loadRiskAssessment: async auctionId => {
        try {
            const assessment = RiskAssessmentAssembler.toRiskAssessmentFromResponse(
                await riskApi.getRiskAssessment(auctionId)
            );
            set({assessment});
        } catch {
            if (get().assessment?.auctionId === auctionId) return;
            set({assessment: null});
        }
    },

    clearRiskAssessment: () => set({assessment: null})
}));
