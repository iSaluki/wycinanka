import { useMemo, useState } from 'react';
import { getLesson, getUnitOfLesson, lessonCardIds, nextLessonAfter } from '../../content/course';
import { Label } from '../components/common';
import { Rosette } from '../components/Rosette';
import { Session, type SessionResult } from '../components/Session';
import { useStats } from '../lib/derived';
import { lessonExercises, lessonForSpeaker, practiceExercises } from '../lib/exercises';
import { warmupCards } from '../lib/reinforce';
import { Link, navigate, useTitle } from '../lib/router';
import { completeLesson, getState, submitReviews, useApp } from '../lib/store';
import { NotFound } from './NotFound';

interface Outcome {
  score: number;
  xp: number;
  added: number;
  warmups: number;
}

export function LessonPage({ id }: { id: string }) {
  const lesson = getLesson(id);
  const unit = getUnitOfLesson(id);
  useTitle(lesson?.title ?? 'Lesson');
  const speaker = useApp((s) => s.settings.speaker);
  const [run, setRun] = useState(0);
  // Each lesson opens with three quick questions from earlier lessons: spaced retrieval of old material.
  const exercises = useMemo(() => {
    if (!lesson) return [];
    const warm = practiceExercises(warmupCards(getState().progress, lesson.id), speaker, 'warmup');
    return [...warm, ...lessonExercises(lessonForSpeaker(lesson, speaker))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, speaker, run]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (!lesson || !unit) return <NotFound />;

  const finish = async (r: SessionResult) => {
    const own = new Set(lessonCardIds(lesson));
    const lessonAttempts = r.attempts.filter((a) => a.tag !== 'warmup');
    const correct = lessonAttempts.filter((a) => a.pass).length + (r.correct - r.attempts.filter((a) => a.pass).length);
    const total = lessonAttempts.length + (r.total - r.attempts.length);
    const missed = [...new Set(lessonAttempts.filter((a) => !a.pass && own.has(a.cardId)).map((a) => a.cardId))];
    // Matching-pair misses are recorded on the result, not as attempts.
    for (const m of r.missed) if (own.has(m) && !missed.includes(m)) missed.push(m);
    const warm = r.attempts.filter((a) => a.tag === 'warmup');
    const out = await completeLesson({ lessonId: lesson.id, correct, total: Math.max(1, total), missed });
    if (warm.length) {
      await submitReviews(warm.flatMap((a) => (r.ratings.get(a.cardId) ? [{ cardId: a.cardId, ...r.ratings.get(a.cardId)! }] : [])));
    }
    setOutcome({ ...out, warmups: warm.length });
  };

  if (outcome) return <Finish lessonId={lesson.id} outcome={outcome} onRetry={() => (setOutcome(null), setRun(run + 1))} />;
  return <Session key={run} exercises={exercises} closeTo="/learn" onFinish={finish} />;
}

function Finish({ lessonId, outcome, onRetry }: { lessonId: string; outcome: Outcome; onRetry: () => void }) {
  const stats = useStats();
  const user = useApp((s) => s.user);
  const next = nextLessonAfter(lessonId);
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
          {next ? (
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
