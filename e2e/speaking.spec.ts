import { expect, test, type Page } from '@playwright/test';
import { solveLesson, solveUntil } from './helpers';

/**
 * Speaking. Headless Chromium has no working speech recognition, so tests stand in for it: a pretend
 * recogniser that "hears" whatever the test says next, or no recogniser at all with the Worker's
 * transcription answered by the test. The fake microphone plays a tone, which counts as speech.
 */

test.use({
  permissions: ['microphone'],
  launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
  serviceWorkers: 'block',
});

/** A pretend browser recogniser: each start() "hears" window.__heard. */
async function fakeRecogniser(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__heard = '';
    class FakeRecognition {
      lang = '';
      interimResults = false;
      maxAlternatives = 1;
      continuous = false;
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        const lang = this.lang;
        setTimeout(() => {
          const said = String(w.__heard);
          (w.__langs as string[] | undefined)?.push(lang);
          if (said && w.__android) {
            // As some Android versions do: results are never marked final, and each repeats the words before it.
            const first = { isFinal: false, length: 1, 0: { transcript: said.split(' ')[0] } };
            this.onresult?.({ resultIndex: 0, results: { length: 1, 0: first } });
            const all = { isFinal: false, length: 1, 0: { transcript: said } };
            this.onresult?.({ resultIndex: 1, results: { length: 2, 0: first, 1: all } });
          } else if (said) {
            const alt = { transcript: said, confidence: 0.9 };
            this.onresult?.({ resultIndex: 0, results: { length: 1, 0: { isFinal: true, length: 1, 0: alt } } });
          } else this.onerror?.({ error: 'no-speech' });
          this.onend?.();
        }, 50);
      }
      stop() {}
      abort() {}
    }
    w.__langs = [];
    w.webkitSpeechRecognition = FakeRecognition;
    w.SpeechRecognition = FakeRecognition;
  });
}

/** No browser recogniser, as in Firefox: clips go to the Worker. */
async function noRecogniser(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    delete w.webkitSpeechRecognition;
    delete w.SpeechRecognition;
  });
}

const hear = (page: Page, text: string) => page.evaluate((t) => ((window as unknown as { __heard: string }).__heard = t), text);
const target = async (page: Page) => (await page.locator('.say-it [lang="pl"][aria-label]').first().getAttribute('aria-label'))!;

test('a lesson asks the learner to say words aloud and checks them', async ({ page }) => {
  await fakeRecogniser(page);
  await page.goto('/lesson/u01-l1');
  await solveUntil(page, 'Say it after me');

  // A wrong word: shown in red, with what was heard, and another go.
  await hear(page, 'zupełnie coś innego');
  await page.getByRole('button', { name: 'Speak now', exact: true }).click();
  await expect(page.locator('.said-miss').first()).toBeVisible();
  await expect(page.getByText('Heard:')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

  // Then right.
  await hear(page, await target(page));
  await page.getByRole('button', { name: 'Speak now', exact: true }).click();
  await expect(page.locator('.sheet.good')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __langs: string[] }).__langs)).toContain('pl-PL');
  await page.getByRole('button', { name: 'Continue' }).click();

  // "Can't speak now" takes speaking out of the rest of the lesson, and the lesson still finishes.
  await solveUntil(page, 'Say it in Polish');
  await page.getByRole('button', { name: "Can't speak now" }).click();
  await expect(page.locator('.say-it')).toHaveCount(0);
  await solveLesson(page, 'u01-l1');
  await expect(page.locator('.finish h1')).toBeVisible();
});

test('speaking can be switched off for lessons', async ({ page }) => {
  await page.goto('/profile');
  await page.getByRole('radiogroup', { name: 'Speaking in lessons' }).getByRole('radio', { name: 'Off' }).click();
  await page.evaluate(() => {
    history.pushState(null, '', '/lesson/u01-l1');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.locator('.player')).toBeVisible();
  await expect(solveUntil(page, 'Say it after me')).rejects.toThrow(/came up|finish/);
});

test('the speaking section runs a round and reports how it went', async ({ page }) => {
  await fakeRecogniser(page);
  await page.goto('/speaking');
  await expect(page.getByRole('heading', { name: /Mówienie/ })).toBeVisible();
  await expect(page.getByText("Your browser's speech recognition checks what you say.")).toBeVisible();
  await page.getByRole('button', { name: /Tongue twisters/ }).click();
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('.say-it .instruction')).toHaveText('Say it after me');
    await hear(page, await target(page));
    await page.getByRole('button', { name: 'Speak now', exact: true }).click();
    await page.locator('.sheet.good').getByRole('button', { name: 'Continue' }).click();
  }
  await expect(page.getByText('Tongue twisters: you said 3 of 3 clearly.')).toBeVisible();
});

