import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getCard, LESSONS } from '../../src/content/course';
import { CHUNK_DECKS } from '../../src/content/chunks';
import { PICTURES } from '../../src/content/pictures';
import { FREQUENCY } from '../../src/content/frequency';
import { chunkLearnSession, lessonForSpeaker, lessonPlan, reviewExercise, rolePlay, type Exercise } from '../../src/app/lib/exercises';
import { speakingRound, type SpeakingMode } from '../../src/app/lib/speaking';
import { audioId, audioKey } from '../../src/app/lib/speech';
import { femaleTexts, spokenTexts } from '../../src/app/lib/spoken';
import { voiceFor, voiceOfSpeaker } from '../../src/app/lib/voices';

const index = JSON.parse(readFileSync('public/voice-index.json', 'utf8')) as { voice: string; ids: string[]; female: { voice: string; ids: string[] } };
const recorded = new Set(index.ids);

/** What an exercise plays in the second (female) voice, picked as the components pick it. */
function femaleBy(e: Exercise): string[] {
  const f = (text: string, listening = false) => (voiceFor(text, listening) === 'f' ? [text] : []);
  switch (e.kind) {
    case 'dialogue':
    case 'listen':
      return e.lines.filter((l) => voiceOfSpeaker(l.who) === 'f').map((l) => l.pl);
    case 'choose':
      if (!e.audio && e.promptLang !== 'pl') return [];
      return e.voice ? (e.voice === 'f' ? [e.say ?? e.prompt] : []) : f(e.say ?? e.prompt, !!e.audio);
    case 'build':
      return e.audio ? f(e.audio, true) : [];
    case 'type':
      return e.audio ? f(e.audio, true) : [];
    case 'speak':
      return e.cue && voiceOfSpeaker(e.cue.who) === 'f' ? [e.cue.pl] : [];
    default:
      return [];
  }
}

/** The Polish an exercise can read aloud, as the player and its feedback do. */
function spokenBy(e: Exercise): string[] {
  switch (e.kind) {
    case 'meet':
      return e.items.flatMap((i) => (i.ex ? [...i.ex, i.ex.join(', ')] : [i.pl]));
    case 'dialogue':
    case 'listen':
      return e.lines.map((l) => l.pl);
    case 'spotlight':
      return (e.spotlight.examples ?? []).map(([pl]) => pl);
    case 'match':
      return e.pairs.map((p) => p.say ?? p.pl);
    case 'choose':
      return e.promptLang === 'pl' ? [e.say ?? e.prompt] : [e.say ?? e.answer];
    case 'gap':
      return [e.text.replace('___', e.answer)];
    case 'type':
      return e.lang === 'pl' ? e.accepted : [e.prompt];
    case 'build':
      return [...e.accepted, ...e.tiles, ...(e.audio ? [e.audio] : [])];
    case 'speak':
      return [e.pl, ...(e.cue ? [e.cue.pl] : [])];
  }
}

describe('recorded voice', () => {
  it('names each recording by a stable hash of its text, with no two texts sharing one', () => {
    expect(audioId('Dzień dobry')).toBe(audioId('Dzień dobry'));
    expect(audioId('Dzień dobry')).not.toBe(audioId('dzień dobry'));
    expect(audioId('Dzień dobry')).toMatch(/^[0-9a-z]+$/);
    const texts = spokenTexts();
    expect(new Set(texts.map(audioId)).size).toBe(texts.length);
  });

  it('has a recording of every fixed Polish text (run `npm run voice` after changing content)', () => {
    const missing = spokenTexts().filter((t) => !recorded.has(audioId(t)));
    expect(missing, 'Texts without a recording: run `npm run voice`').toEqual([]);
  });

  it('has a file for every recording it lists, and lists no stale ones', () => {
    const wanted = new Set(spokenTexts().map(audioId));
    for (const id of index.ids) {
      expect(existsSync(`public/voice/${index.voice}/${id}.mp3`), id).toBe(true);
      expect(wanted.has(id), `${id} is no longer in the course: run \`npm run voice\``).toBe(true);
    }
  });

  it('records the second voice for every text it reads, with no stale files', () => {
    const wanted = new Set(femaleTexts().map(audioId));
    const have = new Set(index.female.ids);
    expect([...wanted].filter((id) => !have.has(id)), 'run `npm run voice`').toEqual([]);
    for (const id of have) {
      expect(existsSync(`public/voice/${index.female.voice}/${id}.mp3`), id).toBe(true);
      expect(wanted.has(id), `${id} is no longer read by the second voice: run \`npm run voice\``).toBe(true);
    }
  });

  it('covers everything lessons, phrases and reviews read aloud', () => {
    const texts = new Set(spokenTexts());
    const female = new Set(femaleTexts());
    const check = (e: Exercise, where: string) => {
      for (const t of spokenBy(e)) expect(texts.has(audioKey(t)), `${where}: "${t}"`).toBe(true);
      for (const t of femaleBy(e)) expect(female.has(audioKey(t)), `${where} (second voice): "${t}"`).toBe(true);
    };
    for (const l of LESSONS)
      for (const speaker of [undefined, 'f'] as const)
        for (let run = 0; run < 3; run++) for (const e of lessonPlan(lessonForSpeaker(l, speaker)).exercises) check(e, `${l.id} (${speaker ?? 'default'})`);
    for (const d of CHUNK_DECKS) for (const e of chunkLearnSession(d.chunks)) check(e, d.id);
    // Speaking practice plays the voice for everything it asks the learner to say.
    const courseLessons = LESSONS.filter((l) => !l.phonics);
    for (const mode of ['repeat', 'translate', 'sounds', 'phrases', 'twisters'] as SpeakingMode[])
      for (const speaker of [undefined, 'f'] as const)
        for (let run = 0; run < 5; run++) for (const e of speakingRound(mode, courseLessons, speaker)) check(e, `speaking: ${mode}`);
    for (const l of LESSONS)
      for (const as of [0, 1]) for (const e of rolePlay(l.dialogue ?? [], l.id, as)) check(e, `${l.id} role-play`);
    const cards = [...LESSONS.flatMap((l) => [...l.items, ...l.sentences, ...l.drills].map((x) => x.id)), ...PICTURES.map((p) => p.id), ...FREQUENCY.map((w) => w.id), ...CHUNK_DECKS.flatMap((d) => d.chunks.map((c) => c.id))];
    for (const id of cards) for (const reps of [0, 1, 2, 3, 4]) for (const speaker of [undefined, 'm', 'f'] as const) check(reviewExercise(getCard(id)!, reps, id, speaker), id);
    // It builds every exercise the app can make, several times over: slow, but that is the point.
  }, 60_000);
});
