import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import type {KycReview} from '../../domain/model/kyc-review.entity';
import {formatDateTime} from './kyc-dates';
import {KycReasonAlert} from './KycReasonAlert';

interface KycRejectedCardProps {
    kyc: KycReview;
    onFix: () => void;
}

/**
 * «No pudimos verificar tu empresa»: the reason, and when it may be sent again.
 *
 * «Corregir y reenviar» stays disabled until the wait profile-service set is over
 * (24 h, then 72 h, then 7 days), and turns on by itself at that moment if the page is
 * still open, rather than after a reload.
 */
export function KycRejectedCard({kyc, onFix}: KycRejectedCardProps) {
    const {t, i18n} = useTranslation();
    const [now, setNow] = useState(() => new Date());
    const canFix = kyc.canSubmitAt(now);

    useEffect(() => {
        if (canFix || !kyc.retryAvailableAt) return;
        const delay = kyc.retryAvailableAt.getTime() - Date.now();
        // setTimeout overflows past ~24.8 days; the longest wait is 7.
        const timer = setTimeout(() => setNow(new Date()), Math.max(0, delay) + 500);
        return () => clearTimeout(timer);
    }, [canFix, kyc.retryAvailableAt]);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <h1 className="text-h1 text-fg font-bold">{t('profile.onboarding.rejected.title')}</h1>
                <p className="text-body text-fg-secondary">{t('profile.onboarding.rejected.subtitle')}</p>
            </div>
            <KycReasonAlert kyc={kyc} />
            <p className="text-caption text-fg-secondary">
                {canFix || !kyc.retryAvailableAt
                    ? t('profile.onboarding.rejected.retryNow')
                    : t('profile.onboarding.rejected.retryAt', {date: formatDateTime(kyc.retryAvailableAt, i18n.language)})}
            </p>
            <Button type="button" size="lg" className="w-full" disabled={!canFix} onClick={onFix}>
                {t('profile.onboarding.rejected.fix')}
            </Button>
        </div>
    );
}
