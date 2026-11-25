import {defineConfig, devices} from '@playwright/test';

/**
 * Pruebas end-to-end y de accesibilidad de la web MYPE (secciones 4.4.1 y 4.4.5 del TF).
 *
 * Corren contra un despliegue real: por defecto el de AKS. E2E_BASE_URL apunta a otro
 * (p. ej. http://localhost:3000 con el compose). La cuenta MYPE llega por variables de
 * entorno y nunca se guarda en el repo: ver e2e/README.md.
 */
export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    expect: {timeout: 10_000},
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', {outputFolder: 'playwright-report', open: 'never'}]],
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'https://vankoo-liquilabs.centralus.cloudapp.azure.com',
        locale: 'es-PE',
        timezoneId: 'America/Lima',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
    },
    projects: [
        {name: 'setup', testMatch: /auth\.setup\.ts/},
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome'], storageState: 'e2e/.auth/mype.json'},
            dependencies: ['setup']
        },
        {
            name: 'firefox',
            use: {...devices['Desktop Firefox'], storageState: 'e2e/.auth/mype.json'},
            dependencies: ['setup']
        }
    ]
});
