/** A sum of money in minor units (cents), as Finance keeps it — never a float. */
export interface MinorAmount {
    amountMinor: number;
    currency: string;
}

/**
 * e.g. "S/ 12,480.00". Locked to `es-PE` for the same reason as invoice amounts: these
 * are soles, read by Peruvian users, whatever language the UI is in.
 */
export function formatMinorAmount({amountMinor, currency}: MinorAmount): string {
    return new Intl.NumberFormat('es-PE', {style: 'currency', currency}).format(amountMinor / 100);
}

/**
 * The MYPE's wallet in one currency — `GET /accounts/{accountId}/wallets/{currency}`.
 *
 * Finance opens it when the MYPE's first auction is fully funded, so a MYPE that has
 * never been paid has none: the store models that as a zero balance, not an error.
 */
export class Wallet {
    readonly accountId: string;
    readonly balance: MinorAmount;
    readonly updatedAt: Date | null;

    constructor({accountId, balance, updatedAt}: {accountId: string; balance: MinorAmount; updatedAt: Date | null}) {
        this.accountId = accountId;
        this.balance = balance;
        this.updatedAt = updatedAt;
    }

    /** The wallet a MYPE has before Finance ever pays it anything. */
    static empty(accountId: string, currency: string): Wallet {
        return new Wallet({accountId, balance: {amountMinor: 0, currency}, updatedAt: null});
    }
}
