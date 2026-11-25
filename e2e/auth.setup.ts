import {expect, test as setup} from '@playwright/test';
import {mypeAccount} from './credentials';

/** Inicia sesión una vez y guarda la sesión para las demás pruebas. */
setup('iniciar sesión como MYPE', async ({page}) => {
    const {email, password} = mypeAccount();
    await page.goto('/iam/sign-in');
    await page.getByLabel('Correo').fill(email);
    await page.getByLabel('Contraseña', {exact: true}).fill(password);
    await page.getByRole('button', {name: 'Ingresar'}).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', {name: 'Facturas'})).toBeVisible();
    await page.context().storageState({path: 'e2e/.auth/mype.json'});
});
