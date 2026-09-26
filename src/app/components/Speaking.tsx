import { useEffect, useRef, useState } from 'react';
import { respell } from '../../shared/phonetics';
import { scoreSpeech, type SpeechScore } from '../../shared/speaking';
import type { SpeakExercise } from '../lib/exercises';
import { canRecord, engine, listen, onEngineChange, type Engine, type Listening } from '../lib/listen';
import { stopSpeaking } from '../lib/speech';
import { Speak } from './common';
import { IconMic, IconPlay } from './icons';

/** How the attempt ended: heard and scored, or marked by the learner after listening back. */
export type SpokenResult = { pass: boolean; heard?: string; self?: boolean };

const INSTRUCTION: Record<SpeakExercise['mode'], string> = {
  repeat: 'Say it after me',
  translate: 'Say it in Polish',
  read: 'Read it aloud',
  reply: 'Your turn: say your line',
};

export function useEngine(): Engine {
  const [e, setE] = useState(engine);
  useEffect(() => onEngineChange(() => setE(engine())), []);
  return e;
}

type Phase = 'ready' | 'listening' | 'checking' | 'self';

/**
 * One speaking exercise: prompt, a microphone button, and what was heard word by word. When speech can't be
 * checked on this device, or checking fails, the learner listens to themselves next to the voice and says
 * whether it matched.
 */
