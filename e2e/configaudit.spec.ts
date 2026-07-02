import path from 'node:path';
import { test, expect } from '@playwright/test';

const SSHD = path.join(process.cwd(), 'samples', 'sshd_config');

test('config audit: sshd_config hardening issues are surfaced', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Audit it for hardening issues' }).click();

  const modal = page.getByTestId('config-audit');
  await expect(modal).toBeVisible();

  await modal.locator('input[type="file"]').setInputFiles(SSHD);

  // PermitRootLogin yes → an ssh-root-login finding.
  await expect(modal.getByText('PermitRootLogin').first()).toBeVisible();
  await expect(modal.getByText('ssh-root-login')).toBeVisible();

  await modal.getByRole('button', { name: 'Open as dataset' }).click();

  await expect(page.getByText('sshd_config.audit.csv')).toBeVisible();
  await expect(page.getByRole('button', { name: /severity/ })).toBeVisible();
});
