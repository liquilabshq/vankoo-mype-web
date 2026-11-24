import {useTranslation} from 'react-i18next';
import {formatMinorAmount, type MinorAmount} from '../../domain/model/wallet.entity';

interface WalletPanelProps {
    /** Advances of the invoices out with investors, not yet funded. */
    inTransit: MinorAmount;
    inTransitCount: number;
    /** The wallet's balance in Finance. */
    available: MinorAmount;
}

/**
 * The navy brand panel of `MK · Billetera`: «En camino» beside «Disponible para
 * retirar» from `md` up, stacked on a phone, as the two frames draw it.
 *
 * Navy in both themes, like `SettlementPanel`, so its text uses the `decor-panel-fg`
 * tokens rather than the app's, which would go unreadable once the surfaces invert.
 *
 * Without the mockup's «Retirar»: Finance has no withdrawal yet, and a button that
 * does nothing would promise what the platform cannot do.
 */
export function WalletPanel({inTransit, inTransitCount, available}: WalletPanelProps) {
    const {t} = useTranslation();

    return (
        <section
            aria-label={t('finance.title')}
            className="bg-decor-panel-from relative flex flex-col gap-4 overflow-hidden rounded-xl p-4 sm:p-6 md:flex-row md:items-center md:gap-8"
        >
            <div
                className="bg-decor-light pointer-events-none absolute right-0 bottom-0 size-[420px] translate-x-1/4 translate-y-1/2 rounded-full opacity-15 blur-3xl"
                aria-hidden="true"
            />

            <div className="relative flex flex-col gap-2">
                <p className="text-caption text-decor-panel-fg/80">{t('finance.panel.inTransit')}</p>
                <p className="text-h1 text-decor-panel-fg font-bold tabular-nums">{formatMinorAmount(inTransit)}</p>
                <p className="text-caption text-decor-panel-fg/80">
                    {inTransitCount > 0
                        ? t('finance.panel.inTransitCount', {count: inTransitCount})
                        : t('finance.panel.inTransitNone')}
                </p>
            </div>

            <div className="bg-decor-panel-fg/25 relative h-px w-full md:h-16 md:w-px" aria-hidden="true" />

            <div className="relative flex flex-col gap-2">
                <p className="text-caption text-decor-panel-fg/80">{t('finance.panel.available')}</p>
                <p className="text-h2 md:text-h1 text-decor-panel-fg font-bold tabular-nums">
                    {formatMinorAmount(available)}
                </p>
            </div>
        </section>
    );
}
