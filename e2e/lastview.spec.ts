import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('workspace: remembers the last view and offers to restore it', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  // Shape a view: filter status_code >= 500 → 3 of 15.
  await page.getByRole('button', { name: '+ Add filter' }).click();
  await page.getByLabel('Column', { exact: true }).selectOption('status_code');
  await page.getByLabel('Operator', { exact: true }).selectOption('gte');
  await page.getByLabel('Value', { exact: true }).fill('500');
  await expect(page.getByText('3 of 15 rows')).toBeVisible();

  // Let the debounced auto-save persist (600ms).
  await page.waitForTimeout(800);

  // Remove the file → back to the empty drop zone.
  await page.getByRole('button', { name: 'Remove server-logs.csv' }).click();
  await expect(page.getByText('Drop your CSV or log file here')).toBeVisible();

  // Load a file with the same structure again → the restore banner appears.
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();
  await page.getByRole('button', { name: 'Restore last view' }).click();

  // The remembered filter is re-applied.
  await expect(page.getByText('3 of 15 rows')).toBeVisible();
});
