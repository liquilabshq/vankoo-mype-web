import type {AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import type {WalletMovementPageResource, WalletResource} from './wallet.resource';

// The gateway route to Finance's account-scoped API. A default, so a build without the
// variable still finds it.
const accountsEndpointPath = import.meta.env.VITE_FINANCE_ACCOUNTS_ENDPOINT_PATH ?? '/finance/api/v1/accounts';

/**
 * The API of the finance bounded context, as far as a MYPE uses it: reading its own
 * wallet.
 *
 * Behind the gateway's JWT: the gateway puts the token's subject in `X-User-Id` and
 * Finance answers 403 unless it equals `{accountId}`. So the account id is always the
 * session's user id — the same id Finance credits when the MYPE's auction is funded.
 */
export class FinanceApi extends BaseApi {
    constructor(options: BaseApiOptions = {}) {
        super(options);
    }

    /** The balance in one currency. 404 `wallet-not-found` until the MYPE is first paid. */
    getWallet(accountId: string, currency: string): Promise<AxiosResponse<WalletResource>> {
        return this.http.get(`${accountsEndpointPath}/${accountId}/wallets/${currency}`);
    }

    /** A page of movements, newest first. Never 404: a wallet not yet opened is an empty page. */
    getMovements(
        accountId: string,
        currency: string,
        page: number,
        size: number
    ): Promise<AxiosResponse<WalletMovementPageResource>> {
        return this.http.get(`${accountsEndpointPath}/${accountId}/wallets/${currency}/movements`, {
            params: {page, size}
        });
    }
}
