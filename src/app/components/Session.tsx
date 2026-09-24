import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Rating } from '../../shared/fsrs';
import { grade, type GradeResult } from '../../shared/grade';
import { isGraded, type Exercise, type GradedExercise } from '../lib/exercises';
import { speak } from '../lib/speech';
import { navigate } from '../lib/router';
import { Build, Choose, Dialogue, Gap, Match, Meet, SpotlightView, TypeAnswer } from './Exercises';
import { IconClose } from './icons';
import { Label } from './common';

/**
 * Runs a sequence of exercises: check → feedback → continue. Wrong answers come back once at the end
 * (retrieval until correct), but only first attempts count towards the score.
 */

export interface SessionResult {
  correct: number;
  total: number;
  missed: Set<string>;
  /** Per-card rating from the first attempt (review sessions). */
  ratings: Map<string, { rating: Rating; at: number }>;
  /** Every first attempt, so callers can separate warm-ups from the lesson itself. */
  attempts: Array<{ cardId: string; pass: boolean; tag?: 'warmup' }>;
}

interface Feedback {
  pass: boolean;
  title: string;
  subtitle?: string;
  answer?: string;
  answerLang?: 'pl' | 'en';
  /** English meaning of a Polish answer, so every sentence built is also understood. */
  meaning?: string;
  note?: string;
  cardId: string;
  rating: Rating;
}

const PRAISE: Array<[string, string]> = [
  ['Dobrze!', 'Good!'],
  ['Świetnie!', 'Great!'],
  ['Brawo!', 'Well done!'],
  ['Super!', 'Super!'],
  ['Doskonale!', 'Excellent!'],
  ['Tak jest!', "That's it!"],
];

type Entry = { ex: Exercise; retry: boolean; key: number };

/** The English for a Polish answer, when the exercise has one and it isn't the answer itself. */
function meaningOf(ex: GradedExercise): string | undefined {
  switch (ex.kind) {
    case 'build':
      return ex.meaning ?? (ex.audio ? undefined : ex.prompt);
    case 'type':
      return ex.lang === 'pl' ? ex.prompt : undefined;
    case 'choose':
      return ex.promptLang === 'en' && (!ex.instruction || ex.image) ? ex.prompt : undefined;
    default:
      return undefined;
  }
}

function check(ex: GradedExercise, answer: string): { result: GradeResult | null; pass: boolean; expected: string; lang: 'pl' | 'en' } {
  switch (ex.kind) {
    case 'choose':
      return { result: null, pass: answer === ex.answer, expected: ex.answer, lang: ex.promptLang === 'en' ? 'pl' : 'en' };
    case 'gap':
      return { result: null, pass: answer === ex.answer, expected: ex.text.replace('___', ex.answer), lang: 'pl' };
    case 'type':
    case 'build': {
      const r = grade(answer, ex.accepted, ex.lang);
      return { result: r, pass: r.verdict !== 'wrong', expected: r.expected, lang: ex.lang };
    }
    case 'match':
      return { result: null, pass: true, expected: '', lang: 'pl' };
  }
}

