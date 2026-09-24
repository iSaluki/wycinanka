import { useMemo, useState } from 'react';
import { CHUNK_DECKS, CHUNKS, type ChunkDeck } from '../../content/chunks';
import { PageHead, SectionHead, Speak } from '../components/common';
import { Session, type SessionResult } from '../components/Session';
import { Shell } from '../components/Shell';
import { chunkExercise, chunkLearnSession, shuffle, type Exercise } from '../lib/exercises';
import { useTitle } from '../lib/router';
import { dueCards, submitReviews, useApp } from '../lib/store';

const REVIEW_SIZE = 20;
const CHUNK_IDS = new Set(CHUNKS.map((c) => c.id));

type Mode = { kind: 'learn' | 'practise'; deck: ChunkDeck } | { kind: 'review' };

/**
 * Lexical chunks: everyday phrases learnt as whole units, each with its word-for-word meaning to show why
 * translating piece by piece fails. Learnt phrases join the review deck.
 */
export function Phrases() {
  useTitle('Phrases');
  const progress = useApp((s) => s.progress);
  const cards = progress.cards;
  const [deckId, setDeckId] = useState(CHUNK_DECKS[0].id);
  const [session, setSession] = useState<{ mode: Mode; exercises: Exercise[] } | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const due = useMemo(() => dueCards(progress).filter(([id]) => CHUNK_IDS.has(id)), [progress]);
  const known = CHUNKS.filter((c) => cards.has(c.id)).length;
  const deck = CHUNK_DECKS.find((d) => d.id === deckId) ?? CHUNK_DECKS[0];
  const unlearnt = deck.chunks.filter((c) => !cards.has(c.id));
  const learnt = deck.chunks.filter((c) => cards.has(c.id));

  const start = (mode: Mode, exercises: Exercise[]) => {
    setNote(null);
    setSession({ mode, exercises });
  };

  const finish = async (r: SessionResult) => {
    const mode = session!.mode;
    setSession(null);
    setNote(
      mode.kind === 'learn'
        ? `Added ${r.ratings.size} phrases to your review deck. They'll come back just before you'd forget them.`
        : `You got ${r.correct} of ${r.total} right. The ones you missed will come back sooner.`,
    );
    await submitReviews([...r.ratings.entries()].map(([cardId, { rating, at }]) => ({ cardId, rating, at })));
  };

  if (session) {
    return <Session exercises={session.exercises} rateable={session.mode.kind === 'review'} onClose={() => setSession(null)} onFinish={finish} />;
  }

  const practise = (ids: string[]) =>
    ids.map((id) => chunkExercise(CHUNKS.find((c) => c.id === id)!, cards.get(id)?.reps ?? 0));

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Zwroty" en="Everyday phrases">
          Fluent speakers don't build “no problem” out of single words: they reach for <i lang="pl">nie ma sprawy</i> as one piece. Learn these
          phrases whole. The word-for-word meaning shows why translating piece by piece goes wrong.
        </PageHead>

        {note && (
          <div className="banner" role="status">
            <p>{note}</p>
          </div>
        )}

        <section className="stack">
          <SectionHead pl="Powtórka" en={due.length ? `${due.length} phrase${due.length === 1 ? '' : 's'} due` : 'nothing due'} />
          {due.length > 0 ? (
            <button
              className="btn red"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => start({ kind: 'review' }, practise(due.slice(0, REVIEW_SIZE).map(([id]) => id)))}
            >
              Review {Math.min(due.length, REVIEW_SIZE)} phrase{due.length === 1 ? '' : 's'}
            </button>
          ) : (
            <p className="muted">
              {known
                ? `You know ${known} of ${CHUNKS.length} phrases. None are due yet — practise a set below, or learn a new one.`
                : 'Learn your first set below, and its phrases will come back here for review.'}
            </p>
          )}
        </section>

        <div className="bands" role="group" aria-label="Phrase sets">
          {CHUNK_DECKS.map((d) => {
            const k = d.chunks.filter((c) => cards.has(c.id)).length;
            return (
              <button key={d.id} className="band" aria-pressed={deck.id === d.id} onClick={() => setDeckId(d.id)}>
                <b lang="pl">{d.pl}</b>
                <span style={{ fontSize: 13 }}>{d.en}</span>
                <span className="meter" aria-hidden="true">
                  <span style={{ width: `${(k / d.chunks.length) * 100}%` }} />
                </span>
                <span style={{ fontSize: 13 }} className="muted">
                  {k} of {d.chunks.length} learnt
                </span>
              </button>
            );
          })}
        </div>

        <div className="row between wrap">
          <h2 style={{ fontSize: 30 }}>
            <span lang="pl">{deck.pl}</span> <small className="muted" style={{ fontSize: 18 }}>{deck.en}</small>
          </h2>
          <div className="row wrap">
            {learnt.length > 0 && (
              <button className="btn quiet" onClick={() => start({ kind: 'practise', deck }, shuffle(practise(learnt.map((c) => c.id))))}>
                Practise {learnt.length}
              </button>
            )}
            <button className="btn red" disabled={!unlearnt.length} onClick={() => start({ kind: 'learn', deck }, chunkLearnSession(unlearnt))}>
              {unlearnt.length ? `Learn ${unlearnt.length} new phrase${unlearnt.length === 1 ? '' : 's'}` : 'All learnt'}
            </button>
          </div>
        </div>

        <ul className="culture-words phrase-chunks" aria-label={`${deck.en} phrases`}>
          {deck.chunks.map((c) => (
            <li key={c.id}>
              <Speak text={c.pl} label={`Play ${c.pl}`} />
              <div>
                <span className="pl" lang="pl">
                  {c.pl}
                </span>
                <span className="en">{c.en}</span>
                {c.lit && <span className="lit">word for word: “{c.lit}”</span>}
                {c.ex && (
                  <span className="ex">
                    <span lang="pl">{c.ex[0]}</span> — {c.ex[1]}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
