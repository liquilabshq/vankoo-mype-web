/**
 * The background dot grid: the logo's dot, tiled.
 *
 * Drawn as a repeating radial gradient rather than hundreds of elements, so it costs
 * one paint and no DOM. It goes only on light surfaces — never on the brand panel,
 * which already has its gradient and its lights — and never behind text, which is why
 * it is a sibling of the content rather than its parent.
 *
 * 26px grid, 2px dot, `decor/dot` at half strength. Those three numbers are the ones
 * written on the Expression page of the design system.
 *
 * It is desktop-only, and that is the same rule again rather than an exception to it:
 * below `lg` the form sits directly on this surface instead of on a card, so the
 * texture would end up behind the labels. The mockups drop it there for that reason.
 */
export function DotField() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden opacity-50 lg:block"
            style={{
                backgroundImage: 'radial-gradient(circle, var(--vk-decor-dot) 1px, transparent 1px)',
                backgroundSize: '26px 26px'
            }}
        />
    );
}
