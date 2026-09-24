import { useEffect, useMemo, useState } from 'react';
import { ALPHABET, DIGRAPHS } from '../../content/alphabet';
import { PHRASEBOOK } from '../../content/phrasebook';
import { SOUND_GROUPS } from '../../content/sounds';
import { agree, numberToWords, priceToWords, timeToWords } from '../../shared/numbers';
import { pronounce, respell, type WordReading } from '../../shared/phonetics';
import { Label, PageHead, SectionHead, Speak } from '../components/common';
import { Shell } from '../components/Shell';
import { navigate, usePath, useTitle } from '../lib/router';

const TOOLS = [
  { id: 'pronounce', pl: 'Wymowa', en: 'Pronouncer' },
  { id: 'numbers', pl: 'Liczby', en: 'Numbers & prices' },
  { id: 'clock', pl: 'Zegar', en: 'Clock' },
  { id: 'phrases', pl: 'Rozmówki', en: 'Phrasebook' },
] as const;

type ToolId = (typeof TOOLS)[number]['id'];

/* ---------- Pronouncer ---------- */

interface SoundCard {
  spelling: string;
  like: string;
  examples: string[];
}

/** Letters and letter pairs a learner might type on their own, e.g. "cz" or "ś". */
const GRAPHEMES: Map<string, SoundCard> = (() => {
  const m = new Map<string, SoundCard>();
  for (const g of SOUND_GROUPS)
    for (const s of g.sounds)
      for (const sp of s.spelling.split(' / ')) m.set(sp, { spelling: s.spelling, like: s.like, examples: s.examples.map((e) => e[0]) });
  for (const d of DIGRAPHS)
    for (const sp of d.spelling.split(' / '))
      if (!m.has(sp)) m.set(sp, { spelling: d.spelling, like: d.sound, examples: [d.example[0]] });
  for (const l of ALPHABET) if (!m.has(l.lower)) m.set(l.lower, { spelling: l.lower, like: l.sound, examples: [l.example[0]] });
  return m;
})();

const EXAMPLES = ['cz', 'ś', 'rz', 'dziękuję', 'przepraszam', 'Wrocław', 'Szczebrzeszyn', 'chrząszcz', 'Łódź'];

