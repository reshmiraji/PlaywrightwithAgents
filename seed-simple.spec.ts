import { test, expect } from '@playwright/test';

test('seed - navigate to Origin Cross Media application', async ({ page }) => {
  await page.goto('https://test-cmm.origincrossmedia.com/');
  await page.waitForLoadState('networkidle');
});