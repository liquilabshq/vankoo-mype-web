import type {i18n as I18n, TFunction} from 'i18next';
import type es from '@/locales/es.json';
import type {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import {LOW_OCR_CONFIDENCE} from '../domain/model/invoice-issue';

/** Every key under `invoicing.issues.codes`, derived from the locale file rather than repeated. */
type IssueCodeKey = `invoicing.issues.codes.${keyof typeof es.invoicing.issues.codes & string}`;

/**
 * Why the service stopped this invoice, in words the MYPE can act on.
 *
 * The service's own sentences name Azure's fields and its confidence scores
 * («El campo crítico 'InvoiceTotal' tiene confianza OCR de 74 %»). Doubtful reads
 * become one sentence that names the data in plain words; every other finding has
 * copy of its own, keyed by code, and falls back to the service's sentence when this
 * build has none. The code comes from the server, so — as in `AuctionRejectionAlert`
 * — `i18n.exists` checks it at run time before the assertion. Null when nothing
 * stops the invoice.
 */
export function issueReasonFor(invoice: InvoiceDetail, t: TFunction, i18n: I18n): string | null {
    const sentences: string[] = [];

    const doubtful = [...invoice.doubtfulFields()];
    if (doubtful.length > 0) {
        const fields = new Intl.ListFormat(i18n.language, {type: 'conjunction'}).format(
            doubtful.map(field => t(`invoicing.issues.fields.${field}`))
        );
        sentences.push(t('invoicing.issues.lowConfidence', {fields}));
    }

    for (const issue of invoice.blockingIssues()) {
        // Already said above by name; one whose field this build does not know gets the general copy.
        if (issue.code === LOW_OCR_CONFIDENCE && issue.field !== null) continue;
        const key = `invoicing.issues.codes.${issue.code}`;
        sentences.push(i18n.exists(key) ? t(key as IssueCodeKey) : issue.message);
    }

    return sentences.length > 0 ? [...new Set(sentences)].join(' ') : null;
}
