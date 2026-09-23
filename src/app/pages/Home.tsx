import { useMemo } from 'react';
import { getUnitOfLesson, TOTAL_LESSONS } from '../../content/course';
import { FREQUENCY } from '../../content/frequency';
import { respell } from '../../shared/phonetics';
import { GoalRing, Label, SectionHead, Speak } from '../components/common';
import { IconArrow } from '../components/icons';
import { Rosette } from '../components/Rosette';
import { Shell } from '../components/Shell';
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
  const fresh = stats.done.size === 0;
  const spots = useMemo(() => troubleSpots(progress).slice(0, 3), [progress]);
  const tricky = useMemo(() => trickyCards(progress).length, [progress]);

  return (
    <Shell>
      <div className="stack-lg">
        <header className="hello stack" style={{ gap: 8 }}>
          <Label pl={user ? user.username : 'gość'} en={user ? 'signed in' : 'guest — progress is not saved'} />
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

        {next && unit ? (
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
          <Link to="/review" className="mini-card">
            <Label pl="powtórka" en="review" />
            <div className="big-number">{stats.due}</div>
            <p className="muted">
              {stats.due > 0
                ? `card${stats.due === 1 ? '' : 's'} due. A few minutes a day is what makes words stick.`
                : upcoming
                  ? `Nothing due. Next review ${relative(upcoming - Date.now())}.`
                  : 'Finish a lesson and its words join your review deck.'}
            </p>
          </Link>
          <div className="mini-card">
            <Label pl="słowo dnia" en={`word of the day · #${word.rank}`} />
            <div className="row">
              <span className="wotd" lang="pl">
                {word.pl}
              </span>
              <Speak text={word.pl} />
            </div>
            <div className="say">say “{respell(word.pl)}”</div>
            <p className="muted">
              {word.en} · <i>{word.pos}</i>
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

        <div className="only-narrow">
          <GoalRing value={stats.todayXp} goal={stats.goal} />
        </div>

        {!user && !fresh && (
          <div className="banner">
            <p>
              Guest progress disappears when you close this tab. <Link to="/signup">Create a free account</Link> to keep it — everything
              you've done today comes with you.
            </p>
          </div>
        )}

        <div className="split">
          <Link to="/sounds" className="mini-card">
            <Label pl="wymowa" en="pronunciation" />
            <h3>The alphabet and its sounds</h3>
            <p className="muted">All 32 letters, the sounds English doesn't have, and an ear-training game.</p>
          </Link>
          <Link to="/tools" className="mini-card">
            <Label pl="narzędzia" en="tools" />
            <h3>How do I say this?</h3>
            <p className="muted">Type any Polish word — or just “cz” — and see how to say it. Plus numbers, prices, the clock and a phrasebook.</p>
          </Link>
        </div>

        <p className="muted" style={{ fontSize: 15 }}>
          Already know some Polish? <Link to="/placement">Take the placement check</Link> — 18 quick questions.
        </p>
      </div>
    </Shell>
  );
}
