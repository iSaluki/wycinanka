import { expect, test } from '@playwright/test';
import { PICTURE_DECKS } from '../src/content/pictures';
import { PLACEMENT } from '../src/content/placement';
import { LESSONS, unitByKey } from '../src/content/course';
import { solveLesson, solveUntil } from './helpers';

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

  // A guest's progress is kept on the device: a reload loses nothing.
  await page.reload();
  await expect(page.locator('.lesson-link.done')).toHaveCount(1);
  await page.goto('/');
  await expect(page.getByText(`You've finished 1 of ${LESSONS.length} lessons`)).toBeVisible();
});

test('signing up keeps guest progress and it survives a reload', async ({ page }) => {
  await page.goto('/welcome');
  await page.getByRole('button', { name: 'Start with the alphabet' }).click();
  await solveLesson(page, 'u00-l1');
  await page.getByRole('link', { name: 'Create a free account' }).click();
  await expect(page.getByText("Everything you've done as a guest on this device will be added")).toBeVisible();

  const username = uniqueName();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(username);

  await page.reload();
  await expect(page.getByText(`You've finished 1 of ${LESSONS.length} lessons`)).toBeVisible();

  // Without a connection the learner still sees their own progress, not an empty guest session.
  await page.waitForTimeout(2500); // the offline copy is written a moment after a change
  await page.route('**/api/**', (r) => r.abort('internetdisconnected'));
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(username);
  await expect(page.getByText(`You've finished 1 of ${LESSONS.length} lessons`)).toBeVisible();
  await page.unroute('**/api/**');

  // Sign out, then back in.
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('/signin');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText(`You've finished 1 of ${LESSONS.length} lessons`)).toBeVisible();
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
  // B1 starts with Unit 17's conditional, which now sits further along the course.
  const b1 = `Start at Unit ${unitByKey(17)!.n}`;
  await expect(page.getByRole('heading', { name: b1 })).toBeVisible();
  await page.getByRole('button', { name: b1 }).click();
  await expect(page.locator('.unit.current')).toContainText('Would you?');
});

test('a lesson with grammar drills and a dialogue can be completed', async ({ page }) => {
  await page.goto('/lesson/u06-l3');
  await solveLesson(page, 'u06-l3');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('lessons from the new units, with their conversations, can be completed', async ({ page }) => {
  for (const id of ['u19-l1', 'u23-l1', 'u28-l1']) {
    await page.goto(`/lesson/${id}`);
    await solveLesson(page, id);
    await expect(page.locator('.finish-stats'), id).toContainText('100%');
  }
});

test('review works after a lesson', async ({ page }) => {
  await page.goto('/lesson/u01-l1');
  await solveLesson(page, 'u01-l1');
  await page.getByRole('link', { name: 'Course map' }).click();
  await page.locator('nav.rail').getByRole('link', { name: /Review/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Powtórka');
  await expect(page.locator('.page-head .gloss')).toHaveText('All caught up');
  // The lesson's 14 cards, and the 2 picture flashcards met along the way.
  await expect(page.locator('.stat').first()).toContainText('16');
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
    ['/culture', 'Kultura'],
    ['/culture/wigilia', 'Wigilia'],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
  }
  await page.goto('/grammar');
  await page.getByRole('button', { name: 'okno' }).click();
  await expect(page.locator('table.plain').first()).toContainText('okien');
});

test('culture notes open from the list and link on to the next one', async ({ page }) => {
  await page.goto('/culture');
  await page.getByRole('link', { name: /Tłusty czwartek/ }).click();
  await expect(page).toHaveURL(/\/culture\/tlusty-czwartek$/);
  await expect(page.locator('.culture-words li')).not.toHaveCount(0);
  await page.getByRole('link', { name: /^Next:/ }).click();
  await expect(page).toHaveURL(/\/culture\/marzanna$/);
});

test('culture breaks sit in the course between lessons, are only read, and can be skipped', async ({ page }) => {
  await page.goto('/learn');
  await page.getByRole('link', { name: /Culture break: Being a guest/ }).click();
  await expect(page).toHaveURL(/\/course\/culture\/goscinnosc$/);
  await expect(page.locator('.culture-glance')).toBeVisible();
  await expect(page.locator('.culture-picture img')).toBeVisible();
  // Nothing to answer: no questions, just the reading and a way on.
  await expect(page.locator('.options')).toHaveCount(0);
  await page.getByRole('button', { name: /^Skip to/ }).click();
  await expect(page).toHaveURL(/\/lesson\/u03-l1$/);
  await page.goto('/learn');
  await expect(page.getByRole('link', { name: /Culture break: Being a guest/ })).toHaveClass(/done/);
});

test('the app can be installed: manifest, icons and service worker are served', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest).toMatchObject({ display: 'standalone', start_url: '/' });
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status(), icon.src).toBe(200);
  const sw = await request.get('/sw.js');
  expect(sw.status()).toBe(200);
  expect(sw.headers()['cache-control']).toBe('no-cache');
});

