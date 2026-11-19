import { expect, test } from '@playwright/test';
import { SummaryApi } from '../../api/SummaryApi';
import ticketData from '../../test-data/ticket.json';

test('serves a successful summary citing the current ticket', async ({ request }) => {
  const response = await new SummaryApi(request).getSummary();

  await expect(response).toBeOK();
  expect(await response.json()).toEqual({
    status: 'ok',
    summary: expect.stringMatching(/\S/),
    sourceIds: [ticketData.currentMessageId],
  });
});