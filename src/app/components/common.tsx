import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { hasPolishVoice, onVoicesChanged, speak } from '../lib/speech';
import { IconSlow, IconSpeaker } from './icons';

export function usePolishVoice(): boolean {
  const [has, setHas] = useState(hasPolishVoice());
  useEffect(() => onVoicesChanged(() => setHas(hasPolishVoice())), []);
  return has;
}

/** Plays Polish text aloud. Disabled, with an explanation, when the device has no Polish voice. */
export function Speak({ text, slow, label, autoPlay }: { text: string; slow?: boolean; label?: string; autoPlay?: boolean }) {
  const has = usePolishVoice();
  const [playing, setPlaying] = useState(false);
  const play = () => {
    setPlaying(true);
    speak(text, { slow, onEnd: () => setPlaying(false) });
  };
  useEffect(() => {
    if (autoPlay && has) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay, has]);
  const name = label ?? (slow ? `Play slowly: ${text}` : `Play: ${text}`);
  return (
    <button
      type="button"
      className="icon-btn speak"
      onClick={play}
      disabled={!has}
      data-playing={playing}
      aria-label={name}
      title={has ? name : 'No Polish voice is installed on this device'}
    >
      {slow ? <IconSlow /> : <IconSpeaker />}
    </button>
  );
}

/** Renders lesson prose: **bold** and {Polish text in the Polish face}. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\{[^}]+\}|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('{') && p.endsWith('}')) return <span key={i} className="pl" lang="pl">{p.slice(1, -1)}</span>;
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export function GoalRing({ value, goal }: { value: number; goal: number }) {
  const r = 27;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  return (
    <div className={`goal ${pct >= 1 ? 'done' : ''}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="track" cx="32" cy="32" r={r} strokeWidth="9" fill="none" />
        <circle
          className="fill"
          cx="32"
          cy="32"
          r={r}
          strokeWidth="9"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div>
        <Label pl="dzisiaj" en="today" />
        <div>
          <b>{Math.min(value, 9999)}</b> / {goal} XP
        </div>
        <div className="muted" style={{ fontSize: 15 }}>
          {pct >= 1 ? 'Daily goal reached. Dobra robota!' : `${goal - value} XP to your daily goal`}
        </div>
      </div>
    </div>
  );
}

/** A bilingual label: Polish word first, English after. */
export function Label({ pl, en }: { pl: string; en?: string }) {
  return (
    <span className="label">
      <i lang="pl">{pl}</i>
      {en && <span>{en}</span>}
    </span>
  );
}

/** Page title in Polish with the English underneath: the interface teaches too. */
export function PageHead({ pl, en, children }: { pl: string; en: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <h1 lang="pl">{pl}</h1>
      <div className="gloss">{en}</div>
      {children && <p className="lead">{children}</p>}
    </header>
  );
}

export function SectionHead({ pl, en, children }: { pl: string; en: string; children?: ReactNode }) {
  return (
    <div className="section-head">
      <h2>
        <span lang="pl">{pl}</span>
        <small>{en}</small>
      </h2>
      {children}
    </div>
  );
}

export const GENDER_LABEL: Record<string, string> = {
  m: 'masculine',
  f: 'feminine',
  n: 'neuter',
  pl: 'plural',
  mp: 'masc. personal',
};
