import path from 'node:path';
import { test, expect } from '@playwright/test';

const UTF16 = path.join(process.cwd(), 'samples', 'utf16-logs.csv');

test('encoding: a UTF-16LE (BOM) CSV is detected and parsed cleanly', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', UTF16);

  // Parsed correctly (not mojibake): 2 rows, clean "level" header column.
  await expect(page.getByText('2 of 2 rows')).toBeVisible();
  await expect(page.getByRole('button', { name: 'level', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'count', exact: true })).toBeVisible();

  // The detected encoding is surfaced on the file tab.
  await expect(page.getByText(/utf-16le/i)).toBeVisible();
});
