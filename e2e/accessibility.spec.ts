import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';

/**
 * Accesibilidad con axe-core (WCAG 2.1 A y AA) en las pantallas principales.
 *
 * Cada pantalla deja su informe completo en e2e-results/axe/<pantalla>-<navegador>.json
 * para el 4.4.5. La prueba falla con las infracciones de impacto A11Y_FAIL_ON (por defecto
 * «critical»); las demás quedan anotadas en el informe HTML de Playwright.
 */
const FAIL_ON = (process.env.A11Y_FAIL_ON ?? 'critical').split(',').map(s => s.trim());
const publicPages = [
    {name: 'inicio-de-sesion', path: '/iam/sign-in'},
    {name: 'registro', path: '/iam/sign-up'},
    {name: 'recuperar-contrasena', path: '/iam/recover'}
];
const privatePages = [
    {name: 'inicio', path: '/'},
    {name: 'facturas', path: '/invoicing'},
    {name: 'subir-factura', path: '/invoicing/upload'},
    {name: 'perfil', path: '/profile'}
];

async function audit(page: import('@playwright/test').Page, name: string, browser: string) {
    const results = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    mkdirSync('e2e-results/axe', {recursive: true});
    writeFileSync(`e2e-results/axe/${name}-${browser}.json`, JSON.stringify(results, null, 2));
    const describe = (v: (typeof results.violations)[number]) =>
        `${v.id} (${v.impact}): ${v.nodes.length} elemento(s) · ${v.help}`;
    for (const v of results.violations.filter(v => !FAIL_ON.includes(v.impact ?? ''))) {
        test.info().annotations.push({type: `a11y ${v.impact}`, description: describe(v)});
    }
    expect(
        results.violations.filter(v => FAIL_ON.includes(v.impact ?? '')).map(describe),
        `Infracciones (${FAIL_ON.join(', ')}) en ${name}`
    ).toEqual([]);
}

test.describe('Accesibilidad: pantallas sin sesión', () => {
    test.use({storageState: {cookies: [], origins: []}});
    for (const {name, path} of publicPages) {
        test(name, async ({page, browserName}) => {
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            await audit(page, name, browserName);
        });
    }
});

test.describe('Accesibilidad: pantallas con sesión', () => {
    for (const {name, path} of privatePages) {
        test(name, async ({page, browserName}) => {
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            await audit(page, name, browserName);
        });
    }
});
