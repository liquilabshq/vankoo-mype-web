import {Landmark} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {cn} from '@/lib/utils';
import type {WalletMovement} from '../../domain/model/wallet-movement.entity';
import {formatMinorAmount} from '../../domain/model/wallet.entity';

/**
 * One movement: the design's row with an icon disc, a title, a muted line under it and
 * the signed amount on the right.
 *
 * The sign is written, not only colored: a «+» or «−» carries the direction for
 * someone who cannot tell the green from the red. The second line is only the date —
 * Finance knows the auction behind an advance, not the invoice's number or payer.
 */
export function MovementRow({movement}: {movement: WalletMovement}) {
    const {t, i18n} = useTranslation();
    const date = new Intl.DateTimeFormat(i18n.language, {day: '2-digit', month: 'short', year: 'numeric'}).format(
        movement.occurredAt
    );
    const title = t(`finance.movements.types.${movement.type ?? 'unknown'}`);
    const detail = movement.type === 'ADELANTO' ? t('finance.movements.adelantoDetail', {date}) : date;
    const credit = movement.isCredit();

    return (
        <li className="border-border-subtle flex items-center gap-3 border-b px-4 py-3 last:border-b-0 sm:gap-4">
            <span className="bg-surface-sunken hidden size-10 shrink-0 items-center justify-center rounded-full sm:flex">
                <Landmark className="text-fg-secondary size-5" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-body text-fg truncate font-semibold">{title}</p>
                <p className="text-caption text-fg-secondary truncate">{detail}</p>
            </div>
            <p className={cn('text-body shrink-0 font-semibold tabular-nums', credit ? 'text-positive' : 'text-negative')}>
                {credit ? '+ ' : '− '}
                {formatMinorAmount(movement.amount)}
            </p>
        </li>
    );
}
