import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/**
 * Throwaway harness that proves the token pipeline works end to end.
 * Delete this once the first real view lands — it is not product code.
 */

const INVOICE_STATUSES = [
    ['UPLOADED', 'Subida', 'bg-status-uploaded-bg text-status-uploaded'],
    ['OCR_PROCESSING', 'Leyendo datos', 'bg-status-ocr-processing-bg text-status-ocr-processing'],
    ['DATA_EXTRACTED', 'Datos extraídos', 'bg-status-data-extracted-bg text-status-data-extracted'],
    ['CONSISTENCY_PASSED', 'Datos verificados', 'bg-status-consistency-passed-bg text-status-consistency-passed'],
    ['SUNAT_VALIDATING', 'Validando en SUNAT', 'bg-status-sunat-validating-bg text-status-sunat-validating'],
    ['SUNAT_VALIDATED', 'Validada en SUNAT', 'bg-status-sunat-validated-bg text-status-sunat-validated'],
    ['APPROVED', 'Aprobada', 'bg-status-approved-bg text-status-approved'],
    ['PUBLISHED', 'En el mercado', 'bg-status-published-bg text-status-published'],
    ['REQUIRES_REVIEW', 'Requiere revisión', 'bg-status-requires-review-bg text-status-requires-review'],
    ['NOT_ELIGIBLE', 'No elegible', 'bg-status-not-eligible-bg text-status-not-eligible'],
    ['REJECTED', 'Rechazada', 'bg-status-rejected-bg text-status-rejected'],
] as const

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-h2 font-bold text-fg">{title}</h2>
                {note && <p className="text-caption text-fg-muted max-w-2xl">{note}</p>}
            </div>
            {children}
        </section>
    )
}

export default function App() {
    const [dark, setDark] = useState(false)

    function toggleTheme() {
        setDark(previous => {
            document.documentElement.classList.toggle('dark', !previous)
            return !previous
        })
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
                <header className="flex items-start justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-overline font-semibold uppercase tracking-widest text-fg-muted">
                            Vankoo · design tokens
                        </p>
                        <h1 className="font-display text-display font-bold text-fg">vankoo</h1>
                        <p className="text-body-lg text-fg-secondary max-w-xl">
                            Every colour, size and radius below comes from the Figma library. Nothing here
                            is a hard-coded hex.
                        </p>
                    </div>
                    <Button variant="outline" onClick={toggleTheme}>
                        {dark ? 'Modo claro' : 'Modo oscuro'}
                    </Button>
                </header>

                <Section
                    title="Botones"
                    note="La regla dura: el verde de marca lleva etiqueta navy, nunca blanca. Blanco sobre verde da 2.16:1 y no pasa accesibilidad."
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <Button>Subir factura</Button>
                        <Button variant="secondary">Descargar PDF</Button>
                        <Button variant="outline">Ver detalle</Button>
                        <Button variant="destructive">Rechazar</Button>
                        <Button disabled>Deshabilitado</Button>
                    </div>
                </Section>

                <Section
                    title="Estado de factura"
                    note="Los once valores del enum InvoiceStatus del servicio Invoicing. Comparten tono a propósito: indigo = el sistema trabaja solo, navy = hito del pipeline, verde = positivo, ámbar = necesita a una persona, gris y rojo = sin salida."
                >
                    <div className="flex flex-wrap gap-2">
                        {INVOICE_STATUSES.map(([value, label, classes]) => (
                            <span
                                key={value}
                                className={`inline-flex items-center rounded-full px-3 py-1 text-caption font-semibold ${classes}`}
                                title={value}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </Section>

                <Section
                    title="Dinero"
                    note="finance/* está separado de state/* a propósito: «+S/ 850» es flujo de caja, «Aprobada» es un estado."
                >
                    <div className="flex flex-wrap gap-6 text-body font-medium">
                        <span className="text-positive">+ S/ 850.00</span>
                        <span className="text-negative">− S/ 2,000.00</span>
                        <span className="text-neutral-amount">S/ 12,450.00</span>
                    </div>
                </Section>

                <Section title="Superficies y tipografía">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-h3">Facturas recientes</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <p className="text-body text-fg-secondary">
                                    Tu factura F001-2930 de S/ 8,450.00 fue financiada el 12 de octubre.
                                </p>
                                <Input placeholder="RUC o N.° de factura" />
                                <div className="flex gap-2">
                                    <Badge>Grado A</Badge>
                                    <span className="inline-flex items-center rounded-full bg-ai-bg px-3 py-1 text-caption font-semibold text-ai">
                                        IA Risk Insight
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-green-finance-bg px-3 py-1 text-caption font-semibold text-green-finance">
                                        Factoring Verde
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3 rounded-xl bg-surface-inverse p-6">
                            <p className="text-caption font-semibold text-fg-on-inverse">Liquidez disponible</p>
                            <p className="text-h1 font-bold text-fg-inverse">S/ 24,500.00</p>
                            <p className="text-caption text-positive-on-inverse">↗ +12% vs mes pasado</p>
                            <p className="text-caption text-fg-on-inverse">
                                Sobre superficie invertida el delta usa /on-inverse: el token normal daría 2.92:1.
                            </p>
                        </div>
                    </div>
                </Section>

                <Section
                    title="Diacríticos"
                    note="A 56px la tinta de una Á o una Ñ mide más que la caja de línea. Si algo se recorta aquí, el interlineado está mal."
                >
                    <p className="font-display text-display font-bold text-fg">ÁÉÍÓÚ ÑÜ ¿¡</p>
                </Section>
            </div>
        </div>
    )
}
