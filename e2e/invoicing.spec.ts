import {expect, test} from '@playwright/test';

/** Número de factura al inicio de cada fila: serie y correlativo, p. ej. E001-5. */
const INVOICE_ROW = /^[A-Z]\w{3}-\d+/;

test.describe('Facturas de la MYPE (con sesión)', () => {
    test('lista las facturas de la MYPE con su estado', async ({page}) => {
        await page.goto('/');
        await page.getByRole('link', {name: 'Facturas'}).first().click();

        await expect(page).toHaveURL(/\/invoicing/);
        await expect(page.getByRole('heading', {name: 'Facturas'})).toBeVisible();
        // La cuenta de prueba ya tiene facturas (sembradas en el despliegue). Cada fila es un
        // enlace al detalle que empieza por el número de la factura (p. ej. E001-5).
        const firstRow = page.getByRole('main').getByRole('link', {name: INVOICE_ROW}).first();
        await expect(firstRow).toBeVisible();
        await expect(firstRow).toContainText(/S\/\s*[\d,]+\.\d{2}/);
    });

    test('abre el detalle de una factura', async ({page}) => {
        await page.goto('/invoicing');
        const first = page.getByRole('main').getByRole('link', {name: INVOICE_ROW}).first();
        const number = (await first.textContent())?.match(INVOICE_ROW)?.[0] ?? '';
        await first.click();

        await expect(page).toHaveURL(/\/invoicing\/[^/]+$/);
        await expect(page.getByRole('heading', {name: new RegExp(number)})).toBeVisible();
    });

    test('la subida de facturas ofrece elegir el PDF', async ({page}) => {
        await page.goto('/invoicing/upload');
        await expect(page.getByRole('heading', {name: 'Subir factura'})).toBeVisible();
        await expect(page.locator('input[type="file"]')).toHaveCount(1);
    });

    test('cerrar sesión vuelve al inicio de sesión', async ({page}) => {
        await page.goto('/');
        await page.getByRole('button', {name: 'Salir'}).click();
        await expect(page).toHaveURL(/\/iam\/sign-in/);
    });
});
