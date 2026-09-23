import { useState, type FormEvent } from 'react';
import { TOTAL_LESSONS } from '../../content/course';
import { addDays, localDay } from '../../shared/progress';
import { passwordProblem, PASSWORD_MESSAGES } from '../../shared/password';
import type { Settings } from '../../shared/schemas';
import { PageHead, Speak, usePolishVoice } from '../components/common';
import { Shell } from '../components/Shell';
import { ApiError } from '../lib/api';
import { useStats } from '../lib/derived';
import { Link, navigate, useTitle } from '../lib/router';
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

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle">
      <span id={`sw-${label}`}>{label}</span>
      <button type="button" role="switch" className="switch" aria-checked={checked} aria-labelledby={`sw-${label}`} onClick={() => onChange(!checked)} />
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
    <section className="card stack" aria-labelledby="settings">
      <h2 id="settings" style={{ fontSize: 24 }}>
        Settings
      </h2>
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
      navigate('/', { replace: true });
    } catch (err) {
      setDelErr(err instanceof ApiError ? err.message : 'The account could not be deleted.');
    }
  };

  return (
    <>
      <section className="card stack" aria-labelledby="pw">
        <h2 id="pw" style={{ fontSize: 24 }}>
          Change password
        </h2>
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

      <section className="card stack" aria-labelledby="data">
        <h2 id="data" style={{ fontSize: 24 }}>
          Your data
        </h2>
        <p className="muted">Download everything stored about you as a JSON file.</p>
        <div className="row wrap">
          <button className="btn quiet" onClick={() => downloadExport().catch((e) => alert(e.message))}>
            Download my data
          </button>
          <button className="btn quiet" onClick={() => logout().then(() => navigate('/'))}>
            Sign out
          </button>
        </div>
      </section>

      <section className="card stack danger-zone" aria-labelledby="del">
        <h2 id="del" style={{ fontSize: 24 }}>
          Delete account
        </h2>
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

export function Profile() {
  useTitle('Profile');
  const user = useApp((s) => s.user);
  const stats = useStats();
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead eyebrow={user ? 'Your account' : 'Guest'} title={user ? user.username : 'Learning as a guest'}>
          {user
            ? `Learning since ${new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
            : "Your progress is kept only until you close this tab. Create a free account to save it — everything from this visit comes with you."}
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
        <section className="card stack" aria-labelledby="act">
          <h2 id="act" style={{ fontSize: 24 }}>
            Activity
          </h2>
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
