import {useTranslation} from 'react-i18next';
import type {InvoiceSettlement} from '../../domain/model/invoice-detail.entity';
import {formatInvoiceAmount, type InvoiceAmount} from '../../domain/model/invoice.entity';

interface SettlementPanelProps {
    totalAmount: InvoiceAmount;
    settlement: InvoiceSettlement | null;
}

/**
 * The "cascada" — the fixed navy brand surface that says what the MYPE gets.
 *
 * Two states: once `settlement` exists (SUNAT has validated the invoice and Vankoo has
 * priced an auction for it), it shows the full discount/fee breakdown down to what
 * lands in the wallet; before that, there is nothing to price yet, so it shows only
 * the invoice's own amount and says why the rest is still unknown.
 *
 * The panel is navy in both themes — see the `Logo`'s own note on fixed-brand
 * surfaces — so its text uses the `decor-panel-fg` tokens rather than the app's usual
 * ones, which would go unreadable in dark mode once the surfaces invert.
 */
export function SettlementPanel({totalAmount, settlement}: SettlementPanelProps) {
    const {t} = useTranslation();

    return (
        <div className="bg-decor-panel-from relative flex w-full max-w-[380px] shrink-0 flex-col gap-3 overflow-hidden rounded-xl p-6">
            <div
                className="bg-decor-light pointer-events-none absolute top-1/3 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                aria-hidden="true"
            />

            {settlement ? (
                <>
                    <div className="relative flex items-center justify-between gap-4">
                        <p className="text-caption text-decor-panel-fg/70">{t('invoicing.detail.settlement.grossAmount')}</p>
                        <p className="text-body text-decor-panel-fg font-semibold">{formatInvoiceAmount(totalAmount)}</p>
                    </div>
                    <div className="relative flex items-center justify-between gap-4">
                        <p className="text-caption text-decor-panel-fg/70">
                            {t('invoicing.detail.settlement.discount', {percentage: settlement.discountPercentage})}
                        </p>
                        <p className="text-body text-decor-panel-fg font-semibold">
                            − {formatInvoiceAmount(settlement.discountAmount)}
                        </p>
                    </div>
                    <div className="relative flex items-center justify-between gap-4">
                        <p className="text-caption text-decor-panel-fg/70">{t('invoicing.detail.settlement.net')}</p>
                        <p className="text-body text-decor-panel-fg font-semibold">{formatInvoiceAmount(settlement.netAmount)}</p>
                    </div>
                    <div className="relative flex items-center justify-between gap-4">
                        <p className="text-caption text-decor-panel-fg/70">
                            {t('invoicing.detail.settlement.fee', {percentage: settlement.feePercentage})}
                        </p>
                        <p className="text-body text-decor-panel-fg font-semibold">− {formatInvoiceAmount(settlement.feeAmount)}</p>
                    </div>
                    <div className="bg-decor-panel-fg/25 relative h-px w-full" />
                    <div className="relative flex flex-col gap-1">
                        <p className="text-caption text-decor-panel-fg/70">{t('invoicing.detail.settlement.receivable')}</p>
                        <p className="text-h1 text-positive-on-inverse font-bold">{formatInvoiceAmount(settlement.receivableAmount)}</p>
                    </div>
                    <p className="text-caption text-decor-panel-fg/70 relative">{t('invoicing.detail.settlement.footnote')}</p>
                </>
            ) : (
                <>
                    <p className="text-caption text-decor-panel-fg/70 relative">{t('invoicing.detail.settlement.grossAmount')}</p>
                    <p className="text-h1 text-decor-panel-fg relative font-bold">{formatInvoiceAmount(totalAmount)}</p>
                    <p className="text-caption text-decor-panel-fg/70 relative">{t('invoicing.detail.settlement.pendingFootnote')}</p>
                </>
            )}
        </div>
    );
}
