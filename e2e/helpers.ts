import { expect, type Page } from '@playwright/test';
import { LESSONS } from '../src/content/course';
import { tokenise } from '../src/app/lib/exercises';
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

/** Answer every exercise in a lesson or session correctly, using the course content as the answer key. */
export async function solveLesson(page: Page, _lessonId: string, onStep?: (kind: string, phase: 'before' | 'after') => Promise<void>) {
  const clickOption = async (text: string) => {
    const options = page.locator('.options button.option');
    const texts = await options.evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/^\d/, '').trim()));
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
    if (await page.locator('.sheet').isVisible()) {
      await page.getByRole('button', { name: 'Continue' }).click();
      continue;
    }
    for (const name of ['Next word', 'Start practising', 'Got it', 'Finish']) {
      const b = page.getByRole('button', { name, exact: true });
      if (await b.isVisible()) {
        await b.click();
        break;
      }
    }
    const instruction = page.locator('.player-body .instruction').first();
    if (!(await instruction.isVisible())) continue;
    const kind = (await instruction.textContent())!.replace(/^rozgrzewka/, '').trim();
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
    } else if (kind === 'Choose the Polish') {
      await clickOption(byEn.get(await text('.prompt-en'))!.pl);
    } else if (kind === 'Write this in Polish') {
      await page.getByLabel('Your answer in Polish').fill(byEn.get(await text('.prompt-en'))!.pl);
    } else if (kind === 'Write this in English') {
      await page.getByLabel('Your answer in English').fill(sentByPl.get(await text('.prompt-pl'))!.en);
    } else if (kind === 'Build this in Polish' || kind === 'Build what you hear') {
      const prompt = kind === 'Build what you hear' ? sentByPl.get(await spokenPrompt()) : sentByEn.get(await text('.prompt-en'));
      const s = prompt!;
      for (const t of tokenise(s.pl)) await page.locator('.bank .tile:not(.used)', { hasText: new RegExp(`^${t}$`) }).first().click();
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
    } else if (kind === 'Fill the gap') {
      const en = await text('.player-body p.muted');
      const gapText = (await text('.gap-text')).replace(/\s+/g, ' ');
      const d = drills.find((x) => x.en === en && x.text.replace('___', '').replace(/\s+/g, ' ').trim() === gapText.replace(/ /g, '').trim()) ??
        drills.find((x) => x.en === en)!;
      await clickOption(d.answer);
    } else {
      continue;
    }
    await page.getByRole('button', { name: 'Check' }).click();
    await expect(page.locator('.sheet.good'), `step ${step}: ${kind}`).toBeVisible();
    await onStep?.(kind, 'after');
  }
  throw new Error('Lesson did not finish');
}
