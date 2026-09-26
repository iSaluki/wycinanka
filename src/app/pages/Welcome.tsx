import { useEffect, useState } from 'react';
import { unitByKey, UNITS } from '../../content/course';
import { Label, Speak } from '../components/common';
import { Rosette } from '../components/Rosette';
import { Shell } from '../components/Shell';
import { markWelcomed } from '../lib/welcome';
import { Link, navigate, useTitle } from '../lib/router';
import { updateSettings } from '../lib/store';


const CHOICES = [
  {
    id: 'new',
    title: 'Complete beginner',
    quote: '„Znam tylko pierogi.”',
    gloss: '"I only know pierogi."',
    body: 'Start with the alphabet and its sounds, then your first words.',
    colour: 'var(--zolc)',
    unit: 0,
  },
  {
    id: 'some',
    title: 'I know some basics',
    quote: '„Cześć, dziękuję, dwa piwa…”',
    gloss: '"Hi, thanks, two beers…"',
    body: `Take the placement check (it stops once it finds your level), or start at Unit ${unitByKey(5)?.n ?? 5}.`,
    colour: 'var(--czerwien)',
    unit: 5,
    placement: true,
  },
  {
    id: 'more',
    title: 'I get by',
    quote: '„Mówię trochę po polsku.”',
    gloss: '"I speak a little Polish."',
    body: 'Check your level, or go straight to the past tense and aspect (A2).',
    colour: 'var(--zielen)',
    unit: 11,
    placement: true,
  },
];

/** A rosette that assembles itself layer by layer: a preview of what progress looks like. */
function DemoRosette() {
  const [n, setN] = useState(0);
  // Seeds first, then one layer at a time around the flower, so it grows symmetrically.
  const order = [
    ...(UNITS.find((u) => u.n === 0)?.lessons.map((l) => l.id) ?? []),
    ...[0, 1, 2].flatMap((layer) => UNITS.filter((u) => u.n > 0).map((u) => u.lessons[layer]?.id)),
  ].filter(Boolean) as string[];
  const target = order.length - 6;
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(target);
      return;
    }
    const t = setInterval(() => setN((k) => (k >= target ? k : k + 1)), 90);
    return () => clearInterval(t);
  }, [target]);
  return <Rosette done={new Set(order.slice(0, n))} fresh={order[n - 1]} label="A sample rosette. Every lesson you finish adds a layer to yours." />;
}

export function Welcome() {
  useTitle('Welcome');
  const choose = async (c: (typeof CHOICES)[number], placement: boolean) => {
    markWelcomed();
    if (placement) return navigate('/placement');
    await updateSettings({ startUnit: c.unit });
    navigate(c.unit === 0 ? '/lesson/u00-l1' : '/learn');
  };

  return (
    <Shell aside={false} wide>
      <div className="welcome">
        <section className="welcome-hero">
          <div className="stack" style={{ gap: 22 }}>
            <Label pl="po polsku, od podstaw" en="Polish from scratch · free" />
            <h1 lang="pl">Wycinanka</h1>
            <span className="say-it">
              <Speak text="wycinanka" label="Hear “wycinanka”" />
              <span>
                <b>vi-chi-NAN-ka</b> — the Polish art of cutting paper
              </span>
            </span>
            <p className="lede">
              Learn Polish in short lessons of about ten minutes. Each one you finish glues another layer onto your own paper rosette, and the words you find
              hardest keep coming back until they stick.
            </p>
            <p className="muted">
              Already learning?{' '}
              <Link to="/signin" onClick={markWelcomed}>
                Sign in
              </Link>
            </p>
          </div>
          <div style={{ maxWidth: 420, width: '100%', justifySelf: 'center' }}>
            <DemoRosette />
          </div>
        </section>

        <div className="scallop" aria-hidden="true" />

        <section className="stack" aria-labelledby="where">
          <h2 id="where" style={{ fontSize: 36 }}>
            <span lang="pl">Od czego zaczynamy?</span>{' '}
            <small style={{ font: '400 18px var(--font-ui)', color: 'var(--ink-3)' }}>Where are you starting from?</small>
          </h2>
          <div className="levels">
            {CHOICES.map((c) => (
              <div key={c.id} className="level-card">
                <svg className="swatch" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 23C4 16 4 8 12 1c8 7 8 15 0 22Z" fill={c.colour} />
                  <circle cx="12" cy="12" r="2" fill="var(--paper)" />
                </svg>
                <h3>{c.title}</h3>
                <p className="quote" lang="pl">
                  {c.quote}
                </p>
                <p className="muted" style={{ marginTop: -6, fontSize: 15 }}>
                  {c.gloss}
                </p>
                <p>{c.body}</p>
                <div className="row wrap">
                  <button className={`btn small ${c.id === 'new' ? 'red' : ''}`} onClick={() => choose(c, !!c.placement)}>
                    {c.placement ? 'Check my level' : 'Start with the alphabet'}
                  </button>
                  {c.placement && (
                    <button className="link-btn" onClick={() => choose(c, false)}>
                      Skip to Unit {unitByKey(c.unit)?.n ?? c.unit}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="research" aria-label="How Wycinanka teaches">
          <div>
            <h3 lang="pl">Powtarzanie</h3>
            <p>
              <b>Spaced review.</b> Every word, sentence and grammar point returns just before you'd forget it (FSRS, the scheduler behind Anki). Lessons
              open with a warm-up from earlier ones, and your trouble spots get their own practice.
            </p>
          </div>
          <div>
            <h3 lang="pl">Najczęstsze słowa</h3>
            <p>
              <b>Frequency first.</b> The 100 most common words make up about 43% of everyday spoken Polish. You learn those first.
            </p>
          </div>
          <div>
            <h3 lang="pl">Wymowa</h3>
            <p>
              <b>Sounds first.</b> A phonics unit for the alphabet, respellings you can read on every word, and a pronouncer that explains any word you
              type.
            </p>
          </div>
        </section>

        <p className="muted" style={{ fontSize: 15 }}>
          No account needed to learn. Create a free account any time to save your progress — there's no paid tier.
        </p>
      </div>
    </Shell>
  );
}