test('a conversation is role-played line by line', async ({ page }) => {
  await fakeRecogniser(page);
  await page.goto('/speaking');
  const first = page.locator('.conversations li').first();
  await first.getByRole('button', { name: /^Be / }).last().click();
  await expect(page.locator('.say-it .instruction')).toHaveText('Your turn: say your line');
  await expect(page.locator('.say-it .bubble').first()).toBeVisible();
  await hear(page, await target(page));
  await page.getByRole('button', { name: 'Speak now', exact: true }).click();
  await expect(page.locator('.sheet.good')).toBeVisible();
});

test('without a browser recogniser, a recording is sent to the Worker as WAV', async ({ page }) => {
  await noRecogniser(page);
  let sent = '';
  let expected = '';
  await page.route('**/api/speech/transcribe', async (route) => {
    sent = (route.request().postDataJSON() as { audio: string }).audio;
    await route.fulfill({ json: { text: expected } });
  });
  await page.goto('/speaking');
  await expect(page.getByText('checked by the app’s speech recognition')).toBeVisible();
  await page.getByRole('button', { name: /Repeat after me/ }).click();
  expected = await target(page);
  await page.getByRole('button', { name: 'Speak now', exact: true }).click();
  await page.waitForTimeout(1500);
  const stop = page.getByRole('button', { name: 'Stop: I have finished speaking' });
  if (await stop.isVisible()) await stop.click();
  await expect(page.locator('.sheet.good')).toBeVisible({ timeout: 15_000 });
  expect(sent.startsWith('UklGR')).toBe(true);
  await expect(page.locator('.sheet .answer')).toHaveText(expected);
});

test('when checking is unavailable, learners listen back and mark themselves', async ({ page }) => {
  await noRecogniser(page);
  // The local Worker has no Workers AI, as in a preview: it answers 503.
  await page.goto('/speaking');
  await page.getByRole('button', { name: /Repeat after me/ }).click();
  await page.getByRole('button', { name: 'Speak now', exact: true }).click();
  await page.waitForTimeout(1500);
  const stop = page.getByRole('button', { name: 'Stop: I have finished speaking' });
  if (await stop.isVisible()) await stop.click();
  await expect(page.getByRole('button', { name: 'Sounded right' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Play your recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Sounded right' }).click();
  await expect(page.locator('.sheet.good')).toBeVisible();
  // From now on this visit goes straight to marking yourself.
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Tap, say it, and hear yourself back')).toBeVisible();
});

test('an iPad sends its recording to the Worker even though Safari has a recogniser', async ({ page }) => {
  await fakeRecogniser(page);
  // iPadOS Safari reports itself as a Mac with a touch screen.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
  });
  let expected = '';
  let sent = 0;
  await page.route('**/api/speech/transcribe', async (route) => {
    sent++;
    await route.fulfill({ json: { text: expected } });
  });
  await page.goto('/speaking');
  await expect(page.getByText('checked by the app’s speech recognition')).toBeVisible();
  await page.getByRole('button', { name: /Repeat after me/ }).click();
  expected = await target(page);
  await page.getByRole('button', { name: 'Speak now', exact: true }).click();
  await page.waitForTimeout(1500);
  const stop = page.getByRole('button', { name: 'Stop: I have finished speaking' });
  if (await stop.isVisible()) await stop.click();
  await expect(page.locator('.sheet.good')).toBeVisible({ timeout: 15_000 });
  expect(sent).toBe(1);
  expect(await page.evaluate(() => (window as unknown as { __langs: string[] }).__langs)).toEqual([]);
});

test('speech is still checked when an Android recogniser never marks its result final', async ({ page }) => {
  await fakeRecogniser(page);
  await page.addInitScript(() => ((window as unknown as { __android: boolean }).__android = true));
  await page.goto('/speaking');
  await page.getByRole('button', { name: /Repeat after me/ }).click();
  await hear(page, await target(page));
  await page.getByRole('button', { name: 'Speak now', exact: true }).click();
  await expect(page.locator('.sheet.good')).toBeVisible();
});
