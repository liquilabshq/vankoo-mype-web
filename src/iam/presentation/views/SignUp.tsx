import {useId, useState, type FormEvent} from 'react';
import {Link, useNavigate} from 'react-router';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {useIamStore} from '../../application/iam.store';
import {SignUpCommand} from '../../domain/model/sign-up.command';
import {AuthLayout} from '../components/AuthLayout';
import {PasswordField} from '../components/PasswordField';
import {iamPaths} from '../iam-paths';

/** The shortest password this form will submit. A courtesy to the user, not a rule. */
const MINIMUM_PASSWORD_LENGTH = 8;

/** Routed view that creates an account. */
export function SignUp() {
    const navigate = useNavigate();
    const emailId = useId();
    const termsId = useId();
    const errors = useIamStore(state => state.errors);
    const submitting = useIamStore(state => state.submitting);
    const signUp = useIamStore(state => state.signUp);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const passwordsMatch = password === confirmation;
    const canSubmit =
        email.trim().length > 0 &&
        password.length >= MINIMUM_PASSWORD_LENGTH &&
        passwordsMatch &&
        termsAccepted &&
        !submitting;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        // The web app is the MYPE client, so the role is fixed rather than chosen.
        // It is the only discriminator in the system: profile-service reads it off the
        // event this call publishes to decide whether to create a Company or an
        // Investor, and an account created without one never gets a profile at all.
        const created = await signUp(new SignUpCommand({
            email: email.trim(),
            password,
            roles: ['ROLE_MYPE']
        }));
        // Sign-up answers without a token, so there is no session to walk into: the
        // next step is signing in, with the address already filled in by the store.
        if (created) navigate(iamPaths.signIn());
    }

    return (
        <AuthLayout>
            <h1 className="text-h1 text-fg font-bold">Crea tu cuenta</h1>
            <p className="text-body text-fg-secondary mt-2">Empieza a financiar tus facturas en minutos.</p>

            <form className="mt-6" onSubmit={handleSubmit}>
                <FieldGroup>
                    {errors.length > 0 && (
                        <Alert variant="destructive" role="alert">
                            <AlertDescription>{errors.map(error => error.message).join(' ')}</AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor={emailId}>Correo</FieldLabel>
                        <Input
                            id={emailId}
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            autoComplete="email"
                            disabled={submitting}
                            required
                        />
                    </Field>

                    <PasswordField
                        label="Contraseña"
                        value={password}
                        onValueChange={setPassword}
                        description={`Mínimo ${MINIMUM_PASSWORD_LENGTH} caracteres.`}
                        autoComplete="new-password"
                        disabled={submitting}
                    />

                    <PasswordField
                        label="Confirmar contraseña"
                        value={confirmation}
                        onValueChange={setConfirmation}
                        description={confirmation.length > 0 && !passwordsMatch ? 'Las contraseñas no coinciden.' : undefined}
                        autoComplete="new-password"
                        disabled={submitting}
                    />

                    <Field orientation="horizontal">
                        <Checkbox
                            id={termsId}
                            checked={termsAccepted}
                            onCheckedChange={checked => setTermsAccepted(checked === true)}
                            disabled={submitting}
                        />
                        <FieldLabel htmlFor={termsId} className="text-caption font-normal">
                            Acepto los Términos y la Política de Privacidad.
                        </FieldLabel>
                    </Field>

                    <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                        {submitting && <Spinner data-icon="inline-start" />}
                        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
                    </Button>

                    <p className="text-caption text-fg-secondary text-center">
                        ¿Ya tienes cuenta?{' '}
                        <Link className="text-fg-link font-semibold hover:underline" to={iamPaths.signIn()}>
                            Inicia sesión
                        </Link>
                    </p>
                </FieldGroup>
            </form>
        </AuthLayout>
    );
}
