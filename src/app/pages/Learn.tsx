import { Fragment, useEffect } from 'react';
import { startPosition, UNITS } from '../../content/course';
import { cultureAfter } from '../../content/culture-stops';
import type { Lesson, Level } from '../../content/types';
import { PageHead } from '../components/common';
import { Shell } from '../components/Shell';
import { useCultureSeen } from '../lib/cultureStops';
import { useStats } from '../lib/derived';
import { unitCardIds } from '../lib/reinforce';
import { Link, useTitle } from '../lib/router';
import { useApp } from '../lib/store';
import { MASTERY } from '../../shared/progress';

const LEVELS: Array<[Level | 'A0', string, string, string]> = [
  ['A0', 'Alfabet', 'Letters and sounds', 'Read any Polish word aloud before learning a single phrase.'],
  ['A1', 'Początkujący', 'Beginner', 'Greetings and small talk, the first cases, everyday verbs, family and the weather.'],
  ['A2', 'Podstawowy', 'Elementary', 'Past and future, aspect, getting around, free time, commands, health, comparing and advice.'],
  ['B1', 'Średnio zaawansowany', 'Intermediate', 'The conditional, quantities, plurals for people, który and swój, prefixed verbs of motion, work and home.'],
];

/**
 * A lesson finished below the mastery mark: done, but enough of it was missed that it is still worth coming back
 * to. Marked rather than locked — nothing in the course is ever locked.
 */
const shaky = (rec: { best: number } | undefined) => !!rec && rec.best < MASTERY;

export function Learn() {
  useTitle('Course');
  const stats = useStats();
  const progress = useApp((s) => s.progress);
  const startUnit = startPosition(useApp((s) => s.settings.startUnit));
  const cultureSeen = useCultureSeen();
  // Units close to where the learner is are open; finished units and those far ahead fold away.
  const here = UNITS.findIndex((u) => u.lessons.some((l) => l.id === stats.next?.id));
  const currentId = here >= 0 ? UNITS[here].id : undefined;
  useEffect(() => {
    if (currentId && currentId !== 'u00') document.getElementById(currentId)?.scrollIntoView({ block: 'start' });
  }, [currentId]);

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Nauka" en="The course">
          The alphabet, then {UNITS.length - 1} units up to B1. Every lesson is open; the red one is where we'd go next.
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
                  const open = current || (done > 0 && !complete) || (!complete && here >= 0 && u.n > here && u.n <= here + 3);
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
                        <details className="unit-lessons" open={open}>
                          <summary>
                            {complete ? 'Finished' : done ? `${done} of ${u.lessons.length} done` : `${u.lessons.length} lessons`}
                            <span className="show"> · show lessons</span>
                          </summary>
                        <ol className="lesson-list">
                          {u.lessons.map((l, i) => {
                            const rec = progress.lessons.get(l.id);
                            const isNext = l.id === stats.next?.id;
                            const culture = cultureAfter(l.id);
                            return (
                              <Fragment key={l.id}>
                              <li>
                                <Link
                                  to={`/lesson/${l.id}`}
                                  className={`lesson-link ${rec ? 'done' : ''} ${shaky(rec) ? 'shaky' : ''} ${isNext ? 'next' : ''}`}
                                >
                                  <span className="dot" aria-hidden="true" />
                                  <span className="t">
                                    <span>
                                      <span className="sr-only">Lesson {i + 1}: </span>
                                      {l.title}
                                    </span>
                                    <small>
                                      {shaky(rec) ? <span className="again">Worth another go · </span> : null}
                                      {l.goal} <span className="lesson-meta">{lessonMeta(l)}</span>
                                    </small>
                                  </span>
                                  {rec ? <span className="score">{rec.best}%</span> : isNext ? <span className="score">dalej</span> : null}
                                </Link>
                              </li>
                              {culture && (
                                <li>
                                  <Link to={`/course/culture/${culture.id}`} className={`lesson-link culture-stop ${cultureSeen.has(culture.id) ? 'done' : ''}`}>
                                    <span className="dot" aria-hidden="true" />
                                    <span className="t">
                                      <span>
                                        <span className="sr-only">Culture break: </span>
                                        {culture.title}
                                      </span>
                                      <small>Culture break · reading only, skip it if you like</small>
                                    </span>
                                    <span className="score" lang="pl">
                                      kultura
                                    </span>
                                  </Link>
                                </li>
                              )}
                              </Fragment>
                            );
                          })}
                        </ol>
                        {revisable && (
                          <Link to={`/practice/unit/${u.id}`} className="btn small quiet" style={{ justifySelf: 'start' }}>
                            Revise this unit
                          </Link>
                        )}
                        </details>
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

/**
 * What a lesson holds and roughly how long it takes. A lesson asks about each new word twice, uses each sentence
 * and drill once, and adds about eighteen steps of its own (warm-up, speaking, the conversation); a step takes
 * fifteen seconds or so.
 */
function lessonMeta(l: Lesson): string {
  const steps = l.items.length * 2 + l.sentences.length + l.drills.length + (l.phonics ? 8 : 18);
  const minutes = Math.max(3, Math.round((steps * 15) / 60));
  return l.phonics ? `· ${l.items.length} sounds · ~${minutes} min` : `· ${l.items.length} new words · ~${minutes} min`;
}
