import type { Page } from '@playwright/test';
import { summaryEndpoint } from '../api/SummaryApi';

export type SummaryResponse =
  | { status: 200; body: { status: 'ok'; summary: string; sourceIds: string[] } }
  | { status: 200; body: { status: 'insufficient_information' } }
  | { status: 503; body: { error: 'unavailable' } };

export async function mockSummaryResponses(page: Page, responses: SummaryResponse[]) {
  await page.route(`**${summaryEndpoint}`, async (route) => {
    const response = responses.shift();
    if (!response) {
      await route.abort('failed');
      throw new Error('Unexpected request to the summary endpoint');
    }
    await route.fulfill({ status: response.status, json: response.body });
  });
}