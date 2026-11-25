import {isAxiosError} from 'axios';
import {create} from 'zustand';
import {useIamStore} from '../../iam/application/iam.store';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import type {WalletMovementPage} from '../domain/model/wallet-movement.entity';
import {Wallet} from '../domain/model/wallet.entity';
import {FinanceApi} from '../infrastructure/finance-api';
import {WalletAssembler} from '../infrastructure/wallet.assembler';

const financeApi = new FinanceApi({requestInterceptors: [iamInterceptor]});

/** Soles only: Investment can fund USD invoices, but no MYPE has one yet and the mockups show one panel. */
export const WALLET_CURRENCY = 'PEN';

/** State and use cases of the finance bounded context. */
export interface FinanceState {
    wallet: Wallet | null;
    movements: WalletMovementPage | null;
    loading: boolean;
    /** Whether the first read has answered, so the screen can tell "empty" from "not yet". */
    loaded: boolean;
    /** The failure of the last read, kept as the error rather than a sentence (see the error contract). */
    error: unknown;
    /**
     * Reads the balance and one page of movements of the signed-in MYPE.
     *
     * A wallet Finance has not opened yet (404) is a zero balance, not an error: it is
     * simply a MYPE whose invoices have not been funded yet.
     */
    loadWallet: (page: number, pageSize: number) => Promise<void>;
}

/** The application layer of the finance context: the only thing that talks to `FinanceApi`. */
export const useFinanceStore = create<FinanceState>()(set => ({
    wallet: null,
    movements: null,
    loading: false,
    loaded: false,
    error: null,

    loadWallet: async (page, pageSize) => {
        const accountId = useIamStore.getState().session?.user.id;
        if (!accountId) return;
        set({loading: true, error: null});
        try {
            const [wallet, movements] = await Promise.all([
                readWallet(accountId),
                financeApi
                    .getMovements(accountId, WALLET_CURRENCY, page, pageSize)
                    .then(WalletAssembler.toMovementPageFromResponse)
            ]);
            set({wallet, movements, loading: false, loaded: true});
        } catch (error) {
            set({error, loading: false, loaded: true});
        }
    }
}));

async function readWallet(accountId: string): Promise<Wallet> {
    try {
        return WalletAssembler.toWalletFromResponse(await financeApi.getWallet(accountId, WALLET_CURRENCY));
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
            return Wallet.empty(accountId, WALLET_CURRENCY);
        }
        throw error;
    }
}
