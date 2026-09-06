import type {ReactNode} from 'react';
import {BrandPanel} from './BrandPanel';
import {DotField} from './DotField';

interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * The shell every authentication screen sits in.
 *
 * Two compositions, one component, because that is what the mockups agreed on: a
 * split on desktop with the brand panel holding the left 39%, and on narrow screens
 * the same panel collapsed to a band across the top with the form on clean surface
 * below.
 *
 * The column is a flex container so the legal row lands at the foot of the viewport
 * rather than trailing the card. That placement is the whole point of the row: it
 * fills the lower third with something useful instead of more ornament, and a footer
 * that floats just under the form does neither.
 *
 * The dot field is a sibling of the card, not an ancestor, so nothing decorative ever
 * ends up behind the text.
 */
export function AuthLayout({children}: AuthLayoutProps) {
    return (
        // A proportion, not a fixed 560px: the mockup is drawn at 1440, where the panel
        // takes 39% of the width. Pinning the pixel value instead of the ratio leaves it
        // a thin stripe on a 27" screen. The floor stops it squeezing the brand on a
        // small laptop.
        <div className="bg-surface flex min-h-dvh flex-col lg:grid lg:grid-cols-[minmax(30rem,39%)_1fr]">
            <BrandPanel />

            <main className="relative flex flex-1 flex-col px-4 py-8 lg:px-16">
                <DotField />

                <div className="relative flex flex-1 items-start justify-center lg:items-center">
                    {/*
                      The card is a desktop composition only. On a 390px screen a card
                      with margins either side wastes the width the form needs, so the
                      mockups drop it there and let the surface itself be the card —
                      which is also why the dot field only shows around it on wide
                      screens.
                    */}
                    <div className="lg:bg-surface-raised lg:shadow-elevation-2 w-full max-w-110 lg:rounded-xl lg:p-8">
                        {children}
                    </div>
                </div>

                <footer className="text-caption text-fg-muted relative mt-8 flex items-center justify-center gap-2">
                    <a className="hover:text-fg-secondary" href="#">Términos</a>
                    <span aria-hidden>·</span>
                    <a className="hover:text-fg-secondary" href="#">Privacidad</a>
                    <span aria-hidden>·</span>
                    <a className="text-fg-link hover:underline" href="#">¿Necesitas ayuda?</a>
                </footer>
            </main>
        </div>
    );
}
