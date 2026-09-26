import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { audioId } from '../src/app/lib/speech';
import { solveLesson, solveUntil } from './helpers';

/**
 * Headless Chromium has no Polish voice, so give it a pretend one that records what it is asked to say.
 * The app then behaves as it does on a phone with Polish installed: audio prompts and autoplay included.
 */
export async function fakePolishVoice(page: Page) {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    (window as unknown as { __spoken: string[] }).__spoken = spoken;
    const voice = { name: 'Test Polish', lang: 'pl-PL', default: true, localService: true, voiceURI: 'test-pl' };
    class Utterance {
      text: string;
      voice: unknown = null;
      lang = '';
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance });
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [voice],
        addEventListener: () => undefined,
        cancel: () => undefined,
        speak: (u: Utterance) => {
          spoken.push(u.text);
          setTimeout(() => u.onend?.(), 0);
        },
      },
    });
  });
}

// The service worker fetches the list of recordings itself, out of reach of page.route(): keep it out of these tests.
test.use({ serviceWorkers: 'block' });

const spokenTexts = (page: Page) => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken);

test('the voice reads only Polish: no English glosses, gaps or spelling labels', async ({ page }) => {
  await fakePolishVoice(page);
  // Recordings are named by a hash of their text; hide them so every text reaches the voice we can inspect.
  await page.route('**/voice-index.json', (r) => r.fulfill({ status: 404 }));
  await page.goto('/lesson/u00-l2');
  await solveLesson(page, 'u00-l2');
  await page.goto('/lesson/u00-l6');
  await solveLesson(page, 'u00-l6');
  const spoken = await spokenTexts(page);
  expect(spoken.length).toBeGreaterThan(10);
  for (const s of spoken) {
    expect(s, s).not.toMatch(/[()_/→+]/);
    expect(s, s).not.toMatch(/\b(water|small|night|at the end|in "van")\b/i);
  }
  // Filled-in gaps are read as the whole Polish word.
  expect(spoken).toContain('woda');
});

test('building a sentence always shows what it means in English', async ({ page }) => {
  await fakePolishVoice(page);
  await page.goto('/lesson/u01-l1');
  let builds = 0;
  await solveLesson(page, 'u01-l1', async (kind, phase) => {
    if (phase !== 'after' || !kind.startsWith('Build')) return;
    builds++;
    const meaning = page.locator('.sheet .meaning');
    await expect(meaning).toBeVisible();
    expect((await meaning.textContent())!.trim()).toMatch(/^[A-Z'"]/);
    if (kind === 'Build what you hear') await expect(page.locator('.build-meaning')).toBeVisible();
  });
  expect(builds).toBeGreaterThan(0);
});

test('course text plays the recorded voice; text made up on the spot uses the device voice', async ({ page, request }) => {
  const index = JSON.parse(readFileSync('public/voice-index.json', 'utf8')) as { voice: string };
  await fakePolishVoice(page);
  // Headless Chromium can't be heard: note what each <audio> is asked to play, and finish at once.
  await page.addInitScript(() => {
    const played: string[] = [];
    (window as unknown as { __played: string[] }).__played = played;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      played.push(new URL(this.src).pathname);
      setTimeout(() => this.onended?.(new Event('ended')), 0);
      return Promise.resolve();
    };
  });
  const played = () => page.evaluate(() => (window as unknown as { __played: string[] }).__played);

  await page.goto('/lesson/u01-l1');
  await page.getByRole('button', { name: 'Play: tak', exact: true }).click();
  const file = `/voice/${index.voice}/${audioId('tak')}.mp3`;
  await expect.poll(played).toContain(file);
  expect(await spokenTexts(page)).not.toContain('tak');
  const res = await request.get(file);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('audio/mpeg');

  // A number typed into the tools has no recording.
  await page.goto('/tools/numbers');
  const input = page.locator('#num');
  await input.fill('4321');
  await page.getByRole('button', { name: /^Play: cztery tysiące/ }).first().click();
  await expect.poll(() => spokenTexts(page)).toContainEqual(expect.stringMatching(/^cztery tysiące/));
});

test('Polish words in culture notes say themselves when tapped, and articles have credited pictures', async ({ page }) => {
  const index = JSON.parse(readFileSync('public/voice-index.json', 'utf8')) as { voice: string };
  await page.addInitScript(() => {
    const played: string[] = [];
    (window as unknown as { __played: string[] }).__played = played;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      played.push(new URL(this.src).pathname);
      setTimeout(() => this.onended?.(new Event('ended')), 0);
      return Promise.resolve();
    };
  });
  await page.goto('/culture/wigilia');
  const picture = page.locator('.culture-picture img');
  await expect(picture).toBeVisible();
  expect(await picture.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.culture-picture .credit')).toContainText('Wikimedia Commons');

  await page.locator('.culture-article p').getByRole('button', { name: 'barszcz: hear it' }).first().click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __played: string[] }).__played)).toContain(`/voice/${index.voice}/${audioId('barszcz')}.mp3`);
});

test('building a sentence reads it out as it appears, and each tile as it goes into place', async ({ page }) => {
  await fakePolishVoice(page);
  await page.route('**/voice-index.json', (r) => r.fulfill({ status: 404 }));
  await page.goto('/lesson/u01-l1');
  await solveUntil(page, 'Build this in Polish');
  const prompt = (await page.locator('.prompt-en').textContent())!.trim();
  // The sentence itself, in Polish, is heard once the exercise is up.
  await expect.poll(async () => (await spokenTexts(page)).length).toBeGreaterThan(0);
  const before = await spokenTexts(page);
  expect(before[before.length - 1]).toMatch(/\p{L}/u);
  expect(before[before.length - 1]).not.toBe(prompt);
  const tile = page.locator('.bank .tile:not(.used)').first();
  const word = (await tile.textContent())!.trim();
  await tile.click();
  await expect.poll(async () => (await spokenTexts(page)).at(-1)).toBe(word);
});
