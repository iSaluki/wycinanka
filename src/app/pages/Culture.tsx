import { CULTURE, CULTURE_THEMES, cultureTopic, type CultureTopic } from '../../content/culture';
import { respell } from '../../shared/phonetics';
import { PageHead, Rich, SectionHead, Speak } from '../components/common';
import { IconArrow } from '../components/icons';
import { Shell } from '../components/Shell';
import { Link, useTitle } from '../lib/router';
import { NotFound } from './NotFound';

function Article({ topic }: { topic: CultureTopic }) {
  const i = CULTURE.indexOf(topic);
  const next = CULTURE[(i + 1) % CULTURE.length];
  return (
    <Shell>
      <article className="stack-lg culture-article">
        <p className="muted" style={{ fontSize: 15 }}>
          <Link to="/culture">← All culture notes</Link>
        </p>
        <PageHead pl={topic.pl} en={topic.title} />
        {topic.when && <p className="culture-when">{topic.when}</p>}
        <div className="stack">
          {topic.body.map((p, k) => (
            <p key={k}>
              <Rich text={p} />
            </p>
          ))}
        </div>
        <section className="stack" aria-labelledby="words-to-know">
          <SectionHead pl="Słówka" en="words to know" />
          <ul className="culture-words" id="words-to-know">
            {topic.words.map(([pl, en]) => (
              <li key={pl}>
                <Speak text={pl} label={`Play ${pl}`} />
                <div>
                  <span className="pl" lang="pl">
                    {pl}
                  </span>
                  <span className="say">{respell(pl)}</span>
                  <span className="en">{en}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <Link to={`/culture/${next.id}`} className="btn quiet" style={{ alignSelf: 'flex-start' }}>
          Next: {next.title} <IconArrow width={20} height={20} />
        </Link>
      </article>
    </Shell>
  );
}

export function Culture({ id }: { id?: string }) {
  const topic = id ? cultureTopic(id) : undefined;
  useTitle(topic ? topic.title : 'Culture');
  if (id && !topic) return <NotFound />;
  if (topic) return <Article topic={topic} />;
  return (
    <Shell>
      <div className="stack-lg">
        <PageHead pl="Kultura" en="Polish culture and traditions">
          The customs, festivals and manners behind the language, in English, each with a few Polish words to take away.
        </PageHead>
        {CULTURE_THEMES.map((t) => (
          <section key={t.id} className="stack" aria-labelledby={`theme-${t.id}`}>
            <div id={`theme-${t.id}`}>
              <SectionHead pl={t.pl} en={t.en} />
            </div>
            <ul className="culture-list">
              {CULTURE.filter((c) => c.theme === t.id).map((c) => (
                <li key={c.id}>
                  <Link to={`/culture/${c.id}`} className="culture-card">
                    <span className="pl" lang="pl">
                      {c.pl}
                    </span>
                    <span className="culture-title">
                      {c.title}
                      {c.when && <small> · {c.when}</small>}
                    </span>
                    <span className="culture-summary">{c.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
