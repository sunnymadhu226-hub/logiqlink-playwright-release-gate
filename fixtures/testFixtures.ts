import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/ui/DashboardPage';
import { TicketPage } from '../pages/ui/TicketPage';
import ticketData from '../test-data/ticket.json';
import { mockSummaryResponses, type SummaryResponse } from './summaryMocks';

export const test = base.extend<{
  dashboard: DashboardPage;
  ticket: TicketPage;
  ticketData: typeof ticketData;
  mockSummary: (...responses: SummaryResponse[]) => Promise<void>;
}>({
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  ticket: async ({ page }, use) => {
    await use(new TicketPage(page));
  },

  ticketData: async ({}, use) => {
    await use({ ...ticketData });
  },

  mockSummary: async ({ page }, use) => {
    await use((...responses) => mockSummaryResponses(page, responses));
  },
});

export { expect } from '@playwright/test';