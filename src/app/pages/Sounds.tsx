import { useState } from 'react';
import { MINIMAL_PAIRS, SOUND_GROUPS, TONGUE_TWISTERS } from '../../content/sounds';
import { PageHead, Speak, usePolishVoice } from '../components/common';
import { IconPlay } from '../components/icons';
import { Shell } from '../components/Shell';
import { shuffle } from '../lib/exercises';
import { useTitle } from '../lib/router';
import { speak } from '../lib/speech';

function PairGame() {
  const has = usePolishVoice();
  const [order] = useState(() => shuffle(MINIMAL_PAIRS.filter((p) => !p.same)));
  const [i, setI] = useState(0);
  const [target, setTarget] = useState<'a' | 'b'>(() => (Math.random() < 0.5 ? 'a' : 'b'));
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const pair = order[i % order.length];
  const word = pair[target][0];

  const pick = (side: 'a' | 'b') => {
    if (picked) return;
    setPicked(side);
    setScore((s) => ({ right: s.right + (side === target ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    setPicked(null);
    setI(i + 1);
    const t = Math.random() < 0.5 ? 'a' : 'b';
    setTarget(t);
    speak(order[(i + 1) % order.length][t][0]);
  };

  return (
    <section className="pair-game" aria-labelledby="pairs">
      <div className="row between wrap">
        <div>
          <div className="eyebrow">Ear training · {pair.contrast}</div>
          <h2 id="pairs" style={{ fontSize: 28 }}>
            Which word do you hear?
          </h2>
        </div>
        <span aria-live="polite">
          {score.right}/{score.total}
        </span>
      </div>
      {!has && <p>Your device has no Polish voice, so this game can't play audio. The sound cards below still show how each sound is made.</p>}
      <div className="row">
        <button className="big-play" onClick={() => speak(word)} disabled={!has} aria-label="Play the word">
          <IconPlay />
        </button>
        <button className="btn small quiet" onClick={() => speak(word, { slow: true })} disabled={!has}>
          Slower
        </button>
      </div>
      <div className="options grid-2">
        {(['a', 'b'] as const).map((side) => {
          const state = picked ? (side === target ? 'right' : side === picked ? 'wrong' : '') : '';
          return (
            <button key={side} className={`option pl-opt ${state}`} onClick={() => pick(side)} lang="pl">
              <span>
                {pair[side][0]} <span className="muted" style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }} lang="en">
                  — {pair[side][1]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="row between wrap">
          <p>{picked === target ? 'Dobrze! You heard it.' : `It was ${word}. Listen to both again, then try the next one.`}</p>
          <div className="row">
            <Speak text={pair.a[0]} label={`Play ${pair.a[0]}`} />
            <Speak text={pair.b[0]} label={`Play ${pair.b[0]}`} />
            <button className="btn small" onClick={next}>
              Next pair
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function Sounds() {
  useTitle('Sounds');
  const has = usePolishVoice();
  const same = MINIMAL_PAIRS.find((p) => p.same)!;
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead eyebrow="Pronunciation" title="The sounds of Polish">
          Polish spelling is regular: once you know these, you can read any word aloud. Tap a card to hear its examples.
        </PageHead>
        {!has && (
          <div className="banner">
            <p>
              No Polish voice was found on this device, so audio is off. On Windows add Polish under Settings → Time &amp; language → Speech; on
              macOS and iOS, under Accessibility → Spoken content → Voices; on Android, in Text-to-speech settings.
            </p>
          </div>
        )}

        <PairGame />

        {SOUND_GROUPS.map((g) => (
          <section key={g.id} className="stack" aria-labelledby={`g-${g.id}`}>
            <div>
              <h2 id={`g-${g.id}`} style={{ fontSize: 26 }}>
                {g.title}
              </h2>
              <p className="muted">{g.note}</p>
            </div>
            <div className="sound-grid">
              {g.sounds.map((s) => (
                <button
                  key={s.spelling}
                  className="sound"
                  onClick={() => speak(s.examples.map((e) => e[0]).join(', '))}
                  aria-label={`${s.spelling}: sounds like ${s.like}. Examples: ${s.examples.map((e) => `${e[0]}, ${e[1]}`).join('; ')}`}
                >
                  <span className="spell" lang="pl">
                    {s.spelling}
                  </span>
                  <span className="ipa">/{s.ipa}/</span>
                  <span className="like">{s.like}</span>
                  <span className="ex" lang="pl">
                    {s.examples.map((e) => e[0]).join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="card stack">
          <h2 style={{ fontSize: 24 }}>Same sound, different spelling</h2>
          <p>
            <span className="pl" lang="pl">
              {same.a[0]}
            </span>{' '}
            ({same.a[1]}) and{' '}
            <span className="pl" lang="pl">
              {same.b[0]}
            </span>{' '}
            ({same.b[1]}) sound identical: rz and ż are the same sound. Only spelling tells them apart, so learn each word's spelling as you meet it.
          </p>
          <div className="row">
            <Speak text={same.a[0]} label={`Play ${same.a[0]}`} />
            <Speak text={same.b[0]} label={`Play ${same.b[0]}`} />
          </div>
        </section>

        <section className="stack" aria-labelledby="tw">
          <h2 id="tw" style={{ fontSize: 26 }}>
            Tongue twisters
          </h2>
          <p className="muted">Poles use these on each other too. Start slowly.</p>
          {TONGUE_TWISTERS.map(([pl, en]) => (
            <div key={pl} className="card example">
              <Speak text={pl} slow />
              <Speak text={pl} />
              <div>
                <div className="pl" lang="pl" style={{ fontSize: 22 }}>
                  {pl}
                </div>
                <div className="muted">{en}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </Shell>
  );
}
