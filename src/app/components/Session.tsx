import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Rating } from '../../shared/fsrs';
import { lessonOfCard, LESSONS } from '../../content/course';
import { isKnownForm } from '../../content/lexicon';
import { grade, passes, type GradeResult } from '../../shared/grade';
import { hintLimit, isGraded, type Exercise, type ExtraTag, type GradedExercise } from '../lib/exercises';
import { pauseSpeaking } from '../lib/listen';
import { playCorrect, playFinished, playWrong, soundEffectsOn } from '../lib/sfx';
import { speak } from '../lib/speech';
import { Build, Choose, Dialogue, Gap, Listen, Match, Meet, SpotlightView, TypeAnswer } from './Exercises';
import { IconClose } from './icons';
import { SayIt, type SpokenResult } from './Speaking';
import { Label } from './common';
import type { SavedSession } from '../lib/resume';

/**
 * Runs a sequence of exercises: check → feedback → continue. Wrong answers come back once, a few questions
 * later (retrieval until correct, while it's still fresh), but only first attempts count towards the score.
 */

/** How many questions later a missed one comes back. */
const RETRY_GAP = 3;

export interface SessionResult {
  correct: number;
  total: number;
  missed: Set<string>;
  /** Per-card rating from the first attempt (review sessions). */
  ratings: Map<string, { rating: Rating; at: number }>;
  /** Every first attempt, so callers can separate warm-ups from the lesson itself. */
  attempts: Array<{ cardId: string; pass: boolean; tag?: ExtraTag; helped?: boolean }>;
  /** Speaking: things said aloud, and how many of them were heard right (or marked right). Never scored. */
  spoken: { tried: number; said: number };
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

/**
 * The grammar rule behind an expected form, from a drill that practises it: the card's own lesson first, then
 * any earlier one. "Feminine -a becomes -ę after poproszę" says more than "check the spelling".
 */
function ruleFor(cardId: string, forms: string[]): string | undefined {
  const own = lessonOfCard(cardId);
  const lessons = own ? [own, ...LESSONS.slice(0, LESSONS.indexOf(own)).reverse()] : LESSONS;
  for (const l of lessons) {
    const d = l.drills.find((d) => d.why && forms.some((f) => d.answer.toLocaleLowerCase('pl') === f));
    if (d) return d.why;
  }
  return undefined;
}

function check(ex: GradedExercise, answer: string): { result: GradeResult | null; pass: boolean; expected: string; lang: 'pl' | 'en' } {
  switch (ex.kind) {
    case 'choose':
      return { result: null, pass: answer === ex.answer, expected: ex.answer, lang: ex.promptLang === 'en' ? 'pl' : 'en' };
    case 'gap':
      return { result: null, pass: answer === ex.answer, expected: ex.text.replace('___', ex.answer), lang: 'pl' };
    case 'type':
    case 'build': {
      const r = grade(answer, ex.accepted, ex.lang, ex.lang === 'pl' ? isKnownForm : undefined);
      // In dictation the spelling is what's being practised: a slip isn't forgiven as a typo.
      const pass = ex.kind === 'type' && ex.audio ? r.verdict === 'correct' : passes(r.verdict);
      return { result: r, pass, expected: r.expected, lang: ex.lang };
    }
    case 'match':
      return { result: null, pass: true, expected: '', lang: 'pl' };
  }
}

/** A Polish sentence whose words can each be tapped to hear them on their own. */
function TapWords({ text }: { text: string }) {
  return (
    <span className="tap-words">
      {text.split(/\s+/).map((w, i) => (
        <button key={i} type="button" onClick={() => speak(w.replace(/[.,!?…:;„”"]/g, ''))} aria-label={`Hear “${w}”`}>
          {w}
        </button>
      ))}
    </span>
  );
}

/**
 * Asks before leaving a session part-way through. A native <dialog> gives focus trapping, Escape to cancel
 * and a backdrop for free.
 */
function ConfirmLeave({ what, note, onStay, onLeave }: { what: string; note?: string; onStay: () => void; onLeave: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d || d.open) return;
    // Safari before 15.4 has no showModal(); an open, non-modal dialog still works there.
    if (typeof d.showModal === 'function') d.showModal();
    else d.setAttribute('open', '');
  }, []);
  return (
    <dialog ref={ref} className="confirm" aria-labelledby="leave-title" aria-describedby="leave-body" onCancel={(e) => (e.preventDefault(), onStay())}>
      <h2 id="leave-title">Leave this {what}?</h2>
      <p id="leave-body">{note ?? `Are you sure? Your progress in this ${what} will be lost if you leave now.`}</p>
      <div className="row wrap">
        <button type="button" className="btn" onClick={onStay} autoFocus>
          Keep going
        </button>
        <button type="button" className="btn quiet" onClick={onLeave}>
          Leave
        </button>
      </div>
    </dialog>
  );
}

export function Session({
  exercises,
  onClose,
  what = 'session',
  rateable = false,
  pausableSpeaking = true,
  onFinish,
  leaveNote,
  banner,
  resumeFrom,
  onProgress,
}: {
  exercises: Exercise[];
  /** A session left part-way, to carry on from instead of starting at the first exercise. */
  resumeFrom?: SavedSession | null;
  /** Called after every step with everything needed to resume from there. */
  onProgress?: (s: SavedSession) => void;
  /** Called when the learner leaves early, after confirming if they had started, with what was answered so far. */
  onClose: (partial: SessionResult) => void;
  /** What the leave prompt says is kept, when the caller saves partial results. */
  leaveNote?: string;
  /** A line under the progress bar, such as which gendered forms are shown. */
  banner?: ReactNode;
  /** What to call this in the leave prompt: "lesson", "review"… */
  what?: string;
  rateable?: boolean;
  /** Offer "Can't speak now", which leaves speaking out for a while (lessons; not the speaking section itself). */
  pausableSpeaking?: boolean;
  onFinish: (r: SessionResult) => void;
}) {
  const [queue, setQueue] = useState<Entry[]>(() => resumeFrom?.queue ?? exercises.map((ex, i) => ({ ex, retry: false, key: i })));
  const [pos, setPos] = useState(resumeFrom?.pos ?? 0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const results = useRef<SessionResult>(
    resumeFrom
      ? {
          correct: resumeFrom.correct,
          total: resumeFrom.total,
          missed: new Set(resumeFrom.missed),
          ratings: new Map(resumeFrom.ratings),
          attempts: resumeFrom.attempts,
          spoken: resumeFrom.spoken,
        }
      : { correct: 0, total: 0, missed: new Set(), ratings: new Map(), attempts: [], spoken: { tried: 0, said: 0 } },
  );
  const matchMisses = useRef(new Set<string>());
  const started = useRef(Date.now());
  const finished = useRef(false);
  const continueRef = useRef<HTMLButtonElement>(null);
  const sayLater = useRef<number | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  // Help given on the current question: hints taken, and whether missing Polish letters were pointed out.
  const [hints, setHints] = useState(0);
  const [accentNudge, setAccentNudge] = useState<Array<[string, string]> | null>(null);
  // Attempts at the current speaking exercise.
  const [spokenTries, setSpokenTries] = useState(0);
  // Before the learner has touched anything there is nothing to lose, so leaving needs no prompt.
  const [touched, setTouched] = useState(false);
  const begun = touched || pos > 0 || answer !== null || feedback !== null;
  const leave = () => (begun ? setConfirming(true) : onClose(results.current));

  const entry = queue[pos];
  const graded = entry && isGraded(entry.ex);
  const gradedCount = useMemo(() => (resumeFrom ? resumeFrom.queue.filter((e) => !e.retry).map((e) => e.ex) : exercises).filter(isGraded).length, [exercises, resumeFrom]);

  // After every step, what it takes to carry on from here later.
  useEffect(() => {
    if (!onProgress || pos === 0 || pos >= queue.length) return;
    const r = results.current;
    onProgress({
      queue,
      pos,
      correct: r.correct,
      total: r.total,
      missed: [...r.missed],
      ratings: [...r.ratings],
      attempts: r.attempts,
      spoken: r.spoken,
    });
  }, [pos, queue, onProgress]);

  const goTo = useCallback(
    (to: number, length: number) => {
      window.clearTimeout(sayLater.current);
      setFeedback(null);
      setAnswer(null);
      setHints(0);
      setAccentNudge(null);
      setSpokenTries(0);
      started.current = Date.now();
      if (to >= length) {
        if (!finished.current) {
          finished.current = true;
          playFinished();
          onFinish(results.current);
        }
        return;
      }
      setPos(to);
    },
    [onFinish],
  );
  const next = useCallback(() => goTo(pos + 1, queue.length), [goTo, pos, queue.length]);

  /** Leave a speaking exercise: counted once, however many tries it took. */
  const leaveSpoken = () => {
    if (entry?.ex.kind === 'speak' && spokenTries > 0 && !feedback) results.current.spoken.tried++;
    next();
  };

  /** "Can't speak now": no more speaking in this session, nor in lessons for the next few minutes. */
  const skipSpeaking = () => {
    pauseSpeaking();
    const rest = queue.filter((q, i) => i < pos || q.ex.kind !== 'speak');
    setQueue(rest);
    goTo(pos, rest.length);
  };

  const onSpoken = (r: SpokenResult) => {
    if (entry?.ex.kind !== 'speak' || feedback) return;
    const ex = entry.ex;
    setSpokenTries((n) => n + 1);
    if (!r.pass) return;
    playCorrect();
    results.current.spoken.tried++;
    results.current.spoken.said++;
    const [pl, en] = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    setFeedback({
      pass: true,
      title: pl,
      subtitle: r.self ? en : spokenTries > 0 ? `${en} Got it that time.` : en,
      answer: ex.pl,
      answerLang: 'pl',
      meaning: ex.en,
      note: r.heard && r.heard.trim() && !r.self ? `Heard: “${r.heard}”` : undefined,
      cardId: ex.cardId,
      rating: 3,
    });
  };

  const record = (cardId: string, pass: boolean, rating: Rating, retry: boolean, tag?: ExtraTag, helped?: boolean) => {
    if (retry) return;
    const r = results.current;
    r.attempts.push({ cardId, pass, tag, ...(helped ? { helped } : {}) });
    r.total++;
    if (pass) r.correct++;
    else r.missed.add(cardId);
    r.ratings.set(cardId, { rating, at: Date.now() });
  };

  const submit = () => {
    if (!entry || !graded || answer === null || feedback) return;
    const ex = entry.ex as GradedExercise;
    if (ex.kind === 'match') return;
    const checked = check(ex, answer);
    const { result, expected, lang } = checked;
    // Missing Polish letters aren't waved through: the first time, say which ones and let the learner fix them.
    if (result?.verdict === 'accent' && !accentNudge) {
      setAccentNudge(result.accents);
      return;
    }
    const pass = checked.pass && result?.verdict !== 'accent';
    const helped = hints > 0 || !!accentNudge;
    const close = result?.verdict === 'typo';
    const rating: Rating = !pass ? 1 : close || helped ? 2 : 3;
    record(ex.cardId, pass, rating, entry.retry, ex.tag, helped);
    if (!pass && !entry.retry)
      setQueue((q) => {
        // Back in a few questions, but never inside the closing conversation (which starts with listening).
        const outro = q.findIndex((e, i) => i > pos && (e.ex.kind === 'listen' || e.ex.kind === 'dialogue'));
        const end = outro >= 0 ? outro : q.length;
        const at = Math.max(pos + 1, Math.min(pos + 1 + RETRY_GAP, end));
        return [...q.slice(0, at), { ex, retry: true, key: q.length }, ...q.slice(at)];
      });

    const [pl, en] = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    let note: string | undefined;
    if (result?.verdict === 'accent') {
      note = `The Polish letters matter: ${result.accents.map(([p, b]) => `${p} (not ${b})`).join(', ')}. A missing accent can make a different word.`;
    } else if (result?.verdict === 'form') {
      const ends = result.endings.map(([t, e]) => `${t} → ${e}`).join(', ');
      const rule = ruleFor(ex.cardId, result.endings.map(([, e]) => e));
      const why = rule ? ` ${rule}` : 'hint' in ex && ex.hint ? ` Tip: ${ex.hint.replace(/[{}]/g, '')}` : '';
      note = `Right word, wrong ending: ${ends}. The ending shows its job in the sentence (case, person or gender).${why}`;
    } else if (result?.verdict === 'typo' && ex.kind === 'type' && ex.audio) {
      note = `Nearly: it's spelt ${expected}. Listen again and look at the letters that sound alike (rz and ż, ó and u, h and ch).`;
    } else if (result?.verdict === 'typo') {
      note = 'Nearly — check the spelling.';
    } else if (pass && ex.kind === 'type' && ex.also?.includes(expected)) {
      // A different right answer from the one this card teaches: accept it, and name the one we meant.
      // Lesson hints explain the difference ("Use until evening, with anyone"); a bare part of speech doesn't.
      const tip = ex.hint && /\s/.test(ex.hint) ? ` ${ex.hint.replace(/[{}]/g, '')}` : '';
      note = `Also right! This card was teaching ${ex.accepted[0]}.${tip}`;
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
      subtitle: pass
        ? close
          ? 'Nearly!'
          : accentNudge
            ? `${en} Polish letters fixed.`
            : hints
              ? `${en} With a hint, so it'll come back sooner.`
              : en
        : result?.verdict === 'accent'
          ? 'Polish letters missing'
          : result?.verdict === 'form'
            ? 'Check the ending'
            : 'Not quite',
      answer: showAnswer ? expected : undefined,
      answerLang: lang,
      meaning: showAnswer && lang === 'pl' ? meaningOf(ex) : undefined,
      note,
      cardId: ex.cardId,
      rating,
    });
    if (pass) playCorrect();
    else playWrong();
    // The Polish is read once the chime has rung, so the two don't talk over each other.
    const say = ex.kind === 'choose' && ex.say ? ex.say : lang === 'pl' && expected ? expected : ex.kind === 'choose' && ex.promptLang === 'pl' ? ex.prompt : '';
    if (say) {
      if (soundEffectsOn()) sayLater.current = window.setTimeout(() => speak(say), 320);
      else speak(say);
    }
  };

  const onMatchDone = (misses: number) => {
    const ex = entry.ex as Extract<Exercise, { kind: 'match' }>;
    if (!entry.retry) {
      results.current.total++;
      if (misses === 0) results.current.correct++;
      for (const id of matchMisses.current) results.current.missed.add(id);
    }
    matchMisses.current = new Set();
    if (misses === 0) playCorrect();
    setFeedback({
      pass: misses === 0,
      title: misses === 0 ? 'Wszystko pasuje!' : 'All matched',
      subtitle: misses === 0 ? 'Everything matches!' : `${misses} mismatch${misses === 1 ? '' : 'es'} on the way`,
      cardId: ex.pairs[0]?.cardId ?? '',
      rating: 3,
    });
  };

  const limit = entry && graded ? hintLimit(entry.ex as GradedExercise) : 0;
  const takeHint = () => {
    if (feedback || hints >= limit) return;
    setHints(hints + 1);
    // A ruled-out option can't stay picked.
    if (entry.ex.kind === 'choose' || entry.ex.kind === 'gap') setAnswer(null);
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
      if (e.key !== 'Enter' || e.isComposing || confirming) return;
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
        <button type="button" className="icon-btn" onClick={leave} aria-label={`Leave this ${what}`}>
          <IconClose />
        </button>
        <div
          className={`stripes ${queue.length > 30 ? 'many' : ''}`}
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

      {banner && <div className="player-banner">{banner}</div>}
      <div className="player-body" key={entry.key} onPointerDownCapture={() => setTouched(true)} onKeyDownCapture={() => setTouched(true)}>
        {ex.kind === 'meet' && <Meet items={ex.items} from={ex.from} total={ex.total} onDone={next} />}
        {ex.kind === 'spotlight' && (
          <>
            <SpotlightView s={ex.spotlight} />
          </>
        )}
        {ex.kind === 'dialogue' && <Dialogue lines={ex.lines} />}
        {ex.kind === 'listen' && <Listen lines={ex.lines} />}
        {ex.kind === 'speak' && <SayIt ex={ex} locked={!!feedback} onResult={onSpoken} />}
        {ex.kind === 'choose' && (
          <Choose ex={ex} locked={!!feedback} hints={hints} onAnswer={setAnswer} checked={feedback ? { pass: feedback.pass, answer } : undefined} />
        )}
        {ex.kind === 'type' && <TypeAnswer ex={ex} locked={!!feedback} hints={hints} onAnswer={setAnswer} />}
        {ex.kind === 'build' && <Build ex={ex} locked={!!feedback} hints={hints} onAnswer={setAnswer} />}
        {ex.kind === 'gap' && (
          <Gap ex={ex} locked={!!feedback} hints={hints} onAnswer={setAnswer} checked={feedback ? { pass: feedback.pass, answer } : undefined} />
        )}
        {accentNudge && !feedback && (
          <p className="nudge" role="alert">
            <b>Almost — add the Polish letters.</b> You need{' '}
            {accentNudge.map(([p, b], i) => (
              <span key={p}>
                {i > 0 && ', '}
                <span lang="pl" className="pl">
                  {p}
                </span>{' '}
                (not {b})
              </span>
            ))}
            . Use the letter buttons, then check again.
          </p>
        )}
        {ex.kind === 'match' && !feedback && (
          <Match ex={ex} onDone={onMatchDone} onMiss={(id) => matchMisses.current.add(id)} />
        )}
        {ex.kind === 'match' && feedback && <div className="instruction">Pairs matched</div>}
        {entry.retry && !feedback && <p className="muted">One more try at this one.</p>}
      </div>

      {confirming && <ConfirmLeave what={what} note={leaveNote} onStay={() => setConfirming(false)} onLeave={() => onClose(results.current)} />}
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
                  {feedback.answerLang === 'pl' && /\s/.test(feedback.answer) ? <TapWords text={feedback.answer} /> : feedback.answer}
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
        ) : ex.kind === 'speak' ? (
          <div className="dock-row">
            {pausableSpeaking && (
              <button type="button" className="btn quiet" onClick={skipSpeaking} title="Leaves out speaking for the next 15 minutes">
                Can't speak now
              </button>
            )}
            <button type="button" className={`btn block ${spokenTries ? '' : 'quiet'}`} onClick={leaveSpoken}>
              {spokenTries ? 'Continue' : 'Skip'}
            </button>
          </div>
        ) : ex.kind === 'dialogue' || ex.kind === 'listen' ? (
          <button type="button" className="btn block" onClick={next}>
            {pos === queue.length - 1 ? 'Finish' : 'Continue'}
          </button>
        ) : graded && ex.kind !== 'match' ? (
          <div className={limit > 0 ? 'dock-row' : undefined}>
            {limit > 0 && (
              <button
                type="button"
                className="btn quiet"
                onClick={takeHint}
                disabled={hints >= limit}
                title="Get some help. Answers given with a hint come back sooner in review."
              >
                {hints === 0 ? 'Hint' : `Hint ${hints}/${limit}`}
              </button>
            )}
            <button type="button" className="btn block" onClick={submit} disabled={answer === null}>
              Check
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
