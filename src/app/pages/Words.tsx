import { useMemo, useState } from 'react';
import { BAND_SIZE, COVERAGE, FREQUENCY } from '../../content/frequency';
import type { Item } from '../../content/types';
import { PageHead, SectionHead, Speak } from '../components/common';
import { respell } from '../../shared/phonetics';
import { Session, type SessionResult } from '../components/Session';
import { Shell } from '../components/Shell';
import { shuffle, stepwise, wordInSentence, type Exercise } from '../lib/exercises';
import { useTitle } from '../lib/router';
import { submitReviews, useApp } from '../lib/store';

const BANDS = Array.from({ length: FREQUENCY.length / BAND_SIZE }, (_, i) => FREQUENCY.slice(i * BAND_SIZE, (i + 1) * BAND_SIZE));
const LEARN_BATCH = 8;

/** Meet a batch of new words a few at a time, recognising each one straight away, then recall some. Results seed their review cards. */
function learnSession(words: typeof FREQUENCY): Exercise[] {
  const items: Item[] = words.map((w) => ({ id: w.id, pl: w.pl, en: w.en, hint: w.ex ? `${w.ex[0]} — ${w.ex[1]}` : undefined }));
  const enPool = FREQUENCY.slice(0, 200).map((w) => w.en);
  const choose = (w: Item): Exercise => ({
    kind: 'choose',
    cardId: w.id,
    prompt: w.pl,
    promptLang: 'pl',
    answer: w.en,
    options: shuffle([w.en, ...shuffle(enPool.filter((e) => e !== w.en)).slice(0, 3)]),
  });
  const mixed = shuffle(words);
  const type: Exercise[] = mixed.slice(0, 4).map((w) => ({ kind: 'type', cardId: w.id, prompt: w.en, accepted: [w.pl], lang: 'pl', hint: w.pos }));
  // Then three of the others in use: their example sentences, built from tiles.
  const inUse = mixed.slice(4).flatMap((w) => wordInSentence(w) ?? []).slice(0, 3);
  return [...stepwise(items, choose, (w) => ({ cardId: w.id, pl: w.pl, en: w.en })), ...type, ...inUse];
}

export function Words() {
  useTitle('Words');
  const cards = useApp((s) => s.progress.cards);
  const [band, setBand] = useState(0);
  const [session, setSession] = useState<Exercise[] | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const known = useMemo(() => FREQUENCY.filter((w) => cards.has(w.id)).length, [cards]);
  const words = BANDS[band];
  const unlearnt = words.filter((w) => !cards.has(w.id));

  const finish = async (r: SessionResult) => {
    setSession(null);
    setNote(`Added ${r.ratings.size} words to your review deck. They'll come back when they're due.`);
    await submitReviews([...r.ratings.entries()].map(([cardId, { rating, at }]) => ({ cardId, rating, at })));
  };

  if (session) return <Session exercises={session} onClose={() => setSession(null)} onFinish={finish} />;

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Słowa" en="The 500 words that matter most">
          Ordered by how often they're heard in everyday Polish. Learn them eight at a time and they join your review deck.
        </PageHead>

        <section className="stack" aria-labelledby="cov">
          <SectionHead pl="Najpierw najczęstsze" en="why frequency first?" />
          <p className="muted">
            In film and TV dialogue, the 100 most common word forms make up <b>{COVERAGE[2][1]}%</b> of everything said, and the top 1,000
            make up <b>{COVERAGE[5][1]}%</b>.
          </p>
          <div className="coverage-bar" aria-hidden="true">
            <span style={{ width: `${(known / FREQUENCY.length) * 100}%` }} />
          </div>
          <p style={{ fontSize: 14 }}>
            You're learning <b>{known}</b> of {FREQUENCY.length} core words.
          </p>
        </section>

        {note && (
          <div className="banner" role="status">
            <p>{note}</p>
          </div>
        )}

        <div className="bands" role="group" aria-label="Word bands">
          {BANDS.map((b, i) => {
            const k = b.filter((w) => cards.has(w.id)).length;
            return (
              <button key={i} className="band" aria-pressed={band === i} onClick={() => setBand(i)}>
                <b>
                  {i * BAND_SIZE + 1}–{(i + 1) * BAND_SIZE}
                </b>
                <span className="meter" aria-hidden="true">
                  <span style={{ width: `${(k / b.length) * 100}%` }} />
                </span>
                <span style={{ fontSize: 13 }} className="muted">
                  {k} of {b.length} learnt
                </span>
              </button>
            );
          })}
        </div>

        <div className="row between wrap">
          <h2 style={{ fontSize: 30 }}>
            <span lang="pl">Słowa</span> {band * BAND_SIZE + 1}–{(band + 1) * BAND_SIZE}
          </h2>
          <button
            className="btn red"
            disabled={!unlearnt.length}
            onClick={() => {
              setNote(null);
              setSession(learnSession(unlearnt.slice(0, LEARN_BATCH)));
            }}
          >
            {unlearnt.length ? `Learn ${Math.min(LEARN_BATCH, unlearnt.length)} new words` : 'All learnt'}
          </button>
        </div>

        <ol className="word-list">
          {words.map((w) => (
            <li key={w.id}>
              <span className="rank">{w.rank}</span>
              <div className="w">
                <div className="row" style={{ gap: 8 }}>
                  <span className="pl" lang="pl">
                    {w.pl}
                  </span>
                  {cards.has(w.id) && <span className="known-dot" title="In your review deck" aria-label="In your review deck" />}
                </div>
                <small>
                  {w.en} · <i>{w.pos}</i> · <span className="say">{respell(w.pl)}</span>
                </small>
                {w.ex && (
                  <span className="ex">
                    <Speak text={w.ex[0]} label={`Play the example: ${w.ex[0]}`} />
                    <span className="pl" lang="pl">
                      {w.ex[0]}
                    </span>{' '}
                    — {w.ex[1]}
                  </span>
                )}
              </div>
              <Speak text={w.pl} label={`Play ${w.pl}`} />
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}
