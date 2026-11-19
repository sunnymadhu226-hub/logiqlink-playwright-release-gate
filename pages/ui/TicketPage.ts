import type { Locator, Page } from '@playwright/test';

export class TicketPage {
  readonly ticket: Locator;
  readonly status: Locator;
  readonly generateButton: Locator;
  readonly approveButton: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    this.ticket = page.getByRole('region', { name: 'Delivery status' });
    this.status = this.ticket.getByRole('status');
    this.generateButton = this.ticket.getByRole('button', { name: 'Generate summary' });
    this.approveButton = this.ticket.getByRole('button', { name: 'Approve summary' });
    this.retryButton = this.ticket.getByRole('button', { name: 'Retry generation' });
  }

  summaryText(text: string) {
    return this.ticket.getByText(text, { exact: true });
  }

  async generateSummary() {
    await this.generateButton.click();
  }

  async approveSummary() {
    await this.approveButton.click();
  }

  async retrySummary() {
    await this.retryButton.click();
  }
}
