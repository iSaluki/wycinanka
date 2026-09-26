import { useMemo, useState } from 'react';
import { unitByKey } from '../../content/course';
import { BANDS, bandFailed, isRight, PLACEMENT, placementResult } from '../../content/placement';
import { IconClose } from '../components/icons';
import { Label } from '../components/common';
import { navigate, useTitle } from '../lib/router';
import { updateSettings } from '../lib/store';
import { markWelcomed } from '../lib/welcome';

export function Placement() {
  useTitle('Placement check');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [typed, setTyped] = useState('');
  const q = PLACEMENT[i];

  const result = useMemo(() => placementResult(answers), [answers]);

  const answer = (opt: string) => {
    const next = { ...answers, [q.id]: opt };
    setAnswers(next);
    // Stop as soon as a band can no longer reach two thirds, or at the end.
    if (bandFailed(q.band, next) || i + 1 >= PLACEMENT.length) {
      setDone(true);
      return;
    }
    setI(i + 1);
    setTyped('');
  };

  const accept = async (unit: number) => {
    markWelcomed();
    await updateSettings({ startUnit: unit, placementBand: Math.min(result.band, 6) });
    navigate('/learn');
  };

  if (done) {
    const unit = unitByKey(result.startUnit)!;
    const band = BANDS.find((b) => b.band === result.band);
    const right = PLACEMENT.filter((p) => isRight(p, answers[p.id])).length;
    return (
      <main className="player">
        <div />
        <div className="finish">
          <Label pl="wynik" en="placement result" />
          <h1>Start at Unit {unit.n}</h1>
          <p className="muted" style={{ maxWidth: '46ch' }}>
            You answered {right} of {Object.keys(answers).length} correctly.{' '}
            {band ? `Your next step is “${band.label}”.` : 'You know everything this course covers — start at B1 to keep it fresh.'} Earlier
            units stay open, so you can dip back any time.
          </p>
          <div style={{ textAlign: 'left', maxWidth: 460, width: '100%', borderTop: '1.5px solid var(--ink)', paddingTop: 16 }}>
            <Label pl={unit.titlePl} en={`Unit ${unit.n} · ${unit.level}`} />
            <h2 style={{ fontSize: 26, margin: '6px 0' }}>{unit.title}</h2>
            <p className="muted">{unit.summary}</p>
          </div>
          <div className="row wrap" style={{ justifyContent: 'center' }}>
            <button className="btn red" onClick={() => accept(unit.key)}>
              Start at Unit {unit.n}
            </button>
            <button className="btn quiet" onClick={() => accept(1)}>
              Start from the beginning
            </button>
          </div>
        </div>
        <div />
      </main>
    );
  }

  const [before, after] = (q.text ?? '').split('___');
  return (
    <main className="player">
      <div className="player-top">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="Leave the placement check">
          <IconClose />
        </button>
        <div className="stripes" role="progressbar" aria-valuemin={0} aria-valuemax={PLACEMENT.length} aria-valuenow={i} aria-label="Progress">
          {PLACEMENT.map((p, k) => (
            <span key={p.id} className={k < i ? 'on' : k === i ? 'now' : ''} />
          ))}
        </div>
      </div>
      <div className="player-body">
        <div className="instruction">
          Question {i + 1} of up to {PLACEMENT.length}
        </div>
        <p className="prompt-en">{q.prompt}</p>
        {q.text && (
          <p className="gap-text" lang="pl">
            {before}
            <span className="gap-slot">{' '}</span>
            {after}
          </p>
        )}
        {q.options ? (
        <div className="options grid-2" key={q.id}>
          {q.options.map((o, k) => (
            <button key={o} className={`option ${q.text ? 'pl-opt' : ''}`} onClick={() => answer(o)} lang={q.text ? 'pl' : 'en'}>
              <span className="key" aria-hidden="true">
                {k + 1}
              </span>
              {o}
            </button>
          ))}
          <button className="option" onClick={() => answer('')}>
            <span className="key" aria-hidden="true">
              ?
            </span>
            I don't know
          </button>
        </div>
        ) : (
          <form
            key={q.id}
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim()) answer(typed);
            }}
          >
            <input
              className="answer-input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              lang="pl"
              aria-label="The missing word, in Polish"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
              maxLength={60}
              autoFocus
            />
            <p className="keys-tip">Polish letters are welcome but not needed here: “bede” counts for “będę”.</p>
            <div className="row wrap">
              <button type="submit" className="btn red" disabled={!typed.trim()}>
                Check
              </button>
              <button type="button" className="btn quiet" onClick={() => answer('')}>
                I don't know
              </button>
            </div>
          </form>
        )}
      </div>
      <div />
    </main>
  );
}
