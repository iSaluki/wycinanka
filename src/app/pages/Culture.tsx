import { Fragment, useEffect, useState } from 'react';
import { CULTURE, CULTURE_THEMES, cultureTopic, type CultureImage, type CultureTopic, type CultureVideo } from '../../content/culture';
import { respell } from '../../shared/phonetics';
import { PageHead, Rich, SectionHead, Speak } from '../components/common';
import { IconArrow } from '../components/icons';
import { Shell } from '../components/Shell';
import { cultureStop } from '../../content/culture-stops';
import { markCultureSeen } from '../lib/cultureStops';
import { Link, navigate, useTitle } from '../lib/router';
import { NotFound } from './NotFound';

/**
 * A culture note. In the course (`course`), it's a culture break between lessons: something to read, never
 * tested, with a way to skip straight on to the next lesson.
 */
function Article({ topic, course = false }: { topic: CultureTopic; course?: boolean }) {
  const i = CULTURE.indexOf(topic);
  const next = CULTURE[(i + 1) % CULTURE.length];
  const stop = course ? cultureStop(topic.id) : undefined;
  // Opened, read or skipped, a culture break comes up only once.
  useEffect(() => {
    if (stop) markCultureSeen(topic.id);
  }, [stop, topic.id]);
  const onward = () => navigate(stop?.next ? `/lesson/${stop.next.id}` : '/learn');
  return (
    <Shell>
      <article className="stack-lg culture-article">
        {stop ? (
          <div className="culture-break" role="note">
            <p>
              <b>
                <span lang="pl">Przerwa na kulturę</span>: a culture break.
              </b>{' '}
              Nothing to answer, just something to read. Here only for the language? Skip it.
            </p>
            <button type="button" className="btn small quiet" onClick={onward}>
              {stop.next ? 'Skip to the next lesson' : 'Skip'}
            </button>
          </div>
        ) : (
          <p className="muted" style={{ fontSize: 15 }}>
            <Link to="/culture">← All culture notes</Link>
          </p>
        )}
        <PageHead pl={topic.pl} en={topic.title} />
        <Glance topic={topic} />
        <div className="stack">
          {topic.body.map((p, k) => (
            <Fragment key={k}>
              <p className={k === 0 ? 'culture-lead' : undefined}>
                <Rich text={p} tappable />
              </p>
              {/* The picture breaks up the text after the opening paragraph, next to what it shows. */}
              {k === 0 && topic.image && <Picture image={topic.image} />}
            </Fragment>
          ))}
        </div>
        {topic.video && <Video video={topic.video} />}
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
        {stop ? (
          <button type="button" className="btn red" style={{ alignSelf: 'flex-start' }} onClick={onward}>
            {stop.next ? `Next lesson: ${stop.next.title}` : 'Back to the course'} <IconArrow width={20} height={20} />
          </button>
        ) : (
          <Link to={`/culture/${next.id}`} className="btn quiet" style={{ alignSelf: 'flex-start' }}>
            Next: {next.title} <IconArrow width={20} height={20} />
          </Link>
        )}
      </article>
    </Shell>
  );
}

/** The note in a nutshell before the full text: what it is, when, and the first few words to take away. */
function Glance({ topic }: { topic: CultureTopic }) {
  return (
    <aside className="culture-glance" aria-label="At a glance">
      <p className="glance-summary">{topic.summary}</p>
      {topic.when && (
        <p className="culture-when">
          <span className="sr-only">When: </span>
          {topic.when}
        </p>
      )}
      <ul className="glance-words" aria-label="Key words">
        {topic.words.slice(0, 3).map(([pl, en]) => (
          <li key={pl}>
            <Rich text={`{${pl}}`} tappable /> <span className="en">{en}</span>
          </li>
        ))}
      </ul>
      <p className="culture-tip">
        Tap any <span className="pl say-word-sample" lang="pl">underlined Polish</span> to hear it. Key points are{' '}
        <strong>highlighted</strong>.
      </p>
    </aside>
  );
}

const LICENSES: Partial<Record<CultureImage['license'], string>> = {
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 3.0 PL': 'https://creativecommons.org/licenses/by-sa/3.0/pl/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
};

/** The article's picture, with the credit its licence asks for. */
function Picture({ image }: { image: CultureImage }) {
  const license = LICENSES[image.license];
  return (
    <figure className="culture-picture">
      <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
      <figcaption>
        {/* One line of text: the caption's parts must not become separate grid rows. */}
        <span>
          <Rich text={image.caption} tappable />
        </span>
        <small className="credit">
          {image.author},{' '}
          {license ? (
            <a href={license} target="_blank" rel="noopener noreferrer">
              {image.license}
            </a>
          ) : (
            image.license.toLowerCase()
          )}
          , via{' '}
          <a href={image.source} target="_blank" rel="noopener noreferrer">
            Wikimedia Commons
          </a>
        </small>
      </figcaption>
    </figure>
  );
}

/**
 * A YouTube video that loads only when the learner asks for it: until then nothing is fetched from YouTube,
 * and it then plays from youtube-nocookie.com, which sets no cookies until playback starts.
 */
function Video({ video }: { video: CultureVideo }) {
  const [playing, setPlaying] = useState(false);
  const watch = `https://www.youtube.com/watch?v=${video.youtube}`;
  return (
    <figure className="culture-video">
      <div className="video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            // YouTube refuses to play embeds that send no referrer; send only the origin.
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button type="button" className="video-start" onClick={() => setPlaying(true)}>
            <span className="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="video-title">
              <span className="sr-only">Play video: </span>
              {video.title}
            </span>
            <span className="video-note">Plays from YouTube · {video.channel}</span>
          </button>
        )}
      </div>
      <figcaption>
        <Rich text={video.caption} tappable />{' '}
        <a href={watch} target="_blank" rel="noopener noreferrer">
          Watch on YouTube
        </a>
      </figcaption>
    </figure>
  );
}

export function Culture({ id, course = false }: { id?: string; course?: boolean }) {
  const topic = id ? cultureTopic(id) : undefined;
  useTitle(topic ? topic.title : 'Culture');
  if (id && !topic) return <NotFound />;
  if (topic) return <Article topic={topic} course={course} />;
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
