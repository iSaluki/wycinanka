import { useMemo } from 'react';
import { getUnitOfLesson, TOTAL_LESSONS } from '../../content/course';
import { FREQUENCY } from '../../content/frequency';
import { GoalRing, Speak } from '../components/common';
import { IconArrow } from '../components/icons';
import { Rosette } from '../components/Rosette';
import { Mark, Shell } from '../components/Shell';
import { useStats } from '../lib/derived';
import { Link, navigate, useTitle } from '../lib/router';
import { nextDue, useApp } from '../lib/store';

function greeting(): [string, string] {
  const h = new Date().getHours();
  if (h < 5 || h >= 18) return ['Dobry wieczór', 'Good evening'];
  return ['Dzień dobry', 'Good day'];
}

function wordOfTheDay() {
  const d = new Date();
  const n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  return FREQUENCY[n % 150];
}

function relative(ms: number): string {
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `in ${Math.max(1, mins)} minute${mins === 1 ? '' : 's'}`;
  const hours = Math.round(mins / 60);
  if (hours < 36) return `in ${hours} hour${hours === 1 ? '' : 's'}`;
  return `in ${Math.round(hours / 24)} days`;
}

export function Home() {
  useTitle('');
  const stats = useStats();
  const user = useApp((s) => s.user);
  const progress = useApp((s) => s.progress);
  const [pl, en] = greeting();
  const word = useMemo(wordOfTheDay, []);
  const next = stats.next;
  const unit = next ? getUnitOfLesson(next.id) : undefined;
  const upcoming = nextDue(progress);
  const fresh = stats.done.size === 0;

  return (
    <Shell>
      <div className="stack-lg">
        <header className="hello stack" style={{ gap: 6 }}>
          <div className="eyebrow">{user ? `Signed in as ${user.username}` : 'Learning as a guest'}</div>
          <h1>
            <span className="pl-greeting" lang="pl">
              {pl}
            </span>
            {user ? `, ${user.username}` : ''}.
          </h1>
          <p className="muted">
            {en}. {fresh ? 'Your first lesson takes about five minutes.' : `You've finished ${stats.done.size} of ${TOTAL_LESSONS} lessons.`}
          </p>
        </header>

        <section className="rosette-wrap only-narrow" aria-label="Your rosette">
          <div style={{ width: 'min(260px, 70vw)' }}>
            <Rosette done={stats.done} next={next?.id} />
          </div>
          <p className="rosette-caption">
            <span lang="pl" className="pl">
              Twoja wycinanka
            </span>{' '}
            — every lesson cuts a new layer.
          </p>
        </section>

        {next && unit ? (
          <section className="continue" aria-labelledby="continue-title">
            <div className="petal-deco" aria-hidden="true">
              <Mark />
            </div>
            <div className="eyebrow">
              {fresh ? 'Start here' : 'Up next'} · Unit {unit.n} · {unit.level}
            </div>
            <h2 id="continue-title">{next.title}</h2>
            <p>{next.goal}</p>
            <button className="btn" onClick={() => navigate(`/lesson/${next.id}`)}>
              {fresh ? 'Start your first lesson' : 'Continue'} <IconArrow width={20} height={20} />
            </button>
          </section>
        ) : (
          <section className="continue">
            <div className="eyebrow">Course complete</div>
            <h2 lang="pl">Gratulacje!</h2>
            <p>You've cut every layer of your rosette. Keep your Polish alive with daily review and the frequency list.</p>
          </section>
        )}

        <div className="tiles-2">
          <Link to="/review" className="mini-card">
            <div className="eyebrow">Review</div>
            <div className="big-number">{stats.due}</div>
            <p className="muted">
              {stats.due > 0
                ? `card${stats.due === 1 ? '' : 's'} ready to review. Short, daily reviews are what make words stick.`
                : upcoming
                  ? `Nothing due. Next review ${relative(upcoming - Date.now())}.`
                  : 'Finish a lesson and its words join your review deck.'}
            </p>
          </Link>
          <div className="mini-card word-of-day">
            <div className="eyebrow">Word of the day · #{word.rank}</div>
            <div className="row">
              <span className="pl wotd" lang="pl">
                {word.pl}
              </span>
              <Speak text={word.pl} />
            </div>
            <p className="muted">
              {word.en} · <i>{word.pos}</i>
            </p>
            {word.ex && (
              <p style={{ fontSize: 15 }}>
                <span className="pl" lang="pl">
                  {word.ex[0]}
                </span>{' '}
                <span className="muted">— {word.ex[1]}</span>
              </p>
            )}
          </div>
        </div>

        <div className="card only-narrow">
          <GoalRing value={stats.todayXp} goal={stats.goal} />
        </div>

        {!user && !fresh && (
          <div className="banner">
            <p>
              Guest progress isn't saved and disappears when you close this tab. <Link to="/signup">Create a free account</Link> to keep it —
              everything you've done today comes with you.
            </p>
          </div>
        )}

        <div className="tiles-2">
          <Link to="/sounds" className="mini-card">
            <div className="eyebrow">Sounds</div>
            <h3>
              <span lang="pl">sz, ś, cz, ć…</span>
            </h3>
            <p className="muted">Hear the sounds English doesn't have, then test your ear with minimal pairs.</p>
          </Link>
          <Link to="/placement" className="mini-card">
            <div className="eyebrow">Already know some Polish?</div>
            <h3>Take the placement check</h3>
            <p className="muted">18 quick questions. We'll suggest where to start.</p>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
