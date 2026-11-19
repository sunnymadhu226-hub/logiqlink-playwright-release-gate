import { expect, test } from '@playwright/test';

test('opens a ticket and approves a locally generated summary', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open ticket: Delivery status' }).click();

  await expect(page.getByRole('heading', { name: 'Delivery status' })).toBeVisible();
  const approve = page.getByRole('button', { name: 'Approve summary' });
  await expect(approve).toBeDisabled();

  await page.getByRole('button', { name: 'Generate summary' }).click();
  await expect(page.getByText('The customer requested a delivery update.')).toBeVisible();
  await expect(approve).toBeEnabled();
  await approve.click();
  await expect(page.getByRole('status')).toHaveText('Summary approved.');
});
