/**
 * The two soft green lights behind the form column, the mockup's `luz · principal`
 * and `luz · secundaria`.
 *
 * Measured off the 1440 frame, relative to the column: the main one is 620px, half
 * above the top edge and spilling past the right; the second is 420px, low on the
 * left. Opacity 16% and 10%. The blur is 120px and 100px because that is the standard
 * deviation the frame exports — Figma's layer blur is twice that number, and CSS
 * `blur()` takes the deviation, not Figma's figure.
 *
 * Desktop only, like the dot field and for the same reason: below `lg` the form has
 * no card, and a glow would sit right behind the labels.
 */
export function FormLights() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
            <div
                className="absolute -top-55 -right-32 size-155 rounded-full opacity-16 blur-[120px]"
                style={{backgroundColor: 'var(--vk-decor-light-primary)'}}
            />
            <div
                className="absolute top-175 left-10 size-105 rounded-full opacity-10 blur-[100px]"
                style={{backgroundColor: 'var(--vk-decor-light-secondary)'}}
            />
        </div>
    );
}
