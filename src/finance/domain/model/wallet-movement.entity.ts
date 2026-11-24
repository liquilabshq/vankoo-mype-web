import type {MinorAmount} from './wallet.entity';

/**
 * Finance's movement kinds. `ADELANTO` is the one a MYPE sees most: the advance of an
 * invoice whose auction was fully funded. `RETIRO` and `COMISION` are debits; the
 * investor's `RECARGA` and `INVERSION` are kept so an unexpected row still has a name.
 */
export type WalletMovementType = 'ADELANTO' | 'RECARGA' | 'INVERSION' | 'RETIRO' | 'COMISION';

const KNOWN_TYPES: readonly WalletMovementType[] = ['ADELANTO', 'RECARGA', 'INVERSION', 'RETIRO', 'COMISION'];

export function isWalletMovementType(value: string): value is WalletMovementType {
    return (KNOWN_TYPES as readonly string[]).includes(value);
}

/** One row of the wallet's history, newest first. */
export class WalletMovement {
    /** Null for a kind this build does not know: the row still shows, with a generic name. */
    readonly type: WalletMovementType | null;
    readonly direction: 'CREDIT' | 'DEBIT';
    readonly amount: MinorAmount;
    /** The auction whose funding paid this movement. Only for `ADELANTO`. */
    readonly sourceAuctionId: string | null;
    readonly occurredAt: Date;

    constructor({
        type,
        direction,
        amount,
        sourceAuctionId,
        occurredAt
    }: {
        type: WalletMovementType | null;
        direction: 'CREDIT' | 'DEBIT';
        amount: MinorAmount;
        sourceAuctionId: string | null;
        occurredAt: Date;
    }) {
        this.type = type;
        this.direction = direction;
        this.amount = amount;
        this.sourceAuctionId = sourceAuctionId;
        this.occurredAt = occurredAt;
    }

    isCredit(): boolean {
        return this.direction === 'CREDIT';
    }
}

/** A page of movements, as `GET .../movements?page&size` answers it. */
export interface WalletMovementPage {
    items: WalletMovement[];
    /** 0-based, as Finance counts. */
    page: number;
    pageSize: number;
    totalElements: number;
}
