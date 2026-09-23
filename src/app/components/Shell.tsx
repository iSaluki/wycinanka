import type { ReactNode } from 'react';
import { Link, usePath } from '../lib/router';
import { useStats } from '../lib/derived';
import { dismissSyncError, useApp } from '../lib/store';
import { GoalRing } from './common';
import { IconFlame, IconGrammar, IconLearn, IconProfile, IconReview, IconSounds, IconWords } from './icons';
import { Rosette } from './Rosette';

const NAV = [
  { to: '/', label: 'Learn', icon: IconLearn, match: (p: string) => p === '/' || p.startsWith('/learn') },
  { to: '/review', label: 'Review', icon: IconReview },
  { to: '/words', label: 'Words', icon: IconWords },
  { to: '/sounds', label: 'Sounds', icon: IconSounds },
  { to: '/grammar', label: 'Grammar', icon: IconGrammar },
  { to: '/profile', label: 'Profile', icon: IconProfile, railOnly: true },
];

export function Mark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g transform="translate(32 32)">
        {[0, 60, 120, 180, 240, 300].map((r) => (
          <path key={r} d="M0-6C7-12 7-22 0-30C-7-22-7-12 0-6Z" fill="var(--kobalt)" transform={`rotate(${r})`} />
        ))}
        {[30, 90, 150, 210, 270, 330].map((r) => (
          <path key={r} d="M0-6C4-10 4-16 0-20C-4-16-4-10 0-6Z" fill="var(--malina)" transform={`rotate(${r})`} />
        ))}
        <circle r="7" fill="var(--slonecznik)" />
        <circle r="3" fill="var(--ink)" />
      </g>
    </svg>
  );
}

function NavLinks({ rail }: { rail: boolean }) {
  const path = usePath();
  const due = useStats().due;
  return (
    <>
      {NAV.filter((n) => rail || !n.railOnly).map(({ to, label, icon: Icon, match }) => {
        const active = match ? match(path) : path.startsWith(to);
        return (
          <Link key={to} to={to} className="tab" aria-current={active ? 'page' : undefined}>
            <Icon />
            <span>
              {label}
              {to === '/review' && due > 0 && <span className="sr-only">, {due} due</span>}
            </span>
          </Link>
        );
      })}
    </>
  );
}

function StreakChip() {
  const { streak } = useStats();
  return (
    <span className="stat-chip" title={`${streak}-day streak`}>
      <IconFlame />
      {streak}
      <span className="sr-only">day streak</span>
    </span>
  );
}

export function Aside() {
  const stats = useStats();
  return (
    <>
      <section className="rosette-wrap" aria-labelledby="rosette-title">
        <div className="eyebrow" id="rosette-title">
          Twoja wycinanka
        </div>
        <Rosette done={stats.done} next={stats.next?.id} />
        <p className="rosette-caption">Each petal is a unit; every lesson you finish cuts one more layer.</p>
      </section>
      <div className="card">
        <GoalRing value={stats.todayXp} goal={stats.goal} />
      </div>
      <div className="row between card">
        <div className="row">
          <IconFlame width={34} height={34} />
          <div>
            <b style={{ fontSize: 22 }}>{stats.streak}</b> day{stats.streak === 1 ? '' : 's'}
            <div className="muted" style={{ fontSize: 14 }}>
              {stats.streak ? 'Keep it going today' : 'Start a streak today'}
            </div>
          </div>
        </div>
        <Link to="/review" className="btn small quiet">
          {stats.due} due
        </Link>
      </div>
    </>
  );
}

export function Shell({ children, aside = true }: { children: ReactNode; aside?: boolean }) {
  const syncError = useApp((s) => s.syncError);
  const user = useApp((s) => s.user);
  return (
    <div className="shell">
      <nav className="rail" aria-label="Main">
        <Link to="/" className="brand">
          <Mark />
          <span>Wycinanka</span>
        </Link>
        <NavLinks rail />
        <div className="spacer" />
        {!user && (
          <Link to="/signup" className="btn small quiet">
            Save progress
          </Link>
        )}
      </nav>
      <div>
        <header className="topbar topbar-mobile">
          <Link to="/" className="brand">
            <Mark />
            <span>Wycinanka</span>
          </Link>
          <div className="chips">
            <StreakChip />
            <Link to="/profile" className="stat-chip" aria-label="Profile and settings">
              <IconProfile />
            </Link>
          </div>
        </header>
        <main className="main" id="main">
          {syncError && (
            <div className="banner error" role="alert" style={{ marginBottom: 16 }}>
              <p>{syncError}</p>
              <button className="link-btn" onClick={dismissSyncError}>
                Dismiss
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
      {aside && (
        <aside className="aside" aria-label="Your progress">
          <Aside />
        </aside>
      )}
      <nav className="tabbar" aria-label="Main">
        <NavLinks rail={false} />
      </nav>
    </div>
  );
}
