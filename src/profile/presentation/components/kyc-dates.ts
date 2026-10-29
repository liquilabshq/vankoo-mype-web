/** A day written the way the reader's locale writes it: «7 de septiembre de 2026». */
export function formatLongDate(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {dateStyle: 'long'}).format(date);
}

/** A moment with its time, for when the wait ends: «7 de septiembre de 2026, 14:30». */
export function formatDateTime(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeStyle: 'short'}).format(date);
}
