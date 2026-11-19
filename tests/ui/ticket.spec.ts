import { expect, test } from '../../fixtures/testFixtures';

const unavailable = { status: 503, body: { error: 'unavailable' } } as const;

test('generates and approves a summary with a valid citation', async ({
  dashboard, ticket, mockSummary, ticketData,
}) => {
  await mockSummary({
    status: 200,
    body: { status: 'ok', summary: ticketData.summary, sourceIds: [ticketData.currentMessageId] },
  });
  await dashboard.openTicket();
  await expect(ticket.approveButton).toBeDisabled();

  await ticket.generateSummary();

  await expect(ticket.summaryText(ticketData.summary)).toBeVisible();
  await expect(ticket.status).toHaveText('Summary ready for approval.');
  await expect(ticket.approveButton).toBeEnabled();
  await ticket.approveSummary();
  await expect(ticket.status).toHaveText('Summary approved.');
});

test('keeps approval disabled when information is insufficient', async ({
  dashboard, ticket, mockSummary,
}) => {
  await mockSummary({ status: 200, body: { status: 'insufficient_information' } });
  await dashboard.openTicket();
  await ticket.generateSummary();

  await expect(ticket.status).toHaveText('Insufficient information to generate a summary.');
  await expect(ticket.approveButton).toBeDisabled();
});

test('shows an error and offers a retry after a 503', async ({ dashboard, ticket, mockSummary }) => {
  await mockSummary(unavailable);
  await dashboard.openTicket();
  await ticket.generateSummary();

  await expect(ticket.status).toHaveText('Summary generation failed. Try again.');
  await expect(ticket.retryButton).toBeVisible();
  await expect(ticket.retryButton).toBeEnabled();
  await expect(ticket.approveButton).toBeDisabled();
});

test('enables approval after a retry returns a valid summary', async ({
  dashboard, ticket, mockSummary, ticketData,
}) => {
  await mockSummary(unavailable, {
    status: 200,
    body: { status: 'ok', summary: ticketData.summary, sourceIds: [ticketData.currentMessageId] },
  });
  await dashboard.openTicket();
  await ticket.generateSummary();
  await expect(ticket.status).toHaveText('Summary generation failed. Try again.');
  await expect(ticket.approveButton).toBeDisabled();

  await ticket.retrySummary();

  await expect(ticket.summaryText(ticketData.summary)).toBeVisible();
  await expect(ticket.status).toHaveText('Summary ready for approval.');
  await expect(ticket.approveButton).toBeEnabled();
});

test('blocks approval when the summary has no citations', async ({
  dashboard, ticket, mockSummary, ticketData,
}) => {
  await mockSummary({
    status: 200,
    body: { status: 'ok', summary: ticketData.summary, sourceIds: [] },
  });
  await dashboard.openTicket();
  await ticket.generateSummary();

  await expect(ticket.summaryText(ticketData.summary)).toBeVisible();
  await expect(ticket.status).toHaveText('Summary citations are missing or invalid.');
  await expect(ticket.approveButton).toBeDisabled();
});

test('blocks approval when a citation belongs to another ticket', async ({
  dashboard, ticket, mockSummary, ticketData,
}) => {
  await mockSummary({
    status: 200,
    body: {
      status: 'ok',
      summary: ticketData.summary,
      sourceIds: [ticketData.currentMessageId, ticketData.otherTicketMessageId],
    },
  });
  await dashboard.openTicket();
  await ticket.generateSummary();

  await expect(ticket.summaryText(ticketData.summary)).toBeVisible();
  await expect(ticket.status).toHaveText('Summary citations are missing or invalid.');
  await expect(ticket.approveButton).toBeDisabled();
});
