import { expect, test } from '@playwright/test';
import { evaluateSummary, type TicketMessage } from '../src/evaluation/summary';

const messages = [
  { id: 'm1', text: 'The customer requested an update.' },
  { id: 'm2', text: 'We issued a $25.50 refund.', facts: { refundUsdCents: 2550 } },
  { id: 'm3', text: 'Tracking shows the order is in transit.', facts: { orderStatus: 'in transit' } },
] as const satisfies readonly TicketMessage[];

test.describe('deterministic summary evaluation', () => {
  const neutralSummary = 'The customer asked for an update.';

  test('accepts a summary with valid citations', () => {
    expect(evaluateSummary({ summary: neutralSummary, sourceIds: ['m1'] }, messages)).toEqual([]);
  });

  for (const { label, sourceIds } of [
    { label: 'omitted citations', sourceIds: undefined },
    { label: 'an empty citation list', sourceIds: [] },
    { label: 'cross-ticket citations', sourceIds: ['other-ticket-m1'] },
    { label: 'mixed valid and invalid citations', sourceIds: ['m1', 'other-ticket-m1'] },
  ]) {
    test('rejects ' + label, () => {
      expect(evaluateSummary({ summary: neutralSummary, sourceIds }, messages))
        .toEqual([{ code: 'invalid-citations' }]);
    });
  }

  test('accepts a supported refund amount with different formatting', () => {
    expect(evaluateSummary({
      summary: 'Refund amount: $25.5.',
      sourceIds: ['m2'],
    }, messages)).toEqual([]);
  });

  test('rejects an incorrect refund amount', () => {
    expect(evaluateSummary({
      summary: 'A refund of $250 was issued.',
      sourceIds: ['m2'],
    }, messages)).toEqual([{ code: 'unsupported-refund', claimedUsdCents: 25000 }]);
  });

  test('rejects a refund amount supported only by an uncited message', () => {
    expect(evaluateSummary({
      summary: 'The refund was $25.50.',
      sourceIds: ['m1'],
    }, messages)).toEqual([{ code: 'unsupported-refund', claimedUsdCents: 2550 }]);
  });

  test('accepts a supported order status with different phrasing', () => {
    expect(evaluateSummary({
      summary: 'Order status: IN TRANSIT.',
      sourceIds: ['m3'],
    }, messages)).toEqual([]);
  });

  test('rejects an order status that contradicts the cited message', () => {
    expect(evaluateSummary({
      summary: 'The order has been delivered.',
      sourceIds: ['m3'],
    }, messages)).toEqual([{ code: 'unsupported-order-status', claimedStatus: 'delivered' }]);
  });

  test('rejects a summary that combines supported and unsupported critical claims', () => {
    expect(evaluateSummary({
      summary: 'Refund: $25.50. The order was canceled.',
      sourceIds: ['m2', 'm3'],
    }, messages)).toEqual([{ code: 'unsupported-order-status', claimedStatus: 'canceled' }]);
  });
});