test('pages are served with a strict Content Security Policy', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(res.headers()['x-frame-options']).toBe('DENY');
});

test('culture videos load nothing from YouTube until played, then play from youtube-nocookie.com', async ({ page, request }) => {
  const csp = (await request.get('/culture/imieniny')).headers()['content-security-policy'];
  expect(csp).toContain('frame-src https://www.youtube-nocookie.com');
  const outside: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost')) outside.push(r.url());
  });
  // Keep the test offline: the player itself is YouTube's business.
  await page.route(/youtube/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>player</title>' }));
  await page.goto('/culture/imieniny');
  const video = page.locator('.culture-video');
  await expect(video).toContainText('Sto lat');
  await expect(video.locator('iframe')).toHaveCount(0);
  expect(outside).toEqual([]);

  await video.getByRole('button', { name: /Play video/ }).click();
  const frame = video.locator('iframe');
  await expect(frame).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?/);
  await expect(frame).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  await expect(video.getByRole('link', { name: 'Watch on YouTube' })).toHaveAttribute('href', /youtube\.com\/watch\?v=/);
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
  await page.getByLabel('Try any time').fill('07:30');
  await expect(page.locator('.big-out', { hasText: 'Jest wpół do ósmej.' })).toBeVisible();
});

test('the second lesson opens with a warm-up from the first', async ({ page }) => {
  await page.goto('/lesson/u00-l1');
  await solveLesson(page, 'u00-l1');
  await page.getByRole('button', { name: /^Next:/ }).click();
  await expect(page.locator('.tag-warmup').first()).toBeVisible();
  await solveLesson(page, 'u00-l2');
  await expect(page.locator('.finish-stats')).toContainText('100%');
});

