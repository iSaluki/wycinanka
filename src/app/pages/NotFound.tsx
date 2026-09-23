import { Shell } from '../components/Shell';
import { Link, useTitle } from '../lib/router';
import { PageHead } from '../components/common';

export function NotFound() {
  useTitle('Not found');
  return (
    <Shell>
      <div className="stack">
        <PageHead pl="Ojej!" en="Page not found">
          There's no page at this address. It may have moved.
        </PageHead>
        <Link to="/" className="btn" style={{ alignSelf: 'flex-start' }}>
          Back to your course
        </Link>
      </div>
    </Shell>
  );
}
