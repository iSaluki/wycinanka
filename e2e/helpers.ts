import { expect, type Page } from '@playwright/test';
import { LESSONS } from '../src/content/course';
import { mergeChunks, tokenise } from '../src/app/lib/exercises';
import { chunkCore, CHUNKS } from '../src/content/chunks';
import { PICTURES } from '../src/content/pictures';
import { respell } from '../src/shared/phonetics';

// A course-wide answer key: warm-ups can ask about any earlier lesson.
const phonics = LESSONS.filter((l) => l.phonics).flatMap((l) => l.items);
const items = LESSONS.filter((l) => !l.phonics).flatMap((l) => l.items);
const byPl = new Map(items.map((i) => [i.pl, i]));
const phonicsByPl = new Map(phonics.map((i) => [i.pl, i]));
const byEn = new Map(items.map((i) => [i.en, i]));
const phonicsByEn = new Map(phonics.map((i) => [i.en, i]));
const sentences = LESSONS.flatMap((l) => l.sentences);
const sentByEn = new Map(sentences.map((s) => [s.en, s]));
const sentByPl = new Map(sentences.map((s) => [s.pl, s]));
const drills = LESSONS.flatMap((l) => l.drills);
const chunkByPl = new Map(CHUNKS.map((c) => [c.pl, c]));
const chunkByEn = new Map(CHUNKS.map((c) => [c.en, c]));
const picturesByEn = new Map(PICTURES.map((p) => [p.en, p]));
const chunkByExample = new Map(CHUNKS.flatMap((c) => (c.ex ? [[c.ex[1], c] as const] : [])));

/** Instructions of speaking exercises. */
export const SPEAKING = ['Say it after me', 'Say it in Polish', 'Read it aloud', 'Your turn: say your line'];

