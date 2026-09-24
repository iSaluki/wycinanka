import { expect, test, type Page } from '@playwright/test';
import { solveLesson } from './helpers';

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

const spokenTexts = (page: Page) => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken);

test('the voice reads only Polish: no English glosses, gaps or spelling labels', async ({ page }) => {
  await fakePolishVoice(page);
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
