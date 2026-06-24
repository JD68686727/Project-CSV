import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('stats: expanding column statistics shows per-column distributions', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByRole('button', { name: /status_code/ })).toBeVisible();

  // The stats panel is collapsed by default — distributions are not computed yet.
  await expect(page.getByTestId('mini-distribution')).toHaveCount(0);

  // Expand "Column statistics".
  await page.getByRole('button', { name: /Column statistics/ }).click();

  // Every column gets a distribution mini-graphic (numeric histogram or top-value bar).
  const dists = page.getByTestId('mini-distribution');
  await expect(dists.first()).toBeVisible();
  // server-logs.csv has multiple columns → multiple distributions.
  expect(await dists.count()).toBeGreaterThan(1);
});
