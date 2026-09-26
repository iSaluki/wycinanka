import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { TOTAL_LESSONS } from '../../content/course';
import { addDays, localDay } from '../../shared/progress';
import { passwordProblem, PASSWORD_MESSAGES } from '../../shared/password';
import type { Settings } from '../../shared/schemas';
import { PageHead, SectionHead, Speak, usePolishVoice } from '../components/common';
import { Shell } from '../components/Shell';
import { ApiError } from '../lib/api';
import { useStats } from '../lib/derived';
import { BadgeCard } from '../components/Badges';
import { badgeStates } from '../../shared/badges';
import { Link, navigate, useTitle } from '../lib/router';
import { hasDeviceVoice } from '../lib/speech';
import { DEFAULT_REMINDER_HOUR } from '../../shared/reminders';
import {
  disableReminders,
  enableReminders,
  forgetThisDevice,
  reminderSupport,
  sendTestReminder,
  useDeviceSubscribed,
  useReminderStatus,
  type ReminderStatus,
} from '../lib/reminders';
import { changePassword, DEFAULT_SETTINGS, deleteAccount, downloadExport, logout, updateSettings, useApp } from '../lib/store';
import { PasswordInput } from './Auth';

function Heatmap() {
  const activity = useApp((s) => s.progress.activity);
  const today = localDay();
  const days = Array.from({ length: 105 }, (_, i) => addDays(today, i - 104));
  const level = (xp: number) => (xp === 0 ? 0 : xp < 15 ? 1 : xp < 40 ? 2 : 3);
  return (
    <div className="heat" role="img" aria-label="Your activity over the last 15 weeks">
      {days.map((d) => (
        <span key={d} data-l={level(activity.get(d)?.xp ?? 0)} title={`${d}: ${activity.get(d)?.xp ?? 0} XP`} />
      ))}
    </div>
  );
}

function Switch({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  const id = `sw-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div className="toggle">
      <span id={id}>{label}</span>
      <button type="button" role="switch" className="switch" aria-checked={checked} aria-labelledby={id} disabled={disabled} onClick={() => onChange(!checked)} />
    </div>
  );
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 to 22:00
const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** What the Worker last did for this device's daily reminder, in words. */
function statusLine(status: ReminderStatus, hour: number): string {
  if (!status.subscribed) return "This device isn't registered for reminders any more. Switch them off and on again.";
  if (!status.lastSentAt) return `No daily reminder sent yet. The first comes at ${hourLabel(hour)} on a day you haven't practised.`;
  const when = new Date(status.lastSentAt).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return status.lastResult === 'failed'
    ? `The last reminder, on ${when}, wasn't accepted by your browser's notification service. Try switching reminders off and on again.`
    : `Last reminder sent ${when}.`;
}

function RemindersField() {
  const user = useApp((s) => s.user);
  const s = useApp((st) => st.settings);
  const [device, recheck] = useDeviceSubscribed();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const support = reminderSupport();
  const hour = s.reminderHour ?? DEFAULT_REMINDER_HOUR;
  const on = !!s.reminders && device === true;
  const status = useReminderStatus(on);

  const run = async (work: () => Promise<void>, done?: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await work();
      if (done) setMsg({ ok: true, text: done });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Something went wrong. Try again.' });
    } finally {
      setBusy(false);
      recheck();
    }
  };

  const toggle = (v: boolean) =>
    run(
      () => (v ? enableReminders(hour) : disableReminders()),
      v ? `Reminders are on. You'll get one at ${hourLabel(hour)} on days you haven't practised yet.` : undefined,
    );

  let help: string | null = null;
  if (!user) help = 'Create a free account to get a daily reminder to practise.';
  else if (support === 'install-first') help = 'On iPhone and iPad, add Wycinanka to your home screen first (Share → Add to Home Screen), then switch reminders on from the app.';
  else if (support === 'blocked') help = 'Notifications are blocked for this site. Allow them in your browser settings to get reminders.';
  else if (support === 'unsupported') help = "This browser can't show reminders.";
  const usable = !!user && support === 'ok';

  return (
    <div className="field">
      <Switch label="Daily reminder to practise" checked={on} disabled={!usable || busy || device === null} onChange={toggle} />
      {usable && on && (
        <div className="row wrap">
          <label htmlFor="rem-hour">Remind me at</label>
          <select
            id="rem-hour"
            value={hour}
            disabled={busy}
            onChange={(e) => void run(() => updateSettings({ reminderHour: Number(e.target.value) }))}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
          <button type="button" className="btn small quiet" disabled={busy} onClick={() => void run(sendTestReminder, 'Test reminder sent. It should arrive in a moment.')}>
            Send a test
          </button>
        </div>
      )}
      {usable && on && status && <p className="help reminder-status">{statusLine(status, hour)}</p>}
      {msg && (
        <div className={`banner ${msg.ok ? '' : 'error'}`} role="status">
          <p>{msg.text}</p>
        </div>
      )}
      <span className="help">
        {help ?? "A notification on days you haven't practised yet, sent at your chosen time. Switching it off stops reminders on all your devices."}
      </span>
    </div>
  );
}

