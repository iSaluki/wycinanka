import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { DialogueLine, Item, Spotlight } from '../../content/types';
import { POLISH_LETTERS } from '../../shared/grade';
import { maskAnswer, ruledOut, sentenceStart, shuffle, type Exercise, type ExtraTag } from '../lib/exercises';
import { speak } from '../lib/speech';
import { respell } from '../../shared/phonetics';
import { chunkFor } from '../../content/chunks';
import { GENDER_LABEL, Rich, Speak, usePolishVoice } from './common';

type Of<K extends Exercise['kind']> = Extract<Exercise, { kind: K }>;

export interface AnswerProps<E> {
  ex: E;
  locked: boolean;
  /** The learner's current answer, or null if they have not given one yet. */
  onAnswer: (a: string | null) => void;
  /** Result shown after checking, so options can be coloured. */
  checked?: { pass: boolean; answer: string | null };
  /** Hints taken so far on this question. */
  hints?: number;
}

function HintLine({ label, text, lang }: { label: string; text: string; lang: 'pl' | 'en' }) {
  return (
    <p className="hint-line" role="status">
      {label}{' '}
      <span className={lang === 'pl' ? 'pl' : undefined} lang={lang}>
        {text}
      </span>
    </p>
  );
}

/* ---------- Choose ---------- */

