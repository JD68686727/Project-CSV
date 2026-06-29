import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('columns: overriding a column type re-runs the pipeline', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  // Column stats show status_code as a number initially.
  await page.getByRole('button', { name: /Column statistics/ }).click();
  const statusRow = page.getByRole('row').filter({ hasText: 'status_code' });
  await expect(statusRow.filter({ hasText: 'number' })).toBeVisible();

  // Override its type → string, via the column manager.
  await page.getByRole('button', { name: /Columns/ }).click();
  await page.getByLabel('Type of status_code').selectOption('string');
  await page.getByRole('button', { name: /Columns/ }).click(); // close the menu

  // The stats panel recomputes: the type is now string.
  await expect(
    page.getByRole('row').filter({ hasText: 'status_code' }).filter({ hasText: 'string' }),
  ).toBeVisible();
});