function SettingsCard() {
  const s = useApp((st) => st.settings);
  const has = usePolishVoice();
  const set = (patch: Settings) => updateSettings(patch);
  const goal = s.dailyGoal ?? DEFAULT_SETTINGS.dailyGoal;
  const rate = s.speechRate ?? DEFAULT_SETTINGS.speechRate;
  return (
    <section className="stack" aria-labelledby="settings">
      <SectionHead pl="Ustawienia" en="settings" />
      <div className="field">
        <span id="goal-l" style={{ fontWeight: 700 }}>
          Daily goal
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="goal-l">
          {([10, 20, 30, 50] as const).map((g) => (
            <button key={g} role="radio" aria-checked={goal === g} aria-pressed={goal === g} onClick={() => set({ dailyGoal: g })}>
              {g} XP
            </button>
          ))}
        </div>
        <span className="help">A lesson is worth 10–20 XP; each review card is worth 1.</span>
      </div>
      <div className="field">
        <label htmlFor="rate">Speech speed</label>
        <div className="row">
          <input
            id="rate"
            type="range"
            min={0.5}
            max={1.3}
            step={0.1}
            value={rate}
            onChange={(e) => set({ speechRate: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <Speak text="Dzień dobry, jak się masz?" label="Test the voice" />
        </div>
        {!has && <span className="help">No Polish voice is installed on this device, so audio is unavailable.</span>}
      </div>
      <div className="field">
        <span id="voice-l" style={{ fontWeight: 700 }}>
          Voice
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="voice-l">
          {(
            [
              [false, 'Recorded voice'],
              [true, "My device's voice"],
            ] as const
          ).map(([device, label]) => (
            <button
              key={label}
              role="radio"
              aria-checked={!!s.deviceVoice === device}
              aria-pressed={!!s.deviceVoice === device}
              disabled={device && !hasDeviceVoice()}
              onClick={() => set({ deviceVoice: device })}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="help">
          Lessons are read by a recorded neural Polish voice. Your device's own voice is used for anything typed in, like numbers in the tools
          {hasDeviceVoice() ? ', and for everything if you choose it here.' : '; this device has no Polish voice installed.'}
        </span>
      </div>
      <div className="field">
        <span id="speaking-l" style={{ fontWeight: 700 }}>
          Speaking in lessons
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="speaking-l">
          {(
            [
              [true, 'On'],
              [false, 'Off'],
            ] as const
          ).map(([on, label]) => (
            <button key={label} role="radio" aria-checked={(s.speaking !== false) === on} aria-pressed={(s.speaking !== false) === on} onClick={() => set({ speaking: on })}>
              {label}
            </button>
          ))}
        </div>
        <span className="help">
          Lessons ask you to say a few words and a sentence aloud. <i>Can't speak now</i> in a lesson leaves them out for 15 minutes; switch them
          off here to leave them out altogether. <Link to="/speaking">Speaking practice</Link> is always there.
        </span>
      </div>
      <div className="field">
        <span id="sounds-l" style={{ fontWeight: 700 }}>
          Sound effects
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="sounds-l">
          {(
            [
              [true, 'On'],
              [false, 'Off'],
            ] as const
          ).map(([on, label]) => (
            <button key={label} role="radio" aria-checked={(s.sounds !== false) === on} aria-pressed={(s.sounds !== false) === on} onClick={() => set({ sounds: on })}>
              {label}
            </button>
          ))}
        </div>
        <span className="help">A soft chime for a right answer, a low note for a wrong one, and a little tune when you finish.</span>
      </div>
      <div className="field">
        <span id="theme-l" style={{ fontWeight: 700 }}>
          Theme
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="theme-l">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <button key={t} role="radio" aria-checked={(s.theme ?? 'system') === t} aria-pressed={(s.theme ?? 'system') === t} onClick={() => set({ theme: t })}>
              {t === 'system' ? 'Match device' : t === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span id="speaker-l" style={{ fontWeight: 700 }}>
          When Polish needs to know, I'm…
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="speaker-l">
          {(
            [
              ['m', 'a man (byłem)'],
              ['f', 'a woman (byłam)'],
            ] as const
          ).map(([v, l]) => (
            <button key={v} role="radio" aria-checked={s.speaker === v} aria-pressed={s.speaker === v} onClick={() => set({ speaker: v })}>
              {l}
            </button>
          ))}
        </div>
        <span className="help">Past-tense verbs change with the speaker's gender. Both forms are always accepted.</span>
      </div>
      <Switch label="Reduce motion" checked={!!s.reduceMotion} onChange={(v) => set({ reduceMotion: v })} />
      <RemindersField />
    </section>
  );
}

function AccountCard() {
  const user = useApp((s) => s.user)!;
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [delErr, setDelErr] = useState<string | null>(null);

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    const problem = passwordProblem(next, user.username);
    if (problem) return setMsg({ ok: false, text: PASSWORD_MESSAGES[problem] });
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setMsg({ ok: true, text: 'Password changed. You have been signed out on your other devices.' });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiError ? err.message : 'The password could not be changed.' });
    }
  };

  const submitDelete = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await deleteAccount(deletePw);
      await forgetThisDevice();
      navigate('/', { replace: true });
    } catch (err) {
      setDelErr(err instanceof ApiError ? err.message : 'The account could not be deleted.');
    }
  };

  return (
    <>
      <section className="stack" aria-labelledby="pw">
        <SectionHead pl="Hasło" en="change password" />
        <form className="form" onSubmit={submitPassword}>
          <input type="text" autoComplete="username" value={user.username} readOnly hidden />
          <div className="field">
            <label htmlFor="cur">Current password</label>
            <PasswordInput id="cur" value={current} onChange={setCurrent} autoComplete="current-password" />
          </div>
          <div className="field">
            <label htmlFor="new">New password</label>
            <PasswordInput id="new" value={next} onChange={setNext} autoComplete="new-password" describedBy="new-help" />
            <span id="new-help" className="help">
              At least 10 characters.
            </span>
          </div>
          {msg && (
            <div className={`banner ${msg.ok ? '' : 'error'}`} role="status">
              <p>{msg.text}</p>
            </div>
          )}
          <button className="btn" disabled={!current || !next}>
            Change password
          </button>
        </form>
      </section>

      <section className="stack" aria-labelledby="data">
        <SectionHead pl="Twoje dane" en="your data" />
        <p className="muted">Download everything stored about you as a JSON file.</p>
        <div className="row wrap">
          <button className="btn quiet" onClick={() => downloadExport().catch((e) => alert(e.message))}>
            Download my data
          </button>
          <button className="btn quiet" onClick={() => forgetThisDevice().then(logout).then(() => navigate('/'))}>
            Sign out
          </button>
        </div>
      </section>

      <section className="stack" aria-labelledby="del">
        <SectionHead pl="Usuń konto" en="delete account" />
        <p className="muted">This permanently removes your account, progress and review deck. It can't be undone.</p>
        {confirmDelete ? (
          <form className="form" onSubmit={submitDelete}>
            <div className="field">
              <label htmlFor="delpw">Enter your password to confirm</label>
              <PasswordInput id="delpw" value={deletePw} onChange={setDeletePw} autoComplete="current-password" invalid={!!delErr} />
            </div>
            {delErr && (
              <div className="banner error" role="alert">
                <p>{delErr}</p>
              </div>
            )}
            <div className="row wrap">
              <button className="btn bad" disabled={!deletePw}>
                Delete my account
              </button>
              <button type="button" className="btn quiet" onClick={() => setConfirmDelete(false)}>
                Keep my account
              </button>
            </div>
          </form>
        ) : (
          <button className="btn quiet" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirmDelete(true)}>
            Delete account…
          </button>
        )}
      </section>
    </>
  );
}