function Reading({ w }: { w: WordReading }) {
  const rules = [...new Set(w.syllables.flatMap((s) => s.phones.flatMap((p) => (p.rule ? [`${p.spelling || '·'}: ${p.rule}`] : []))))];
  return (
    <div className="reading-word">
      <div className="row wrap">
        <span className="pl" lang="pl" style={{ fontSize: 30, fontWeight: 700 }}>
          {w.word}
        </span>
        <Speak text={w.word} />
        <Speak text={w.word} slow />
      </div>
      <div className="respelling" aria-label={`Say: ${w.respelling}`}>
        {w.syllables.map((s, i) => {
          const stressed = s.stressed && w.syllables.length > 1;
          const txt = s.phones.map((p) => p.say).join('');
          return (
            <span key={i}>
              {i > 0 && '-'}
              <span className={stressed ? 'stress' : ''}>{stressed ? txt.toUpperCase() : txt}</span>
            </span>
          );
        })}
      </div>
      <div className="phones" aria-label="Sound by sound">
        {w.syllables.map((s, i) => (
          <span key={i} className="row" style={{ gap: 6 }}>
            {i > 0 && <span className="syllable-gap" />}
            {s.phones.map((p, k) =>
              p.spelling ? (
                <span
                  key={k}
                  className={`phone ${p.vowel ? 'vowel' : ''} ${p.soft ? 'soft' : ''} ${p.rule ? 'ruled' : ''} ${s.stressed && p.vowel && w.syllables.length > 1 ? 'stress' : ''}`}
                  title={p.rule}
                >
                  <span className="sp" lang="pl">
                    {p.spelling}
                  </span>
                  <span className="sy">{p.say}</span>
                  <span className="ip">/{p.ipa}/</span>
                </span>
              ) : null,
            )}
          </span>
        ))}
      </div>
      {rules.length > 0 && (
        <ul style={{ paddingLeft: 20, color: 'var(--ink-2)', fontSize: 15 }}>
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pronouncer() {
  const [text, setText] = useState('Szczebrzeszyn');
  const trimmed = text.trim().toLocaleLowerCase('pl');
  const card = GRAPHEMES.get(trimmed);
  const words = useMemo(() => (card ? [] : pronounce(text).slice(0, 12)), [text, card]);
  return (
    <section className="stack" aria-labelledby="pron-title">
      <SectionHead pl="Jak to przeczytać?" en="how do I say this?" />
      <p className="muted" style={{ marginTop: -4 }}>
        Type a Polish word or phrase — or a single letter or pair like <b>cz</b> — and see how to say it: an English-style respelling
        (capitals mark the stress), each sound, and the rules that change it.
      </p>
      <label className="sr-only" htmlFor="pron">
        Polish text
      </label>
      <input
        id="pron"
        className="pron-input"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 120))}
        lang="pl"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="e.g. dziękuję"
      />
      <div className="seg" aria-label="Examples">
        {EXAMPLES.map((e) => (
          <button key={e} className="pl" onClick={() => setText(e)} aria-pressed={text === e} lang="pl">
            {e}
          </button>
        ))}
      </div>

      {card ? (
        <div className="reading-word" aria-live="polite">
          <div className="row wrap">
            <span className="pl" lang="pl" style={{ font: '700 64px/1 var(--font-pl)', color: 'var(--czerwien)' }}>
              {trimmed}
            </span>
            <div>
              <div className="respelling" style={{ fontSize: 26 }}>
                sounds like {card.like}
              </div>
              {card.spelling !== trimmed && <Label pl="pisownia" en={`also written ${card.spelling}`} />}
            </div>
          </div>
          <ul className="meet-examples" aria-label="Examples">
            {card.examples.map((w) => (
              <li key={w}>
                <Speak text={w} />
                <button className="link-btn pl" style={{ fontSize: 24 }} onClick={() => setText(w)} lang="pl">
                  {w}
                </button>
                <span className="say">{respell(w)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="reading" aria-live="polite">
          {words.map((w, i) => (
            <Reading key={`${w.word}-${i}`} w={w} />
          ))}
          {words.length > 1 && (
            <div className="row">
              <Speak text={text} label="Play the whole phrase" />
              <span className="muted">Play the whole phrase</span>
            </div>
          )}
        </div>
      )}
      <div className="legend">
        <span className="l-vowel">vowel</span>
        <span className="l-soft">soft sound (tongue down, smile)</span>
        <span className="l-rule">changed by a rule</span>
        <span className="l-stress">stressed</span>
      </div>
    </section>
  );
}

/* ---------- Numbers ---------- */

function Numbers() {
  const [raw, setRaw] = useState('24.99');
  const value = Number(raw.replace(',', '.'));
  const valid = raw.trim() !== '' && Number.isFinite(value) && value >= 0 && value < 1_000_000;
  const whole = Math.floor(value);
  const hasPence = valid && Math.round(value * 100) % 100 !== 0;
  let out: { label: [string, string]; text: string }[] = [];
  if (valid) {
    out = [
      { label: ['liczba', 'the number'], text: numberToWords(whole) },
      { label: ['cena', 'as a price'], text: priceToWords(value) },
      ...(!hasPence && whole > 0 && whole < 130
        ? [{ label: ['wiek', 'as an age'] as [string, string], text: `Mam ${numberToWords(whole)} ${agree(whole, { one: 'rok', few: 'lata', many: 'lat' })}.` }]
        : []),
      ...(!hasPence
        ? [{ label: ['z rzeczownikiem', 'with a noun'] as [string, string], text: `${numberToWords(whole, 'f')} ${agree(whole, { one: 'kawa', few: 'kawy', many: 'kaw' })}` }]
        : []),
    ];
  }
  return (
    <section className="stack" aria-labelledby="num-title">
      <SectionHead pl="Liczby i ceny" en="numbers and prices" />
      <p className="muted" style={{ marginTop: -4 }}>
        Type a number up to 999,999 — with pence (grosze) if you like. The noun after a number changes: 2 złote, 5 złotych.
      </p>
      <label className="sr-only" htmlFor="num">
        Number
      </label>
      <input id="num" className="num-input" inputMode="decimal" value={raw} onChange={(e) => setRaw(e.target.value.slice(0, 10))} />
      {!valid && raw.trim() !== '' && <p className="muted">Enter a number from 0 to 999,999.99.</p>}
      <div className="stack" aria-live="polite">
        {out.map(({ label, text }) => (
          <div key={label[0]} className="stack" style={{ gap: 4, paddingBottom: 14, borderBottom: '1px solid var(--rule)' }}>
            <Label pl={label[0]} en={label[1]} />
            <div className="row wrap">
              <Speak text={text} />
              <span className="big-out" lang="pl">
                {text}
              </span>
            </div>
            <span className="say">{respell(text)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Clock ---------- */

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** The current time, updated on the minute. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      t = setTimeout(tick, 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return now;
}

function TimeReadings({ time }: { time: string }) {
  const [h, m] = time.split(':').map(Number);
  const words = Number.isFinite(h) && Number.isFinite(m) ? timeToWords(h, m) : null;
  if (!words) return null;
  const rows: Array<[string, string, string]> = [
    ['na co dzień', 'in everyday speech', words.everyday],
    ['oficjalnie', 'formally, as on timetables', words.formal],
    ['o której?', 'at what time?', words.at],
  ];
  return (
    <div className="stack" aria-live="polite">
      {rows.map(([pl, en, text]) => (
        <div key={pl} className="stack" style={{ gap: 4, paddingBottom: 14, borderBottom: '1px solid var(--rule)' }}>
          <Label pl={pl} en={en} />
          <div className="row wrap">
            <Speak text={text} />
            <span className="big-out" lang="pl">
              {text}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Clock() {
  const now = useNow();
  const current = hhmm(now);
  const nowWords = timeToWords(now.getHours(), now.getMinutes());
  const [picked, setPicked] = useState<string | null>(null);
  const t = picked ?? current;
  return (
    <section className="stack" aria-labelledby="clock-title">
      <SectionHead pl="Która godzina?" en="telling the time" />
      <div className="clock-now" role="status" aria-label="The time now">
        <Label pl="teraz" en="right now" />
        <div className="clock-face" aria-hidden="true">
          {current}
        </div>
        <div className="row wrap">
          <Speak text={nowWords.everyday} label="Play the time now" />
          <span className="big-out" lang="pl">
            {nowWords.everyday}
          </span>
        </div>
      </div>
      <p className="muted">
        Polish tells the time with “the seventh (hour)” rather than “seven o'clock”. Timetables use the 24-hour clock; people say “half to eight” for
        7:30.
      </p>
      <div className="field">
        <label htmlFor="time" style={{ fontWeight: 700 }}>
          Try any time
        </label>
        <div className="row wrap">
          <input id="time" type="time" className="num-input" value={t} onChange={(e) => setPicked(e.target.value || null)} />
          {picked && picked !== current && (
            <button type="button" className="btn small quiet" onClick={() => setPicked(null)}>
              Back to now
            </button>
          )}
        </div>
      </div>
      <TimeReadings time={t} />
    </section>
  );
}

/* ---------- Phrasebook ---------- */

function Phrasebook() {
  const [group, setGroup] = useState(PHRASEBOOK[0].id);
  const g = PHRASEBOOK.find((x) => x.id === group)!;
  return (
    <section className="stack" aria-labelledby="phr-title">
      <SectionHead pl="Rozmówki" en="phrasebook" />
      <div className="seg" role="group" aria-label="Situations">
        {PHRASEBOOK.map((p) => (
          <button key={p.id} aria-pressed={p.id === group} onClick={() => setGroup(p.id)}>
            {p.title}
          </button>
        ))}
      </div>
      <Label pl={g.titlePl} en={g.title} />
      <ul className="phrase-list">
        {g.phrases.map(([pl, en]) => (
          <li key={pl}>
            <Speak text={pl} />
            <div>
              <span className="pl" lang="pl">
                {pl}
              </span>
              <small>
                {en} · <span className="say">{respell(pl)}</span>
              </small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Tools() {
  const path = usePath();
  const current = (TOOLS.find((t) => path === `/tools/${t.id}`)?.id ?? 'pronounce') as ToolId;
  const tool = TOOLS.find((t) => t.id === current)!;
  useTitle(tool.en);
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Narzędzia" en="Tools">
          Helpers you can use any time, outside the course.
        </PageHead>
        <div className="seg" role="tablist" aria-label="Tools">
          {TOOLS.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === current} aria-pressed={t.id === current} onClick={() => navigate(`/tools/${t.id}`)}>
              <span className="pl" lang="pl" style={{ fontStyle: 'italic', marginRight: 6 }}>
                {t.pl}
              </span>
              {t.en}
            </button>
          ))}
        </div>
        {current === 'pronounce' && <Pronouncer />}
        {current === 'numbers' && <Numbers />}
        {current === 'clock' && <Clock />}
        {current === 'phrases' && <Phrasebook />}
      </div>
    </Shell>
  );
}
