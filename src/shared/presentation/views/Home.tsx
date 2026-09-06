import {useIamStore} from '../../../iam/application/iam.store';

/**
 * Where a signed-in user lands.
 *
 * A stand-in, and knowingly so: the MYPE dashboard has not been designed yet, and the
 * screens that would fill it — invoices, wallet, profile — have no frontend either.
 * It exists so signing in leads somewhere real, and so the session survives a reload
 * visibly. Replace it with the dashboard; nothing else depends on what is inside.
 */
export function Home() {
    const session = useIamStore(state => state.session);

    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <h1 className="text-h1 text-fg font-bold">Sesión iniciada</h1>
            <p className="text-body text-fg-secondary mt-2">
                Entraste como <span className="text-fg font-semibold">{session?.user.email}</span>.
            </p>

            <dl className="border-subtle mt-8 grid gap-4 rounded-xl border p-6 sm:grid-cols-2">
                <div>
                    <dt className="text-overline text-fg-muted uppercase">Roles</dt>
                    <dd className="text-body text-fg mt-1">{session?.user.roles.join(', ') || '—'}</dd>
                </div>
                <div>
                    <dt className="text-overline text-fg-muted uppercase">La sesión caduca</dt>
                    <dd className="text-body text-fg mt-1">
                        {session?.expiresAt.toLocaleString('es-PE') ?? '—'}
                    </dd>
                </div>
            </dl>

            <p className="text-caption text-fg-muted mt-6">
                Pantalla provisional. El panel de la MYPE llega cuando se diseñen facturas, perfil y billetera.
            </p>
        </main>
    );
}
