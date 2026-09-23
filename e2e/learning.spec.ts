import { expect, test } from '@playwright/test';
import { PICTURE_DECKS } from '../src/content/pictures';
import { PLACEMENT } from '../src/content/placement';
import { solveLesson } from './helpers';

const uniqueName = () => `e2e_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
const PASSWORD = 'pierogi z kapustą i grzybami';

test('a new guest picks a level and completes their first lesson', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.getByRole('heading', { name: 'Wycinanka', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Start with the alphabet' }).click();
  await expect(page).toHaveURL(/\/lesson\/u00-l1$/);
  await solveLesson(page, 'u00-l1');
  await expect(page.locator('.finish-stats')).toContainText('100%');
  await expect(page.getByText("You're learning as a guest")).toBeVisible();

  await page.getByRole('link', { name: 'Course map' }).click();
  await expect(page.locator('.lesson-link.done')).toHaveCount(1);
});

test('signing up keeps guest progress and it survives a reload', async ({ page }) => {
  await page.goto('/welcome');
  await page.getByRole('button', { name: 'Start with the alphabet' }).click();
  await solveLesson(page, 'u00-l1');
  await page.getByRole('link', { name: 'Create a free account' }).click();
  await expect(page.getByText("Everything you've done in this visit will be added")).toBeVisible();

  const username = uniqueName();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(username);

  await page.reload();
  await expect(page.getByText("You've finished 1 of 60 lessons")).toBeVisible();

  // Sign out, then back in.
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('/signin');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText("You've finished 1 of 60 lessons")).toBeVisible();
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Powtórka');
  await expect(page.locator('.page-head .gloss')).toHaveText('All caught up');
  await expect(page.locator('.stat').first()).toContainText('14');
  // Early practice runs a real review session and records it.
  await page.getByRole('button', { name: 'Practise your 10 weakest cards' }).click();
  await expect(page.locator('.player .instruction').first()).toBeVisible();
  await expect(page.locator('.stripes span')).toHaveCount(10);
});

test('reference pages render', async ({ page }) => {
  for (const [path, heading] of [
    ['/words', 'Słowa'],
    ['/sounds', 'Wymowa'],
    ['/grammar', 'Gramatyka'],
    ['/learn', 'Nauka'],
    ['/tools', 'Narzędzia'],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
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

test('the pronouncer explains letters and words', async ({ page }) => {
  await page.goto('/tools');
  const input = page.getByLabel('Polish text');
  await input.fill('cz');
  await expect(page.getByText('sounds like ch in "church"')).toBeVisible();
  await input.fill('Wrocław');
  await expect(page.locator('.respelling').first()).toHaveText('VRO-tswaf');
  await page.getByRole('tab', { name: /Numbers/ }).click();
  await page.getByLabel('Number').fill('5');
  await expect(page.getByText('pięć złotych')).toBeVisible();
  await page.getByRole('tab', { name: /Clock/ }).click();
  await page.getByLabel('Time').fill('07:30');
  await expect(page.getByText('Jest wpół do ósmej.')).toBeVisible();
});

test('the second lesson opens with a warm-up from the first', async ({ page }) => {
  await page.goto('/lesson/u00-l1');
  await solveLesson(page, 'u00-l1');
  await page.getByRole('button', { name: /^Next:/ }).click();
  await expect(page.locator('.tag-warmup').first()).toBeVisible();
  await solveLesson(page, 'u00-l2');
  await expect(page.locator('.finish-stats')).toContainText('100%');
});

test('picture flashcards: meet a deck, then name each picture from four Polish words', async ({ page }) => {
  const deck = PICTURE_DECKS[0];
  const byEn = new Map(deck.pictures.map((p) => [p.en, p]));
  await page.goto('/pictures');
  await expect(page.getByRole('heading', { name: 'Obrazki', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: `Learn ${deck.pictures.length} new pictures` }).click();

  // First meeting: picture, Polish and English together.
  for (let i = 0; i < deck.pictures.length; i++) {
    const card = page.locator('.meet-card');
    await expect(card.locator('img.meet-picture')).toBeVisible();
    const pl = (await card.locator('.word').textContent())!.trim();
    const en = (await card.locator('.en').textContent())!.trim();
    expect(byEn.get(en)?.pl).toBe(pl);
    await page.getByRole('button', { name: i === deck.pictures.length - 1 ? 'Start practising' : 'Next word' }).click();
  }

  // Quiz: only the picture is shown; choose its Polish name.
  for (let i = 0; i < deck.pictures.length; i++) {
    const img = page.locator('.picture-prompt img');
    await expect(img).toBeVisible();
    const picture = byEn.get((await img.getAttribute('alt'))!)!;
    expect(await img.getAttribute('src')).toBe(picture.img);
    const options = page.locator('.options button.option');
    await expect(options).toHaveCount(4);
    await options.filter({ hasText: picture.pl }).click();
    await page.getByRole('button', { name: 'Check' }).click();
    await expect(page.locator('.sheet.good')).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  await expect(page.getByText(`Added ${deck.pictures.length} pictures to your review deck`)).toBeVisible();
  await expect(page.getByRole('button', { name: `Practise ${deck.pictures.length}` })).toBeVisible();
  await expect(page.locator('.picture-grid li.known')).toHaveCount(deck.pictures.length);
});
