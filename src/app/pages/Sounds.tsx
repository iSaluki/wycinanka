import { useState } from 'react';
import { ALPHABET, DIGRAPHS, NOT_NATIVE } from '../../content/alphabet';
import { MINIMAL_PAIRS, SOUND_GROUPS, TONGUE_TWISTERS } from '../../content/sounds';
import { respell } from '../../shared/phonetics';
import { Label, PageHead, SectionHead, Speak, usePolishVoice } from '../components/common';
import { IconPlay } from '../components/icons';
import { Shell } from '../components/Shell';
import { shuffle } from '../lib/exercises';
import { Link, useTitle } from '../lib/router';
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
        <div className="stack" style={{ gap: 4 }}>
          <Label pl="ćwiczenie ucha" en={`ear training · ${pair.contrast}`} />
          <h2 id="pairs" style={{ fontSize: 30 }}>
            Which word do you hear?
          </h2>
        </div>
        <span aria-live="polite" style={{ font: '700 26px var(--font-pl)' }}>
          {score.right}/{score.total}
        </span>
      </div>
      {!has && (
        <p>
          This device has no Polish voice, so the game can't play audio. Read the respellings instead:{' '}
          <b>
            {pair.a[0]} = “{respell(pair.a[0])}”, {pair.b[0]} = “{respell(pair.b[0])}”
          </b>
          .
        </p>
      )}
      <div className="row">
        <button className="big-play" onClick={() => speak(word)} disabled={!has} aria-label="Play the word">
          <IconPlay />
        </button>
        <button className="btn small" style={{ background: 'var(--paper)', color: 'var(--ink)' }} onClick={() => speak(word, { slow: true })} disabled={!has}>
          Slower
        </button>
      </div>
      <div className="options grid-2">
        {(['a', 'b'] as const).map((side) => {
          const state = picked ? (side === target ? 'right' : side === picked ? 'wrong' : '') : '';
          return (
            <button key={side} className={`option pl-opt ${state}`} onClick={() => pick(side)} lang="pl">
              <span>
                {pair[side][0]}{' '}
                <span className="muted" style={{ fontFamily: 'var(--font-ui)', fontSize: 15 }} lang="en">
                  — {pair[side][1]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="row between wrap">
          <p>{picked === target ? 'Dobrze! You heard it.' : `It was ${word}. Listen to both again.`}</p>
          <div className="row">
            <Speak text={pair.a[0]} label={`Play ${pair.a[0]}`} />
            <Speak text={pair.b[0]} label={`Play ${pair.b[0]}`} />
            <button className="btn small red" onClick={next}>
              Next pair
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function AlphabetChart() {
  const [sel, setSel] = useState<string | null>(null);
  const letter = ALPHABET.find((l) => l.lower === sel);
  const say = (l: (typeof ALPHABET)[number]) => {
    setSel(l.lower);
    speak(`${l.name}. ${l.example[0]}`);
  };
  return (
    <section className="stack" aria-labelledby="abc">
      <SectionHead pl="Alfabet" en="32 letters — tap one to hear its name" />
      <div className="alphabet" role="group" aria-label="The Polish alphabet">
        {ALPHABET.map((l) => (
          <button key={l.lower} className={`letter ${l.special ? 'special' : ''}`} aria-pressed={sel === l.lower} onClick={() => say(l)} lang="pl">
            <span className="glyph">
              {l.upper}
              {l.lower}
            </span>
            <span className="name">{l.name}</span>
            <span className="snd" lang="en">
              {l.sound}
            </span>
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {letter ? (
          <p style={{ fontSize: 18 }}>
            <b className="pl" lang="pl" style={{ fontSize: 24 }}>
              {letter.upper}
            </b>{' '}
            is called <i className="pl">„{letter.name}”</i> and sounds like {letter.sound}:{' '}
            <span className="pl" lang="pl" style={{ fontSize: 22 }}>
              {letter.example[0]}
            </span>{' '}
            <span className="say">“{respell(letter.example[0])}”</span> — {letter.example[1]}.
          </p>
        ) : (
          <p className="muted">Letters in red don't exist in English. {NOT_NATIVE}</p>
        )}
      </div>
      <SectionHead pl="Dwuznaki" en="letter pairs that make one sound" />
      <div className="sound-grid">
        {DIGRAPHS.map((d) => (
          <button key={d.spelling} className="sound" onClick={() => speak(d.example[0])}>
            <span className="spell" lang="pl">
              {d.spelling}
            </span>
            <span className="like">{d.sound}</span>
            <span className="ex" lang="pl">
              {d.example[0]} <span className="say">“{respell(d.example[0])}”</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Sounds() {
  useTitle('Pronunciation');
  const has = usePolishVoice();
  const same = MINIMAL_PAIRS.find((p) => p.same)!;
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Wymowa" en="Pronunciation">
          Polish spelling is regular: learn which letters make which sounds and you can read any word aloud. New to the letters? The{' '}
          <Link to="/lesson/u00-l1">Alphabet &amp; phonics unit</Link> teaches them step by step, and the{' '}
          <Link to="/tools">pronouncer</Link> reads out anything you type.
        </PageHead>
        {!has && (
          <div className="banner">
            <p>
              No Polish voice was found on this device, so audio is off. On Windows add Polish under Settings → Time &amp; language → Speech; on
              macOS and iOS under Accessibility → Spoken content → Voices; on Android in Text-to-speech settings. Respellings are shown
              everywhere in the meantime.
            </p>
          </div>
        )}

        <AlphabetChart />

        <PairGame />

        {SOUND_GROUPS.map((g) => (
          <section key={g.id} className="stack" aria-labelledby={`g-${g.id}`}>
            <div className="section-head">
              <h2 id={`g-${g.id}`}>{g.title}</h2>
            </div>
            <p className="muted" style={{ marginTop: -4 }}>
              {g.note}
            </p>
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

        <section className="stack">
          <SectionHead pl="Ten sam dźwięk" en="same sound, different spelling" />
          <p>
            <span className="pl" lang="pl" style={{ fontSize: 22 }}>
              {same.a[0]}
            </span>{' '}
            ({same.a[1]}) and{' '}
            <span className="pl" lang="pl" style={{ fontSize: 22 }}>
              {same.b[0]}
            </span>{' '}
            ({same.b[1]}) sound identical: rz and ż are one sound. Only the spelling tells them apart, so learn each word's spelling as you meet it.
          </p>
          <div className="row">
            <Speak text={same.a[0]} label={`Play ${same.a[0]}`} />
            <Speak text={same.b[0]} label={`Play ${same.b[0]}`} />
          </div>
        </section>

        <section className="stack" aria-labelledby="tw">
          <SectionHead pl="Łamańce językowe" en="tongue twisters" />
          <p className="muted">Poles use these on each other too. Listen at full speed first, then slow it down to practise.</p>
          {TONGUE_TWISTERS.map(([pl, en]) => (
            <div key={pl} className="example" style={{ alignItems: 'flex-start' }}>
              <div className="row" style={{ gap: 6, flex: 'none' }}>
                <Speak text={pl} />
                <Speak text={pl} slow />
              </div>
              <div>
                <div className="pl" lang="pl" style={{ fontSize: 24 }}>
                  {pl}
                </div>
                <div className="say">{respell(pl)}</div>
                <div className="muted">{en}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </Shell>
  );
}
