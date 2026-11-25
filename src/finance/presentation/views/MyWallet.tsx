import {FileText} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {useInvestmentStore} from '../../../investment/application/investment.store';
import {invoicingPaths} from '../../../invoicing/presentation/invoicing-paths';
import {EmptyState} from '../../../shared/presentation/components/EmptyState';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';
import {LoadingSkeleton} from '../../../shared/presentation/components/LoadingSkeleton';
import {Pagination} from '../../../shared/presentation/components/Pagination';
import {useFinanceStore, WALLET_CURRENCY} from '../../application/finance.store';
import type {MinorAmount} from '../../domain/model/wallet.entity';
import {MovementRow} from '../components/MovementRow';
import {WalletPanel} from '../components/WalletPanel';

const PAGE_SIZE = 10;

/** Auctions whose money is on its way: out with investors and not funded yet. */
const IN_TRANSIT_STATUSES = new Set(['PUBLISHED', 'FUNDING']);

/**
 * `MK · Billetera` for the MYPE: what is on its way, what is already there, and how it
 * got there.
 *
 * «Disponible para retirar» is the wallet Finance keeps, which it credits with the
 * advance the moment an auction is fully funded. «En camino» is not Finance's: it is
 * the advance of every accepted quote still out with investors, read from Investment's
 * list of the MYPE's auctions, so the figure moves from one side to the other when an
 * auction fills.
 */
export function MyWallet() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const wallet = useFinanceStore(state => state.wallet);
    const movements = useFinanceStore(state => state.movements);
    const loaded = useFinanceStore(state => state.loaded);
    const error = useFinanceStore(state => state.error);
    const loadWallet = useFinanceStore(state => state.loadWallet);
    const auctionsByInvoice = useInvestmentStore(state => state.auctionsByInvoice);
    const loadMyAuctions = useInvestmentStore(state => state.loadMyAuctions);
    const [page, setPage] = useState(1);

    useEffect(() => {
        void loadWallet(page - 1, PAGE_SIZE);
    }, [loadWallet, page]);

    useEffect(() => {
        void loadMyAuctions();
    }, [loadMyAuctions]);

    const inTransit = useMemo(() => {
        const advances = [...auctionsByInvoice.values()]
            .filter(auction => IN_TRANSIT_STATUSES.has(auction.status) && auction.acceptedQuote)
            .map(auction => auction.acceptedQuote!.mypeAdvance)
            .filter(advance => advance.currency === WALLET_CURRENCY);
        const amount: MinorAmount = {
            amountMinor: advances.reduce((sum, advance) => sum + Math.round(advance.value * 100), 0),
            currency: WALLET_CURRENCY
        };
        return {amount, count: advances.length};
    }, [auctionsByInvoice]);

    const total = movements?.totalElements ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="flex w-full flex-col gap-4 sm:gap-8">
            <h1 className="text-h1 text-fg font-bold">{t('finance.title')}</h1>

            {Boolean(error) && (
                <InlineAlert variant="error" title={t('finance.error.title')} message={t('finance.error.message')} />
            )}

            {!loaded ? (
                <LoadingSkeleton label={t('finance.loading')}>
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-72 w-full rounded-xl" />
                </LoadingSkeleton>
            ) : (
                <>
                    <WalletPanel
                        inTransit={inTransit.amount}
                        inTransitCount={inTransit.count}
                        available={wallet?.balance ?? {amountMinor: 0, currency: WALLET_CURRENCY}}
                    />

                    {movements && movements.items.length > 0 ? (
                        <section className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-4 rounded-xl border p-4 sm:p-6">
                            <h2 className="text-h3 text-fg font-semibold">{t('finance.movements.title')}</h2>
                            <ul className="border-border-subtle overflow-hidden rounded-lg border">
                                {movements.items.map((movement, index) => (
                                    <MovementRow key={`${movement.occurredAt.toISOString()}-${index}`} movement={movement} />
                                ))}
                            </ul>
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                summary={t('finance.movements.summary', {shown: movements.items.length, total})}
                            />
                        </section>
                    ) : (
                        !error && (
                            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 rounded-xl border">
                                <EmptyState
                                    icon={FileText}
                                    title={t('finance.empty.title')}
                                    description={t('finance.empty.description')}
                                    action={
                                        <Button
                                            type="button"
                                            className="mt-4"
                                            onClick={() => navigate(invoicingPaths.myInvoices())}
                                        >
                                            {t('finance.empty.action')}
                                        </Button>
                                    }
                                />
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