export function Session({
  exercises,
  closeTo,
  rateable = false,
  onFinish,
}: {
  exercises: Exercise[];
  closeTo: string;
  rateable?: boolean;
  onFinish: (r: SessionResult) => void;
}) {
  const [queue, setQueue] = useState<Entry[]>(() => exercises.map((ex, i) => ({ ex, retry: false, key: i })));
  const [pos, setPos] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const results = useRef<SessionResult>({ correct: 0, total: 0, missed: new Set(), ratings: new Map(), attempts: [] });
  const matchMisses = useRef(new Set<string>());
  const started = useRef(Date.now());
  const finished = useRef(false);
  const continueRef = useRef<HTMLButtonElement>(null);

  const entry = queue[pos];
  const graded = entry && isGraded(entry.ex);
  const gradedCount = useMemo(() => exercises.filter(isGraded).length, [exercises]);

  const next = useCallback(() => {
    setFeedback(null);
    setAnswer(null);
    started.current = Date.now();
    if (pos + 1 >= queue.length) {
      if (!finished.current) {
        finished.current = true;
        onFinish(results.current);
      }
      return;
    }
    setPos(pos + 1);
  }, [pos, queue.length, onFinish]);

  const record = (cardId: string, pass: boolean, rating: Rating, retry: boolean, tag?: 'warmup') => {
    if (retry) return;
    const r = results.current;
    r.attempts.push({ cardId, pass, tag });
    r.total++;
    if (pass) r.correct++;
    else r.missed.add(cardId);
    r.ratings.set(cardId, { rating, at: Date.now() });
  };

  const submit = () => {
    if (!entry || !graded || answer === null || feedback) return;
    const ex = entry.ex as GradedExercise;
    if (ex.kind === 'match') return;
    const { result, pass, expected, lang } = check(ex, answer);
    const close = result && (result.verdict === 'accent' || result.verdict === 'typo');
    const rating: Rating = !pass ? 1 : close ? 2 : 3;
    record(ex.cardId, pass, rating, entry.retry, ex.tag);
    if (!pass && !entry.retry) setQueue((q) => [...q, { ex, retry: true, key: q.length }]);

    const [pl, en] = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    let note: string | undefined;
    if (result?.verdict === 'accent') {
      note = `Watch the Polish letters: ${result.accents.map(([p, b]) => `${p} (not ${b})`).join(', ')}.`;
    } else if (result?.verdict === 'typo') {
      note = 'Nearly — check the spelling.';
    } else if (ex.kind === 'gap' && ex.why) {
      note = ex.why;
    } else if (!pass && 'hint' in ex && ex.hint) {
      // Mistakes are the best moment to restate the rule or the sound.
      note = `Tip: ${ex.hint.replace(/[{}]/g, '')}`;
    }
    const showAnswer = !pass || close || ex.kind === 'type' || ex.kind === 'build';
    setFeedback({
      pass,
      title: pass ? (close ? 'Prawie!' : pl) : 'Niestety',
      subtitle: pass ? (close ? 'Nearly!' : en) : 'Not quite',
      answer: showAnswer ? expected : undefined,
      answerLang: lang,
      meaning: showAnswer && lang === 'pl' ? meaningOf(ex) : undefined,
      note,
      cardId: ex.cardId,
      rating,
    });
    if (ex.kind === 'choose' && ex.say) speak(ex.say);
    else if (lang === 'pl' && expected) speak(expected);
    else if (ex.kind === 'choose' && ex.promptLang === 'pl') speak(ex.prompt);
  };

  const onMatchDone = (misses: number) => {
    const ex = entry.ex as Extract<Exercise, { kind: 'match' }>;
    if (!entry.retry) {
      results.current.total++;
      if (misses === 0) results.current.correct++;
      for (const id of matchMisses.current) results.current.missed.add(id);
    }
    matchMisses.current = new Set();
    setFeedback({
      pass: misses === 0,
      title: misses === 0 ? 'Wszystko pasuje!' : 'All matched',
      subtitle: misses === 0 ? 'Everything matches!' : `${misses} mismatch${misses === 1 ? '' : 'es'} on the way`,
      cardId: ex.pairs[0]?.cardId ?? '',
      rating: 3,
    });
  };

  const setRating = (rating: Rating) => {
    if (!feedback) return;
    const r = results.current.ratings.get(feedback.cardId);
    if (r) results.current.ratings.set(feedback.cardId, { ...r, rating });
    setFeedback({ ...feedback, rating });
  };

  // Enter checks, then continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing) return;
      if (feedback) {
        e.preventDefault();
        next();
      } else if (graded && answer !== null) {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (feedback) continueRef.current?.focus({ preventScroll: true });
  }, [feedback]);

  if (!entry) return null;
  const ex = entry.ex;
  const doneSteps = Math.min(pos, gradedCount + 3);
  const steps = Math.max(queue.length, 1);

  return (
    <div className="player">
      <div className="player-top">
        <button type="button" className="icon-btn" onClick={() => navigate(closeTo)} aria-label="Leave this session">
          <IconClose />
        </button>
        <div
          className="stripes"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={steps}
          aria-valuenow={pos}
        >
          {queue.map((q, i) => (
            <span key={q.key} className={i < pos || (i === pos && feedback) ? 'on' : i === pos ? 'now' : ''} />
          ))}
        </div>
        <span className="sr-only">{doneSteps} done</span>
      </div>

      <div className="player-body" key={entry.key}>
        {ex.kind === 'meet' && <Meet items={ex.items} onDone={next} />}
        {ex.kind === 'spotlight' && (
          <>
            <SpotlightView s={ex.spotlight} />
          </>
        )}
        {ex.kind === 'dialogue' && <Dialogue lines={ex.lines} />}
        {ex.kind === 'choose' && <Choose ex={ex} locked={!!feedback} onAnswer={setAnswer} checked={feedback ? { pass: feedback.pass, answer } : undefined} />}
        {ex.kind === 'type' && <TypeAnswer ex={ex} locked={!!feedback} onAnswer={setAnswer} />}
        {ex.kind === 'build' && <Build ex={ex} locked={!!feedback} onAnswer={setAnswer} />}
        {ex.kind === 'gap' && <Gap ex={ex} locked={!!feedback} onAnswer={setAnswer} checked={feedback ? { pass: feedback.pass, answer } : undefined} />}
        {ex.kind === 'match' && !feedback && (
          <Match ex={ex} onDone={onMatchDone} onMiss={(id) => matchMisses.current.add(id)} />
        )}
        {ex.kind === 'match' && feedback && <div className="instruction">Pairs matched</div>}
        {entry.retry && !feedback && <p className="muted">One more try at this one.</p>}
      </div>

      <div className="dock">
        {feedback ? (
          <div className={`sheet ${feedback.pass ? 'good' : 'bad'}`} role="status" aria-live="polite">
            <div className="verdict">
              {feedback.title}
              {feedback.subtitle && <small>{feedback.subtitle}</small>}
            </div>
            {feedback.answer && (
              <div>
                <Label pl={feedback.pass ? 'odpowiedź' : 'poprawnie'} en={feedback.pass ? 'answer' : 'correct answer'} />
                <div className="answer" lang={feedback.answerLang}>
                  {feedback.answer}
                </div>
                {feedback.meaning && <div className="meaning">{feedback.meaning}</div>}
              </div>
            )}
            {feedback.note && <p className="why">{feedback.note}</p>}
            {rateable && !entry.retry && (
              <div className="ratings" role="group" aria-label="How well did you know it?">
                <span>How was it?</span>
                {(
                  [
                    [1, 'Forgot'],
                    [2, 'Hard'],
                    [3, 'Good'],
                    [4, 'Easy'],
                  ] as const
                ).map(([r, label]) => (
                  <button key={r} type="button" aria-pressed={feedback.rating === r} onClick={() => setRating(r)}>
                    {label}
                  </button>
                ))}
              </div>
            )}
            <button ref={continueRef} type="button" className={`btn block ${feedback.pass ? 'good' : 'bad'}`} onClick={next}>
              Continue
            </button>
          </div>
        ) : ex.kind === 'spotlight' ? (
          <button type="button" className="btn block" onClick={next}>
            Got it
          </button>
        ) : ex.kind === 'dialogue' ? (
          <button type="button" className="btn block" onClick={next}>
            Finish
          </button>
        ) : graded && ex.kind !== 'match' ? (
          <button type="button" className="btn block" onClick={submit} disabled={answer === null}>
            Check
          </button>
        ) : null}
      </div>
    </div>
  );
}
