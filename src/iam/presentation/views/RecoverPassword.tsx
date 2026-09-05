import {useId, useState} from 'react';
import {ChevronLeft} from 'lucide-react';
import {Link} from 'react-router';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {AuthLayout} from '../components/AuthLayout';
import {iamPaths} from '../iam-paths';

/**
 * Routed view that would start a password reset.
 *
 * The form is real and the submit button is permanently disabled, because iam-service
 * has no recovery endpoint, no reset token and no mail transport — the whole feature
 * is unbuilt on the server. Shipping a button that quietly did nothing, or that faked
 * a confirmation, would be worse than shipping one that says so.
 */
export function RecoverPassword() {
    const emailId = useId();
    const [email, setEmail] = useState('');

    return (
        <AuthLayout>
            <Link
                className="text-caption text-fg-link inline-flex items-center gap-1 font-semibold hover:underline"
                to={iamPaths.signIn()}
            >
                <ChevronLeft className="size-4" />
                Volver a iniciar sesión
            </Link>

            <h1 className="text-h1 text-fg mt-4 font-bold">Recupera tu contraseña</h1>
            <p className="text-body text-fg-secondary mt-2">
                Escribe tu correo y te enviaremos un enlace para crear una nueva.
            </p>

            <div className="mt-6">
                <FieldGroup>
                    <Alert>
                        <AlertTitle>Todavía no disponible</AlertTitle>
                        <AlertDescription>
                            El servicio de identidad aún no tiene recuperación de contraseña. Escríbenos y te
                            ayudamos a entrar.
                        </AlertDescription>
                    </Alert>

                    <Field>
                        <FieldLabel htmlFor={emailId}>Correo</FieldLabel>
                        <Input
                            id={emailId}
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            autoComplete="email"
                        />
                    </Field>

                    <Button type="button" size="lg" className="w-full" disabled>
                        Enviar enlace
                    </Button>
                </FieldGroup>
            </div>
        </AuthLayout>
    );
}
