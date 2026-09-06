import {CircleCheck} from 'lucide-react';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {AuthLayout} from '../components/AuthLayout';
import {iamPaths} from '../iam-paths';

/**
 * Routed view confirming that a reset link is on its way.
 *
 * Nothing routes here yet — the step before it is disabled until iam-service grows a
 * recovery endpoint. It exists because the screen is designed and reviewed, and it is
 * the piece that will need no work when the backend catches up.
 *
 * The wording deliberately does not confirm whether the account exists. Saying so
 * would turn this form into a way of asking the service which addresses are
 * registered.
 */
export function RecoverPasswordSent() {
    const navigate = useNavigate();

    return (
        <AuthLayout>
            <span className="bg-success-bg text-success flex size-14 items-center justify-center rounded-full">
                <CircleCheck className="size-7" />
            </span>

            <h1 className="text-h1 text-fg mt-5 font-bold">Revisa tu correo</h1>
            <p className="text-body text-fg-secondary mt-2">
                Si existe una cuenta con ese correo, te llegará un enlace en unos minutos.
            </p>

            <Button
                type="button"
                variant="secondary"
                size="lg"
                className="mt-6 w-full"
                onClick={() => navigate(iamPaths.signIn())}
            >
                Volver a iniciar sesión
            </Button>
        </AuthLayout>
    );
}
