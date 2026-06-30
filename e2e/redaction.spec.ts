import fs from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const CSV1 = path.join(process.cwd(), 'samples', 'server-logs.csv');

test('redaction: exported CSV replaces IPs with consistent dummies', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', CSV1);
  await expect(page.getByText('15 of 15 rows')).toBeVisible();

  await page.getByRole('button', { name: /Export \d/ }).click();
  await page.getByLabel('Redact sensitive values').check();

  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'CSV', exact: true }).click(),
  ]);

  expect(dl.suggestedFilename()).toBe('server-logs.filtered.redacted.csv');

  const file = path.join(test.info().outputDir, 'redacted.csv');
  await dl.saveAs(file);
  const text = await fs.readFile(file, 'utf-8');

  // Consistent dummies present, raw IPs gone.
  expect(text).toContain('[IP_');
  expect(text).not.toContain('10.0.0.4');
  expect(text).not.toContain('10.0.0.9');
});