/** Badges: signed-in learners only, because they are kept with the account. */
function BadgesSection() {
  const user = useApp((s) => s.user);
  const progress = useApp((s) => s.progress);
  const seen = useApp((s) => s.settings.badges);
  const states = useMemo(() => badgeStates(progress), [progress]);
  useEffect(() => {
    if (location.hash === '#badges') document.getElementById('badges')?.scrollIntoView({ block: 'start' });
  }, []);
  if (!user) {
    return (
      <section className="stack" id="badges" aria-labelledby="badges-h">
        <SectionHead pl="Odznaki" en="badges" id="badges-h" />
        <p className="muted">
          Learners with an account collect badges for milestones: their first lesson, a week-long streak, a whole level finished.{' '}
          <Link to="/signup">Create a free account</Link> to start collecting — what you've already done counts.
        </p>
      </section>
    );
  }
  const earned = states.filter((s) => s.earned);
  // Earned first, then the ones closest to being earned.
  const next = states.filter((s) => !s.earned).sort((a, b) => b.value / b.badge.target - a.value / a.badge.target);
  return (
    <section className="stack" id="badges" aria-labelledby="badges-h">
      <SectionHead pl="Odznaki" en={`badges · ${earned.length} of ${states.length}`} id="badges-h" />
      {earned.length === 0 && <p className="muted">Finish your first lesson to earn your first badge.</p>}
      <ul className="badge-grid">
        {[...earned, ...next].map((s) => (
          <BadgeCard key={s.badge.id} state={s} at={seen?.[s.badge.id]} />
        ))}
      </ul>
    </section>
  );
}