/** Answer every exercise in a lesson or session correctly, using the course content as the answer key. */
export async function solveLesson(page: Page, _lessonId: string, onStep?: (kind: string, phase: 'before' | 'after') => Promise<void>) {
  const optionTexts = () =>
    page.locator('.options button.option').evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/^\d/, '').trim()));
  const clickOption = async (text: string) => {
    const options = page.locator('.options button.option');
    const texts = await optionTexts();
    const i = texts.indexOf(text);
    expect(i, `option "${text}" in ${JSON.stringify(texts)}`).toBeGreaterThanOrEqual(0);
    await options.nth(i).click();
  };
  const spokenPrompt = async () => {
    const label = await page.locator('.prompt-row .speak').first().getAttribute('aria-label');
    return label!.replace(/^Play: /, '');
  };
  const text = async (sel: string) => (await page.locator(sel).first().textContent())!.trim();

  for (let step = 0; step < 120; step++) {
    if (await page.locator('.finish h1').isVisible()) return;
    // Sessions outside lessons (words, pictures, phrases) end by returning to their page.
    if (step > 0 && !(await page.locator('.player').count())) return;
    if (await page.locator('.sheet').isVisible()) {
      await page.getByRole('button', { name: 'Continue' }).click();
      continue;
    }
    for (const name of ['Next word', 'Next phrase', 'Start practising', 'Practise these', 'Practise it', 'Got it', 'Finish']) {
      const b = page.getByRole('button', { name, exact: true });
      if (await b.isVisible()) {
        await b.click();
        break;
      }
    }
    const instruction = page.locator('.player-body .instruction').first();
    if (!(await instruction.isVisible())) continue;
    const kind = (await instruction.textContent())!.replace(/^(rozgrzewka|powtórka|obrazki)/, '').trim();
    await onStep?.(kind, 'before');

    if (kind === 'How does it sound?') {
      await clickOption(phonicsByPl.get(await text('.prompt-pl'))!.en);
    } else if (kind === 'Which spelling makes this sound?') {
      await clickOption(phonicsByEn.get(await text('.prompt-en'))!.pl);
    } else if (kind.startsWith('How do you say it?')) {
      await clickOption(respell(await text('.prompt-pl')));
    } else if (kind === 'Which word do you hear?') {
      await clickOption(await spokenPrompt());
    } else if (kind === 'What does this mean?' || kind === 'Listen. What does it mean?') {
      await clickOption(byPl.get(await spokenPrompt())!.en);
    } else if (kind === 'What does this phrase mean?') {
      await clickOption(chunkByPl.get(await text('.prompt-pl'))!.en);
    } else if (kind === 'What is this in Polish?') {
      // A picture flashcard, or a lesson word shown as its picture: the image's alt text is the English.
      const en = (await page.locator('.picture-prompt img').getAttribute('alt'))!;
      const texts = await optionTexts();
      await clickOption([byEn.get(en)?.pl, picturesByEn.get(en)?.pl].find((pl) => pl && texts.includes(pl))!);
    } else if (kind === 'Choose the Polish') {
      await clickOption(byEn.get(await text('.prompt-en'))!.pl);
    } else if (kind === 'Write this in Polish') {
      const en = await text('.prompt-en');
      await page.getByLabel('Your answer in Polish').fill(byEn.get(en)?.pl ?? chunkCore(chunkByEn.get(en)!));
    } else if (kind === 'Write this in English') {
      await page.getByLabel('Your answer in English').fill(sentByPl.get(await text('.prompt-pl'))!.en);
    } else if (kind === 'Build this in Polish' || kind === 'Build what you hear') {
      const en = kind === 'Build what you hear' ? '' : await text('.prompt-en');
      const chunk = chunkByExample.get(en);
      const tiles = chunk
        ? mergeChunks(tokenise(chunk.ex![0]), [{ core: tokenise(chunkCore(chunk)).map((w) => w.toLocaleLowerCase('pl')) }])
        : mergeChunks(tokenise((kind === 'Build what you hear' ? sentByPl.get(await spokenPrompt()) : sentByEn.get(en))!.pl));
      for (const t of tiles) await page.locator('.bank .tile:not(.used)', { hasText: new RegExp(`^${t}$`) }).first().click();
    } else if (kind === 'Match the pairs') {
      const pairs = await page.locator('.match .col').first().locator('button').allTextContents();
      const shown = new Set(await page.locator('.match .col').nth(1).locator('button').allTextContents());
      for (const pl of pairs) {
        // Some spellings are both a word and a sound ("a" = "and", or the vowel): pick the meaning on screen.
        const en = [phonicsByPl.get(pl)?.en, byPl.get(pl)?.en].find((x) => x && shown.has(x))!;
        await page.locator('.match .col').first().getByRole('button', { name: pl, exact: true }).click();
        await page.locator('.match .col').nth(1).getByRole('button', { name: en, exact: true }).click();
      }
      await expect(page.locator('.sheet')).toBeVisible();
      continue;
    } else if (SPEAKING.includes(kind)) {
      // Headless browsers have no microphone: speaking has its own tests (speaking.spec.ts).
      await page.getByRole('button', { name: 'Skip', exact: true }).click();
      continue;
    } else if (kind === 'Fill the gap') {
      const en = await text('.player-body p.muted');
      const gapText = (await text('.gap-text')).replace(/\s+/g, ' ');
      const d = drills.find((x) => x.en === en && x.text.replace('___', '').replace(/\s+/g, ' ').trim() === gapText.replace(/ /g, '').trim()) ??
        drills.find((x) => x.en === en);
      if (d) await clickOption(d.answer);
      else {
        // A phrase with one word missing: the answer is the phrase's word the gapped text lacks.
        const missing = tokenise(chunkCore(chunkByEn.get(en)!));
        for (const w of tokenise(gapText)) if (missing.includes(w)) missing.splice(missing.indexOf(w), 1);
        await clickOption(missing[0]);
      }
    } else {
      continue;
    }
    await page.getByRole('button', { name: 'Check' }).click();
    await expect(page.locator('.sheet.good'), `step ${step}: ${kind}`).toBeVisible();
    await onStep?.(kind, 'after');
  }
  throw new Error('Lesson did not finish');
}

class Reached extends Error {}

/** Answer correctly until an exercise with this instruction comes up, and leave it unanswered. */
export async function solveUntil(page: Page, instruction: string) {
  try {
    await solveLesson(page, '', async (kind, phase) => {
      if (phase === 'before' && kind === instruction) throw new Reached();
    });
  } catch (e) {
    if (e instanceof Reached) return;
    throw e;
  }
  throw new Error(`No "${instruction}" exercise came up`);
}
