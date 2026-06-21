import path from 'node:path';
import { test, expect } from '@playwright/test';

const sample = (name: string) => path.join(process.cwd(), 'samples', name);
const CSV1 = sample('server-logs.csv');
const CSV2 = sample('server-logs-2.csv');

test('analyze: load a file, filter it, and chart it', async ({ page }) => {
  await page.goto('/');

  // Ingest → table renders with inferred columns.
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByRole('button', { name: /status_code/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /latency_ms/ })).toBeVisible();
  await expect(page.getByText('15 of 15 rows')).toBeVisible(); // all rows, unfiltered

  // Filter status_code >= 500 → 3 of 15 rows.
  await page.getByRole('button', { name: '+ Add filter' }).click();
  await page.selectOption('select[aria-label="Column"]', 'status_code');
  await page.selectOption('select[aria-label="Operator"]', 'gte');
  await page.fill('input[aria-label="Value"]', '500');
  await expect(page.getByText('3 of 15 rows')).toBeVisible();

  // Chart aggregates the filtered set (lazy-loaded Recharts).
  await page.selectOption('select[aria-label="Group by column"]', 'level');
  await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();
});

test('search: grep across all columns narrows the table', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  // Only one row mentions "payments" (the /api/payments endpoint).
  await page.fill('input[aria-label="Search all columns"]', 'payments');
  await expect(page.getByText('1 of 15 rows')).toBeVisible();

  // Clearing the search restores the full set.
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByText('15 of 15 rows')).toBeVisible();
});

test('columns: hiding a column removes it from the table', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  // The "cached" column header is present initially.
  await expect(page.getByRole('button', { name: 'cached', exact: true })).toBeVisible();

  // Open the column manager and hide "cached".
  await page.getByRole('button', { name: /Columns/ }).click();
  await page.getByRole('checkbox', { name: 'cached' }).uncheck();

  // The header for that column is gone from the table.
  await expect(
    page.getByRole('button', { name: 'cached', exact: true }),
  ).toHaveCount(0);
});

test('share: a link restores the view in a fresh session', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);

  // Configure a view: filter status_code >= 500 (3 of 15).
  await page.getByRole('button', { name: '+ Add filter' }).click();
  await page.selectOption('select[aria-label="Column"]', 'status_code');
  await page.selectOption('select[aria-label="Operator"]', 'gte');
  await page.fill('input[aria-label="Value"]', '500');
  await expect(page.getByText('3 of 15 rows')).toBeVisible();

  // Share → URL gains a #v= token (clipboard is best-effort).
  await page.getByRole('button', { name: /Share view/ }).click();
  await expect(page.getByRole('button', { name: /Link copied/ })).toBeVisible();
  const url = page.url();
  expect(url).toContain('#v=');

  // Open the link in a fresh page, load the same file → the filter is restored.
  const page2 = await context.newPage();
  await page2.goto(url);
  await page2.setInputFiles('input[type="file"]', CSV1);
  await expect(page2.getByText('3 of 15 rows')).toBeVisible();
  await page2.close();
});

test('compare: overlay trends across two files', async ({ page }) => {
  await page.goto('/');

  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByRole('button', { name: 'Compare', exact: true })).toBeVisible();

  // Add a second, schema-compatible file.
  await page.setInputFiles('input[type="file"]', CSV2);
  await expect(page.getByText('server-logs-2.csv')).toBeVisible();

  // Compare mode → group by level → 2 series × 3 levels = 6 bars.
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await page.selectOption('select[aria-label="Group by column"]', 'level');
  await expect(page.locator('.recharts-legend-item')).toHaveCount(2);
  await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(6);
});
