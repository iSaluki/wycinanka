import { useMemo, useState } from 'react';
import { lessonOfCard, UNITS } from '../../content/course';
import { getSkill, skillOfLesson } from '../../content/skills';
import { PageHead } from '../components/common';
import { Session, type SessionResult } from '../components/Session';
import { Shell } from '../components/Shell';
import { practiceExercises, type Exercise } from '../lib/exercises';
import { skillSpotlights, trickyCards, unitCardIds, weakest } from '../lib/reinforce';
import { Link, navigate, useTitle } from '../lib/router';
import { getState, submitReviews } from '../lib/store';
import { NotFound } from './NotFound';

const SIZE = 12;

/**
 * Targeted practice: a skill the learner struggles with (rule first, then the hardest cards),
 * their tricky words, or a whole unit. Every answer is a real review, so it feeds the scheduler.
 */
export function Practice({ kind, id }: { kind: string; id: string }) {
  const [summary, setSummary] = useState<{ correct: number; total: number } | null>(null);
  const [run, setRun] = useState(0);

  const plan = useMemo(() => {
    const { progress, settings } = getState();
    if (kind === 'skill') {
      const skill = getSkill(id);
      if (!skill) return null;
      const cards = weakest(progress, progress.cards.keys(), 400).filter(({ id: c }) => skillCard(c, skill.id));
      const spot = skillSpotlights(skill.id)[0];
      const ex: Exercise[] = [...(spot ? [{ kind: 'spotlight', spotlight: spot } as Exercise] : []), ...practiceExercises(cards.slice(0, SIZE), settings.speaker)];
      return { title: skill.name, pl: skill.namePl, exercises: ex };
    }
    if (kind === 'unit') {
      const unit = UNITS.find((u) => u.id === id);
      if (!unit) return null;
      const cards = weakest(progress, unitCardIds(progress, unit.id), SIZE);
      return { title: `Unit ${unit.n}: ${unit.title}`, pl: unit.titlePl, exercises: practiceExercises(cards, settings.speaker) };
    }
    if (kind === 'tricky') {
      const ids = trickyCards(progress);
      return { title: 'Tricky words', pl: 'Trudne słowa', exercises: practiceExercises(weakest(progress, ids, SIZE), settings.speaker) };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, id, run]);

  useTitle(plan ? `Practise: ${plan.title}` : 'Practice');
  if (!plan) return <NotFound />;

  const finish = async (r: SessionResult) => {
    setSummary({ correct: r.correct, total: r.total });
    await submitReviews([...r.ratings.entries()].map(([cardId, v]) => ({ cardId, ...v })));
  };

  if (!summary && plan.exercises.some((e) => 'cardId' in e)) {
    return (
      <Session
        key={run}
        exercises={plan.exercises}
        what="practice session"
        onClose={(r) => {
          navigate('/');
          void submitReviews([...r.ratings.entries()].map(([cardId, v]) => ({ cardId, ...v })));
        }}
        leaveNote="The cards you've answered so far are saved."
        rateable
        onFinish={finish}
      />
    );
  }

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl={plan.pl} en={plan.title} />
        {summary ? (
          <div className="stack">
            <p style={{ fontSize: 20 }}>
              <b lang="pl">Gotowe!</b> You got {summary.correct} of {summary.total} right. Everything you practised has been rescheduled — the
              ones you missed come back soonest.
            </p>
            <div className="row wrap">
              <button className="btn" onClick={() => (setSummary(null), setRun(run + 1))}>
                Practise again
              </button>
              <Link to="/" className="btn quiet">
                Back home
              </Link>
            </div>
          </div>
        ) : (
          <p>There's nothing to practise here yet. Finish a lesson first.</p>
        )}
      </div>
    </Shell>
  );
}

function skillCard(cardId: string, skillId: string): boolean {
  const l = lessonOfCard(cardId);
  return !!l && skillOfLesson(l.id) === skillId;
}
