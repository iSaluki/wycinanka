import { useState } from 'react';
import { getCard } from '../../content/course';
import { PageHead } from '../components/common';
import { Session, type SessionResult } from '../components/Session';
import { Shell } from '../components/Shell';
import { reviewExercise, type Exercise } from '../lib/exercises';
import { Link, useTitle } from '../lib/router';
import { dueCards, getState, nextDue, submitReviews, useApp } from '../lib/store';

const SESSION_SIZE = 20;

function buildSession(ids: string[]): Exercise[] {
  const { progress: p, settings } = getState();
  return ids.flatMap((id) => {
    const src = getCard(id);
    const card = p.cards.get(id);
    return src && card ? [reviewExercise(src, card.reps, id, settings.speaker)] : [];
  });
}

export function Review() {
  useTitle('Review');
  const progress = useApp((s) => s.progress);
  const [session, setSession] = useState<Exercise[] | null>(null);
  const [summary, setSummary] = useState<{ correct: number; total: number } | null>(null);
  const due = dueCards(progress);
  const upcoming = nextDue(progress);

  const start = (ids: string[]) => {
    setSummary(null);
    setSession(buildSession(ids));
  };

  const finish = async (r: SessionResult) => {
    setSession(null);
    setSummary({ correct: r.correct, total: r.total });
    await submitReviews([...r.ratings.entries()].map(([cardId, { rating, at }]) => ({ cardId, rating, at })));
  };

  if (session) return <Session exercises={session} closeTo="/review" rateable onFinish={finish} />;

  const weakest = [...progress.cards.entries()]
    .sort((a, b) => a[1].stability - b[1].stability)
    .slice(0, 10)
    .map(([id]) => id);

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead eyebrow="Review" title={due.length ? `${due.length} card${due.length === 1 ? '' : 's'} to review` : 'All caught up'}>
          Words come back just before you're likely to forget them. A few minutes a day keeps them for good.
        </PageHead>

        {summary && (
          <div className="banner" role="status">
            <p>
              <b lang="pl">Gotowe!</b> You recalled {summary.correct} of {summary.total}. Anything you missed will come back sooner.
            </p>
          </div>
        )}

        {due.length > 0 ? (
          <div className="card stack">
            <p>
              {due.length > SESSION_SIZE
                ? `We'll take them ${SESSION_SIZE} at a time, oldest first.`
                : 'Type or choose each answer. Your rating is set automatically — change it if you disagree.'}
            </p>
            <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => start(due.slice(0, SESSION_SIZE).map(([id]) => id))}>
              Start review
            </button>
          </div>
        ) : progress.cards.size ? (
          <div className="card stack">
            <p>
              Nothing is due{upcoming ? ` until ${new Date(upcoming).toLocaleString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}` : ''}. Reviewing
              early isn't wasted, but the biggest gains come from waiting until cards are due.
            </p>
            <button className="btn quiet" style={{ alignSelf: 'flex-start' }} onClick={() => start(weakest)}>
              Practise your 10 weakest words
            </button>
          </div>
        ) : (
          <div className="card stack">
            <p>Your review deck is empty. Finish a lesson, or learn words from the frequency list, and they'll appear here.</p>
            <div className="row wrap">
              <Link to="/learn" className="btn">
                Go to the course
              </Link>
              <Link to="/words" className="btn quiet">
                Learn common words
              </Link>
            </div>
          </div>
        )}

        <section className="stack">
          <h2 style={{ fontSize: 24 }}>Your deck</h2>
          <div className="stats">
            <div className="stat">
              <b>{progress.cards.size}</b>
              <span>cards</span>
            </div>
            <div className="stat">
              <b>{[...progress.cards.values()].filter((c) => c.stability >= 21).length}</b>
              <span>well known (3+ weeks)</span>
            </div>
            <div className="stat">
              <b>{due.length}</b>
              <span>due now</span>
            </div>
            <div className="stat">
              <b>{[...progress.cards.values()].reduce((n, c) => n + c.lapses, 0)}</b>
              <span>times forgotten</span>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
