/** La cuenta MYPE de prueba, solo desde variables de entorno (nunca en el repo). */
export function mypeAccount() {
    const email = process.env.E2E_MYPE_EMAIL;
    const password = process.env.E2E_MYPE_PASSWORD;
    if (!email || !password) {
        throw new Error('Define E2E_MYPE_EMAIL y E2E_MYPE_PASSWORD (ver e2e/README.md)');
    }
    return {email, password};
}
