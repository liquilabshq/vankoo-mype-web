# Pruebas E2E y de accesibilidad de la web MYPE

Secciones **4.4.1** (E2E en dos navegadores) y **4.4.5** (accesibilidad) del Trabajo Final.
Usan [Playwright](https://playwright.dev) con Chromium y Firefox, y
[axe-core](https://github.com/dequelabs/axe-core) para WCAG 2.1 A y AA.

## Qué cubren

| Archivo | Qué prueba |
|---|---|
| `auth.setup.ts` | Inicia sesión con la cuenta MYPE y guarda la sesión para las demás pruebas |
| `iam.spec.ts` | Redirección al inicio de sesión sin sesión, credenciales incorrectas, botón deshabilitado hasta completar el formulario, enlaces a registro y recuperación |
| `invoicing.spec.ts` | Lista de facturas con su importe, detalle de una factura, pantalla de subida y cierre de sesión |
| `accessibility.spec.ts` | axe en 7 pantallas (3 sin sesión, 4 con sesión) |

Todo corre dos veces, una por navegador.

## Cómo ejecutarlas

```bash
pnpm install
pnpm exec playwright install chromium firefox    # una sola vez
export E2E_MYPE_EMAIL='<correo de la cuenta MYPE de prueba>'
export E2E_MYPE_PASSWORD='<su contraseña>'
pnpm test:e2e                 # contra AKS (https://vankoo-liquilabs.centralus.cloudapp.azure.com)
pnpm test:e2e:report          # informe HTML con capturas y trazas de los fallos
pnpm test:a11y:summary        # tabla de accesibilidad en e2e-results/axe/resumen.md
```

- **Otro entorno:** `E2E_BASE_URL=http://localhost:3000 pnpm test:e2e` (compose local).
- **La cuenta MYPE** tiene que existir en ese entorno, estar verificada (KYC) y tener al menos una factura. Las credenciales no van al repositorio: pídelas a Salim.
- **Un solo navegador:** `pnpm test:e2e --project=firefox`.

## Accesibilidad

Cada pantalla deja su informe completo en `e2e-results/axe/<pantalla>-<navegador>.json`. La prueba **falla con las infracciones críticas**; las demás (por ejemplo, las graves) quedan anotadas en el informe HTML y en el resumen. Para ser más estricto: `A11Y_FAIL_ON=critical,serious pnpm test:e2e`.

**Resultado al crear estas pruebas (25 nov 2026, en AKS):**

| Pantalla | Regla | Impacto | Qué pasa |
|---|---|---|---|
| Facturas | `button-name` | crítico | Los botones de paginación (flechas) no tienen nombre accesible |
| Facturas | `label` | crítico | El campo del rango de fechas no tiene etiqueta asociada |
| Todas | `label-content-name-mismatch` | grave | El botón de idioma muestra «ES» pero se anuncia como «Cambiar a inglés» |
| Facturas, Perfil, Registro, Subir factura | `color-contrast` | grave | Textos secundarios (`text-fg-muted`, #787d84 sobre blanco) con contraste 4.14:1, por debajo del 4.5:1 de AA |
| Inicio | `aria-hidden-focus` | grave | Un elemento oculto a lectores de pantalla contiene algo enfocable |

Son el punto de partida de la sección 4.4.5: corregirlas, volver a ejecutar y comparar.
