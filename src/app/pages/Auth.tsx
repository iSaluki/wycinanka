import { useState, type FormEvent } from 'react';
import { passwordProblem, PASSWORD_MESSAGES } from '../../shared/password';
import { USERNAME_RE } from '../../shared/limits';
import { PageHead } from '../components/common';
import { Shell } from '../components/Shell';
import { ApiError } from '../lib/api';
import { Link, navigate, useTitle } from '../lib/router';
import { login, register, useApp } from '../lib/store';
import { markWelcomed } from './Welcome';

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        maxLength={128}
        required
      />
      <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-controls={id}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const signup = mode === 'signup';
  useTitle(signup ? 'Create an account' : 'Sign in');
  const hasGuestProgress = useApp((s) => s.guestLog.lessons.length + s.guestLog.reviews.length > 0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const nameProblem = username && !USERNAME_RE.test(username) ? 'Use 3–24 letters, numbers, dots, dashes or underscores.' : null;
  const pwProblem = signup && password ? passwordProblem(password, username) : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (signup && (nameProblem || pwProblem)) {
      setError({ message: nameProblem ?? PASSWORD_MESSAGES[pwProblem!], field: nameProblem ? 'username' : 'password' });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const note = signup ? await register(username, password) : await login(username, password);
      markWelcomed();
      navigate('/', { replace: true });
      if (note) setTimeout(() => alert(note), 50);
    } catch (err) {
      setError(err instanceof ApiError ? { message: err.message, field: err.field } : { message: 'Something went wrong. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell aside={false}>
      <div className="stack-lg" style={{ maxWidth: 460 }}>
        <PageHead eyebrow={signup ? 'Free account' : 'Welcome back'} title={signup ? 'Save your progress' : 'Sign in'}>
          {signup
            ? 'Pick a username and password — no email or real name needed. Your rosette, review deck and streak will follow you to any device.'
            : 'Pick up where you left off.'}
        </PageHead>
        {signup && hasGuestProgress && (
          <div className="banner">
            <p>Everything you've done in this visit will be added to your new account.</p>
          </div>
        )}
        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={24}
              required
              aria-invalid={error?.field === 'username' || (signup && !!nameProblem) || undefined}
              aria-describedby="username-help"
            />
            <span id="username-help" className={signup && nameProblem ? 'err' : 'help'}>
              {signup && nameProblem ? nameProblem : signup ? '3–24 characters. Others never see it.' : ''}
            </span>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete={signup ? 'new-password' : 'current-password'}
              invalid={error?.field === 'password' || !!pwProblem}
              describedBy="password-help"
            />
            <span id="password-help" className={pwProblem ? 'err' : 'help'}>
              {pwProblem ? PASSWORD_MESSAGES[pwProblem] : signup ? 'At least 10 characters. A short phrase is easy to remember and hard to guess.' : ''}
            </span>
          </div>
          {error && (
            <div className="banner error" role="alert">
              <p>{error.message}</p>
            </div>
          )}
          <button className="btn" type="submit" disabled={busy || !username || !password}>
            {busy ? (signup ? 'Creating your account…' : 'Signing in…') : signup ? 'Create account' : 'Sign in'}
          </button>
          <p className="muted" style={{ fontSize: 15 }}>
            {signup ? (
              <>
                Already have an account? <Link to="/signin">Sign in</Link>
              </>
            ) : (
              <>
                New here? <Link to="/signup">Create a free account</Link>
              </>
            )}
          </p>
          {signup && (
            <p className="muted" style={{ fontSize: 13 }}>
              We store your username, a securely hashed password and your learning progress — nothing else, and no tracking. You can download or
              delete it all from your profile. As there's no email, a forgotten password can't be reset, so keep it somewhere safe.
            </p>
          )}
        </form>
      </div>
    </Shell>
  );
}
