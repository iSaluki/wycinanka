import { expect, test } from '@playwright/test';
import { PLACEMENT } from '../src/content/placement';
import { solveLesson } from './helpers';

const uniqueName = () => `e2e_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
const PASSWORD = 'pierogi z kapustą i grzybami';

test('a new guest picks a level and completes their first lesson', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.getByRole('heading', { name: 'Wycinanka', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Start from the beginning' }).click();
  await expect(page).toHaveURL(/\/lesson\/u01-l1$/);
  await solveLesson(page, 'u01-l1');
  await expect(page.locator('.finish-stats')).toContainText('100%');
  await expect(page.getByText("You're learning as a guest")).toBeVisible();

  await page.getByRole('link', { name: 'Course map' }).click();
  await expect(page.locator('.lesson-link.done')).toHaveCount(1);
});

test('signing up keeps guest progress and it survives a reload', async ({ page }) => {
  await page.goto('/welcome');
  await page.getByRole('button', { name: 'Start from the beginning' }).click();
  await solveLesson(page, 'u01-l1');
  await page.getByRole('link', { name: 'Create a free account' }).click();
  await expect(page.getByText("Everything you've done in this visit will be added")).toBeVisible();

  const username = uniqueName();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(username);

  await page.reload();
  await expect(page.getByText("You've finished 1 of 54 lessons")).toBeVisible();

  // Sign out, then back in.
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('/signin');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText("You've finished 1 of 54 lessons")).toBeVisible();
});

test('rejects a weak password before submitting', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Username').fill(uniqueName());
  await page.getByLabel('Password', { exact: true }).fill('qwertyuiop');
  await expect(page.getByText('on lists attackers try first')).toBeVisible();
});

test('the placement check places a strong learner at B1', async ({ page }) => {
  await page.goto('/placement');
  for (const q of PLACEMENT) {
    await expect(page.locator('.prompt-en')).toHaveText(q.prompt);
    await page.locator('button.option', { hasText: new RegExp(`^\\d${q.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).click();
  }
  await expect(page.getByRole('heading', { name: 'Start at Unit 17' })).toBeVisible();
  await page.getByRole('button', { name: 'Start at Unit 17' }).click();
  await expect(page.locator('.unit.current')).toContainText('Would you?');
});

test('a lesson with grammar drills and a dialogue can be completed', async ({ page }) => {
  await page.goto('/lesson/u06-l3');
  await solveLesson(page, 'u06-l3');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('review works after a lesson', async ({ page }) => {
  await page.goto('/lesson/u01-l1');
  await solveLesson(page, 'u01-l1');
  // Guest progress lives in memory, so navigate within the app rather than reloading.
  await page.getByRole('link', { name: 'Course map' }).click();
  await page.locator('nav.rail').getByRole('link', { name: /Review/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('All caught up');
  await expect(page.locator('.stat').first()).toContainText('11');
  // Early practice runs a real review session and records it.
  await page.getByRole('button', { name: 'Practise your 10 weakest words' }).click();
  await expect(page.locator('.player .instruction').first()).toBeVisible();
  await expect(page.locator('.stripes span')).toHaveCount(10);
});

test('reference pages render', async ({ page }) => {
  for (const [path, heading] of [
    ['/words', 'The 500 words that matter most'],
    ['/sounds', 'The sounds of Polish'],
    ['/grammar', 'Grammar, one idea at a time'],
    ['/learn', 'Your path through Polish'],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  await page.goto('/grammar');
  await page.getByRole('button', { name: 'okno' }).click();
  await expect(page.locator('table.plain').first()).toContainText('okien');
});

test('pages are served with a strict Content Security Policy', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(res.headers()['x-frame-options']).toBe('DENY');
});
