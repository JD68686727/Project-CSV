import { test, expect } from '@playwright/test';

test('theme: toggling dark applies the class and persists across reload', async ({
  page,
}) => {
  await page.goto('/');

  // Start from an explicit light state for determinism.
  await page.getByRole('button', { name: 'Light' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  await page.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  // The pre-paint inline script re-applies it after a reload.
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
