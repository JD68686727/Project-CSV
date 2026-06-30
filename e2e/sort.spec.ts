import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('multi-sort: shift-click adds a secondary sort with a priority badge', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByRole('button', { name: /status_code/ })).toBeVisible();

  // Primary sort: level (asc). Secondary: latency_ms via Shift-click.
  await page.getByRole('button', { name: /^level/ }).click();
  await page
    .getByRole('button', { name: /latency_ms/ })
    .click({ modifiers: ['Shift'] });

  // Priority badge "2" shows on the secondary column (only with >1 sort key).
  await expect(page.getByRole('button', { name: /latency_ms/ })).toContainText('2');

  // level asc → ERROR first; latency asc within ERROR → 980 (/api/search) first.
  // Virtualized body rows are absolutely-positioned grids (left-0).
  const firstRow = page.locator('div.absolute.left-0').first();
  await expect(firstRow).toContainText('ERROR');
  await expect(firstRow).toContainText('980');
});
