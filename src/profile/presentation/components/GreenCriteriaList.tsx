import {CircleCheck, CircleX} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {isGreenCriterionCode, type GreenCriterion} from '../../domain/model/sustainability-certification.entity';

/**
 * Every check of the green rules and what it found.
 *
 * The name of each check is translated by its code; the detail comes in Spanish from
 * the risk service, which is the only one that knows what it found. A code this app
 * does not know is still shown, by its code, rather than dropped.
 */
export function GreenCriteriaList({criteria}: {criteria: readonly GreenCriterion[]}) {
    const {t} = useTranslation();
    return (
        <ul className="flex flex-col gap-3">
            {criteria.map(criterion => (
                <li key={criterion.code} className="flex items-start gap-3">
                    {criterion.passed ? (
                        <CircleCheck className="text-green-finance mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    ) : (
                        <CircleX className="text-status-rejected mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    )}
                    <div className="flex min-w-0 flex-col">
                        <span className="text-body text-fg font-semibold">
                            {isGreenCriterionCode(criterion.code)
                                ? t(`profile.certificate.criteria.${criterion.code}`)
                                : criterion.code}
                            <span className="sr-only">
                                {' '}
                                {criterion.passed ? t('profile.certificate.passed') : t('profile.certificate.failed')}
                            </span>
                        </span>
                        <span className="text-caption text-fg-muted">{criterion.detail}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
