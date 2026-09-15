interface FactFieldProps {
    label: string;
    value: string;
}

/** One labeled fact in the "Datos que leímos de la factura" grid. */
export function FactField({label, value}: FactFieldProps) {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-caption text-fg-muted">{label}</p>
            <p className="text-body text-fg font-semibold">{value}</p>
        </div>
    );
}
