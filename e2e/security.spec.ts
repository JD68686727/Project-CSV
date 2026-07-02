import path from 'node:path';
import { test, expect } from '@playwright/test';

const AUTH = path.join(process.cwd(), 'samples', 'auth-events.csv');

test('security scan: brute-force is flagged and opens as a dataset', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', AUTH);
  await expect(page.getByText('9 of 9 rows')).toBeVisible();

  await page.getByRole('button', { name: 'Security scan' }).click();
  const modal = page.getByTestId('security-scan');
  await expect(modal).toBeVisible();

  // The repeated failures from .66 are flagged as brute-force.
  await expect(modal.getByText('brute-force').first()).toBeVisible();
  await expect(modal.getByText('10.0.0.66')).toBeVisible();

  await modal.getByRole('button', { name: 'Open as dataset' }).click();

  // A findings dataset opens as a new tab with a severity column.
  await expect(page.getByText('auth-events.threats.csv')).toBeVisible();
  await expect(page.getByRole('button', { name: /severity/ })).toBeVisible();
});
