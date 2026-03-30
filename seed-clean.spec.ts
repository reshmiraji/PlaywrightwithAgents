import { test, expect } from '@playwright/test';

test('seed', async ({ page }) => {
  await page.goto('https://test-cmm.origincrossmedia.com/');
  await page.waitForLoadState('networkidle');
});