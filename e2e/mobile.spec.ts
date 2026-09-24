import { expect, test } from '@playwright/test';

test('mobile layout has a tab bar and never scrolls sideways', async ({ page }) => {
  for (const path of ['/welcome', '/learn', '/words', '/sounds', '/grammar', '/culture', '/culture/kuchnia', '/study', '/discover', '/phrases', '/tools/clock', '/profile', '/lesson/u04-l2']) {
    await page.goto(path);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
  await page.goto('/learn');
  await expect(page.locator('nav.tabbar')).toBeVisible();
  await expect(page.locator('nav.rail')).toBeHidden();
});

test('the tab bar keeps to four tabs and groups the other sections', async ({ page }) => {
  await page.goto('/learn');
  const tabs = page.locator('nav.tabbar a');
  await expect(tabs).toHaveCount(4);
  await tabs.filter({ hasText: 'Discover' }).click();
  await expect(page).toHaveURL(/\/discover$/);
  await page.getByRole('link', { name: /Kultura/ }).click();
  await expect(page).toHaveURL(/\/culture$/);
  // The group's tab stays highlighted inside its sections.
  await expect(tabs.filter({ hasText: 'Discover' })).toHaveAttribute('aria-current', 'page');
  await tabs.filter({ hasText: 'Practise' }).click();
  await page.getByRole('link', { name: /Obrazki/ }).click();
  await expect(page).toHaveURL(/\/pictures$/);
  await expect(tabs.filter({ hasText: 'Practise' })).toHaveAttribute('aria-current', 'page');
});

test('the welcome page has the tab bar too, and it leads into the app', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/welcome$/);
  const tabs = page.locator('nav.tabbar a');
  await expect(tabs).toHaveCount(4);
  await tabs.filter({ hasText: 'Learn' }).click();
  // Choosing to go elsewhere counts as having seen the welcome page: no bounce back.
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Dzień dobry|Dobry wieczór/);
});
