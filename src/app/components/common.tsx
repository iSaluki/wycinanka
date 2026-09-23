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
  const r = 30;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  return (
    <div className={`goal ${pct >= 1 ? 'done' : ''}`}>
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle className="track" cx="36" cy="36" r={r} strokeWidth="8" fill="none" />
        <circle
          className="fill"
          cx="36"
          cy="36"
          r={r}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div>
        <div className="eyebrow">Today</div>
        <div>
          <b style={{ fontSize: 22 }}>{Math.min(value, 9999)}</b> / {goal} XP
        </div>
        <div className="muted" style={{ fontSize: 14 }}>
          {pct >= 1 ? 'Daily goal reached. Dobra robota!' : `${goal - value} XP to your daily goal`}
        </div>
      </div>
    </div>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-head">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}

export const GENDER_LABEL: Record<string, string> = {
  m: 'masculine',
  f: 'feminine',
  n: 'neuter',
  pl: 'plural',
  mp: 'masc. personal',
};
