import type { Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async openTicket() {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Open ticket: Delivery status' }).click();
  }
}