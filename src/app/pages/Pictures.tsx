import { useMemo, useState } from 'react';
import { PICTURE_DECKS, PICTURES, type Picture, type PictureDeck } from '../../content/pictures';
import type { Item } from '../../content/types';
import { GENDER_LABEL, PageHead, SectionHead, Speak } from '../components/common';
import { Session, type SessionResult } from '../components/Session';
import { Shell } from '../components/Shell';
import { pictureChoice, shuffle, type Exercise } from '../lib/exercises';
import { useTitle } from '../lib/router';
import { dueCards, submitReviews, useApp } from '../lib/store';

const REVIEW_SIZE = 20;
const PICTURE_IDS = new Set(PICTURES.map((p) => p.id));
const deckOf = new Map(PICTURE_DECKS.flatMap((d) => d.pictures.map((p) => [p.id, d] as const)));

const quiz = (p: Picture) => pictureChoice(p, deckOf.get(p.id)!.pictures.map((x) => x.pl));

/** First meeting: each picture with its Polish and English, then pick the Polish for each picture. */
function learnSession(pictures: Picture[]): Exercise[] {
  const items: Item[] = pictures.map((p) => ({ id: p.id, pl: p.pl, en: p.en, g: p.g, img: p.img }));
  return [{ kind: 'meet', items }, ...shuffle(pictures).map(quiz)];
}

type Mode = { kind: 'learn' | 'practise'; deck: PictureDeck } | { kind: 'review' };

export function Pictures() {
  useTitle('Pictures');
  const cards = useApp((s) => s.progress.cards);
  const progress = useApp((s) => s.progress);
  const [deckId, setDeckId] = useState(PICTURE_DECKS[0].id);
  const [session, setSession] = useState<{ mode: Mode; exercises: Exercise[] } | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const due = useMemo(() => dueCards(progress).filter(([id]) => PICTURE_IDS.has(id)), [progress]);
  const known = PICTURES.filter((p) => cards.has(p.id)).length;
  const deck = PICTURE_DECKS.find((d) => d.id === deckId) ?? PICTURE_DECKS[0];
  const unlearnt = deck.pictures.filter((p) => !cards.has(p.id));
  const learnt = deck.pictures.filter((p) => cards.has(p.id));

  const start = (mode: Mode, exercises: Exercise[]) => {
    setNote(null);
    setSession({ mode, exercises });
  };

  const finish = async (r: SessionResult) => {
    const mode = session!.mode;
    setSession(null);
    setNote(
      mode.kind === 'learn'
        ? `Added ${r.ratings.size} pictures to your review deck. You'll be quizzed on them again when they're due.`
        : `You named ${r.correct} of ${r.total} correctly. The ones you missed will come back sooner.`,
    );
    await submitReviews([...r.ratings.entries()].map(([cardId, { rating, at }]) => ({ cardId, rating, at })));
  };

  if (session) return <Session exercises={session.exercises} onClose={() => setSession(null)} rateable={session.mode.kind === 'review'} onFinish={finish} />;

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Obrazki" en="Picture flashcards">
          See the thing, say the Polish. Meet each picture with its Polish and English name, then pick the right Polish word from four.
          Pictures you've learnt come back for a quiz just before you're likely to forget them.
        </PageHead>

        {note && (
          <div className="banner" role="status">
            <p>{note}</p>
          </div>
        )}

        <section className="stack">
          <SectionHead pl="Quiz" en={due.length ? `${due.length} picture${due.length === 1 ? '' : 's'} to name` : 'nothing due'} />
          {due.length > 0 ? (
            <button
              className="btn red"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => start({ kind: 'review' }, due.slice(0, REVIEW_SIZE).map(([id]) => quiz(PICTURES.find((p) => p.id === id)!)))}
            >
              Quiz me on {Math.min(due.length, REVIEW_SIZE)} picture{due.length === 1 ? '' : 's'}
            </button>
          ) : (
            <p className="muted">
              {known
                ? `You know ${known} of ${PICTURES.length} pictures. None are due yet — practise a deck below, or learn a new one.`
                : 'Learn your first deck below, and its pictures will come back here for a quiz.'}
            </p>
          )}
        </section>

        <div className="bands" role="group" aria-label="Picture decks">
          {PICTURE_DECKS.map((d) => {
            const k = d.pictures.filter((p) => cards.has(p.id)).length;
            return (
              <button key={d.id} className="band" aria-pressed={deck.id === d.id} onClick={() => setDeckId(d.id)}>
                <b lang="pl">{d.pl}</b>
                <span style={{ fontSize: 13 }}>{d.en}</span>
                <span className="meter" aria-hidden="true">
                  <span style={{ width: `${(k / d.pictures.length) * 100}%` }} />
                </span>
                <span style={{ fontSize: 13 }} className="muted">
                  {k} of {d.pictures.length} learnt
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
              <button className="btn quiet" onClick={() => start({ kind: 'practise', deck }, shuffle(learnt).map(quiz))}>
                Practise {learnt.length}
              </button>
            )}
            <button className="btn red" disabled={!unlearnt.length} onClick={() => start({ kind: 'learn', deck }, learnSession(unlearnt))}>
              {unlearnt.length ? `Learn ${unlearnt.length} new picture${unlearnt.length === 1 ? '' : 's'}` : 'All learnt'}
            </button>
          </div>
        </div>

        <ul className="picture-grid" aria-label={`${deck.en} pictures`}>
          {deck.pictures.map((p) => {
            const isKnown = cards.has(p.id);
            return (
              <li key={p.id} className={isKnown ? 'known' : ''}>
                <img src={p.img} alt={isKnown ? p.en : ''} width={96} height={96} loading="lazy" draggable={false} />
                {isKnown ? (
                  <>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="pl" lang="pl">
                        {p.pl}
                      </span>
                      <Speak text={p.pl} label={`Play ${p.pl}`} />
                    </div>
                    <small>
                      {p.en} · <i>{GENDER_LABEL[p.g]}</i>
                    </small>
                  </>
                ) : (
                  <small className="muted">Not learnt yet</small>
                )}
              </li>
            );
          })}
        </ul>

        <p className="muted" style={{ fontSize: 13 }}>
          Pictures: <a href="https://github.com/jdecked/twemoji">Twemoji</a> by Twitter, Inc. and other contributors, licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
        </p>
      </div>
    </Shell>
  );
}
