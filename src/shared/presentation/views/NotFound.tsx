import {Link} from 'react-router';
import {Button} from '@/components/ui/button';

/** Shown for any URL the router does not recognise. */
export function NotFound() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
            <p className="text-overline text-fg-muted uppercase">Error 404</p>
            <h1 className="text-h1 text-fg mt-2 font-bold">Esta página no existe</h1>
            <p className="text-body text-fg-secondary mt-2">
                Puede que el enlace esté mal escrito o que la página se haya movido.
            </p>
            <Button className="mt-6" render={<Link to="/" />}>
                Volver al inicio
            </Button>
        </main>
    );
}
