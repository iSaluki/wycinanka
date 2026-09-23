import { Shell } from '../components/Shell';
import { Link, useTitle } from '../lib/router';

export function NotFound() {
  useTitle('Not found');
  return (
    <Shell>
      <div className="stack">
        <h1 lang="pl">Ojej!</h1>
        <p className="muted">There's no page at this address. It may have moved.</p>
        <Link to="/" className="btn" style={{ alignSelf: 'flex-start' }}>
          Back to your course
        </Link>
      </div>
    </Shell>
  );
}
