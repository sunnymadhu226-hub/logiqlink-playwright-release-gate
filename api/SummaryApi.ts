import type { APIRequestContext } from '@playwright/test';

export const summaryEndpoint = '/api/summary.json';

export class SummaryApi {
  constructor(private readonly request: APIRequestContext) {}

  getSummary() {
    return this.request.get(summaryEndpoint);
  }
}