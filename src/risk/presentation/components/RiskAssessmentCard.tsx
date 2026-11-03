import {CircleCheck, CircleMinus, CircleX} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {cn} from '@/lib/utils';
import {RiskAssessment, type RiskFactor, type RiskFactorEffect} from '../../domain/model/risk-assessment.entity';

/** The id the rail's «Validando con SUNAT» step scrolls to. */
export const RISK_ASSESSMENT_CARD_ID = 'evaluacion-de-riesgo';

const EFFECT_ICON = {positive: CircleCheck, neutral: CircleMinus, negative: CircleX};
const EFFECT_CLASS: Record<RiskFactorEffect, string> = {
    positive: 'text-success',
    neutral: 'text-fg-muted',
    negative: 'text-error'
};

const URL_PATTERN = /(https?:\/\/[^\s)]+)/;

/**
 * A factor's sentence, with the source of a news finding as a link.
 *
 * The risk service writes the URL inside the sentence, in brackets; it is pulled out
 * so the MYPE can open what was found instead of reading an address.
 */
function FactorDetail({detail}: {detail: string}) {
    const {t} = useTranslation();
    const [before, url, after] = detail.split(URL_PATTERN);
    if (!url) return <>{detail}</>;
    return (
        <>
            {before.replace(/\($/, '').trimEnd()}{' '}
            <a href={url} target="_blank" rel="noreferrer" className="text-fg font-semibold underline underline-offset-2">
                {t('risk.card.source')}
            </a>
            {after.replace(/^\)/, '')}
        </>
    );
}

function formatPoints(points: number): string {
    if (points > 0) return `+${points}`;
    if (points < 0) return `−${Math.abs(points)}`;
    return '0';
}

function FactorRow({factor, excludes}: {factor: RiskFactor; excludes: boolean}) {
    const {t} = useTranslation();
    // The reason an invoice was refused carries no points: it is not weighed, it decides.
    const effect = excludes ? 'negative' : RiskAssessment.effectOf(factor);
    const Icon = EFFECT_ICON[effect];
    // The risk service says «(simulado)» when a source is stood in for; it gets a tag
    // too, so nobody in a demo takes it for a real bureau's answer.
    const simulated = /simulad/i.test(factor.detail);
    return (
        <li className="border-border-subtle flex items-start gap-3 border-b py-3 last:border-b-0">
            <Icon className={cn('mt-0.5 size-5 shrink-0', EFFECT_CLASS[effect])} aria-hidden="true" />
            <p className="text-body text-fg min-w-0 flex-1">
                <FactorDetail detail={factor.detail} />
                {simulated && (
                    <span className="bg-warning-bg text-warning text-caption ml-2 inline-block rounded-full px-2 font-semibold">
                        {t('risk.card.simulated')}
                    </span>
                )}
            </p>
            <span
                className={cn('text-body shrink-0 font-semibold tabular-nums', EFFECT_CLASS[effect])}
                aria-label={excludes ? undefined : t('risk.card.pointsLabel', {points: factor.points})}
            >
                {excludes ? t('risk.card.excludes') : formatPoints(factor.points)}
            </span>
        </li>
    );
}

/**
 * «Evaluación de riesgo»: what the risk service found about the payer, and what it
 * made of it.
 *
 * The grade and its score first, then every factor with its points, and a starting
 * value so the sum closes on the score. A rejected invoice shows the reason first and
 * what was found after it. A tag marks anything the service simulated.
 */
export function RiskAssessmentCard({assessment}: {assessment: RiskAssessment}) {
    const {t, i18n} = useTranslation();
    const startingPoints = assessment.startingPoints();
    const assessedOn = new Intl.DateTimeFormat(i18n.language, {dateStyle: 'medium', timeStyle: 'short'}).format(
        assessment.assessedAt
    );

    return (
        <section
            id={RISK_ASSESSMENT_CARD_ID}
            className="bg-surface-raised border-border-subtle shadow-elevation-1 flex scroll-mt-6 flex-col gap-4 rounded-xl border p-6"
        >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-body text-fg font-semibold">{t('risk.card.title')}</h2>
                <p className="text-caption text-fg-muted">{t('risk.card.assessedOn', {date: assessedOn})}</p>
            </div>

            {assessment.eligible && assessment.riskGrade ? (
                <div className="flex items-center gap-4">
                    <span className="bg-fg text-surface-raised flex size-14 shrink-0 items-center justify-center rounded-xl text-3xl font-bold">
                        {assessment.riskGrade}
                    </span>
                    <div className="flex flex-col gap-1">
                        <p className="text-body text-fg font-semibold">
                            {t('risk.card.gradeLine', {grade: assessment.riskGrade, score: assessment.score})}
                        </p>
                        <p className="text-caption text-fg-muted">{t('risk.card.scale')}</p>
                    </div>
                </div>
            ) : (
                <p className="text-body text-error font-semibold">{t('risk.card.notEligible')}</p>
            )}

            {/* A refusal stops the review at the first payer check that fails, so it does
                not claim the sanction lists or the news were read. */}
            <p className="text-body text-fg-secondary">
                {t(assessment.eligible ? 'risk.card.intro' : 'risk.card.introRejected', {
                    payer: assessment.payerName,
                    ruc: assessment.payerRuc
                })}
            </p>

            <ul className="flex flex-col">
                {startingPoints !== null && startingPoints !== 0 && (
                    <li className="border-border-subtle flex items-start gap-3 border-b py-3">
                        <CircleMinus className="text-fg-muted mt-0.5 size-5 shrink-0" aria-hidden="true" />
                        <p className="text-body text-fg min-w-0 flex-1">{t('risk.card.startingPoints')}</p>
                        <span className="text-body text-fg-muted shrink-0 font-semibold tabular-nums">{startingPoints}</span>
                    </li>
                )}
                {assessment.factors.map(factor => (
                    <FactorRow
                        key={factor.code}
                        factor={factor}
                        excludes={!assessment.eligible && factor.code === assessment.rejectionCode}
                    />
                ))}
                {!assessment.eligible &&
                    assessment.rejectionReason &&
                    !assessment.factors.some(factor => factor.code === assessment.rejectionCode) && (
                        <FactorRow
                            factor={{code: assessment.rejectionCode ?? 'REJECTED', points: 0, detail: assessment.rejectionReason}}
                            excludes
                        />
                    )}
            </ul>

            {assessment.score !== null && (
                <div className="border-border-default flex items-center justify-between border-t pt-3">
                    <p className="text-body text-fg font-semibold">{t('risk.card.total')}</p>
                    <p className="text-body text-fg font-semibold tabular-nums">{assessment.score}</p>
                </div>
            )}

            {assessment.provisional && <p className="text-caption text-warning">{t('risk.card.provisional')}</p>}
        </section>
    );
}
