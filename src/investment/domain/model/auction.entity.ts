import type {InvoiceAmount} from '../../../invoicing/domain/model/invoice.entity';
import {isPublishedStatus, type AuctionStatus, type RiskGrade} from './auction-status';
import type {FinancialQuote} from './financial-quote.entity';

/** Attributes an auction is built from. */
export interface AuctionAttributes {
    id: string;
    /** The invoicing aggregate this auction was opened for — by id, never by object. */
    invoiceId: string;
    status: AuctionStatus;
    riskGrade: RiskGrade;
    /** What the investors are asked to put in. Null until a quote is accepted. */
    targetAmount: InvoiceAmount | null;
    currentFunding: InvoiceAmount;
    publishedAt: Date | null;
    expiresAt: Date | null;
    /** The quote the MYPE accepted, which is the only one this response carries. */
    acceptedQuote: FinancialQuote | null;
    /** Why the risk evaluation found the invoice not eligible, as a stable code. Null unless rejected. */
    rejectionReasonCode: string | null;
    /** The same reason in the risk service's words, for a code this build has no copy for. */
    rejectionReason: string | null;
}

/**
 * One invoice's auction, as Investment sees it — `AuctionDetailsResource`, reduced to
 * what the MYPE's invoice detail needs.
 *
 * The auction is Investment's aggregate, not this app's: it is created by an event
 * when the invoice passes validation, evaluated by the risk service, and only then
 * does the MYPE get a say — unless the evaluation rejects it. The four predicates
 * below are the four things the detail screen has to know about it, and nothing
 * more is modelled yet.
 */
export class Auction {
    readonly id: string;
    readonly invoiceId: string;
    readonly status: AuctionStatus;
    readonly riskGrade: RiskGrade;
    readonly targetAmount: InvoiceAmount | null;
    readonly currentFunding: InvoiceAmount;
    readonly publishedAt: Date | null;
    readonly expiresAt: Date | null;
    readonly acceptedQuote: FinancialQuote | null;
    readonly rejectionReasonCode: string | null;
    readonly rejectionReason: string | null;

    constructor({
        id,
        invoiceId,
        status,
        riskGrade,
        targetAmount,
        currentFunding,
        publishedAt,
        expiresAt,
        acceptedQuote,
        rejectionReasonCode,
        rejectionReason
    }: AuctionAttributes) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.status = status;
        this.riskGrade = riskGrade;
        this.targetAmount = targetAmount;
        this.currentFunding = currentFunding;
        this.publishedAt = publishedAt;
        this.expiresAt = expiresAt;
        this.acceptedQuote = acceptedQuote;
        this.rejectionReasonCode = rejectionReasonCode;
        this.rejectionReason = rejectionReason;
    }

    /** Whether the risk evaluation is still pending, so there is nothing to offer yet. */
    isAwaitingEvaluation(): boolean {
        return this.status === 'PENDING_VERIFICATION_RISK';
    }

    /** Whether the MYPE can ask for, see and accept a quote: only while `DRAFT`. */
    canBeQuoted(): boolean {
        return this.status === 'DRAFT';
    }

    /** Whether the risk evaluation found the invoice not eligible, so it will never be offered. */
    isRejected(): boolean {
        return this.status === 'REJECTED';
    }

    /** Whether a quote was accepted and the invoice is out with the investors. */
    isPublished(): boolean {
        return isPublishedStatus(this.status);
    }
}
