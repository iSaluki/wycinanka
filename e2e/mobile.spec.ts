import { expect, test } from '@playwright/test';

test('mobile layout has a tab bar and never scrolls sideways', async ({ page }) => {
  for (const path of ['/welcome', '/learn', '/words', '/sounds', '/grammar', '/profile', '/lesson/u04-l2']) {
    await page.goto(path);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
  await page.goto('/learn');
  await expect(page.locator('nav.tabbar')).toBeVisible();
  await expect(page.locator('nav.rail')).toBeHidden();
});