export function Profile() {
  useTitle('Profile');
  const user = useApp((s) => s.user);
  const stats = useStats();
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl={user ? user.username : 'Gość'} en={user ? 'Your profile' : 'Learning as a guest'}>
          {user
            ? `Learning since ${new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
            : "Your progress is saved on this device only. Create a free account to keep it safe and use it on other devices — everything you've done comes with you."}
        </PageHead>
        {!user && (
          <div className="row wrap">
            <Link to="/signup" className="btn">
              Create a free account
            </Link>
            <Link to="/signin" className="btn quiet">
              Sign in
            </Link>
          </div>
        )}
        <div className="stats">
          <div className="stat">
            <b>{stats.streak}</b>
            <span>day streak</span>
          </div>
          <div className="stat">
            <b>{stats.xp}</b>
            <span>total XP</span>
          </div>
          <div className="stat">
            <b>
              {stats.done.size}/{TOTAL_LESSONS}
            </b>
            <span>lessons</span>
          </div>
          <div className="stat">
            <b>{stats.deck}</b>
            <span>cards in review</span>
          </div>
        </div>
        <BadgesSection />
        <section className="stack" aria-labelledby="act">
          <SectionHead pl="Aktywność" en="the last 15 weeks" />
          <Heatmap />
        </section>
        <SettingsCard />
        {user && <AccountCard />}
        <p className="muted" style={{ fontSize: 14 }}>
          <Link to="/welcome">Change starting level</Link> · <Link to="/placement">Retake the placement check</Link>
        </p>
      </div>
    </Shell>
  );
}
