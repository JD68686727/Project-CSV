import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('quick filters: one-click HTTP 4xx/5xx narrows the table', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  await page.getByRole('button', { name: 'Quick filters' }).click();
  await page.getByRole('button', { name: 'Filter HTTP 4xx / 5xx' }).click();

  // 6 rows have a 4xx/5xx status code.
  await expect(page.getByText('6 of 15 rows')).toBeVisible();
});

test('quick filters: extract lists distinct IPv4 matches', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  await page.getByRole('button', { name: 'Quick filters' }).click();
  await page.getByRole('button', { name: 'Extract IPv4 address' }).click();

  const panel = page.getByTestId('extract-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByText('10.0.0.9', { exact: true })).toBeVisible();

  // Clicking a value filters the view to rows containing it.
  await panel.getByRole('button', { name: 'Filter by 10.0.0.9' }).click();
  await expect(page.getByTestId('extract-panel')).toHaveCount(0);
  await expect(page.getByText('4 of 15 rows')).toBeVisible();
});
