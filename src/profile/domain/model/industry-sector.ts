/** The six sectors profile-service accepts (`IndustrySector` on the server). */
export type IndustrySector = 'AGRICULTURE' | 'MANUFACTURING' | 'SERVICES' | 'TECHNOLOGY' | 'RETAIL' | 'OTHER';

export const INDUSTRY_SECTORS: readonly IndustrySector[] = [
    'AGRICULTURE',
    'MANUFACTURING',
    'SERVICES',
    'TECHNOLOGY',
    'RETAIL',
    'OTHER'
];

export function isIndustrySector(value: string): value is IndustrySector {
    return (INDUSTRY_SECTORS as readonly string[]).includes(value);
}
