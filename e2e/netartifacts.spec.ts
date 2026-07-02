import path from 'node:path';
import { test, expect } from '@playwright/test';

const ARP = path.join(process.cwd(), 'samples', 'arp-table.txt');

test('network artifacts: an arp -a dump auto-parses into ip/mac columns', async ({
  page,
}) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', ARP);

  await expect(page.getByText('5 of 5 rows')).toBeVisible();
  // Columns produced by the ARP adapter's named groups.
  await expect(page.getByRole('button', { name: /mac/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /iface/ })).toBeVisible();
  // A parsed MAC cell shows up in the table.
  await expect(page.getByText('00:1a:2b:3c:4d:5e')).toBeVisible();
});
