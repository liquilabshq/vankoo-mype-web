import {useTranslation} from 'react-i18next';
import {Wordmark} from '../../../shared/presentation/components/Wordmark';

/**
 * The navy brand surface: a radial gradient plus two soft green lights.
 *
 * It is a fixed-brand surface — navy in light mode and in dark mode alike, the same
 * way the Logo does not react to the theme. That is why its text uses
 * `decor/panel-fg` and not `text/inverse`: the latter flips with the theme and would
 * resolve to navy on navy in dark, at 1.92:1.
 *
 * On desktop every number is the `Decor/BrandPanel` frame's, read from its export
 * rather than its panel: the gradient's radii are 43.5% of the panel, which is what
 * darkens the corners, and the blur is 120px and 100px. Figma shows a layer blur of
 * twice that, but CSS `blur()` takes the standard deviation, which is what the export
 * carries; at Figma's figure the lights spread until they vanish. Their opacity
 * ceiling — under 20% — exists so the decorative green never competes with the
 * primary button, which is the one place green is supposed to mean "press here".
 *
 * The lights sit deliberately away from the wordmark, at the bottom-left and off the
 * top-right corner. Contrast must not depend on where a glow happens to fall.
 *
 * They shrink below `lg`, as does the gradient's spread, and that is not a tweak: the band is 200px tall there, so a
 * 620px light covers all of it and the navy reads green. The mockup's mobile band is a
 * crop of this panel from a region between the two lights, and these sizes are what
 * makes the browser land in the same place.
 */
export function BrandPanel() {
    const {t} = useTranslation();

    return (
        <aside
            className="relative isolate flex h-50 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(120%_90%_at_50%_50%,var(--vk-decor-panel-from),var(--vk-decor-panel-to))] px-4 text-center lg:h-auto lg:bg-[radial-gradient(43.5%_43.5%_at_50.4%_50.4%,var(--vk-decor-panel-from),var(--vk-decor-panel-to))] lg:px-16"
        >
            <div
                aria-hidden
                className="absolute -bottom-20 -left-20 size-70 rounded-full opacity-8 blur-[110px] lg:-bottom-29 lg:-left-57.5 lg:size-155 lg:opacity-16 lg:blur-[120px]"
                style={{backgroundColor: 'var(--vk-decor-light-primary)'}}
            />
            <div
                aria-hidden
                className="absolute -top-16 -right-10 size-50 rounded-full opacity-5 blur-[95px] lg:-top-30 lg:-right-47.5 lg:size-105 lg:opacity-10 lg:blur-[100px]"
                style={{backgroundColor: 'var(--vk-decor-light-secondary)'}}
            />

            <div className="text-decor-panel-fg relative flex flex-col items-center gap-3">
                <Wordmark className="w-45 lg:w-60" />
                <p className="text-h2 font-bold">{t('common.tagline')}</p>
            </div>
        </aside>
    );
}
