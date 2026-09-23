import type { ReactNode } from 'react';
import { Link, usePath } from '../lib/router';
import { useStats } from '../lib/derived';
import { dismissSyncError, useApp } from '../lib/store';
import { GoalRing, Label } from './common';
import { IconGrammar, IconLearn, IconProfile, IconReview, IconSounds, IconTools, IconWords } from './icons';
import { Rosette } from './Rosette';

/** Navigation is labelled in Polish first: learners read these words every visit. */
const NAV = [
  { to: '/', pl: 'Nauka', en: 'Learn', icon: IconLearn, match: (p: string) => p === '/' || p.startsWith('/learn') || p.startsWith('/practice') },
  { to: '/review', pl: 'Powtórka', en: 'Review', icon: IconReview },
  { to: '/words', pl: 'Słowa', en: 'Words', icon: IconWords },
  { to: '/sounds', pl: 'Wymowa', en: 'Sounds', icon: IconSounds },
  { to: '/grammar', pl: 'Gramatyka', en: 'Grammar', icon: IconGrammar },
  { to: '/tools', pl: 'Narzędzia', en: 'Tools', icon: IconTools },
  { to: '/profile', pl: 'Profil', en: 'Profile', icon: IconProfile, railOnly: true },
];

/** The brand mark: an eight-petal wycinanka flower in black and red. */
export function Mark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g transform="translate(32 32)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r, i) => (
          <path
            key={r}
            d="M0-7C6-12 6-22 0-30C-6-22-6-12 0-7Z"
            fill={i % 2 ? 'var(--czerwien)' : 'var(--ink)'}
            transform={`rotate(${r})`}
          />
        ))}
        <circle r="7" fill="var(--czerwien)" />
        <circle r="2.6" fill="var(--paper)" />
      </g>
    </svg>
  );
}

function NavLinks({ rail }: { rail: boolean }) {
  const path = usePath();
  const due = useStats().due;
  return (
    <>
      {NAV.filter((n) => rail || !n.railOnly).map(({ to, pl, en, icon: Icon, match }) => {
        const active = match ? match(path) : path.startsWith(to);
        return (
          <Link key={to} to={to} className="tab" aria-current={active ? 'page' : undefined}>
            <Icon />
            <span className="pl" lang="pl">
              {pl}
            </span>
            <small>
              {en}
              {to === '/review' && due > 0 && ` · ${due}`}
            </small>
          </Link>
        );
      })}
    </>
  );
}

export function Aside() {
  const stats = useStats();
  return (
    <>
      <section className="rosette-wrap" aria-labelledby="rosette-title">
        <div id="rosette-title">
          <Label pl="Twoja wycinanka" en="your paper cut" />
        </div>
        <Rosette done={stats.done} next={stats.next?.id} />
        <p className="rosette-caption">Each petal is a unit; every lesson glues on another layer of colour.</p>
      </section>
      <GoalRing value={stats.todayXp} goal={stats.goal} />
      <div className="row between">
        <div>
          <Label pl="dni z rzędu" en="day streak" />
          <div style={{ font: '700 34px/1 var(--font-pl)' }}>{stats.streak}</div>
        </div>
        <Link to="/review" className="btn small quiet">
          {stats.due} to review
        </Link>
      </div>
    </>
  );
}

export function Shell({ children, aside = true }: { children: ReactNode; aside?: boolean }) {
  const syncError = useApp((s) => s.syncError);
  const user = useApp((s) => s.user);
  const { streak } = useStats();
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
            <span className="stat-chip" title={`${streak}-day streak`}>
              <b>{streak}</b> <span lang="pl">dni</span>
              <span className="sr-only">day streak</span>
            </span>
            <Link to="/profile" className="stat-chip" aria-label="Profile and settings">
              <IconProfile />
            </Link>
          </div>
        </header>
        <main className="main" id="main">
          {syncError && (
            <div className="banner error" role="alert" style={{ marginBottom: 20 }}>
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
