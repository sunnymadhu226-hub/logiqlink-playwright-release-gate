import { expect, test } from './fixtures/dashboard';

const unavailable = { status: 503, body: { error: 'unavailable' } } as const;

test('generates and approves a summary with a valid citation', async ({
  dashboard, mockSummary, ticketData,
}) => {
  await mockSummary({
    status: 200,
    body: { status: 'ok', summary: ticketData.summary, sourceIds: [ticketData.currentMessageId] },
  });
  await dashboard.openTicket();
  await expect(dashboard.approveButton).toBeDisabled();

  await dashboard.generateSummary();

  await expect(dashboard.summaryText(ticketData.summary)).toBeVisible();
  await expect(dashboard.status).toHaveText('Summary ready for approval.');
  await expect(dashboard.approveButton).toBeEnabled();
  await dashboard.approveSummary();
  await expect(dashboard.status).toHaveText('Summary approved.');
});

test('keeps approval disabled when information is insufficient', async ({
  dashboard, mockSummary,
}) => {
  await mockSummary({ status: 200, body: { status: 'insufficient_information' } });
  await dashboard.openTicket();
  await dashboard.generateSummary();

  await expect(dashboard.status).toHaveText('Insufficient information to generate a summary.');
  await expect(dashboard.approveButton).toBeDisabled();
});

test('shows an error and offers a retry after a 503', async ({ dashboard, mockSummary }) => {
  await mockSummary(unavailable);
  await dashboard.openTicket();
  await dashboard.generateSummary();

  await expect(dashboard.status).toHaveText('Summary generation failed. Try again.');
  await expect(dashboard.retryButton).toBeVisible();
  await expect(dashboard.retryButton).toBeEnabled();
  await expect(dashboard.approveButton).toBeDisabled();
});

test('enables approval after a retry returns a valid summary', async ({
  dashboard, mockSummary, ticketData,
}) => {
  await mockSummary(unavailable, {
    status: 200,
    body: { status: 'ok', summary: ticketData.summary, sourceIds: [ticketData.currentMessageId] },
  });
  await dashboard.openTicket();
  await dashboard.generateSummary();
  await expect(dashboard.status).toHaveText('Summary generation failed. Try again.');
  await expect(dashboard.approveButton).toBeDisabled();

  await dashboard.retrySummary();

  await expect(dashboard.summaryText(ticketData.summary)).toBeVisible();
  await expect(dashboard.status).toHaveText('Summary ready for approval.');
  await expect(dashboard.approveButton).toBeEnabled();
});

test('blocks approval when the summary has no citations', async ({
  dashboard, mockSummary, ticketData,
}) => {
  await mockSummary({
    status: 200,
    body: { status: 'ok', summary: ticketData.summary, sourceIds: [] },
  });
  await dashboard.openTicket();
  await dashboard.generateSummary();

  await expect(dashboard.summaryText(ticketData.summary)).toBeVisible();
  await expect(dashboard.status).toHaveText('Summary citations are missing or invalid.');
  await expect(dashboard.approveButton).toBeDisabled();
});

test('blocks approval when a citation belongs to another ticket', async ({
  dashboard, mockSummary, ticketData,
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
  await dashboard.generateSummary();

  await expect(dashboard.summaryText(ticketData.summary)).toBeVisible();
  await expect(dashboard.status).toHaveText('Summary citations are missing or invalid.');
  await expect(dashboard.approveButton).toBeDisabled();
});
