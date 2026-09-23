import { UNITS } from '../../content/course';
import type { Level } from '../../content/types';
import { PageHead } from '../components/common';
import { Shell } from '../components/Shell';
import { useStats } from '../lib/derived';
import { unitCardIds } from '../lib/reinforce';
import { Link, useTitle } from '../lib/router';
import { useApp } from '../lib/store';

const LEVELS: Array<[Level | 'A0', string, string, string]> = [
  ['A0', 'Alfabet', 'Letters and sounds', 'Read any Polish word aloud before learning a single phrase.'],
  ['A1', 'Początkujący', 'Beginner', 'Greetings, the first cases and everyday verbs.'],
  ['A2', 'Podstawowy', 'Elementary', 'Past and future, aspect, getting around, likes and gifts.'],
  ['B1', 'Średnio zaawansowany', 'Intermediate', 'The conditional and quantities.'],
];

export function Learn() {
  useTitle('Course');
  const stats = useStats();
  const progress = useApp((s) => s.progress);
  const startUnit = useApp((s) => s.settings.startUnit ?? 0);

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Nauka" en="The course">
          From the alphabet to the conditional in 19 units. Every lesson is open; the red one is our suggestion. Once you've done a lesson in a
          unit, revise the whole unit to keep it fresh.
        </PageHead>
        {LEVELS.map(([level, pl, en, blurb]) => {
          const units = UNITS.filter((u) => (level === 'A0' ? u.n === 0 : u.level === level && u.n > 0));
          return (
            <section key={level} className="stack" aria-labelledby={`lvl-${level}`}>
              <div className="level-head">
                <span className={`level-badge ${level}`}>{level}</span>
                <h2 id={`lvl-${level}`}>
                  <span lang="pl">{pl}</span> <small style={{ font: '400 17px var(--font-ui)', color: 'var(--ink-3)' }}>{en}</small>
                </h2>
              </div>
              <p className="muted">{blurb}</p>
              <div>
                {units.map((u) => {
                  const done = u.lessons.filter((l) => stats.done.has(l.id)).length;
                  const complete = done === u.lessons.length;
                  const current = u.lessons.some((l) => l.id === stats.next?.id);
                  const skipped = u.n < startUnit && done === 0;
                  const revisable = unitCardIds(progress, u.id).length >= 4;
                  return (
                    <article key={u.id} className={`unit ${complete ? 'complete' : ''} ${current ? 'current' : ''}`} id={u.id}>
                      <div className="unit-num" aria-hidden="true">
                        {u.n}
                      </div>
                      <div className="unit-body">
                        <div>
                          <h3>
                            <span className="sr-only">Unit {u.n}: </span>
                            {u.title}
                          </h3>
                          <div className="pl-title" lang="pl">
                            {u.titlePl}
                          </div>
                        </div>
                        <p>{u.summary}</p>
                        {skipped && <p style={{ fontSize: 15 }}>Your placement suggests you already know this. Dip in any time.</p>}
                        <ol className="lesson-list">
                          {u.lessons.map((l, i) => {
                            const rec = progress.lessons.get(l.id);
                            const isNext = l.id === stats.next?.id;
                            return (
                              <li key={l.id}>
                                <Link to={`/lesson/${l.id}`} className={`lesson-link ${rec ? 'done' : ''} ${isNext ? 'next' : ''}`}>
                                  <span className="dot" aria-hidden="true" />
                                  <span className="t">
                                    <span>
                                      <span className="sr-only">Lesson {i + 1}: </span>
                                      {l.title}
                                    </span>
                                    <small>{l.goal}</small>
                                  </span>
                                  {rec ? <span className="score">{rec.best}%</span> : isNext ? <span className="score">dalej</span> : null}
                                </Link>
                              </li>
                            );
                          })}
                        </ol>
                        {revisable && (
                          <Link to={`/practice/unit/${u.id}`} className="btn small quiet" style={{ justifySelf: 'start' }}>
                            Revise this unit
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
