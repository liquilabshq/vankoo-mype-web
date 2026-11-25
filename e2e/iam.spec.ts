import {expect, test} from '@playwright/test';

// Pantallas de entrada: sin sesión.
test.use({storageState: {cookies: [], origins: []}});

test.describe('IAM: entrada a la plataforma', () => {
    test('sin sesión, la web lleva al inicio de sesión', async ({page}) => {
        await page.goto('/invoicing');
        await expect(page).toHaveURL(/\/iam\/sign-in/);
        await expect(page.getByRole('heading', {name: 'Bienvenido de vuelta'})).toBeVisible();
    });

    test('rechaza credenciales incorrectas con un mensaje claro', async ({page}) => {
        await page.goto('/iam/sign-in');
        await page.getByLabel('Correo').fill('nadie@vankoo.test');
        await page.getByLabel('Contraseña', {exact: true}).fill('Incorrecta-123');
        await page.getByRole('button', {name: 'Ingresar'}).click();

        await expect(page.getByText(/Correo o contraseña incorrectos|No encontramos ninguna cuenta/)).toBeVisible();
        await expect(page).toHaveURL(/\/iam\/sign-in/);
    });

    test('el botón de ingresar espera a que el formulario esté completo', async ({page}) => {
        await page.goto('/iam/sign-in');
        const submit = page.getByRole('button', {name: 'Ingresar'});
        await expect(submit).toBeDisabled();
        await page.getByLabel('Correo').fill('mype@vankoo.test');
        await expect(submit).toBeDisabled();
        await page.getByLabel('Contraseña', {exact: true}).fill('algo');
        await expect(submit).toBeEnabled();
    });

    test('navega al registro y a la recuperación de contraseña', async ({page}) => {
        await page.goto('/iam/sign-in');
        await page.getByRole('link', {name: 'Crea una'}).click();
        await expect(page).toHaveURL(/\/iam\/sign-up/);

        await page.goto('/iam/sign-in');
        await page.getByRole('link', {name: '¿Olvidaste tu contraseña?'}).click();
        await expect(page).toHaveURL(/\/iam\/recover/);
    });
});