test('picture flashcards: meet a few pictures at a time and name each one, then name the whole deck', async ({ page }) => {
  const deck = PICTURE_DECKS[0];
  const byEn = new Map(deck.pictures.map((p) => [p.en, p]));
  await page.goto('/pictures');
  await expect(page.getByRole('heading', { name: 'Obrazki', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: `Learn ${deck.pictures.length} new pictures` }).click();

  // Quiz: only the picture is shown; choose its Polish name.
  const nameIt = async () => {
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
  };

  // A few at a time: meet a small group (picture, Polish and English together), then name each of them.
  let met = 0;
  while (met < deck.pictures.length) {
    let group = 0;
    for (;;) {
      const card = page.locator('.meet-card');
      await expect(card.locator('img.meet-picture')).toBeVisible();
      const pl = (await card.locator('.word').textContent())!.trim();
      const en = (await card.locator('.en').textContent())!.trim();
      expect(byEn.get(en)?.pl).toBe(pl);
      await expect(page.locator('.meet .instruction')).toContainText(`${met + group + 1} of ${deck.pictures.length}`);
      group++;
      const practise = page.getByRole('button', { name: /^Practise (these|it)$/ });
      if (await practise.isVisible()) {
        await practise.click();
        break;
      }
      await page.getByRole('button', { name: 'Next word' }).click();
    }
    expect(group).toBeLessThanOrEqual(3);
    for (let i = 0; i < group; i++) await nameIt();
    met += group;
  }

  // Then a final mixed round of the whole deck.
  for (let i = 0; i < deck.pictures.length; i++) await nameIt();

  await expect(page.getByText(`Added ${deck.pictures.length} pictures to your review deck`)).toBeVisible();
  await expect(page.getByRole('button', { name: `Practise ${deck.pictures.length}` })).toBeVisible();
  await expect(page.locator('.picture-grid li.known')).toHaveCount(deck.pictures.length);
});

test('a missing Polish letter is pointed out and must be fixed; hints help without giving the answer away', async ({ page }) => {
  // Every word this lesson asks you to type has a Polish letter: są, koń, źle, ręka.
  const lesson = LESSONS.find((l) => l.id === 'u01-l3')!;
  const byEn = new Map(lesson.items.map((i) => [i.en, i]));
  await page.goto('/lesson/u01-l3');
  await solveUntil(page, 'Write this in Polish');
  const word = byEn.get((await page.locator('.prompt-en').first().textContent())!.trim())!;

  // Hints reveal the start of the answer, one step at a time.
  await page.getByRole('button', { name: 'Hint', exact: true }).click();
  await expect(page.locator('.hint-line')).toContainText(`${word.pl[0]}·`);
  await expect(page.getByRole('button', { name: 'Hint 1/2' })).toBeVisible();

  // Without its Polish letters the answer isn't accepted: the learner is told which letters and can fix them.
  const bare = word.pl.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
  expect(bare).not.toBe(word.pl);
  const input = page.getByLabel('Your answer in Polish');
  await input.fill(bare);
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.nudge')).toContainText('add the Polish letters');
  await expect(page.locator('.sheet')).toHaveCount(0);
  await input.fill(word.pl);
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.sheet.good')).toContainText('Polish letters fixed');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Leaving them out a second time counts as wrong.
  await solveUntil(page, 'Write this in Polish');
  const next = byEn.get((await page.locator('.prompt-en').first().textContent())!.trim())!;
  const nextBare = next.pl.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
  await input.fill(nextBare);
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.sheet.bad')).toContainText('Polish letters missing');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Finish the lesson: both words are listed to look over again.
  await solveLesson(page, 'u01-l3');
  await expect(page.locator('.missed')).toContainText(word.pl);
  await expect(page.locator('.missed')).toContainText(next.pl);
});

test('leaving a lesson part-way asks first, and closing a review really closes it', async ({ page }) => {
  await page.goto('/lesson/u01-l1');
  // Nothing done yet: leave straight away.
  await page.getByRole('button', { name: 'Leave this lesson' }).click();
  await expect(page).toHaveURL(/\/learn$/);

  await page.goto('/lesson/u01-l1');
  await page.getByRole('button', { name: 'Next word' }).click();
  await page.getByRole('button', { name: 'Leave this lesson' }).click();
  const dialog = page.getByRole('dialog', { name: 'Leave this lesson?' });
  await expect(dialog).toContainText('Your place is kept on this device');
  await dialog.getByRole('button', { name: 'Keep going' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/lesson\/u01-l1$/);
  await page.getByRole('button', { name: 'Leave this lesson' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Leave' }).click();
  await expect(page).toHaveURL(/\/learn$/);

  // Sessions that run on their own page (review, words, pictures) used to ignore the close button.
  await page.goto('/words');
  await page.getByRole('button', { name: /^Learn \d+ new words?/ }).click();
  await page.getByRole('button', { name: 'Next word' }).click();
  await page.getByRole('button', { name: 'Leave this session' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Leave' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Słowa' })).toBeVisible();
});

test('the clock tells you the time now, in Polish', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 24, 8, 1));
  await page.goto('/tools/clock');
  const now = page.getByRole('status', { name: 'The time now' });
  await expect(now).toContainText('08:01');
  await expect(now).toContainText('Jest minuta po ósmej.');
  await page.getByLabel('Try any time').fill('19:30');
  await expect(page.locator('.big-out', { hasText: 'Jest wpół do ósmej.' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to now' }).click();
  await expect(page.getByLabel('Try any time')).toHaveValue('08:01');
});

test('signed-in learners get revision from earlier lessons mixed into a lesson', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Username').fill(uniqueName());
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/lesson/u01-l1');
  await solveLesson(page, 'u01-l1');
  await page.goto('/lesson/u01-l2');
  const seen: string[] = [];
  await solveLesson(page, 'u01-l2', async (_kind, phase) => {
    if (phase !== 'before') return;
    const tag = page.locator('.player-body .tag-revision');
    if (await tag.isVisible()) seen.push((await tag.textContent())!);
  });
  expect(seen.length).toBeGreaterThanOrEqual(2);
  expect(seen[0]).toBe('powtórka');
  await expect(page.getByText(/You also revised \d+ things? from earlier lessons/)).toBeVisible();
});

test('phrases are learnt whole: meet them, complete them, build sentences from them', async ({ page }) => {
  await page.goto('/phrases');
  await expect(page.getByRole('heading', { level: 1, name: 'Zwroty' })).toBeVisible();
  await expect(page.locator('.phrase-chunks')).toContainText('word for word');
  await page.getByRole('button', { name: /^Learn 6 new phrases/ }).click();
  await expect(page.locator('.chunk-badge')).toBeVisible();
  let chunkTiles = 0;
  await solveLesson(page, 'phrases', async (kind, phase) => {
    if (phase === 'before' && kind === 'Build this in Polish') chunkTiles += await page.locator('.bank .tile.chunk').count();
  });
  expect(chunkTiles).toBeGreaterThan(0);
  await expect(page.getByText('Added 6 phrases to your review deck')).toBeVisible();
});

test('signed-in learners are told about a badge when they earn it, and see all their badges in their profile', async ({ page }) => {
  await page.goto('/signup');
  const username = uniqueName();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(username);

  await page.goto('/lesson/u01-l1');
  await solveLesson(page, 'u01-l1');
  const toast = page.locator('.badge-toast');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('First step');
  await toast.getByRole('link', { name: 'See your badges' }).click();
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.locator('.badge-card.earned').first()).toContainText('Pierwszy krok');
  await expect(page.locator('.badge-card').filter({ hasText: 'Dziesiątka' })).toContainText('1 of 10 lessons');

  // Told once: after a reload, nothing new to announce.
  await page.goto('/');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(username);
  await expect(page.locator('.badge-toast')).toHaveCount(0);
});

test('guests do not collect badges, but are told they could', async ({ page }) => {
  await page.goto('/lesson/u01-l1');
  await solveLesson(page, 'u01-l1');
  await expect(page.locator('.badge-toast')).toHaveCount(0);
  await page.goto('/profile');
  await expect(page.locator('#badges')).toContainText('Create a free account');
  await expect(page.locator('.badge-card')).toHaveCount(0);
});

test('a lesson left part-way can be carried on from the same question, or started again', async ({ page }) => {
  await page.goto('/lesson/u01-l1');
  await solveUntil(page, 'Build this in Polish');
  const prompt = (await page.locator('.prompt-en').textContent())!.trim();
  await page.getByRole('button', { name: 'Leave this lesson' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Leave' }).click();
  await expect(page).toHaveURL(/\/learn$/);

  // Back to the same question, even after a reload.
  await page.goto('/lesson/u01-l1');
  await page.reload();
  await page.getByRole('button', { name: 'Carry on' }).click();
  await expect(page.locator('.prompt-en')).toHaveText(prompt);
  await solveLesson(page, 'u01-l1');
  await expect(page.locator('.finish h1')).toBeVisible();

  // Finished: nothing left to carry on.
  await page.goto('/lesson/u01-l1');
  await expect(page.getByRole('button', { name: 'Carry on' })).toHaveCount(0);
  await expect(page.locator('.player')).toBeVisible();
});
