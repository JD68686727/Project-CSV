import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('pivot: cross-tab two columns and drill into a cell', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  // Expand the pivot panel and cross-tab level × cached.
  await page.getByRole('button', { name: 'Pivot table' }).click();
  await page.getByLabel('Pivot rows').selectOption('level');
  await page.getByLabel('Pivot columns').selectOption('cached');
  await expect(page.getByTestId('pivot-table')).toBeVisible();

  // Clicking the INFO × true cell filters to level=INFO AND cached=true.
  await page.getByRole('button', { name: 'Filter INFO × true' }).click();
  await expect(page.getByText('6 of 15 rows')).toBeVisible();
});
