import type {AxiosResponse} from 'axios';
import {isWalletMovementType, WalletMovement, type WalletMovementPage} from '../domain/model/wallet-movement.entity';
import {Wallet} from '../domain/model/wallet.entity';
import type {WalletMovementPageResource, WalletMovementResource, WalletResource} from './wallet.resource';

/** Anti-corruption layer between Finance's wallet API and this context's model. */
export class WalletAssembler {
    static toWalletFromResponse(response: AxiosResponse<WalletResource>): Wallet {
        const resource = response.data;
        return new Wallet({
            accountId: resource.accountId,
            balance: {amountMinor: resource.balanceMinor, currency: resource.currency},
            updatedAt: resource.updatedAt ? new Date(resource.updatedAt) : null
        });
    }

    static toMovementPageFromResponse(response: AxiosResponse<WalletMovementPageResource>): WalletMovementPage {
        const resource = response.data;
        return {
            items: resource.items.map(WalletAssembler.toMovement),
            page: resource.pageNumber,
            pageSize: resource.pageSize,
            totalElements: resource.totalElements
        };
    }

    private static toMovement(resource: WalletMovementResource): WalletMovement {
        return new WalletMovement({
            type: isWalletMovementType(resource.type) ? resource.type : null,
            direction: resource.direction === 'DEBIT' ? 'DEBIT' : 'CREDIT',
            amount: {amountMinor: resource.amountMinor, currency: resource.currency},
            sourceAuctionId: resource.sourceAuctionId ?? null,
            occurredAt: new Date(resource.occurredAt)
        });
    }
}
