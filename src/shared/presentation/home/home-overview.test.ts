import {describe, expect, it} from 'vitest';
import type {AuctionStatus} from '../../../investment/domain/model/auction-status';
import {Auction} from '../../../investment/domain/model/auction.entity';
import type {InvoiceStatus} from '../../../invoicing/domain/model/invoice-status';
import {Invoice} from '../../../invoicing/domain/model/invoice.entity';
import {readHomeInvoice, summarizeHome} from './home-overview';

const NOW = new Date(2026, 10, 23, 12);

function invoice(id: string, status: InvoiceStatus, uploadedAt = NOW, amount: number | null = 1000, currency = 'PEN') {
    return new Invoice({
        id,
        number: `F001-${id}`,
        payerName: 'Pagador SAC',
        payerRuc: '20100000001',
        dueDate: null,
        status,
        amount: amount === null ? null : {value: amount, currency},
        uploadedAt
    });
}

function auction(invoiceId: string, status: AuctionStatus, funding = 0) {
    return new Auction({
        id: `auction-${invoiceId}`,
        invoiceId,
        status,
        riskGrade: 'A',
        targetAmount: null,
        currentFunding: {value: funding, currency: 'PEN'},
        publishedAt: null,
        expiresAt: null,
        acceptedQuote: null,
        rejectionReasonCode: null,
        rejectionReason: null
    });
}

describe('readHomeInvoice', () => {
    it('keeps an invoice still being read or validated in review, with nothing for the MYPE to do', () => {
        for (const status of ['UPLOADED', 'OCR_PROCESSING', 'CONSISTENCY_PASSED', 'SUNAT_VALIDATED'] as const) {
            expect(readHomeInvoice(invoice('1', status), null)).toMatchObject({bucket: 'inReview', action: null});
        }
    });

    it('asks the MYPE to review an invoice whose data needs her confirmation', () => {
        expect(readHomeInvoice(invoice('1', 'REQUIRES_REVIEW'), null)).toMatchObject({
            bucket: 'inReview',
            action: 'review',
            status: 'REQUIRES_REVIEW'
        });
    });

    it('asks the MYPE to accept the offer while the auction is a draft, even before Invoicing hears of it', () => {
        expect(readHomeInvoice(invoice('1', 'CONSISTENCY_PASSED'), auction('1', 'DRAFT'))).toMatchObject({
            bucket: 'inReview',
            action: 'acceptQuote',
            status: 'APPROVED'
        });
    });

    it('takes the auction’s word that an invoice is out with investors', () => {
        expect(readHomeInvoice(invoice('1', 'APPROVED'), auction('1', 'FUNDING'))).toMatchObject({
            bucket: 'inAuction',
            status: 'PUBLISHED'
        });
    });

    it('counts a fully funded or closed auction as funded, not as in auction', () => {
        expect(readHomeInvoice(invoice('1', 'PUBLISHED'), auction('1', 'FULLY_FUNDED')).bucket).toBe('funded');
        expect(readHomeInvoice(invoice('1', 'PUBLISHED'), auction('1', 'CLOSED')).bucket).toBe('funded');
    });

    it('pills a funded invoice as «Fondeada», whichever side says it first', () => {
        // The auction already filled, Invoicing has not heard yet.
        expect(readHomeInvoice(invoice('1', 'PUBLISHED'), auction('1', 'FULLY_FUNDED'))).toMatchObject({
            bucket: 'funded',
            status: 'FUNDED'
        });
        // Invoicing heard, and the auction is not in the list (it failed to load).
        expect(readHomeInvoice(invoice('1', 'FUNDED'), null)).toMatchObject({bucket: 'funded', status: 'FUNDED'});
    });

    it('puts every dead end in not eligible, whoever decided it', () => {
        expect(readHomeInvoice(invoice('1', 'NOT_ELIGIBLE'), null).bucket).toBe('notEligible');
        expect(readHomeInvoice(invoice('1', 'REJECTED'), null).bucket).toBe('notEligible');
        expect(readHomeInvoice(invoice('1', 'CONSISTENCY_PASSED'), auction('1', 'REJECTED')).bucket).toBe('notEligible');
    });
});

describe('summarizeHome', () => {
    const invoices = [
        invoice('6', 'REQUIRES_REVIEW', new Date(2026, 10, 20)),
        invoice('5', 'CONSISTENCY_PASSED', new Date(2026, 10, 18), 2500.5),
        invoice('4', 'PUBLISHED', new Date(2026, 9, 2), 3000),
        invoice('3', 'PUBLISHED', new Date(2026, 8, 15), 4000),
        invoice('2', 'UPLOADED', new Date(2026, 8, 1), null),
        invoice('1', 'NOT_ELIGIBLE', new Date(2025, 0, 10), 500, 'USD')
    ];
    const auctions = new Map([
        ['5', auction('5', 'DRAFT')],
        ['4', auction('4', 'FUNDING', 1200)],
        ['3', auction('3', 'CLOSED', 4000)]
    ]);
    const overview = summarizeHome(invoices, auctions, {now: NOW, recentLimit: 3});

    it('counts every invoice in exactly one bucket', () => {
        expect(overview.total).toBe(6);
        expect(overview.counts).toEqual({inReview: 3, inAuction: 1, funded: 1, notEligible: 1});
    });

    it('lists what waits on the MYPE apart from the rest, newest first', () => {
        expect(overview.needingAction.map(entry => [entry.invoice.id, entry.action])).toEqual([
            ['6', 'review'],
            ['5', 'acceptQuote']
        ]);
        expect(overview.recent.map(entry => entry.invoice.id)).toEqual(['4', '3', '2']);
    });

    it('adds up what was submitted per currency, soles first, skipping invoices not read yet', () => {
        expect(overview.submitted).toEqual([
            {currency: 'PEN', value: 10500.5},
            {currency: 'USD', value: 500}
        ]);
    });

    it('adds up what investors have put in, partial auctions included', () => {
        expect(overview.funded).toEqual([{currency: 'PEN', value: 5200}]);
    });

    it('buckets the last six months by upload month, oldest first, leaving older invoices out', () => {
        expect(overview.months.map(month => month.key)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']);
        expect(overview.months.map(month => month.total)).toEqual([0, 0, 0, 2, 1, 2]);
        expect(overview.months[3].counts).toEqual({inReview: 1, inAuction: 0, funded: 1, notEligible: 0});
        expect(overview.months[5].counts.inReview).toBe(2);
    });

    it('answers zeros, not errors, for a MYPE with nothing yet', () => {
        const empty = summarizeHome([], new Map(), {now: NOW});
        expect(empty.total).toBe(0);
        expect(empty.submitted).toEqual([]);
        expect(empty.funded).toEqual([]);
        expect(empty.months).toHaveLength(6);
    });
});
