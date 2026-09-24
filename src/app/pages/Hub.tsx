import { PageHead } from '../components/common';
import { IconArrow } from '../components/icons';
import { Shell } from '../components/Shell';
import { Link, useTitle } from '../lib/router';
import type { SectionGroup } from '../lib/sections';

/** A group's landing page (phone tab bar): one card per section in it. */
export function Hub({ group }: { group: SectionGroup }) {
  useTitle(group.en);
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl={group.pl} en={group.en}>
          {group.lead}
        </PageHead>
        <ul className="hub" aria-label={group.en}>
          {group.sections.map(({ to, pl, en, icon: Icon, blurb }) => (
            <li key={to}>
              <Link to={to} className="hub-card">
                <span className="hub-icon">
                  <Icon />
                </span>
                <span className="hub-text">
                  <span className="hub-title">
                    <span className="pl" lang="pl">
                      {pl}
                    </span>
                    <small>{en}</small>
                  </span>
                  <span className="hub-blurb">{blurb}</span>
                </span>
                <IconArrow className="hub-arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
