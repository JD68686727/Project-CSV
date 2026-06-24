import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('export: download the filtered view as CSV, JSON and Excel', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  const download = async (item: string) => {
    await page.getByRole('button', { name: /Export \d/ }).click();
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: item, exact: true }).click(),
    ]);
    return dl.suggestedFilename();
  };

  expect(await download('CSV')).toBe('server-logs.filtered.csv');
  expect(await download('JSON')).toBe('server-logs.filtered.json');
  expect(await download('Excel')).toBe('server-logs.filtered.xlsx');
});
