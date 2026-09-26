import { useMemo } from 'react';
import { getUnitOfLesson, LESSONS, TOTAL_LESSONS } from '../../content/course';
import { cultureAfter } from '../../content/culture-stops';
import { FREQUENCY } from '../../content/frequency';
import { respell } from '../../shared/phonetics';
import { GoalRing, Label, SectionHead, Speak } from '../components/common';
import { IconArrow } from '../components/icons';
import { Rosette } from '../components/Rosette';
import { InstallPrompt } from '../components/InstallPrompt';
import { Shell } from '../components/Shell';
import { markCultureSeen, useCultureSeen } from '../lib/cultureStops';
import { useStats } from '../lib/derived';
import { trickyCards, troubleSpots } from '../lib/reinforce';
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
  // A culture break straight after the last lesson done comes up before the next lesson.
  const cultureSeen = useCultureSeen();
  const before = next ? LESSONS[LESSONS.findIndex((l) => l.id === next.id) - 1] : undefined;
  const pending = before && stats.done.has(before.id) ? cultureAfter(before.id) : undefined;
  const culture = pending && !cultureSeen.has(pending.id) ? pending : undefined;
  const fresh = stats.done.size === 0;
  const spots = useMemo(() => troubleSpots(progress).slice(0, 3), [progress]);
  const tricky = useMemo(() => trickyCards(progress).length, [progress]);

  return (
    <Shell>
      <div className="stack-lg">
        <header className="hello stack" style={{ gap: 8 }}>
          <Label pl={user ? user.username : 'gość'} en={user ? 'signed in' : 'guest — saved on this device'} />
          <h1>
            <span className="pl-greeting" lang="pl">
              {pl}
            </span>
            {user ? `, ${user.username}` : ''}.
          </h1>
          <p className="muted">
            {en}. {fresh ? 'Your first lesson takes under ten minutes.' : `You've finished ${stats.done.size} of ${TOTAL_LESSONS} lessons.`}
          </p>
        </header>
        <InstallPrompt />

        <section className="rosette-wrap only-narrow" aria-label="Your rosette">
          <div style={{ width: 'min(280px, 76vw)' }}>
            <Rosette done={stats.done} next={next?.id} />
          </div>
          <p className="rosette-caption">
            <span lang="pl" className="pl">
              Twoja wycinanka
            </span>{' '}
            — every lesson glues on another layer.
          </p>
        </section>

        {next && unit && culture ? (
          <section className="next-up" aria-labelledby="continue-title">
            <Label pl="przerwa na kulturę" en="up next · a culture break" />
            <h2 id="continue-title">{culture.title}</h2>
            <p className="muted">{culture.summary} Just reading, no questions.</p>
            <div className="row wrap">
              <button className="btn red" onClick={() => navigate(`/course/culture/${culture.id}`)}>
                Read it <IconArrow width={20} height={20} />
              </button>
              <button className="btn quiet" onClick={() => (markCultureSeen(culture.id), navigate(`/lesson/${next.id}`))}>
                Skip to the next lesson
              </button>
            </div>
          </section>
        ) : next && unit ? (
          <section className="next-up" aria-labelledby="continue-title">
            <Label pl={fresh ? 'zaczynamy' : 'dalej'} en={`${fresh ? "let's begin" : 'up next'} · Unit ${unit.n} · ${unit.title}`} />
            <h2 id="continue-title">{next.title}</h2>
            <p className="muted">{next.goal}</p>
            <button className="btn red" onClick={() => navigate(`/lesson/${next.id}`)}>
              {fresh ? 'Start the first lesson' : 'Continue'} <IconArrow width={20} height={20} />
            </button>
          </section>
        ) : (
          <section className="next-up">
            <Label pl="gratulacje" en="course complete" />
            <h2>You've made the whole wycinanka.</h2>
            <p className="muted">Keep your Polish alive with daily review, your trouble spots and the frequency list.</p>
          </section>
        )}

        {(spots.length > 0 || tricky > 0) && (
          <section className="stack" aria-labelledby="trouble-title">
            <SectionHead pl="Słabe punkty" en="trouble spots" />
            <p className="muted" style={{ marginTop: -4 }}>
              Where your mistakes cluster. Each session starts with the rule, then drills the cards you find hardest.
            </p>
            <ul className="trouble">
              {spots.map((t) => (
                <li key={t.skill.id}>
                  <span className="name">
                    {t.skill.name}
                    <span className="diamonds" aria-label={`difficulty ${Math.min(5, Math.round(t.score))} of 5`}>
                      {[1, 2, 3, 4, 5].map((k) => (
                        <span key={k} className={k <= Math.round(t.score) ? 'on' : ''} />
                      ))}
                    </span>
                  </span>
                  <span className="why">
                    <i lang="pl" className="pl">
                      {t.skill.namePl}
                    </i>{' '}
                    · {t.cardIds.length} cards{t.lapses ? `, forgotten ${t.lapses} time${t.lapses === 1 ? '' : 's'}` : ''}
                  </span>
                  <Link to={`/practice/skill/${t.skill.id}`} className="btn small">
                    Practise
                  </Link>
                </li>
              ))}
              {tricky > 0 && (
                <li>
                  <span className="name">Tricky words</span>
                  <span className="why">{tricky} cards you've forgotten twice or more</span>
                  <Link to="/practice/tricky/all" className="btn small">
                    Practise
                  </Link>
                </li>
              )}
            </ul>
          </section>
        )}

        <div className="split">
          <div className="mini-card">
            <Link to="/review" className="review-line">
              <Label pl="powtórka" en="review" />
              <span className="big-number">{stats.due}</span>
              <span className="muted">
                {stats.due > 0
                  ? `card${stats.due === 1 ? '' : 's'} due`
                  : upcoming
                    ? `nothing due · next ${relative(upcoming - Date.now())}`
                    : 'finish a lesson to start your deck'}
              </span>
            </Link>
            {/* On wide screens the goal lives in the side column. */}
            <div className="only-narrow">
              <GoalRing value={stats.todayXp} goal={stats.goal} />
            </div>
          </div>
          <div className="mini-card">
            <Label pl="słowo dnia" en="word of the day" />
            <div className="row">
              <span className="wotd" lang="pl">
                {word.pl}
              </span>
              <Speak text={word.pl} />
            </div>
            <p className="muted">
              <span className="say">{respell(word.pl)}</span> · {word.en}
            </p>
            {word.ex && (
              <p style={{ fontSize: 16 }}>
                <span className="pl" lang="pl" style={{ fontSize: 19 }}>
                  {word.ex[0]}
                </span>{' '}
                <span className="muted">— {word.ex[1]}</span>
              </p>
            )}
          </div>
        </div>

        {!user && !fresh && (
          <div className="banner">
            <p>
              Your progress is saved on this device only. <Link to="/signup">Create a free account</Link> to keep it — everything
              you've done so far comes with you.
            </p>
          </div>
        )}

        {/* Where else to start matters on day one; after that these live under Discover. */}
        {fresh && (
          <ul className="start-links">
            <li>
              Already know some Polish? <Link to="/placement">Take the placement check</Link>, 18 quick questions.
            </li>
            <li>
              Curious how it sounds? <Link to="/sounds">The alphabet and its sounds</Link>, or type any word into{' '}
              <Link to="/tools">the pronouncer</Link>.
            </li>
          </ul>
        )}
      </div>
    </Shell>
  );
}
