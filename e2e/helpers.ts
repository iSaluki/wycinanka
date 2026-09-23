import { expect, type Page } from '@playwright/test';
import { getLesson } from '../src/content/course';
import { tokenise } from '../src/app/lib/exercises';

/** Answer every exercise in a lesson correctly, using the course content as the answer key. */
export async function solveLesson(page: Page, lessonId: string, onStep?: (kind: string, phase: 'before' | 'after') => Promise<void>) {
  const lesson = getLesson(lessonId)!;
  const byPl = new Map(lesson.items.map((i) => [i.pl, i]));
  const byEn = new Map(lesson.items.map((i) => [i.en, i]));
  const sentByEn = new Map(lesson.sentences.map((s) => [s.en, s]));
  const sentByPl = new Map(lesson.sentences.map((s) => [s.pl, s]));
  const drillByEn = new Map(lesson.drills.map((d) => [d.en, d]));

  const clickOption = async (text: string, scope = page.locator('.options')) => {
    const options = scope.locator('button.option');
    const texts = await options.evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/^\d/, '').trim()));
    const i = texts.indexOf(text);
    expect(i, `option "${text}" in ${JSON.stringify(texts)}`).toBeGreaterThanOrEqual(0);
    await options.nth(i).click();
  };
  const spokenPrompt = async () => {
    const label = await page.locator('.prompt-row .speak').first().getAttribute('aria-label');
    return label!.replace(/^Play: /, '');
  };

  for (let step = 0; step < 80; step++) {
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
    const kind = (await instruction.textContent())!.trim();
    await onStep?.(kind, 'before');

    if (kind === 'What does this mean?' || kind === 'Listen. What does it mean?') {
      await clickOption(byPl.get(await spokenPrompt())!.en);
    } else if (kind === 'Choose the Polish') {
      await clickOption(byEn.get((await page.locator('.prompt-en').textContent())!)!.pl);
    } else if (kind === 'Write this in Polish') {
      await page.getByLabel('Your answer in Polish').fill(byEn.get((await page.locator('.prompt-en').textContent())!)!.pl);
    } else if (kind === 'Write this in English') {
      await page.getByLabel('Your answer in English').fill(sentByPl.get((await page.locator('.prompt-pl').textContent())!)!.en);
    } else if (kind === 'Build this in Polish' || kind === 'Build what you hear') {
      const s = kind === 'Build what you hear' ? sentByPl.get(await spokenPrompt())! : sentByEn.get((await page.locator('.prompt-en').textContent())!)!;
      for (const t of tokenise(s.pl)) await page.locator('.bank .tile:not(.used)', { hasText: new RegExp(`^${t}$`) }).first().click();
    } else if (kind === 'Match the pairs') {
      const pairs = await page.locator('.match .col').first().locator('button').allTextContents();
      for (const pl of pairs) {
        await page.locator('.match .col').first().getByRole('button', { name: pl, exact: true }).click();
        await page.locator('.match .col').nth(1).getByRole('button', { name: byPl.get(pl)!.en, exact: true }).click();
      }
      await expect(page.locator('.sheet')).toBeVisible();
      continue;
    } else if (kind === 'Fill the gap') {
      await clickOption(drillByEn.get((await page.locator('.player-body p.muted').first().textContent())!)!.answer);
    } else {
      continue;
    }
    await page.getByRole('button', { name: 'Check' }).click();
    await expect(page.locator('.sheet.good'), `step ${step}: ${kind}`).toBeVisible();
    await onStep?.(kind, 'after');
  }
  throw new Error('Lesson did not finish');
}
