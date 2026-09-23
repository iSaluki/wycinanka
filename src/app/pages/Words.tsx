import { useMemo, useState } from 'react';
import { BAND_SIZE, COVERAGE, FREQUENCY } from '../../content/frequency';
import type { Item } from '../../content/types';
import { PageHead, Speak } from '../components/common';
import { Session, type SessionResult } from '../components/Session';
import { Shell } from '../components/Shell';
import { shuffle, type Exercise } from '../lib/exercises';
import { useTitle } from '../lib/router';
import { submitReviews, useApp } from '../lib/store';

const BANDS = Array.from({ length: FREQUENCY.length / BAND_SIZE }, (_, i) => FREQUENCY.slice(i * BAND_SIZE, (i + 1) * BAND_SIZE));
const LEARN_BATCH = 8;

/** Meet a batch of new words, then recognise and recall each one. Results seed their review cards. */
function learnSession(words: typeof FREQUENCY): Exercise[] {
  const items: Item[] = words.map((w) => ({ id: w.id, pl: w.pl, en: w.en, hint: w.ex ? `${w.ex[0]} — ${w.ex[1]}` : undefined }));
  const enPool = FREQUENCY.slice(0, 200).map((w) => w.en);
  const choose: Exercise[] = shuffle(words).map((w) => ({
    kind: 'choose',
    cardId: w.id,
    prompt: w.pl,
    promptLang: 'pl',
    answer: w.en,
    options: shuffle([w.en, ...shuffle(enPool.filter((e) => e !== w.en)).slice(0, 3)]),
  }));
  const type: Exercise[] = shuffle(words)
    .slice(0, 4)
    .map((w) => ({ kind: 'type', cardId: w.id, prompt: w.en, accepted: [w.pl], lang: 'pl', hint: w.pos }));
  return [{ kind: 'meet', items }, ...choose, { kind: 'match', pairs: shuffle(words).slice(0, 5).map((w) => ({ cardId: w.id, pl: w.pl, en: w.en })) }, ...type];
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

  if (session) return <Session exercises={session} closeTo="/words" onFinish={finish} />;

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead eyebrow="Frequency list" title="The 500 words that matter most">
          Ordered by how often they're heard in everyday Polish. Learn them in small batches and they join your review deck.
        </PageHead>

        <section className="card coverage" aria-labelledby="cov">
          <h2 id="cov" style={{ fontSize: 22 }}>
            Why frequency first?
          </h2>
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
                <span className="eyebrow">Words</span>
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
          <h2 style={{ fontSize: 24 }}>
            Words {band * BAND_SIZE + 1}–{(band + 1) * BAND_SIZE}
          </h2>
          <button
            className="btn"
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
                  {w.en} · <i>{w.pos}</i>
                </small>
                {w.ex && (
                  <span className="ex">
                    <span className="pl" lang="pl">
                      {w.ex[0]}
                    </span>{' '}
                    — {w.ex[1]}
                  </span>
                )}
              </div>
              <Speak text={w.ex ? `${w.pl}. ${w.ex[0]}` : w.pl} label={`Play ${w.pl}`} />
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}
