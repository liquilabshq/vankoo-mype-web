import {toProblemDetail} from '../../shared/infrastructure/problem-detail';

/**
 * What the user reads when an IAM call fails.
 *
 * The server answers in English, because its `title` and `detail` are written for
 * whoever is reading a log or a curl. The words on screen are a product decision and
 * come from the mockups, so they live here, keyed by the `code` the service sends.
 *
 * This is also the shape the `iam.errors` namespace will take once the app has real
 * i18n: the keys are already the codes, so it becomes a JSON file without the logic
 * changing.
 */
const MESSAGES: Record<string, string> = {
    'email-already-in-use': 'Ya existe una cuenta con este correo.',
    'invalid-credentials': 'Correo o contraseña incorrectos.',
    'role-not-allowed': 'No pudimos crear tu cuenta con ese tipo de perfil.',
    'validation-failed': 'Revisa los datos: hay algo que no está bien.',
    'invalid-request': 'Revisa los datos: hay algo que no está bien.',
    'user-not-found': 'No encontramos ninguna cuenta con ese correo.',
    unauthenticated: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    forbidden: 'Tu cuenta no tiene permiso para hacer esto.'
};

/**
 * A message the user can act on, whatever went wrong.
 *
 * When the call never reached the server, or came back with something that is not a
 * problem+json, the answer is that we could not connect — not that they got their
 * details wrong. Saying otherwise blames the user for our outage, which is what this
 * whole change set out to stop.
 */
export function messageFor(error: unknown, whenUnrecognised: string): string {
    const problem = toProblemDetail(error);
    if (!problem) return 'No pudimos conectar con Vankoo. Inténtalo en unos minutos.';
    // A code we do not know yet is a backend that moved ahead of us, not a broken
    // client: fall back to something true rather than showing the English detail.
    return MESSAGES[problem.code] ?? whenUnrecognised;
}
