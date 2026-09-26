import { useCallback, useMemo, useState } from 'react';
import { getCard, getLesson, getUnitOfLesson, lessonCardIds, nextLessonAfter } from '../../content/course';
import { cultureAfter } from '../../content/culture-stops';
import { Label, Speak } from '../components/common';
import { Rosette } from '../components/Rosette';
import { Session, type SessionResult } from '../components/Session';
import { markCultureSeen, useCultureSeen } from '../lib/cultureStops';
import { useStats } from '../lib/derived';
import { isGraded, lessonForSpeaker, lessonPlan, pictureRound, practiceExercises, shuffle } from '../lib/exercises';
import { speakingPaused } from '../lib/listen';
import { lessonPictures, revisionCards, sprinkle, warmupCards } from '../lib/reinforce';
import { Link, navigate, useTitle } from '../lib/router';
import { completeLesson, getState, submitReviews, useApp } from '../lib/store';
import { NotFound } from './NotFound';
import { clearSession, loadSession, markSent, saveSession, type SavedSession } from '../lib/resume';
import type { Lesson } from '../../content/types';

interface Outcome {
  score: number;
  xp: number;
  added: number;
  /** Personalised revision questions answered during the lesson. */
  revised: number;
  /** Picture flashcards named during the lesson. */
  pictures: number;
  /** Lesson cards the learner got wrong at least once, to look over before leaving. */
  missed: string[];
  spoken: SessionResult['spoken'];
}

