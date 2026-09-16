import type {InvoiceMilestone, RailState} from '../domain/model/invoice-status';

/** The rail's five milestones, left to right — what the step labels are built from. */
export const RAIL_MILESTONES: readonly InvoiceMilestone[] = ['received', 'reading', 'validating', 'approved', 'inAuction'];

/**
 * Every key under `invoicing.detail.railCaption` — see `IamErrorAlert` for the same
 * dynamic-key-cast pattern. Written out rather than templated from `InvoiceMilestone`:
 * only the combinations a real status can actually produce (per `MILESTONE_BY_STATUS`)
 * have copy — "received" has no "attention" or "blocked" entry, and "blocked" only
 * exists on "validating", since `NOT_ELIGIBLE` is the only status mapped to it today.
 */
export type RailCaptionKey =
    | 'invoicing.detail.railCaption.received.automatic'
    | 'invoicing.detail.railCaption.reading.automatic'
    | 'invoicing.detail.railCaption.reading.attention'
    | 'invoicing.detail.railCaption.validating.automatic'
    | 'invoicing.detail.railCaption.validating.attention'
    | 'invoicing.detail.railCaption.validating.blocked'
    | 'invoicing.detail.railCaption.approved.automatic'
    | 'invoicing.detail.railCaption.approved.attention'
    | 'invoicing.detail.railCaption.inAuction.automatic'
    | 'invoicing.detail.railCaption.inAuction.attention';

/**
 * The sentence under the rail for where an invoice is.
 *
 * Shared by the detail and the upload screen so the two can never describe the same
 * status in different words — the upload screen used to carry a fixed «estamos
 * leyendo los datos» that stayed on screen long after the rail had moved past reading.
 */
export function railCaptionKey(rail: RailState): RailCaptionKey {
    return `invoicing.detail.railCaption.${RAIL_MILESTONES[rail.currentIndex]}.${rail.currentState}` as RailCaptionKey;
}
