import { useEffect, useRef, useState } from 'react';
import { getBadge, type Badge, type BadgeState } from '../../shared/badges';
import { useNewBadges } from '../lib/badges';
import { Link, usePath } from '../lib/router';
import { playFinished } from '../lib/sfx';

/** A badge's medal: a paper-cut rosette in the badge's colour, grey until it is earned. */
export function Medal({ badge, earned, size = 64 }: { badge: Badge; earned: boolean; size?: number }) {
  return (
    <span className={`medal ${earned ? `tone-${badge.tone}` : 'locked'}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={size} height={size}>
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} className="petal" cx="32" cy="9" rx="5.5" ry="9" transform={`rotate(${i * 30} 32 32)`} />
        ))}
        <circle className="disc" cx="32" cy="32" r="19" />
      </svg>
      <span className="mark">{badge.mark}</span>
    </span>
  );
}

/** One badge on the profile: earned (with the date), or the progress towards it. */
export function BadgeCard({ state, at }: { state: BadgeState; at?: number }) {
  const { badge, value, earned } = state;
  const pct = Math.round((value / badge.target) * 100);
  return (
    <li className={`badge-card ${earned ? 'earned' : ''}`}>
      <Medal badge={badge} earned={earned} />
      <div className="badge-text">
        <b lang="pl">{badge.pl}</b>
        <span className="badge-en">{badge.en}</span>
        <span className="badge-how">{badge.how}</span>
        {earned ? (
          <span className="badge-when">
            {at ? `Earned ${new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Earned'}
          </span>
        ) : (
          <span className="badge-progress">
            <span className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={badge.target} aria-valuenow={value} aria-label={`${badge.en} progress`}>
              <span style={{ width: `${pct}%` }} />
            </span>
            <span>
              {value} of {badge.target} {badge.unit}
            </span>
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * Tells a signed-in learner about a badge they have just earned. It waits until they are between screens rather
 * than in the middle of a question: in a lesson, that is the finish screen.
 */
export function BadgeToast() {
  const { fresh, dismiss } = useNewBadges();
  const path = usePath();
  const chimed = useRef(0);
  const badges = fresh.map(getBadge).filter((b): b is Badge => !!b);
  const onProfile = path === '/profile';
  // In the middle of a question? Checked while a badge is waiting, so it appears as soon as the learner is free.
  const inQuestion = () => !!document.querySelector('.player') && !document.querySelector('.finish');
  const [busy, setBusy] = useState(inQuestion);
  useEffect(() => {
    if (!fresh.length) return;
    setBusy(inQuestion());
    const t = window.setInterval(() => setBusy(inQuestion()), 400);
    return () => window.clearInterval(t);
  }, [fresh.length]);

  useEffect(() => {
    if (badges.length > chimed.current && !busy && !onProfile) playFinished();
    chimed.current = badges.length;
  }, [badges.length, busy, onProfile]);
  // The profile lists them all, highlighted: nothing more to say.
  useEffect(() => {
    if (onProfile && fresh.length) dismiss();
  }, [onProfile, fresh.length, dismiss]);

  if (!badges.length || busy || onProfile) return null;
  const [first] = badges;
  return (
    <div className="badge-toast" role="status" aria-live="polite">
      <Medal badge={first} earned size={52} />
      <div className="badge-toast-text">
        <span className="label">
          <span lang="pl">{badges.length > 1 ? 'Nowe odznaki!' : 'Nowa odznaka!'}</span> {badges.length > 1 ? `${badges.length} new badges` : 'New badge'}
        </span>
        <b>{badges.length > 1 ? badges.map((b) => b.en).join(', ') : `${first.en}: ${first.how.replace(/\.$/, '')}`}</b>
        <Link to="/profile#badges" onClick={dismiss}>
          See your badges
        </Link>
      </div>
      <button type="button" className="icon-btn" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