export function Choose({ ex, locked, onAnswer, checked, hints = 0 }: AnswerProps<Of<'choose'>>) {
  const [picked, setPicked] = useState<string | null>(null);
  const hasVoice = usePolishVoice(ex.say ?? ex.prompt);
  useEffect(() => setPicked(null), [ex, hints]);
  const out = ruledOut(ex.options, ex.answer, hints);
  const pick = (o: string) => {
    if (locked || out.includes(o)) return;
    setPicked(o);
    onAnswer(o);
  };
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length && !(e.target instanceof HTMLInputElement)) pick(ex.options[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const style = ex.optionStyle ?? (ex.promptLang === 'en' ? 'pl' : 'en');
  const instruction =
    ex.instruction ?? (ex.audio ? 'Listen. What does it mean?' : ex.promptLang === 'en' ? 'Choose the Polish' : 'What does this mean?');
  // Audio-only questions show their text once answered, or straight away if the device can't speak Polish.
  const hidePrompt = ex.audio && hasVoice && !checked;
  return (
    <>
      <Instruction tag={ex.tag}>{instruction}</Instruction>
      {ex.image ? (
        <figure className="picture-prompt">
          <img src={ex.image} alt={ex.prompt} width={220} height={220} draggable={false} />
          {checked && <figcaption>{ex.prompt}</figcaption>}
        </figure>
      ) : (
        <div className="prompt-row">
          {ex.promptLang === 'pl' && <Speak text={ex.say ?? ex.prompt} autoPlay={ex.audio} />}
          {ex.audio && <Speak text={ex.prompt} slow />}
          {hidePrompt ? (
            <span className="muted">Tap to hear it again</span>
          ) : ex.audio && !hasVoice && !checked && ex.fallback ? (
            <span className="prompt-en">{ex.fallback}</span>
          ) : (
            <span className={ex.promptLang === 'pl' ? 'prompt-pl' : 'prompt-en'} lang={ex.promptLang}>
              {ex.prompt}
            </span>
          )}
        </div>
      )}
      <div className={`options ${ex.options.every((o) => o.length < 24) ? 'grid-2' : ''}`} role="group" aria-label="Answers">
        {ex.options.map((o, i) => {
          const state = checked ? (o === ex.answer ? 'right' : o === picked ? 'wrong' : '') : '';
          const gone = !state && out.includes(o);
          return (
            <button
              key={o}
              type="button"
              className={`option ${style === 'pl' ? 'pl-opt' : style === 'say' ? 'say-opt' : ''} ${state} ${gone ? 'ruled-out' : ''}`}
              aria-pressed={picked === o}
              disabled={(locked && !state) || gone}
              onClick={() => pick(o)}
              lang={style === 'pl' ? 'pl' : 'en'}
            >
              <span className="key" aria-hidden="true">
                {i + 1}
              </span>
              {o}
            </button>
          );
        })}
      </div>
    </>
  );
}

const TAGS: Record<ExtraTag, { pl: string; title: string }> = {
  warmup: { pl: 'rozgrzewka', title: 'Warm-up: a quick one from an earlier lesson' },
  revision: { pl: 'powtórka', title: "Revision: picked for you from earlier lessons, most often from what you've got wrong" },
};

function Instruction({ tag, children }: { tag?: ExtraTag; children: ReactNode }) {
  return (
    <div className="instruction">
      {tag && (
        <span className={`tag-warmup ${tag === 'revision' ? 'tag-revision' : ''}`} lang="pl" title={TAGS[tag].title}>
          {TAGS[tag].pl}
        </span>
      )}
      {children}
    </div>
  );
}

/* ---------- Type ---------- */

export function TypeAnswer({ ex, locked, onAnswer, hints = 0 }: AnswerProps<Of<'type'>>) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setValue('');
    ref.current?.focus({ preventScroll: true });
  }, [ex]);
  const insert = (ch: string) => {
    const el = ref.current;
    if (!el || locked) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + ch + value.slice(end);
    setValue(next);
    onAnswer(next.trim() ? next : null);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + ch.length, start + ch.length);
    });
  };
  const toPolish = ex.lang === 'pl';
  return (
    <>
      <Instruction tag={ex.tag}>{toPolish ? 'Write this in Polish' : 'Write this in English'}</Instruction>
      <div className="prompt-row">
        {!toPolish && <Speak text={ex.prompt} />}
        <span className={toPolish ? 'prompt-en' : 'prompt-pl'} lang={toPolish ? 'en' : 'pl'}>
          {ex.prompt}
        </span>
      </div>
      <input
        ref={ref}
        className={`answer-input ${toPolish ? '' : 'en'}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onAnswer(e.target.value.trim() ? e.target.value : null);
        }}
        readOnly={locked}
        lang={toPolish ? 'pl' : 'en'}
        aria-label={toPolish ? 'Your answer in Polish' : 'Your answer in English'}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        maxLength={200}
      />
      {hints > 0 && !locked && <HintLine label="It starts:" text={maskAnswer(ex.accepted[0], hints)} lang={ex.lang} />}
      {toPolish && (
        <div className="diacritics" aria-label="Polish letters">
          {POLISH_LETTERS.map((l) => (
            <button key={l} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(l)} aria-label={`Insert ${l}`} lang="pl">
              {l}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Build ---------- */

export function Build({ ex, locked, onAnswer, hints = 0 }: AnswerProps<Of<'build'>>) {
  const [chosen, setChosen] = useState<number[]>([]);
  const hasVoice = usePolishVoice(ex.audio ?? '');
  useEffect(() => setChosen([]), [ex]);
  const update = (next: number[]) => {
    setChosen(next);
    onAnswer(next.length ? next.map((i) => ex.tiles[i]).join(' ') : null);
  };
  return (
    <>
      <Instruction tag={ex.tag}>{ex.audio && hasVoice ? 'Build what you hear' : 'Build this in Polish'}</Instruction>
      <div className="prompt-row">
        {ex.audio && hasVoice ? (
          <>
            <Speak text={ex.audio} autoPlay />
            <Speak text={ex.audio} slow />
          </>
        ) : (
          <span className="prompt-en">{ex.audio ? ex.meaning : ex.prompt}</span>
        )}
      </div>
      {ex.audio && hasVoice && locked && ex.meaning && <p className="build-meaning">{ex.meaning}</p>}
      {hints > 0 && !locked && <HintLine label="It starts:" text={`${sentenceStart(ex.accepted[0], hints)} …`} lang="pl" />}
      <div className="build-line" aria-label="Your sentence" aria-live="polite">
        {chosen.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            className={`tile placed ${ex.tiles[i].includes(' ') ? 'chunk' : ''}`}
            lang="pl"
            disabled={locked}
            onClick={() => update(chosen.filter((_, p) => p !== pos))}
            aria-label={`Remove ${ex.tiles[i]}`}
          >
            {ex.tiles[i]}
          </button>
        ))}
      </div>
      <div className="bank" aria-label="Words to use">
        {ex.tiles.map((t, i) => (
          <button
            key={i}
            type="button"
            className={`tile ${chosen.includes(i) ? 'used' : ''} ${t.includes(' ') ? 'chunk' : ''}`}
            lang="pl"
            disabled={locked || chosen.includes(i)}
            aria-hidden={chosen.includes(i)}
            onClick={() => update([...chosen, i])}
          >
            {t}
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- Gap ---------- */

export function Gap({ ex, locked, onAnswer, checked, hints = 0 }: AnswerProps<Of<'gap'>>) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => setPicked(null), [ex, hints]);
  const [before, after] = ex.text.split('___');
  const out = ruledOut(ex.options, ex.answer, hints);
  const pick = (o: string) => {
    if (locked || out.includes(o)) return;
    setPicked(o);
    onAnswer(o);
  };
  return (
    <>
      <Instruction tag={ex.tag}>Fill the gap</Instruction>
      <p className="gap-text" lang="pl">
        {before}
        <span className="gap-slot">{picked ?? ' '}</span>
        {after}
      </p>
      <p className="muted">{ex.en}</p>
      <div className="options grid-2" role="group" aria-label="Choices">
        {ex.options.map((o, i) => {
          const state = checked ? (o === ex.answer ? 'right' : o === picked ? 'wrong' : '') : '';
          const gone = !state && out.includes(o);
          return (
            <button
              key={o}
              type="button"
              className={`option pl-opt ${state} ${gone ? 'ruled-out' : ''}`}
              aria-pressed={picked === o}
              disabled={(locked && !state) || gone}
              onClick={() => pick(o)}
              lang="pl"
            >
              <span className="key" aria-hidden="true">
                {i + 1}
              </span>
              {o}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Match ---------- */

export function Match({
  ex,
  onDone,
  onMiss,
}: {
  ex: Of<'match'>;
  onDone: (misses: number) => void;
  onMiss: (cardId: string) => void;
}) {
  const left = useMemo(() => shuffle(ex.pairs), [ex]);
  const right = useMemo(() => shuffle(ex.pairs), [ex]);
  const [sel, setSel] = useState<{ side: 'pl' | 'en'; id: string } | null>(null);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState<string | null>(null);
  const misses = useRef(0);

  const choose = (side: 'pl' | 'en', id: string) => {
    if (gone.has(id)) return;
    if (side === 'pl') {
      const p = ex.pairs.find((x) => x.cardId === id)!;
      speak(p.say ?? p.pl);
    }
    if (!sel || sel.side === side) {
      setSel({ side, id });
      return;
    }
    if (sel.id === id) {
      const next = new Set(gone).add(id);
      setGone(next);
      setSel(null);
      if (next.size === ex.pairs.length) setTimeout(() => onDone(misses.current), 450);
    } else {
      misses.current++;
      onMiss(side === 'pl' ? id : sel.id);
      setShake(`${side}:${id}`);
      setTimeout(() => setShake(null), 330);
      setSel(null);
    }
  };

  const btn = (side: 'pl' | 'en', p: (typeof ex.pairs)[number]) => (
    <button
      key={p.cardId}
      type="button"
      className={`option ${side === 'pl' ? 'pl-opt' : ''} ${gone.has(p.cardId) ? 'right gone' : ''} ${shake === `${side}:${p.cardId}` ? 'wrong shake' : ''}`}
      aria-pressed={sel?.side === side && sel.id === p.cardId}
      onClick={() => choose(side, p.cardId)}
      disabled={gone.has(p.cardId)}
      lang={side}
    >
      {side === 'pl' ? p.pl : p.en}
    </button>
  );

  return (
    <>
      <div className="instruction">Match the pairs</div>
      <div className="match">
        <div className="col">{left.map((p) => btn('pl', p))}</div>
        <div className="col">{right.map((p) => btn('en', p))}</div>
      </div>
    </>
  );
}

/* ---------- Meet ---------- */

export function Meet({ items, from = 0, total = items.length, onDone }: { items: Item[]; from?: number; total?: number; onDone: () => void }) {
  const [i, setI] = useState(0);
  // Part of a lesson that introduces its words a few at a time.
  const grouped = total > items.length;
  const item = items[i];
  const last = i === items.length - 1;
  // Multi-word items are lexical chunks; show the literal meaning when we know it.
  const isPhrase = !item.ex && !item.img && (item.chunk || /\s/.test(item.pl.trim()));
  const literal = isPhrase ? chunkFor(item.pl)?.lit : undefined;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && !last) setI(i + 1);
    if (e.key === 'ArrowLeft' && i > 0) setI(i - 1);
  };
  return (
    <div className="meet" onKeyDown={onKey}>
      <div className="row between">
        <div className="instruction">
          <span lang="pl" className="pl" style={{ fontStyle: 'italic', color: 'var(--czerwien)' }}>
            nowe
          </span>{' '}
          {items[0]?.ex ? 'New sounds' : items[0]?.img ? 'New pictures' : items[0]?.chunk ? 'New phrases' : 'New words'} · {from + i + 1} of {total}
        </div>
        <div className="dots" aria-hidden="true">
          {Array.from({ length: total }, (_, k) => (
            <span key={k} className={k <= from + i ? 'on' : ''} />
          ))}
        </div>
      </div>
      <article className={`meet-card ${item.img ? 'with-picture' : ''}`} key={item.id}>
        {item.img && <img className="meet-picture" src={item.img} alt="" width={200} height={200} draggable={false} />}
        {item.g && <span className="gender">{GENDER_LABEL[item.g]}</span>}
        {isPhrase && (
          <span className="chunk-badge" title="A set phrase: learn it as one piece, the way Polish speakers use it">
            <span lang="pl">zwrot</span> · learn it as one phrase
          </span>
        )}
        <span className="word" lang="pl">
          {item.pl}
        </span>
        {item.ex ? (
          <>
            <div className="en">Sounds like {item.en}</div>
            <ul className="meet-examples" aria-label="Examples">
              {item.ex.map((w, k) => (
                <li key={w}>
                  <Speak text={w} autoPlay={k === 0} />
                  <span className="pl" lang="pl">
                    {w}
                  </span>
                  <span className="say">{respell(w)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="row">
              <Speak text={item.pl} autoPlay />
              <Speak text={item.pl} slow />
              <span className="say" title="Say it like this. Capitals show the stressed syllable.">
                {respell(item.pl)}
              </span>
            </div>
            <div className="en">{item.en}</div>
          </>
        )}
        {item.hint ? (
          <p className="hint">
            <Rich text={item.hint} />
          </p>
        ) : (
          literal && <p className="hint">Word for word: "{literal}"</p>
        )}
      </article>
      <div className="row between">
        <button type="button" className="btn quiet" onClick={() => setI(i - 1)} disabled={i === 0}>
          Back
        </button>
        <button type="button" className="btn" onClick={() => (last ? onDone() : setI(i + 1))}>
          {last ? (grouped ? `Practise ${items.length === 1 ? 'it' : 'these'}` : 'Start practising') : items[0]?.chunk ? 'Next phrase' : 'Next word'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Spotlight ---------- */

/** Spotlight table columns that hold English descriptions rather than Polish forms. */
const ENGLISH_COLUMN = /^(|sounds like|gender|talking to|number|time|ending|form)$/i;

export function SpotlightView({ s }: { s: Spotlight }) {
  return (
    <section className="spotlight">
      <div className="instruction">Grammar spotlight</div>
      <h2>{s.title}</h2>
      {s.body.map((p, i) => (
        <p key={i}>
          <Rich text={p} />
        </p>
      ))}
      {s.table && (
        <div className="table-wrap">
          <table className="plain">
            <thead>
              <tr>
                {s.table.head.map((h, i) => (
                  <th key={i} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => {
                    const pl = !ENGLISH_COLUMN.test(s.table!.head[j] ?? '');
                    return (
                      <td key={j} className={pl ? 'pl' : ''} lang={pl ? 'pl' : undefined}>
                        {c}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.examples && (
        <div className="examples">
          {s.examples.map(([pl, en]) => (
            <div className="example" key={pl}>
              <Speak text={pl} />
              <div>
                <div className="pl" lang="pl">
                  {pl}
                </div>
                <div className="muted">{en}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- Dialogue ---------- */

export function Dialogue({ lines }: { lines: DialogueLine[] }) {
  const [shown, setShown] = useState(1);
  const [english, setEnglish] = useState(true);
  const speakers = [...new Set(lines.map((l) => l.who))];
  useEffect(() => {
    speak(lines[shown - 1].pl);
  }, [shown, lines]);
  return (
    <section className="dialogue">
      <div className="row between wrap">
        <div className="instruction">Dialogue</div>
        <button type="button" className="link-btn" onClick={() => setEnglish(!english)} aria-pressed={english}>
          {english ? 'Hide English' : 'Show English'}
        </button>
      </div>
      {lines.slice(0, shown).map((l, i) => (
        <div key={i} className={`bubble ${speakers.indexOf(l.who) === 1 ? 'me' : ''}`}>
          <span className="who">{l.who}</span>
          <div className="row">
            <span className="pl" lang="pl" style={{ flex: 1 }}>
              {l.pl}
            </span>
            <Speak text={l.pl} />
          </div>
          {english && <span className="en">{l.en}</span>}
        </div>
      ))}
      {shown < lines.length && (
        <button type="button" className="btn quiet" onClick={() => setShown(shown + 1)}>
          Next line
        </button>
      )}
    </section>
  );
}