export function LessonPage({ id }: { id: string }) {
  const lesson = getLesson(id);
  const unit = getUnitOfLesson(id);
  useTitle(lesson?.title ?? 'Lesson');
  const speaker = useApp((s) => s.settings.speaker);
  const signedIn = useApp((s) => !!s.user);
  const speakingOn = useApp((s) => s.settings.speaking !== false);
  const [run, setRun] = useState(0);
  const owner = useApp((s) => s.user?.username ?? 'guest');
  // A lesson left part-way on this device: offer to carry on from there.
  const [saved, setSaved] = useState(() => loadSession(id, owner));
  const [resumeFrom, setResumeFrom] = useState<SavedSession | null>(null);
  const keep = useCallback((s: SavedSession) => saveSession(id, owner, s), [id, owner]);
  const exercises = useMemo(() => {
    if (!lesson) return [];
    const progress = getState().progress;
    // Each lesson opens with three quick questions from earlier lessons: spaced retrieval of old material.
    const warmCards = warmupCards(progress, lesson.id);
    const warm = practiceExercises(warmCards, speaker, 'warmup');
    const { exercises: main, introEnd, outroStart } = lessonPlan(lessonForSpeaker(lesson, speaker), { speaking: speakingOn && !speakingPaused() });
    // A couple of picture flashcards, a new one met and named or known ones named again (not in the sound lessons).
    const { fresh, known } = lesson.phonics ? { fresh: [], known: [] } : lessonPictures(progress);
    const pictures = pictureRound(fresh, known);
    // Signed-in learners also get revision sprinkled through the lesson, weighted towards their mistakes.
    const n = Math.min(4, Math.max(2, Math.round(main.filter(isGraded).length / 6)));
    const revision = signedIn
      ? practiceExercises(revisionCards(progress, lesson.id, n, warmCards.map((c) => c.id)), speaker, 'revision').map((e) => [e])
      : [];
    // Never while new words are still being introduced: old material there would crowd out the new.
    const from = introEnd;
    // Nor in the closing conversation.
    const until = outroStart;
    // Groups stay together, so a new picture is named straight after it is met.
    const extra = shuffle([...revision, ...pictures]);
    const groups = sprinkle(main.map((e) => [e]), extra, from, until);
    return [...warm, ...groups.flat()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, speaker, signedIn, speakingOn, run]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (!lesson || !unit) return <NotFound />;

  const finish = async (r: SessionResult) => {
    clearSession(lesson.id);
    const own = new Set(lessonCardIds(lesson));
    const lessonAttempts = r.attempts.filter((a) => !a.tag);
    const correct = lessonAttempts.filter((a) => a.pass).length + (r.correct - r.attempts.filter((a) => a.pass).length);
    const total = lessonAttempts.length + (r.total - r.attempts.length);
    // Answers that needed a hint or an accent fix enter review as "Hard", like a miss, so they come back sooner.
    const missed = [...new Set(lessonAttempts.filter((a) => (!a.pass || a.helped) && own.has(a.cardId)).map((a) => a.cardId))];
    // Matching-pair misses are recorded on the result, not as attempts.
    for (const m of r.missed) if (own.has(m) && !missed.includes(m)) missed.push(m);
    // Warm-up and revision answers are real reviews of earlier cards.
    const extra = r.attempts.filter((a) => a.tag);
    const out = await completeLesson({ lessonId: lesson.id, correct, total: Math.max(1, total), missed });
    if (extra.length) {
      await submitReviews(extra.flatMap((a) => (r.ratings.get(a.cardId) ? [{ cardId: a.cardId, ...r.ratings.get(a.cardId)! }] : [])));
    }
    setOutcome({ ...out, revised: extra.filter((a) => a.tag === 'revision').length, pictures: extra.filter((a) => a.tag === 'picture').length, missed, spoken: r.spoken });
  };

  if (outcome) return <Finish lessonId={lesson.id} outcome={outcome} onRetry={() => (setOutcome(null), setResumeFrom(null), setRun(run + 1))} />;
  // Leaving part-way: the place is kept on this device, and warm-up and revision answers (real reviews) are sent now.
  const leave = (r: SessionResult) => {
    navigate('/learn');
    const extra = r.attempts.filter((a) => a.tag && r.ratings.get(a.cardId));
    if (extra.length) {
      void submitReviews(extra.map((a) => ({ cardId: a.cardId, ...r.ratings.get(a.cardId)! })));
      markSent(lesson.id, extra.map((a) => a.cardId));
    }
  };

  if (saved) {
    const left = saved.queue.length - saved.pos;
    return (
      <main className="player">
        <div />
        <div className="resume stack" style={{ gap: 18 }}>
          <Label pl="dokończ lekcję" en="finish the lesson" />
          <h1>{lesson.title}</h1>
          <p className="muted">
            You left this lesson part-way through. Carry on where you stopped, with {left} question{left === 1 ? '' : 's'} to go, or start it again.
          </p>
          <div className="row wrap">
            <button type="button" className="btn red" onClick={() => (setResumeFrom(saved), setSaved(null))}>
              Carry on
            </button>
            <button type="button" className="btn quiet" onClick={() => (clearSession(lesson.id), setSaved(null))}>
              Start again
            </button>
          </div>
        </div>
        <div />
      </main>
    );
  }

  return (
    <Session
      key={run}
      exercises={exercises}
      resumeFrom={resumeFrom}
      onProgress={keep}
      what="lesson"
      onClose={leave}
      leaveNote="Your place is kept on this device: open the lesson again to carry on."
      banner={<SpeakerNote lesson={lesson} speaker={speaker} />}
      onFinish={finish}
    />
  );
}

/**
 * Polish past-tense and "I would" forms differ for men and women. When a lesson has them, say whose forms are
 * shown, and where to change it, so "byłam" or "byłem" isn't a mystery.
 */
function SpeakerNote({ lesson, speaker }: { lesson: Lesson; speaker?: 'm' | 'f' }) {
  const gendered = [...lesson.items, ...lesson.sentences].some((x) => x.altPl?.some((a) => /(łam|łem|łabym|łbym)\b/.test(a)));
  if (!gendered) return null;
  return (
    <p className="muted small">
      {speaker === 'f' ? 'Showing the forms a woman uses (byłam).' : speaker === 'm' ? 'Showing the forms a man uses (byłem).' : 'Showing the forms a man uses (byłem); both are accepted.'}{' '}
      <Link to="/profile">{speaker ? 'Change' : 'Are you a woman? Set it in your profile'}</Link>
    </p>
  );
}

function Finish({ lessonId, outcome, onRetry }: { lessonId: string; outcome: Outcome; onRetry: () => void }) {
  const stats = useStats();
  const user = useApp((s) => s.user);
  const next = nextLessonAfter(lessonId);
  // A culture break after this lesson is offered next, with a way straight past it.
  const seen = useCultureSeen();
  const after = cultureAfter(lessonId);
  const culture = after && !seen.has(after.id) ? after : undefined;
  useTitle('Lesson complete');
  const [headline, english] =
    outcome.score >= 90 ? ['Wspaniale!', 'Wonderful!'] : outcome.score >= 70 ? ['Dobra robota!', 'Good work!'] : ['Zrobione!', 'Done!'];
  return (
    <main className="player">
      <div />
      <div className="finish">
        <div style={{ width: 'min(300px, 78vw)' }}>
          <Rosette done={stats.done} fresh={lessonId} label="Your rosette, with a new layer for this lesson." />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <h1 lang="pl">{headline}</h1>
          <p className="muted">{english} Another layer is glued onto your wycinanka.</p>
        </div>
        <div className="finish-stats">
          <div>
            <b>{outcome.score}%</b>
            <span>accuracy</span>
          </div>
          <div>
            <b>+{outcome.xp}</b>
            <span>XP</span>
          </div>
          <div>
            <b>{outcome.added}</b>
            <span>new review cards</span>
          </div>
        </div>
        {outcome.revised > 0 && (
          <p className="muted" style={{ maxWidth: '46ch' }}>
            You also revised {outcome.revised} thing{outcome.revised === 1 ? '' : 's'} from earlier lessons, picked from what you've found hardest.
          </p>
        )}
        {outcome.pictures > 0 && (
          <p className="muted" style={{ maxWidth: '46ch' }}>
            You named {outcome.pictures} picture{outcome.pictures === 1 ? '' : 's'} along the way. <Link to="/pictures">More picture flashcards</Link>
          </p>
        )}
        {outcome.spoken.tried > 0 && (
          <p className="muted" style={{ maxWidth: '46ch' }}>
            You said {outcome.spoken.said} of {outcome.spoken.tried} thing{outcome.spoken.tried === 1 ? '' : 's'} aloud clearly.{' '}
            <Link to="/speaking">More speaking practice</Link>
          </p>
        )}
        {outcome.missed.length > 0 && <Missed ids={outcome.missed} />}
        {outcome.score < 70 && (
          <p className="muted" style={{ maxWidth: '46ch' }}>
            The words you missed will come back sooner in review. Practising the lesson again today also helps.
          </p>
        )}
        {!user && (
          <div className="banner" style={{ maxWidth: 480, textAlign: 'left' }}>
            <p>
              You're learning as a guest, so this disappears when you close the tab. <Link to="/signup">Create a free account</Link> to keep
              it.
            </p>
          </div>
        )}
        <div className="row wrap" style={{ justifyContent: 'center' }}>
          {culture ? (
            <>
              <button className="btn red" onClick={() => navigate(`/course/culture/${culture.id}`)}>
                Culture break: {culture.title}
              </button>
              <button className="btn quiet" onClick={() => (markCultureSeen(culture.id), navigate(next ? `/lesson/${next.id}` : '/learn'))}>
                {next ? 'Skip to the next lesson' : 'Skip'}
              </button>
            </>
          ) : next ? (
            <button className="btn red" onClick={() => navigate(`/lesson/${next.id}`)}>
              Next: {next.title}
            </button>
          ) : (
            <button className="btn red" onClick={() => navigate('/review')}>
              Go to review
            </button>
          )}
          <button className="btn quiet" onClick={onRetry}>
            Practise again
          </button>
          <Link to="/learn" className="btn quiet">
            Course map
          </Link>
        </div>
        <Label pl="do zobaczenia" en="see you soon" />
      </div>
      <div />
    </main>
  );
}

/** The words and sentences missed in this lesson, with their meanings: one last look while they're fresh. */
function Missed({ ids }: { ids: string[] }) {
  const rows = ids.flatMap((id) => {
    const src = getCard(id);
    if (src?.kind === 'item') return [{ id, pl: src.item.pl, en: src.item.en }];
    if (src?.kind === 'sentence') return [{ id, pl: src.sentence.pl, en: src.sentence.en }];
    if (src?.kind === 'drill') return [{ id, pl: src.drill.text.replace('___', src.drill.answer), en: src.drill.en }];
    return [];
  });
  if (!rows.length) return null;
  return (
    <section className="missed" aria-labelledby="missed-title">
      <h2 id="missed-title">Worth another look</h2>
      <p className="muted">Missed, or answered with help. These come back sooner in review.</p>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <Speak text={r.pl} />
            <span className="pl" lang="pl">
              {r.pl}
            </span>
            <span className="muted">{r.en}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
