import path from 'node:path';
import { test, expect } from '@playwright/test';

const sample = (name: string) => path.join(process.cwd(), 'samples', name);
const CSV1 = sample('server-logs.csv');
const CSV2 = sample('server-logs-2.csv');

test('compare: schema + row diff between two files', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  // Wait for the first file to land before adding the second (worker parse).
  await expect(page.getByRole('button', { name: 'Compare', exact: true })).toBeVisible();
  await page.setInputFiles('input[type="file"]', CSV2);
  await expect(page.getByText('server-logs-2.csv')).toBeVisible();
  await page.getByRole('button', { name: 'Compare', exact: true }).click();

  // Open the Diff panel.
  await page.getByRole('button', { name: /^Diff/ }).click();
  await expect(page.getByTestId('compare-diff')).toBeVisible();

  // The two files share all columns → identical schema.
  await expect(page.getByText(/Identical schema/)).toBeVisible();

  // Default key = timestamp; the files share no timestamps → all add/remove.
  await expect(page.getByText(/12 added/)).toBeVisible();
  await expect(page.getByText(/15 removed/)).toBeVisible();
});
