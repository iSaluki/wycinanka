import { UNITS } from '../../content/course';
import type { Level } from '../../content/types';
import { PageHead } from '../components/common';
import { IconCheck } from '../components/icons';
import { Shell } from '../components/Shell';
import { useStats } from '../lib/derived';
import { Link, useTitle } from '../lib/router';
import { useApp } from '../lib/store';

const LEVELS: Array<[Level, string, string]> = [
  ['A1', 'Beginner', 'Sounds, greetings, the first cases and everyday verbs.'],
  ['A2', 'Elementary', 'Past and future, aspect, getting around, likes and gifts.'],
  ['B1', 'Intermediate', 'The conditional and quantities.'],
];

export function Learn() {
  useTitle('Course');
  const stats = useStats();
  const lessons = useApp((s) => s.progress.lessons);
  const startUnit = useApp((s) => s.settings.startUnit ?? 1);

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead eyebrow="Course" title="Your path through Polish">
          18 units from your first sounds to the conditional. Every lesson is open — the highlighted one is our suggestion.
        </PageHead>
        {LEVELS.map(([level, name, blurb]) => (
          <section key={level} className="stack" aria-labelledby={`lvl-${level}`}>
            <div className="level-head">
              <span className={`level-badge ${level}`}>{level}</span>
              <h2 id={`lvl-${level}`} style={{ fontSize: 26 }}>
                {name}
              </h2>
            </div>
            <p className="muted" style={{ marginTop: -8 }}>
              {blurb}
            </p>
            {UNITS.filter((u) => u.level === level).map((u) => {
              const done = u.lessons.filter((l) => stats.done.has(l.id)).length;
              const complete = done === u.lessons.length;
              const current = u.lessons.some((l) => l.id === stats.next?.id);
              const skipped = u.n < startUnit && done === 0;
              return (
                <article key={u.id} className={`unit ${complete ? 'complete' : ''} ${current ? 'current' : ''}`} id={u.id}>
                  <div className="unit-head">
                    <div className="unit-num" aria-hidden="true">
                      {complete ? <IconCheck width={22} height={22} /> : u.n}
                    </div>
                    <div className="stack" style={{ gap: 4 }}>
                      <h3>
                        <span className="sr-only">Unit {u.n}: </span>
                        {u.title}
                      </h3>
                      <div className="pl-title" lang="pl">
                        {u.titlePl}
                      </div>
                      <p>{u.summary}</p>
                      {skipped && <p style={{ fontSize: 14 }}>Your placement suggests you already know this. Dip in any time.</p>}
                    </div>
                  </div>
                  <ol className="lesson-list">
                    {u.lessons.map((l, i) => {
                      const rec = lessons.get(l.id);
                      const isNext = l.id === stats.next?.id;
                      return (
                        <li key={l.id}>
                          <Link to={`/lesson/${l.id}`} className={`lesson-link ${rec ? 'done' : ''} ${isNext ? 'next' : ''}`}>
                            <span className="dot" aria-hidden="true">
                              {rec && <IconCheck />}
                            </span>
                            <span className="t">
                              <span>
                                <span className="sr-only">Lesson {i + 1}: </span>
                                {l.title}
                              </span>
                              <small>{l.goal}</small>
                            </span>
                            {rec ? <span className="score">{rec.best}%</span> : isNext ? <span className="score">Next</span> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </Shell>
  );
}
