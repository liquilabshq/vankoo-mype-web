import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Bar, BarChart, CartesianGrid, LabelList, Rectangle, XAxis, YAxis, type BarShapeProps} from 'recharts';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig
} from '@/components/ui/chart';
import {HOME_BUCKETS, type HomeBucket, type HomeMonth} from './home-overview';

/**
 * One color per bucket, light and dark picked apart rather than flipped, and checked
 * with the dataviz palette validator against each mode's card surface (`surface/raised`):
 * lightness band, chroma, color-blind separation and contrast.
 *
 * The hues follow the meaning `status/*` gives them — green positive, navy a milestone,
 * indigo the system at work, red a dead end — but come from the primitive ramps: the
 * `status/*` foregrounds are tuned to be text on a tint, and as fills two of them read
 * nearly the same blue. In light, the navy bar stays just under 3:1 against the card,
 * which is why the chart carries a legend, a total over every bar, a tooltip and a table
 * for screen readers, never color alone.
 */
const BUCKET_COLORS: Record<HomeBucket, {light: string; dark: string}> = {
    funded: {light: 'var(--vk-green-600)', dark: 'var(--vk-green-600)'},
    inAuction: {light: 'var(--vk-navy-500)', dark: 'var(--vk-navy-600)'},
    inReview: {light: 'var(--vk-indigo-700)', dark: 'var(--vk-indigo-400)'},
    notEligible: {light: 'var(--vk-red-600)', dark: 'var(--vk-red-500)'}
};

/** Labels keyed by bucket, as the KPI tiles word them. */
const LABEL_KEYS = {
    funded: 'home.kpis.funded',
    inAuction: 'home.kpis.inAuction',
    inReview: 'home.kpis.inReview',
    notEligible: 'home.kpis.notEligible'
} as const satisfies Record<HomeBucket, string>;

interface ChartRow extends Record<HomeBucket, number> {
    key: string;
    month: string;
    longMonth: string;
    total: number;
    /** The highest non-empty bucket of the stack: the only segment whose top is rounded. */
    top: HomeBucket | null;
}

interface InvoicesByMonthChartProps {
    months: readonly HomeMonth[];
}

/**
 * Invoices uploaded per month, stacked by where each one stands today.
 *
 * Answers both questions the professor asked of the home at once — how many by status,
 * and how they come in over time — in one chart with one axis.
 */
export function InvoicesByMonthChart({months}: InvoicesByMonthChartProps) {
    const {t, i18n} = useTranslation();

    const config = useMemo<ChartConfig>(
        () =>
            Object.fromEntries(
                HOME_BUCKETS.map(bucket => [bucket, {label: t(LABEL_KEYS[bucket]), theme: BUCKET_COLORS[bucket]}])
            ),
        [t]
    );

    const rows = useMemo<ChartRow[]>(() => {
        const short = new Intl.DateTimeFormat(i18n.language, {month: 'short'});
        const long = new Intl.DateTimeFormat(i18n.language, {month: 'long', year: 'numeric'});
        return months.map(month => ({
            key: month.key,
            month: short.format(month.start).replace('.', ''),
            longMonth: long.format(month.start),
            total: month.total,
            top: [...HOME_BUCKETS].reverse().find(bucket => month.counts[bucket] > 0) ?? null,
            ...month.counts
        }));
    }, [months, i18n.language]);

    const max = Math.max(0, ...rows.map(row => row.total));

    return (
        <figure className="flex min-w-0 flex-col gap-4">
            <ChartContainer config={config} className="aspect-auto h-[240px] w-full sm:h-[280px]" aria-hidden="true">
                <BarChart data={rows} margin={{top: 24, right: 4, left: -16, bottom: 0}} barCategoryGap="28%" accessibilityLayer>
                    <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{fill: 'var(--color-fg-secondary)'}}
                    />
                    <YAxis
                        allowDecimals={false}
                        domain={[0, Math.max(4, max)]}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        tick={{fill: 'var(--color-fg-secondary)'}}
                    />
                    <ChartTooltip
                        cursor={{fill: 'var(--color-accent)'}}
                        content={
                            <ChartTooltipContent
                                labelFormatter={(_, payload) => (payload?.[0]?.payload as ChartRow | undefined)?.longMonth}
                            />
                        }
                    />
                    <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1 *:whitespace-nowrap" />} />
                    {HOME_BUCKETS.map((bucket, index) => (
                        <Bar
                            key={bucket}
                            dataKey={bucket}
                            stackId="month"
                            fill={`var(--color-${bucket})`}
                            stroke="var(--color-surface-raised)"
                            strokeWidth={2}
                            isAnimationActive={false}
                            shape={(props: BarShapeProps) => (
                                <Rectangle
                                    {...props}
                                    radius={(props.payload as ChartRow).top === bucket ? [4, 4, 0, 0] : 0}
                                />
                            )}
                        >
                            {index === HOME_BUCKETS.length - 1 && (
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    offset={8}
                                    className="fill-fg font-semibold tabular-nums"
                                    formatter={(value: unknown) => (value ? String(value) : '')}
                                />
                            )}
                        </Bar>
                    ))}
                </BarChart>
            </ChartContainer>

            {/* The chart is hidden from screen readers; this is what they get instead. */}
            <table className="sr-only">
                <caption>{t('home.chart.title')}</caption>
                <thead>
                    <tr>
                        <th scope="col">{t('home.chart.month')}</th>
                        {HOME_BUCKETS.map(bucket => (
                            <th key={bucket} scope="col">
                                {t(LABEL_KEYS[bucket])}
                            </th>
                        ))}
                        <th scope="col">{t('home.chart.total')}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <tr key={row.key}>
                            <th scope="row">{row.longMonth}</th>
                            {HOME_BUCKETS.map(bucket => (
                                <td key={bucket}>{row[bucket]}</td>
                            ))}
                            <td>{row.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
