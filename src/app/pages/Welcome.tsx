import { useEffect, useState } from 'react';
import { UNITS } from '../../content/course';
import { Speak } from '../components/common';
import { Rosette } from '../components/Rosette';
import { Mark } from '../components/Shell';
import { Link, navigate, useTitle } from '../lib/router';
import { updateSettings } from '../lib/store';

export const WELCOME_KEY = 'wycinanka:welcomed';

export function markWelcomed() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    /* storage unavailable: the welcome screen may show again, which is harmless */
  }
}

const CHOICES = [
  {
    id: 'new',
    title: 'Complete beginner',
    quote: '“I know pierogi and not much else.”',
    body: 'Start with the sounds of Polish and your first phrases.',
    colour: 'var(--slonecznik)',
    unit: 1,
  },
  {
    id: 'some',
    title: 'I know some basics',
    quote: '“Cześć, dziękuję, dwa piwa…”',
    body: 'Take an 18-question placement check, or start at Unit 5.',
    colour: 'var(--malina)',
    unit: 5,
    placement: true,
  },
  {
    id: 'more',
    title: 'I get by',
    quote: '“Mówię trochę po polsku.”',
    body: 'Check your level, or jump straight into the past tense and aspect (A2).',
    colour: 'var(--kobalt)',
    unit: 11,
    placement: true,
  },
];

/** A rosette that cuts itself, one layer at a time, as a preview of what progress looks like. */
function DemoRosette() {
  const all = UNITS.flatMap((u) => u.lessons.map((l) => l.id));
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(44);
      return;
    }
    const t = setInterval(() => setN((k) => (k >= 44 ? k : k + 1)), 140);
    return () => clearInterval(t);
  }, []);
  // Cut lesson 1 of every unit, then lesson 2 — so the preview grows symmetrically.
  const order = [0, 1, 2].flatMap((layer) => UNITS.map((u) => u.lessons[layer]?.id)).filter(Boolean) as string[];
  const done = new Set(order.slice(0, n));
  return <Rosette done={done} fresh={order[n - 1]} label={`A sample rosette: ${all.length} lessons make a full wycinanka.`} />;
}

export function Welcome() {
  useTitle('Welcome');
  const choose = async (c: (typeof CHOICES)[number], placement: boolean) => {
    markWelcomed();
    if (placement) return navigate('/placement');
    await updateSettings({ startUnit: c.unit });
    navigate(c.unit === 1 ? '/lesson/u01-l1' : '/learn');
  };

  return (
    <main className="welcome">
      <div className="row between">
        <span className="brand">
          <Mark />
          <span>Wycinanka</span>
        </span>
        <Link to="/signin" className="btn small quiet" onClick={markWelcomed}>
          Sign in
        </Link>
      </div>

      <section className="welcome-hero">
        <div className="stack" style={{ gap: 22 }}>
          <div className="eyebrow">Polish for English speakers · free</div>
          <h1 lang="pl">Wycinanka</h1>
          <div>
            <span className="say-it">
              <Speak text="wycinanka" label="Hear “wycinanka”" />
              <span>
                vi-chi-<b>NAN</b>-ka · the Polish art of paper cutting
              </span>
            </span>
          </div>
          <p className="lede">
            Learn Polish in five-minute lessons. Every one you finish cuts a new layer into your own paper rosette — until you've made the
            whole thing.
          </p>
        </div>
        <div style={{ maxWidth: 420, width: '100%', justifySelf: 'center' }}>
          <DemoRosette />
        </div>
      </section>

      <section className="stack" aria-labelledby="where">
        <h2 id="where" style={{ fontSize: 30 }}>
          Where are you starting from?
        </h2>
        <div className="levels">
          {CHOICES.map((c) => (
            <div key={c.id} className="level-card">
              <svg className="swatch" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 23C4 16 4 8 12 1c8 7 8 15 0 22Z" fill={c.colour} />
              </svg>
              <h3>{c.title}</h3>
              <p className="quote" lang="pl">
                {c.quote}
              </p>
              <p className="muted">{c.body}</p>
              <div className="row wrap">
                <button className="btn small" onClick={() => choose(c, !!c.placement)}>
                  {c.placement ? 'Check my level' : 'Start from the beginning'}
                </button>
                {c.placement && (
                  <button className="link-btn" onClick={() => choose(c, false)}>
                    Skip to Unit {c.unit}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="research" aria-label="How Wycinanka teaches">
        <div>
          <h3>Spaced review</h3>
          <p>Every word you learn comes back just before you'd forget it, scheduled by FSRS — the same modern algorithm used in Anki.</p>
        </div>
        <div>
          <h3>Frequency first</h3>
          <p>The 100 most common words make up about 43% of everyday spoken Polish. You learn those first.</p>
        </div>
        <div>
          <h3>Sounds English lacks</h3>
          <p>Hear the difference between sz, ś and s, and train your ear with minimal pairs like wieś and wiesz.</p>
        </div>
      </section>

      <p className="muted" style={{ fontSize: 14 }}>
        No account needed to learn. Create a free account any time to save your progress — there's no paid tier.
      </p>
    </main>
  );
}
