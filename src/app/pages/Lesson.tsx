import { useMemo, useState } from 'react';
import { getLesson, getUnitOfLesson, isCardId, nextLessonAfter } from '../../content/course';
import { Rosette } from '../components/Rosette';
import { Session, type SessionResult } from '../components/Session';
import { lessonExercises, lessonForSpeaker } from '../lib/exercises';
import { Link, navigate, useTitle } from '../lib/router';
import { completeLesson, useApp } from '../lib/store';
import { useStats } from '../lib/derived';
import { NotFound } from './NotFound';

interface Outcome {
  score: number;
  xp: number;
  added: number;
}

export function LessonPage({ id }: { id: string }) {
  const lesson = getLesson(id);
  const unit = getUnitOfLesson(id);
  useTitle(lesson?.title ?? 'Lesson');
  const speaker = useApp((s) => s.settings.speaker);
  const exercises = useMemo(() => (lesson ? lessonExercises(lessonForSpeaker(lesson, speaker)) : []), [lesson, speaker]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [run, setRun] = useState(0);

  if (!lesson || !unit) return <NotFound />;

  const finish = async (r: SessionResult) => {
    const missed = [...r.missed].filter((m) => isCardId(m) && m.startsWith(`${lesson.id}:`) && !/:d\d+$/.test(m));
    const out = await completeLesson({ lessonId: lesson.id, correct: r.correct, total: Math.max(1, r.total), missed });
    setOutcome(out);
  };

  if (outcome) return <Finish lessonId={lesson.id} outcome={outcome} onRetry={() => (setOutcome(null), setRun(run + 1))} />;
  return <Session key={run} exercises={exercises} closeTo="/learn" onFinish={finish} />;
}

function Finish({ lessonId, outcome, onRetry }: { lessonId: string; outcome: Outcome; onRetry: () => void }) {
  const stats = useStats();
  const user = useApp((s) => s.user);
  const next = nextLessonAfter(lessonId);
  useTitle('Lesson complete');
  const headline = outcome.score >= 90 ? 'Wspaniale!' : outcome.score >= 70 ? 'Dobra robota!' : 'Zrobione!';
  const english = outcome.score >= 90 ? 'Wonderful!' : outcome.score >= 70 ? 'Good work!' : 'Done!';
  return (
    <main className="player">
      <div />
      <div className="finish">
        <div style={{ width: 'min(300px, 80vw)' }}>
          <Rosette done={stats.done} fresh={lessonId} label="Your rosette, with a new layer cut for this lesson." />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <h1 lang="pl">{headline}</h1>
          <p className="muted">{english} A new layer is cut into your rosette.</p>
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
            <span>new cards to review</span>
          </div>
        </div>
        {!user && (
          <div className="banner" style={{ maxWidth: 460, textAlign: 'left' }}>
            <p>
              You're learning as a guest, so this progress disappears when you close the tab.{' '}
              <Link to="/signup">Create a free account</Link> to keep it.
            </p>
          </div>
        )}
        <div className="row wrap" style={{ justifyContent: 'center' }}>
          {next ? (
            <button className="btn" onClick={() => navigate(`/lesson/${next.id}`)}>
              Next: {next.title}
            </button>
          ) : (
            <button className="btn" onClick={() => navigate('/review')}>
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
      </div>
      <div />
    </main>
  );
}
