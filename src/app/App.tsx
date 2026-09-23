import { useEffect } from 'react';
import { match, navigate, usePath } from './lib/router';
import { init, useApp } from './lib/store';
import { AuthPage } from './pages/Auth';
import { Grammar } from './pages/Grammar';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { LessonPage } from './pages/Lesson';
import { NotFound } from './pages/NotFound';
import { Placement } from './pages/Placement';
import { Profile } from './pages/Profile';
import { Review } from './pages/Review';
import { Sounds } from './pages/Sounds';
import { Welcome, WELCOME_KEY } from './pages/Welcome';
import { Words } from './pages/Words';
import { Tools } from './pages/Tools';
import { Practice } from './pages/Practice';
import { Mark } from './components/Shell';

function welcomed(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

export function App() {
  const path = usePath();
  const status = useApp((s) => s.status);
  const user = useApp((s) => s.user);
  const startUnit = useApp((s) => s.settings.startUnit);
  const hasProgress = useApp((s) => s.progress.lessons.size > 0 || s.progress.cards.size > 0);

  useEffect(() => {
    void init();
  }, []);

  // First visit as a guest: choose a starting level before anything else.
  useEffect(() => {
    if (status === 'ready' && path === '/' && !user && !startUnit && !hasProgress && !welcomed()) navigate('/welcome', { replace: true });
  }, [status, path, user, startUnit, hasProgress]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }} aria-busy="true">
        <div className="brand" style={{ fontSize: 28 }}>
          <Mark />
          <span>Wycinanka</span>
        </div>
      </div>
    );
  }

  const lesson = match('/lesson/:id', path);
  if (lesson) return <LessonPage key={lesson.id} id={lesson.id} />;
  const practice = match('/practice/:kind/:id', path);
  if (practice) return <Practice key={path} kind={practice.kind} id={practice.id} />;
  if (path === '/tools' || match('/tools/:id', path)) return <Tools />;

  switch (path) {
    case '/':
      return <Home />;
    case '/welcome':
      return <Welcome />;
    case '/placement':
      return <Placement />;
    case '/learn':
      return <Learn />;
    case '/review':
      return <Review />;
    case '/words':
      return <Words />;
    case '/sounds':
      return <Sounds />;
    case '/grammar':
      return <Grammar />;
    case '/profile':
      return <Profile />;
    case '/signin':
      return <AuthPage key="in" mode="signin" />;
    case '/signup':
      return <AuthPage key="up" mode="signup" />;
    default:
      return <NotFound />;
  }
}
