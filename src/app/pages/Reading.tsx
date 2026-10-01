import { useEffect, useMemo, useRef, useState } from 'react';
import { READING, getText, wordCount, type ReadingQuestion, type ReadingText } from '../../content/reading';
import { unitByKey } from '../../content/course';
import { respell } from '../../shared/phonetics';
import { shuffle } from '../lib/exercises';
import { Label, PageHead, SectionHead, Speak } from '../components/common';
import { IconArrow } from '../components/icons';
import { Shell } from '../components/Shell';
import { useStats } from '../lib/derived';
import { markRead, useReadingDone } from '../lib/readingDone';
import { Link, navigate, useTitle } from '../lib/router';
import { speak, stopSpeaking } from '../lib/speech';
import { playCorrect, playWrong } from '../lib/sfx';
import { NotFound } from './NotFound';

/**
 * Reading and listening: whole texts rather than single sentences.
 *
 * The order of the stages is the pedagogy, not decoration. A text is **heard once with nothing on screen** and
 * answered for the gist, because listening to Polish you can't see is the skill the course never asks for.
 * Only then is it read, with the English hidden line by line, so the learner works out the Polish before
 * checking — a translation on the page turns reading into decoding. Detail questions come last.
 *
 * The comprehension questions are deliberately not review cards. They ask about one text, they are answered once,
 * and there is nothing in them to bring back on a schedule; what a text leaves behind is the words it used, which
 * already have cards of their own.
 */

const LEVELS: Array<[ReadingText['level'], string, string]> = [
  ['A1', 'Początkujący', 'Beginner'],
  ['A2', 'Podstawowy', 'Elementary'],
  ['B1', 'Średnio zaawansowany', 'Intermediate'],
];

export function Reading({ id }: { id?: string }) {
  const text = id ? getText(id) : undefined;
  if (id && !text) return <NotFound />;
  return text ? <Reader text={text} /> : <TextList />;
}

/* ---------- The list ---------- */

