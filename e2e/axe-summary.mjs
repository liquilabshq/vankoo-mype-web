// Resume los informes de axe (e2e-results/axe/*.json) en una tabla Markdown para el
// informe (4.4.5): pantalla, regla, impacto, elementos y ayuda. Uso: pnpm test:a11y:summary
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';

const dir = 'e2e-results/axe';
const rows = [];
for (const file of readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const report = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'));
    const page = file.replace(/\.json$/, '');
    for (const v of report.violations) {
        rows.push(`| ${page} | \`${v.id}\` | ${v.impact} | ${v.nodes.length} | ${v.help} |`);
    }
    if (report.violations.length === 0) rows.push(`| ${page} | — | — | 0 | Sin infracciones |`);
}
const table = ['| Pantalla | Regla | Impacto | Elementos | Qué pide |', '|---|---|---|---|---|', ...rows].join('\n');
writeFileSync(`${dir}/resumen.md`, `# Accesibilidad (axe-core, WCAG 2.1 AA)\n\n${table}\n`);
console.log(table);
