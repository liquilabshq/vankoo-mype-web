import {cn} from '@/lib/utils';

interface WordmarkProps {
    className?: string;
}

/**
 * The Vankoo wordmark.
 *
 * Poppins, because that is the logo's typeface — the rest of the product is Plus
 * Jakarta Sans. The green dot is what makes it the logo rather than the word, and it
 * hangs below the baseline the way it does in the Figma component.
 *
 * This is a type-set approximation, and it depends on Poppins having loaded. The
 * design system tracks vectorising the mark as an open item; when that lands, this
 * component becomes the place the SVG goes, and nothing that uses it has to change.
 */
export function Wordmark({className}: WordmarkProps) {
    return (
        <span
            className={cn('font-display text-decor-panel-fg relative inline-block leading-none font-bold tracking-tight', className)}
        >
            vankoo
            <span
                aria-hidden
                className="absolute right-[0.09em] -bottom-[0.06em] size-[0.16em] rounded-full"
                style={{backgroundColor: 'var(--vk-decor-light-primary)'}}
            />
        </span>
    );
}