function TextList() {
  useTitle('Reading');
  const done = useReadingDone();
  const stats = useStats();
  // The furthest unit the learner has finished a lesson in: enough to say which texts are comfortable yet.
  const reached = Math.max(0, ...[...stats.done].map((lessonId) => unitOf(lessonId)));
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Czytanie" en="Reading and listening">
          Whole texts, not single sentences. Each one is heard first with no words on screen, then read with the
          English hidden, then asked about. Everything in them is built from what the course teaches.
        </PageHead>

        {LEVELS.map(([level, pl, en]) => {
          const texts = READING.filter((t) => t.level === level);
          if (!texts.length) return null;
          return (
            <section className="stack" key={level} aria-labelledby={`reading-${level}`}>
              <SectionHead pl={pl} en={en} id={`reading-${level}`} />
              <ol className="reading-list">
                {texts.map((t) => {
                  const unit = unitByKey(t.after);
                  const ahead = unit ? unit.n > reached : false;
                  return (
                    <li key={t.id}>
                      <Link to={`/reading/${t.id}`} className={`reading-link ${done.has(t.id) ? 'done' : ''}`}>
                        <span className="dot" aria-hidden="true" />
                        <span className="t">
                          <span lang="pl">{t.titlePl}</span>
                          <small>
                            {t.blurb}{' '}
                            <span className="lesson-meta">
                              {wordCount(t)} words
                              {ahead && unit ? ` · easier after Unit ${unit.n}` : ''}
                            </span>
                          </small>
                        </span>
                        {done.has(t.id) && <span className="score">✓</span>}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        <p className="muted" style={{ fontSize: 14 }}>
          Nothing here is locked. A text above your level is still worth listening to: hearing Polish you only half
          understand is how the rest of it starts to come apart into words.
        </p>
      </div>
    </Shell>
  );
}

const unitOf = (lessonId: string) => {
  const key = Number(lessonId.slice(1, 3));
  return unitByKey(key)?.n ?? 0;
};

/* ---------- The reader ---------- */

type Stage = 'intro' | 'listen' | 'gist' | 'read' | 'detail' | 'done';

function Reader({ text }: { text: ReadingText }) {
  useTitle(text.title);
  const [stage, setStage] = useState<Stage>('intro');
  const [right, setRight] = useState(0);
  const total = text.questions.length;
  useEffect(() => () => stopSpeaking(), []);
  const answered = (ok: boolean) => setRight((n) => n + (ok ? 1 : 0));

  const gist = text.questions.filter((q) => q.stage === 'gist');
  const detail = text.questions.filter((q) => q.stage === 'detail');

  return (
    <Shell>
      <article className="stack-lg reading-text">
        <p className="muted" style={{ fontSize: 15 }}>
          <Link to="/reading">← All texts</Link>
        </p>
        <PageHead pl={text.titlePl} en={text.title}>
          {text.blurb}
        </PageHead>

        {stage === 'intro' && (
          <div className="stack">
            <p>
              First you will <b>hear it once</b>, with nothing on screen. Don't worry about every word — listen for
              what it is about. You can play it as many times as you like.
            </p>
            <button className="btn red" style={{ alignSelf: 'flex-start' }} onClick={() => setStage('listen')}>
              Listen <IconArrow width={20} height={20} />
            </button>
          </div>
        )}

        {stage === 'listen' && (
          <div className="stack">
            <PlayAll text={text} />
            <p className="muted">
              {wordCount(text)} words, read straight through. Nothing to read yet — that comes after the questions.
            </p>
            <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => (stopSpeaking(), setStage('gist'))}>
              I've listened
            </button>
          </div>
        )}

        {stage === 'gist' && (
          <Questions
            key="gist"
            questions={gist}
            lead="From what you heard — the text is still hidden."
            onAnswered={answered}
            onDone={() => setStage('read')}
            nextLabel="Now read it"
          />
        )}

        {stage === 'read' && (
          <div className="stack-lg">
            <Lines text={text} />
            <NewWords text={text} />
            <button className="btn red" style={{ alignSelf: 'flex-start' }} onClick={() => setStage('detail')}>
              Check what you understood <IconArrow width={20} height={20} />
            </button>
          </div>
        )}

        {stage === 'detail' && (
          <Questions
            key="detail"
            questions={detail}
            lead="Now the details. Look back at the text if you need to."
            onAnswered={answered}
            onDone={() => (markRead(text.id), setStage('done'))}
            nextLabel="Finish"
          />
        )}

        {stage === 'done' && <Done text={text} right={right} total={total} />}
      </article>
    </Shell>
  );
}

/** The whole text read straight through, one sentence after another, at natural speed. */
function PlayAll({ text }: { text: ReadingText }) {
  const [at, setAt] = useState(-1);
  const stop = useRef(false);
  const play = () => {
    stop.current = false;
    const next = (i: number) => {
      if (stop.current || i >= text.lines.length) {
        setAt(-1);
        return;
      }
      setAt(i);
      speak(text.lines[i].pl, { natural: true, voice: text.voice, onEnd: () => next(i + 1) });
    };
    next(0);
  };
  const halt = () => {
    stop.current = true;
    stopSpeaking();
    setAt(-1);
  };
  const playing = at >= 0;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <button className="btn red big-play" onClick={playing ? halt : play} style={{ alignSelf: 'flex-start' }}>
        {playing ? 'Stop' : 'Play the whole text'}
      </button>
      <p className="muted small" aria-live="polite">
        {playing ? `Sentence ${at + 1} of ${text.lines.length}` : `${text.lines.length} sentences`}
      </p>
    </div>
  );
}

/** The text to read: Polish, with each line's English hidden until it is asked for. */
function Lines({ text }: { text: ReadingText }) {
  const [shown, setShown] = useState<ReadonlySet<number>>(new Set());
  const all = shown.size === text.lines.length;
  const toggle = (i: number) =>
    setShown((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  return (
    <section className="stack" aria-labelledby="the-text">
      <div className="row between wrap">
        <SectionHead pl="Tekst" en="the text" id="the-text" />
        <button
          type="button"
          className="btn small quiet"
          onClick={() => setShown(all ? new Set() : new Set(text.lines.map((_, i) => i)))}
        >
          {all ? 'Hide the English' : 'Show all the English'}
        </button>
      </div>
      <p className="muted small">
        Work out each line first, then check it. Tap the speaker to hear one sentence again.
      </p>
      <ol className="reading-lines">
        {text.lines.map((l, i) => (
          <li key={i}>
            <Speak text={l.pl} voice={text.voice} label={`Play: ${l.pl}`} />
            <div>
              <span className="pl" lang="pl">
                {l.pl}
              </span>
              {shown.has(i) ? (
                <span className="en">{l.en}</span>
              ) : (
                <button type="button" className="reveal" onClick={() => toggle(i)}>
                  Show the English
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Words in the text the course hasn't taught: glossed, with their sound, never tested. */
function NewWords({ text }: { text: ReadingText }) {
  if (!text.words.length) return null;
  return (
    <section className="stack" aria-labelledby="new-words">
      <SectionHead pl="Nowe słowa" en="new here" id="new-words" />
      <p className="muted small">
        Not in the course yet, so they are given rather than tested. Everything else in the text you have met.
      </p>
      <ul className="culture-words" id="new-words-list">
        {text.words.map(([pl, en]) => (
          <li key={pl}>
            <Speak text={pl} label={`Play ${pl}`} />
            <div>
              <span className="pl" lang="pl">
                {pl}
              </span>
              <span className="say">{respell(pl)}</span>
              <span className="en">{en}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One comprehension question at a time. These never reach the review deck, so this is a plain right-or-wrong
 * check rather than a graded session: it asks, it says, it moves on.
 */
function Questions({
  questions,
  lead,
  onAnswered,
  onDone,
  nextLabel,
}: {
  questions: ReadingQuestion[];
  lead: string;
  onAnswered: (ok: boolean) => void;
  onDone: () => void;
  nextLabel: string;
}) {
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const q = questions[at];
  // Shuffled once per question, so the right answer isn't always in the same place.
  const shown = useMemo(() => shuffle(q.options), [q]);

  const pick = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    onAnswered(ok);
    if (ok) playCorrect();
    else playWrong();
  };
  const next = () => {
    setPicked(null);
    if (at + 1 < questions.length) setAt(at + 1);
    else onDone();
  };

  return (
    <section className="stack" aria-labelledby="question">
      <SectionHead pl="Pytanie" en={`question ${at + 1} of ${questions.length}`} id="question" />
      <p className="muted small">{lead}</p>
      <p className="prompt-en">{q.q}</p>
      <div className="options" role="group" aria-label="Answers">
        {shown.map((o, i) => {
          const state = picked ? (o === q.answer ? 'right' : o === picked ? 'wrong' : '') : '';
          return (
            <button key={o} type="button" className={`option ${state}`} aria-pressed={picked === o} disabled={!!picked && !state} onClick={() => pick(o)}>
              <span className="key" aria-hidden="true">
                {i + 1}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className={`banner ${picked === q.answer ? '' : 'warn'}`} role="status">
          <p>
            {picked === q.answer ? (
              <>
                <b lang="pl">Tak!</b> That's it.
              </>
            ) : (
              <>
                <b lang="pl">Nie.</b> It's "{q.answer}".
              </>
            )}
          </p>
          <button type="button" className="btn small" onClick={next}>
            {at + 1 < questions.length ? 'Next question' : nextLabel}
          </button>
        </div>
      )}
    </section>
  );
}

function Done({ text, right, total }: { text: ReadingText; right: number; total: number }) {
  const i = READING.indexOf(text);
  const next = READING[i + 1];
  return (
    <div className="stack">
      <h2 lang="pl">Przeczytane!</h2>
      <p>
        You understood <b>{right}</b> of {total} questions, and read {wordCount(text)} words of Polish.
      </p>
      <p className="muted" style={{ maxWidth: '52ch' }}>
        Worth coming back to in a week: the second time through, you will hear words you missed the first time, and
        the ones you have since met in lessons will jump out.
      </p>
      <div className="row wrap">
        {next && (
          <button className="btn red" onClick={() => navigate(`/reading/${next.id}`)}>
            Next: {next.title} <IconArrow width={20} height={20} />
          </button>
        )}
        <Link to="/reading" className="btn quiet">
          All texts
        </Link>
      </div>
      <Label pl="czytaj dalej" en="keep reading" />
    </div>
  );
}
