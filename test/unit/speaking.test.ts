import { describe, expect, it } from 'vitest';
import { alignWords, scoreSpeech, speechWords, wordSimilarity } from '../../src/shared/speaking';
import { LESSONS } from '../../src/content/course';
import { encodeWav } from '../../src/app/lib/listen';
import { lessonPlan, rolePlay, type Exercise } from '../../src/app/lib/exercises';
import { conversationLessons, speakingLessons, speakingRound } from '../../src/app/lib/speaking';

describe('speech scoring', () => {
  it('passes the words it was asked for, ignoring case and punctuation', () => {
    const s = scoreSpeech(['dzień dobry'], ['Dzień dobry!']);
    expect(s.pass).toBe(true);
    expect(s.score).toBe(1);
    expect(s.words).toEqual([
      { text: 'Dzień', state: 'ok' },
      { text: 'dobry!', state: 'ok' },
    ]);
  });

  it('fails a different word, even a similar short one', () => {
    expect(scoreSpeech(['kod'], ['kot']).pass).toBe(false);
    expect(scoreSpeech(['tak'], ['nie']).pass).toBe(false);
    expect(scoreSpeech([''], ['nie']).pass).toBe(false);
  });

  it('forgives a lost accent or one letter in a longer word, as a near miss', () => {
    expect(wordSimilarity('dziękuję', 'dziekuje')).toBeGreaterThan(0.5);
    expect(wordSimilarity('herbata', 'herbaty')).toBeGreaterThan(0);
    expect(wordSimilarity('kot', 'kod')).toBe(0);
    const s = scoreSpeech(['Dziekuje'], ['Dziękuję']);
    expect(s.pass).toBe(true);
    expect(s.words[0].state).toBe('close');
  });

  it('marks which words of a sentence were missed', () => {
    const s = scoreSpeech(['poproszę kawę'], ['Poproszę kawę z mlekiem.']);
    expect(s.words.map((w) => w.state)).toEqual(['ok', 'ok', 'miss', 'miss']);
    expect(s.pass).toBe(false);
    const nearly = scoreSpeech(['poproszę kawę z mlekiem'], ['Poproszę kawę z mlekiem.']);
    expect(nearly.pass).toBe(true);
  });

  it('passes a long sentence with one word misheard', () => {
    expect(scoreSpeech(['W szczebrzeszynie chrząszcz brzmi w trawie'], ['W Szczebrzeszynie chrząszcz brzmi w trzcinie.']).pass).toBe(true);
    expect(scoreSpeech(['Mam na imię Kasia, jestem w domu'], ['Mam na imię Anna i mieszkam w Krakowie.']).pass).toBe(false);
  });

  it('ignores extra words the recogniser adds', () => {
    expect(scoreSpeech(['no dzień dobry'], ['Dzień dobry']).pass).toBe(true);
    expect(alignWords(['a', 'b'], ['x', 'a', 'y', 'b'])).toEqual([1, 1]);
  });

  it('keeps word order: the same words in the wrong order do not all count', () => {
    expect(alignWords(['jestem', 'studentem'], ['studentem', 'jestem']).filter((x) => x === 1)).toHaveLength(1);
  });

  it('reads numbers written as digits', () => {
    expect(speechWords('Mam 5 kotów')).toEqual(['mam', 'pięć', 'kotów']);
    expect(scoreSpeech(['2 kawy'], ['dwie kawy']).pass).toBe(true);
  });

  it('takes the best of several guesses and several accepted answers', () => {
    const s = scoreSpeech(['czeźć', 'cześć'], ['Dzień dobry', 'Cześć']);
    expect(s.pass).toBe(true);
    expect(s.expected).toBe('Cześć');
    expect(s.heard).toBe('cześć');
  });
});

const speaks = (xs: Exercise[]) => xs.filter((e) => e.kind === 'speak');

describe('speaking in lessons', () => {
  it('asks every lesson to say a few things aloud, after the new words have been met', () => {
    for (const l of LESSONS) {
      const { exercises, introEnd } = lessonPlan(l);
      const said = speaks(exercises);
      expect(said.length, l.id).toBeGreaterThanOrEqual(2);
      expect(exercises.findIndex((e) => e.kind === 'speak'), l.id).toBeGreaterThanOrEqual(introEnd);
      // What it asks for is always something the learner can pass by saying the course's own Polish.
      for (const e of said) if (e.kind === 'speak') expect(scoreSpeech([e.pl], e.accepted).pass, `${l.id}: ${e.pl}`).toBe(true);
    }
  });

  it('leaves speaking out when it is switched off', () => {
    for (const l of LESSONS) expect(speaks(lessonPlan(l, { speaking: false }).exercises), l.id).toHaveLength(0);
  });
});

describe('speaking practice', () => {
  it('practises finished lessons, or the first lessons of the starting unit before any', () => {
    expect(speakingLessons(new Set()).map((l) => l.id)).toEqual(['u01-l1', 'u01-l2']);
    expect(speakingLessons(new Set(), 5)[0].id).toMatch(/^u05-/);
    expect(speakingLessons(new Set(['u02-l1', 'u00-l1'])).map((l) => l.id)).toEqual(['u02-l1']);
  });

  it('offers finished dialogues to role-play, or the next one before any', () => {
    expect(conversationLessons(new Set())).toEqual({ lessons: [LESSONS.find((l) => l.id === 'u02-l1')], preview: true });
    expect(conversationLessons(new Set(), 4).lessons[0].id).toBe('u05-l3');
    expect(conversationLessons(new Set(['u02-l1', 'u03-l2', 'u03-l1'])).lessons.map((l) => l.id)).toEqual(['u02-l1', 'u03-l2']);
  });

  it('makes a round of every kind that can be passed by saying the answer', () => {
    const lessons = speakingLessons(new Set(LESSONS.slice(0, 12).map((l) => l.id)));
    for (const mode of ['repeat', 'translate', 'sounds', 'phrases', 'twisters'] as const) {
      const round = speakingRound(mode, lessons);
      expect(round.length, mode).toBeGreaterThanOrEqual(3);
      for (const e of round) if (e.kind === 'speak') expect(scoreSpeech([e.pl], e.accepted).pass, `${mode}: ${e.pl}`).toBe(true);
    }
  });

  it('role-plays one speaker, cueing each line with the one before', () => {
    const l = LESSONS.find((x) => (x.dialogue?.length ?? 0) >= 4)!;
    const who = [...new Set(l.dialogue!.map((d) => d.who))];
    const mine = rolePlay(l.dialogue!, l.id, 1);
    expect(mine.length).toBe(l.dialogue!.filter((d) => d.who === who[1]).length);
    for (const e of mine) {
      expect(e.mode).toBe('reply');
      expect(e.cue?.who).toBe(who[0]);
    }
    expect(new Set(mine.map((e) => e.cardId)).size).toBe(mine.length);
  });
});

describe('recordings sent for checking', () => {
  it('are 16-bit mono WAV, which the Worker accepts', () => {
    const wav = encodeWav(new Float32Array([0, 0.5, -0.5, 1, -1]), 16_000);
    const text = (a: number, b: number) => String.fromCharCode(...wav.subarray(a, b));
    expect(text(0, 4)).toBe('RIFF');
    expect(text(8, 16)).toBe('WAVEfmt ');
    expect(wav.length).toBe(44 + 10);
    const view = new DataView(wav.buffer);
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getInt16(44 + 6, true)).toBe(0x7fff);
    expect(view.getInt16(44 + 8, true)).toBe(-0x8000);
    expect(btoa(text(0, wav.length)).startsWith('UklGR')).toBe(true);
  });
});