export function SayIt({ ex, locked, onResult }: { ex: SpeakExercise; locked: boolean; onResult: (r: SpokenResult) => void }) {
  const current = useEngine();
  const [phase, setPhase] = useState<Phase>('ready');
  // Checking fell through for this exercise: mark it yourself from here on.
  const [selfCheck, setSelfCheck] = useState(false);
  const [score, setScore] = useState<SpeechScore | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [interim, setInterim] = useState('');
  const [level, setLevel] = useState(0);
  const [recording, setRecording] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const active = useRef<Listening | null>(null);
  const failures = useRef(0);
  const mode = selfCheck ? 'self' : current;
  // What the prompt gives away: translating and reading hide the model until the learner has had a go.
  const revealed = ex.mode === 'repeat' || ex.mode === 'reply' || locked || tries > 0 || phase === 'self';

  const lastRecording = useRef<string | null>(null);
  useEffect(
    () => () => {
      active.current?.cancel();
      if (lastRecording.current) URL.revokeObjectURL(lastRecording.current);
    },
    [],
  );

  const keepRecording = (url?: string) => {
    if (lastRecording.current && lastRecording.current !== url) URL.revokeObjectURL(lastRecording.current);
    lastRecording.current = url ?? null;
    setRecording(url ?? null);
  };

  const start = async () => {
    if (locked || phase === 'checking') return;
    if (phase === 'listening') {
      active.current?.stop();
      return;
    }
    // Stop the voice, so it isn't heard as the learner.
    stopSpeaking();
    if (mode === 'self' && !canRecord()) {
      setPhase('self');
      return;
    }
    setMessage(null);
    setInterim('');
    setScore(null);
    setPhase('listening');
    const run = listen({ onLevel: setLevel, onInterim: setInterim, onChecking: () => setPhase('checking') }, mode);
    active.current = run;
    const heard = await run.done;
    active.current = null;
    setLevel(0);
    if (!heard.ok && heard.error === 'aborted') return;
    keepRecording(heard.recording);
    if (heard.ok && mode === 'self') {
      setPhase('self');
      return;
    }
    if (heard.ok) {
      const s = scoreSpeech(heard.alternatives, ex.accepted);
      setScore(s);
      setTries((t) => t + 1);
      setPhase('ready');
      onResult({ pass: s.pass, heard: s.heard });
      if (!s.pass) setMessage(s.heard ? 'Not quite. The words in red weren’t heard clearly: listen, then try again.' : 'Nothing was heard clearly. Try again, a little louder.');
      return;
    }
    setPhase('ready');
    switch (heard.error) {
      case 'no-speech':
        setMessage("I didn't hear anything. Tap the microphone, then speak.");
        break;
      case 'denied':
        setMessage("The microphone is blocked for this site. Allow it in your browser's settings, or check yourself below.");
        setSelfCheck(true);
        setPhase('self');
        break;
      case 'no-mic':
        setMessage('No microphone was found. Say it aloud anyway, then check yourself below.');
        setSelfCheck(true);
        setPhase('self');
        break;
      case 'unavailable': {
        const next = engine();
        if (heard.message && /resting/.test(heard.message)) {
          setMessage(heard.message);
          setSelfCheck(true);
          setPhase('self');
        } else if (next === mode && ++failures.current < 2) {
          // Only this attempt failed (a dropped connection, a busy moment): try again rather than give up.
          setMessage("That one couldn't be checked just now. Tap the microphone to try again.");
        } else if (next !== 'self' && next !== mode) {
          setMessage(
            next === 'server'
              ? "Your browser's speech recognition isn't working, so the app will check you instead. Tap the microphone again."
              : "The app's speech checking isn't available, so your browser will check you instead. Tap the microphone again.",
          );
        } else {
          setMessage("Speech checking isn't available right now, so check yourself this time.");
          setSelfCheck(true);
          setPhase('self');
        }
        break;
      }
    }
  };

  const markSelf = (pass: boolean) => {
    setTries((t) => t + 1);
    onResult({ pass, self: true });
    if (!pass) setPhase('ready');
  };

  const words = score?.words;
  return (
    <div className="say-it">
      <div className="instruction">{INSTRUCTION[ex.mode]}</div>

      {ex.mode === 'reply' && ex.cue && (
        <div className="bubble">
          <span className="who">{ex.cue.who}</span>
          <div className="row">
            <span className="pl" lang="pl" style={{ flex: 1 }}>
              {ex.cue.pl}
            </span>
            <Speak text={ex.cue.pl} autoPlay />
          </div>
          <span className="en">{ex.cue.en}</span>
        </div>
      )}

      {ex.mode === 'translate' && (
        <div className="prompt-row">
          <span className="prompt-en" lang="en">
            {ex.en}
          </span>
        </div>
      )}

      {(ex.mode !== 'translate' || revealed) && (
        <div className={ex.mode === 'reply' ? 'bubble me' : 'say-target'}>
          {ex.mode === 'reply' && <span className="who">You</span>}
          <div className="prompt-row">
            {revealed && <Speak text={ex.pl} autoPlay={ex.mode === 'repeat'} />}
            {revealed && <Speak text={ex.pl} slow />}
            <span className={ex.mode === 'reply' ? 'pl' : 'prompt-pl'} lang="pl" aria-label={ex.pl}>
              {words
                ? words.map((w, i) => (
                    <span key={i} className={`said-${w.state}`}>
                      {i > 0 && ' '}
                      {w.text}
                    </span>
                  ))
                : ex.pl}
            </span>
          </div>
          {revealed && ex.mode !== 'reply' && !/\s/.test(ex.pl.trim()) && (
            <span className="say" title="Say it like this. Capitals show the stressed syllable.">
              {respell(ex.pl)}
            </span>
          )}
          {ex.mode !== 'translate' && ex.en && ex.mode !== 'read' && <span className={ex.mode === 'reply' ? 'en' : 'muted'}>{ex.en}</span>}
        </div>
      )}

      {!locked && phase !== 'self' && (
        <div className="mic-area">
          <button
            type="button"
            className="mic"
            data-state={phase}
            style={{ ['--level' as string]: level }}
            onClick={start}
            disabled={phase === 'checking'}
            aria-label={phase === 'listening' ? 'Stop: I have finished speaking' : 'Speak now'}
          >
            <IconMic />
          </button>
          <span className="mic-label" aria-live="polite">
            {phase === 'listening'
              ? interim || (mode === 'browser' ? 'Listening…' : 'Listening… tap when you have finished')
              : phase === 'checking'
                ? 'Checking…'
                : tries > 0
                  ? 'Tap to try again'
                  : mode === 'self'
                    ? canRecord()
                      ? 'Tap, say it, and hear yourself back'
                      : 'Say it aloud, then compare'
                    : 'Tap and say it'}
          </span>
        </div>
      )}

      {score?.heard && !locked && (
        <p className="muted heard">
          Heard: <span lang="pl">“{score.heard}”</span>
        </p>
      )}
      {message && !locked && (
        <p className="nudge" role="status">
          {message}
        </p>
      )}

      {phase === 'self' && !locked && (
        <div className="self-check">
          <p>
            {recording ? 'Listen to yourself, then to the voice.' : 'Say it aloud, then listen to the voice.'} Did yours sound the same?
          </p>
          <div className="row wrap">
            {recording && <PlayRecording src={recording} />}
            <Speak text={ex.pl} label={`Play the voice: ${ex.pl}`} />
            {!selfCheck && canRecord() && (
              <button type="button" className="btn quiet" onClick={() => setPhase('ready')}>
                Record again
              </button>
            )}
          </div>
          <div className="row wrap">
            <button type="button" className="btn quiet" onClick={() => markSelf(false)}>
              Not yet
            </button>
            <button type="button" className="btn good" onClick={() => markSelf(true)}>
              Sounded right
            </button>
          </div>
        </div>
      )}

      {recording && phase !== 'self' && !locked && tries > 0 && (
        <div className="row">
          <PlayRecording src={recording} />
          <span className="muted">Hear yourself</span>
        </div>
      )}
    </div>
  );
}

function PlayRecording({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <button
      type="button"
      className="icon-btn speak mine"
      data-playing={playing}
      aria-label="Play your recording"
      title="Play your recording"
      onClick={() => {
        stopSpeaking();
        const a = new Audio(src);
        setPlaying(true);
        a.onended = a.onerror = () => setPlaying(false);
        a.play().catch(() => setPlaying(false));
      }}
    >
      <IconPlay />
    </button>
  );
}
