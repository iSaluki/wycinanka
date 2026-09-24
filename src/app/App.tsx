import { useEffect } from 'react';
import { match, navigate, usePath } from './lib/router';
import { init, useApp } from './lib/store';
import { refreshReminders } from './lib/reminders';
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
import { Welcome } from './pages/Welcome';
import { welcomed } from './lib/welcome';
import { Words } from './pages/Words';
import { Tools } from './pages/Tools';
import { Practice } from './pages/Practice';
import { Pictures } from './pages/Pictures';
import { Culture } from './pages/Culture';
import { Phrases } from './pages/Phrases';
import { Hub } from './pages/Hub';
import { Speaking } from './pages/Speaking';
import { DISCOVER, PRACTISE } from './lib/sections';
import { Mark } from './components/Shell';

export function App() {
  const path = usePath();
  const status = useApp((s) => s.status);
  const user = useApp((s) => s.user);
  const startUnit = useApp((s) => s.settings.startUnit);
  const hasProgress = useApp((s) => s.progress.lessons.size > 0 || s.progress.cards.size > 0);

  useEffect(() => {
    void init().then(refreshReminders);
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
  const culture = match('/culture/:id', path);
  if (culture) return <Culture key={culture.id} id={culture.id} />;
  const cultureBreak = match('/course/culture/:id', path);
  if (cultureBreak) return <Culture key={`course-${cultureBreak.id}`} id={cultureBreak.id} course />;

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
    case '/pictures':
      return <Pictures />;
    case '/sounds':
      return <Sounds />;
    case '/grammar':
      return <Grammar />;
    case '/phrases':
      return <Phrases />;
    case '/speaking':
      return <Speaking />;
    case '/culture':
      return <Culture />;
    case '/study':
      return <Hub group={PRACTISE} />;
    case '/discover':
      return <Hub group={DISCOVER} />;
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
