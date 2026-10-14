import {useTranslation} from 'react-i18next';
import type es from '@/locales/es.json';
import {InlineAlert} from '../../../shared/presentation/components/InlineAlert';
import type {Auction} from '../../domain/model/auction.entity';

/** Every key under `investment.rejection.reasons`, derived from the locale file rather than repeated. */
type RejectionReasonKey = `investment.rejection.reasons.${keyof typeof es.investment.rejection.reasons & string}`;

interface AuctionRejectionAlertProps {
    /** The invoice's auction. Nothing is rendered unless the risk evaluation rejected it. */
    auction: Auction | null;
}

/**
 * Says why an invoice will not be funded, when the risk evaluation rejected its auction.
 *
 * The risk service sends a code and a sentence. The code is the translation key, so
 * the reason follows the language the MYPE reads in; a code this build has no copy
 * for falls back to the risk service's own sentence, and that to the generic one.
 * The key comes from the server, so — as in `IamErrorAlert` — `i18n.exists` checks
 * it at run time before the assertion.
 */
export function AuctionRejectionAlert({auction}: AuctionRejectionAlertProps) {
    const {t, i18n} = useTranslation();
    if (!auction?.isRejected()) return null;

    const key = `investment.rejection.reasons.${auction.rejectionReasonCode ?? ''}`;
    const message = i18n.exists(key)
        ? t(key as RejectionReasonKey)
        : (auction.rejectionReason ?? t('invoicing.detail.notEligibleAlert.fallbackMessage'));

    return <InlineAlert variant="error" title={t('invoicing.detail.notEligibleAlert.title')} message={message} />;
}
