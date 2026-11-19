import { test as base } from '@playwright/test';
import { SupportDashboardPage } from '../pages/SupportDashboardPage';

type SummaryResponse =
  | { status: 200; body: { status: 'ok'; summary: string; sourceIds: string[] } }
  | { status: 200; body: { status: 'insufficient_information' } }
  | { status: 503; body: { error: 'unavailable' } };

export const test = base.extend<{
  dashboard: SupportDashboardPage;
  ticketData: {
    currentMessageId: string;
    otherTicketMessageId: string;
    summary: string;
  };
  mockSummary: (...responses: SummaryResponse[]) => Promise<void>;
}>({
  dashboard: async ({ page }, use) => {
    await use(new SupportDashboardPage(page));
  },

  ticketData: async ({}, use) => {
    await use({
      currentMessageId: 'm1',
      otherTicketMessageId: 'other-ticket-m1',
      summary: 'The customer asked for an update on the delivery.',
    });
  },

  mockSummary: async ({ page }, use) => {
    await use(async (...responses) => {
      await page.route('**/api/summary.json', async (route) => {
        const response = responses.shift();
        if (!response) {
          await route.abort('failed');
          throw new Error('Unexpected request to the summary endpoint');
        }
        await route.fulfill({ status: response.status, json: response.body });
      });
    });
  },
});

export { expect } from '@playwright/test';
