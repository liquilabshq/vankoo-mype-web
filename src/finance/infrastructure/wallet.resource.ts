/** `WalletResource` — Finance's balance response. */
export interface WalletResource {
    walletId: string;
    accountId: string;
    currency: string;
    balanceMinor: number;
    createdAt: string;
    updatedAt: string;
}

/** `WalletMovementResource` — one movement. */
export interface WalletMovementResource {
    type: string;
    direction: string;
    amountMinor: number;
    currency: string;
    sourceDepositId: string | null;
    debitId: string | null;
    sourceAuctionId?: string | null;
    occurredAt: string;
}

/** `WalletMovementPageResource`. */
export interface WalletMovementPageResource {
    items: WalletMovementResource[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
}
