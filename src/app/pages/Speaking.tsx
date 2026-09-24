import { useMemo, useState } from 'react';
import { PageHead, SectionHead } from '../components/common';
import { IconArrow, IconMic, IconPhrases, IconSounds, IconWords } from '../components/icons';
import { Session, type SessionResult } from '../components/Session';
import { useEngine } from '../components/Speaking';
import { Shell } from '../components/Shell';
import { rolePlay, type Exercise } from '../lib/exercises';
import { conversationLessons, speakingLessons, speakingRound, type SpeakingMode } from '../lib/speaking';
import { ENGINE_NOTE } from '../lib/listen';
import { Link, useTitle } from '../lib/router';
import { getState, useApp } from '../lib/store';

const MODES: Array<{ mode: SpeakingMode; pl: string; en: string; blurb: string; icon: typeof IconMic }> = [
  { mode: 'repeat', pl: 'Powtarzaj', en: 'Repeat after me', blurb: 'Hear words and sentences from your lessons, then say them back.', icon: IconMic },
  { mode: 'translate', pl: 'Powiedz po polsku', en: 'Say it in Polish', blurb: 'See the English and say the Polish, with no Polish on screen to lean on.', icon: IconWords },
  { mode: 'phrases', pl: 'Zwroty', en: 'Everyday phrases', blurb: 'Say whole phrases like "nie ma sprawy" until they come out in one breath.', icon: IconPhrases },
  { mode: 'sounds', pl: 'Czytaj na głos', en: 'Read aloud', blurb: 'Read words with the tricky sounds (sz, ś, rz, ł…) before you hear them.', icon: IconSounds },
  { mode: 'twisters', pl: 'Łamańce językowe', en: 'Tongue twisters', blurb: 'The famous ones, chrząszcz and all. Checked word by word.', icon: IconSounds },
];

type Running = { title: string; exercises: Exercise[]; again: () => Exercise[] };

/** Speaking practice on its own: pick what to say, and say it. */
export function Speaking() {
  useTitle('Speaking');
  const progress = useApp((s) => s.progress);
  const startUnit = useApp((s) => s.settings.startUnit);
  const engine = useEngine();
  const [running, setRunning] = useState<Running | null>(null);
  const [summary, setSummary] = useState<{ title: string; said: number; tried: number; again: () => Exercise[] } | null>(null);
  const [run, setRun] = useState(0);

  const lessons = useMemo(() => speakingLessons(new Set(progress.lessons.keys()), startUnit), [progress, startUnit]);
  const talks = useMemo(() => conversationLessons(new Set(progress.lessons.keys()), startUnit), [progress, startUnit]);
  const conversations = talks.lessons;
  const fresh = progress.lessons.size === 0;

  const start = (title: string, make: () => Exercise[]) => {
    setSummary(null);
    setRunning({ title, exercises: make(), again: make });
    setRun(run + 1);
  };

  const finish = (r: SessionResult) => {
    if (!running) return;
    setSummary({ title: running.title, ...r.spoken, again: running.again });
    setRunning(null);
  };

  if (running) {
    return (
      <Session
        key={run}
        exercises={running.exercises}
        what="speaking practice"
        pausableSpeaking={false}
        onClose={() => setRunning(null)}
        onFinish={finish}
      />
    );
  }

  const speaker = () => getState().settings.speaker;

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Mówienie" en="Speaking">
          Say it out loud. Speaking is how words move from "I know it when I see it" to "I can use it", and it's the only way to get your mouth
          round <i lang="pl">sz</i>, <i lang="pl">ś</i> and <i lang="pl">rz</i>.
        </PageHead>

        <p className="speaking-note">
          <IconMic />
          <span>
            {ENGINE_NOTE[engine]} Recognisers find accents hard, so treat a miss as a nudge to listen again, not a verdict.
          </span>
        </p>

        {summary && (
          <div className="banner" role="status">
            <p>
              <b lang="pl">{summary.said === summary.tried && summary.tried > 0 ? 'Świetnie!' : 'Gotowe!'}</b>{' '}
              {summary.tried
                ? `${summary.title}: you said ${summary.said} of ${summary.tried} clearly.`
                : `${summary.title}: nothing was said this time.`}{' '}
              <button type="button" className="link-btn" onClick={() => start(summary.title, summary.again)}>
                Go again
              </button>
            </p>
          </div>
        )}

        <section className="stack">
          <SectionHead pl="Ćwiczenia" en={fresh ? 'from your first lessons' : `from your ${lessons.length} finished lesson${lessons.length === 1 ? '' : 's'}`} />
          <ul className="hub" aria-label="Speaking practice">
            {MODES.map(({ mode, pl, en, blurb, icon: Icon }) => (
              <li key={mode}>
                <button type="button" className="hub-card" onClick={() => start(en, () => speakingRound(mode, lessons, speaker()))}>
                  <span className="hub-icon">
                    <Icon />
                  </span>
                  <span className="hub-text">
                    <span className="hub-title">
                      <span className="pl" lang="pl">
                        {pl}
                      </span>
                      <small>{en}</small>
                    </span>
                    <span className="hub-blurb">{blurb}</span>
                  </span>
                  <IconArrow className="hub-arrow" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="stack">
          <SectionHead pl="Rozmowy" en="Conversations" />
          <p>
            Take a part in a lesson's dialogue: hear the other person's line, then say yours.
            {talks.preview && " More appear as you finish lessons with a dialogue; here's the first one to try."}
          </p>
          {conversations.length ? (
            <ul className="conversations">
              {conversations.map((l) => {
                const who = [...new Set(l.dialogue!.map((d) => d.who))];
                return (
                  <li key={l.id}>
                    <span className="pl" lang="pl">
                      {l.title}
                    </span>
                    <div className="row wrap">
                      {who.slice(0, 2).map((name, as) => (
                        <button
                          key={name}
                          type="button"
                          className="btn quiet"
                          onClick={() => start(`${l.title}, as ${name}`, () => rolePlay(l.dialogue!, l.id, as))}
                        >
                          Be {name}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">
              Lessons with a dialogue appear here once you've finished them. <Link to="/learn">Go to the course</Link>
            </p>
          )}
        </section>
      </div>
    </Shell>
  );
}
