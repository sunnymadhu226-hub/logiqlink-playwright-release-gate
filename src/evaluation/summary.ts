import { hasValidCitations } from '../citations';

export interface TicketMessage {
  id: string;
  text: string;
  facts?: {
    refundUsdCents?: number;
    orderStatus?: 'pending' | 'shipped' | 'in transit' | 'delivered' | 'canceled';
  };
}

interface Summary {
  summary: string;
  sourceIds?: unknown;
}

type EvaluationIssue =
  | { code: 'invalid-citations' }
  | { code: 'unsupported-refund'; claimedUsdCents: number }
  | { code: 'unsupported-order-status'; claimedStatus: string };

export function evaluateSummary(
  candidate: Summary,
  messages: readonly TicketMessage[],
): EvaluationIssue[] {
  const { summary, sourceIds } = candidate;
  if (!hasValidCitations(sourceIds, messages)) {
    return [{ code: 'invalid-citations' }];
  }

  const citedMessages = messages.filter((message) => sourceIds.includes(message.id));
  const issues: EvaluationIssue[] = [];

  const refundClaims = /\brefund(?:\s+(?:amount|of|is|was|for))*\s*[:=]?\s*\$(\d+)(?:\.(\d{1,2}))?(?!\d|[.,]\d)/gi;
  for (const [, dollars, cents = ''] of summary.matchAll(refundClaims)) {
    const claimedUsdCents = Number(dollars) * 100 + Number(cents.padEnd(2, '0'));
    if (!citedMessages.some((message) => message.facts?.refundUsdCents === claimedUsdCents)) {
      issues.push({ code: 'unsupported-refund', claimedUsdCents });
    }
  }

  const statusClaims = /\border(?:\s+status)?(?:\s+(?:is|was|has been))?\s*[:=]?\s+(pending|shipped|in\s+transit|delivered|cancell?ed)\b/gi;
  for (const [, status] of summary.matchAll(statusClaims)) {
    const claimedStatus = status.toLowerCase().replace(/\s+/g, ' ').replace('cancelled', 'canceled');
    if (!citedMessages.some((message) => message.facts?.orderStatus === claimedStatus)) {
      issues.push({ code: 'unsupported-order-status', claimedStatus });
    }
  }

  return issues;
}
