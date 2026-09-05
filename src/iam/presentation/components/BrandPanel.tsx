import {Wordmark} from '../../../shared/presentation/components/Wordmark';

/**
 * The navy brand surface: a radial gradient plus two soft green lights.
 *
 * It is a fixed-brand surface — navy in light mode and in dark mode alike, the same
 * way the Logo does not react to the theme. That is why its text uses
 * `decor/panel-fg` and not `text/inverse`: the latter flips with the theme and would
 * resolve to navy on navy in dark, at 1.92:1.
 *
 * The lights sit deliberately away from the wordmark, at the bottom-left and off the
 * top-right corner. Contrast must not depend on where a glow happens to fall.
 * Their ceiling is written down: under 20% opacity, with a wide blur — any stronger
 * and the decorative green starts competing with the primary button, which is the
 * one place green is supposed to mean "press here".
 */
export function BrandPanel() {
    return (
        <aside
            className="relative isolate flex h-50 flex-col justify-center overflow-hidden px-4 lg:h-auto lg:px-16"
            style={{
                backgroundImage:
                    'radial-gradient(120% 90% at 50% 50%, var(--vk-decor-panel-from), var(--vk-decor-panel-to))'
            }}
        >
            <div
                aria-hidden
                className="absolute -bottom-40 -left-40 size-155 rounded-full opacity-16 blur-[120px]"
                style={{backgroundColor: 'var(--vk-decor-light-primary)'}}
            />
            <div
                aria-hidden
                className="absolute -top-30 -right-20 size-105 rounded-full opacity-10 blur-[100px]"
                style={{backgroundColor: 'var(--vk-decor-light-secondary)'}}
            />

            <div className="relative flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
                <Wordmark className="text-4xl lg:text-6xl" />
                <p className="text-h2 text-decor-panel-fg font-bold">Tu liquidez, hoy.</p>
            </div>
        </aside>
    );
}
