import { useState } from 'react';
import { UNITS } from '../../content/course';
import { CASES, DECLENSIONS, PRONOUNS } from '../../content/grammar';
import { PageHead, Speak } from '../components/common';
import { SpotlightView } from '../components/Exercises';
import { Shell } from '../components/Shell';
import { useTitle } from '../lib/router';

export function Grammar() {
  useTitle('Grammar');
  const [caseId, setCaseId] = useState('gen');
  const [nounId, setNounId] = useState('kot');
  const noun = DECLENSIONS.find((d) => d.id === nounId)!;
  const active = CASES.find((c) => c.id === caseId)!;
  const idx = CASES.findIndex((c) => c.id === caseId);

  return (
    <Shell>
      <div className="stack-lg">
        <PageHead eyebrow="Reference" title="Grammar, one idea at a time">
          Polish nouns change their endings to show their job in a sentence. Pick a case to see what it does and how the ending changes.
        </PageHead>

        <section className="stack" aria-labelledby="cases">
          <h2 id="cases" style={{ fontSize: 26 }}>
            The seven cases
          </h2>
          <div className="case-grid" role="group" aria-label="Cases">
            {CASES.map((c) => (
              <button key={c.id} className="case-card" aria-pressed={c.id === caseId} onClick={() => setCaseId(c.id)}>
                <span className="eyebrow">{c.name}</span>
                <h3 lang="pl">{c.polish}</h3>
                <span className="q" lang="pl">
                  {c.questions}
                </span>
              </button>
            ))}
          </div>
          <div className="card stack" aria-live="polite">
            <div>
              <div className="eyebrow">{active.name}</div>
              <p style={{ fontSize: 18, marginTop: 4 }}>{active.job}</p>
            </div>
            <div>
              <div className="eyebrow">Used after</div>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                {active.triggers.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="example">
              <Speak text={active.example[0]} />
              <div>
                <div className="pl" lang="pl" style={{ fontSize: 22 }}>
                  {active.example[0]}
                </div>
                <div className="muted">{active.example[1]}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="stack" aria-labelledby="decl">
          <h2 id="decl" style={{ fontSize: 26 }}>
            Declension explorer
          </h2>
          <div className="seg" role="group" aria-label="Choose a noun">
            {DECLENSIONS.map((d) => (
              <button key={d.id} className="pl" aria-pressed={d.id === nounId} onClick={() => setNounId(d.id)} lang="pl">
                {d.word}
              </button>
            ))}
          </div>
          <p className="muted">
            <span className="pl" lang="pl">
              {noun.word}
            </span>{' '}
            — {noun.en}, {noun.gender}. {noun.note}
          </p>
          <div className="table-wrap">
            <table className="plain">
              <thead>
                <tr>
                  <th scope="col">Case</th>
                  <th scope="col">Singular</th>
                  <th scope="col">Plural</th>
                </tr>
              </thead>
              <tbody>
                {CASES.map((c, i) => (
                  <tr key={c.id} className={i === idx ? 'hl' : ''} onClick={() => setCaseId(c.id)}>
                    <td>
                      <b>{c.name}</b>
                      <div className="muted" style={{ fontSize: 13 }} lang="pl">
                        {c.questions}
                      </div>
                    </td>
                    <td className="pl" lang="pl">
                      {noun.singular[i]}
                    </td>
                    <td className="pl" lang="pl">
                      {noun.plural[i]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack" aria-labelledby="pron">
          <h2 id="pron" style={{ fontSize: 26 }}>
            Personal pronouns
          </h2>
          <p className="muted">Short forms (mi, ci, go) are the everyday choice; long forms are for emphasis and after prepositions (dla niego).</p>
          <div className="table-wrap">
            <table className="plain">
              <thead>
                <tr>
                  {PRONOUNS.head.map((h) => (
                    <th key={h} scope="col" lang="pl">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRONOUNS.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((c, j) => (
                      <td key={j} className={j ? 'pl' : ''} lang={j ? 'pl' : undefined} style={j ? { fontSize: 16 } : undefined}>
                        {j ? c : <b>{CASES.find((x) => x.id === c)?.name ?? c}</b>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack" aria-labelledby="spots">
          <h2 id="spots" style={{ fontSize: 26 }}>
            Every grammar spotlight
          </h2>
          <p className="muted">The short explanations from each lesson, in course order.</p>
          {UNITS.map((u) =>
            u.lessons
              .filter((l) => l.spotlight)
              .map((l) => (
                <details key={l.id} className="spot">
                  <summary>
                    <span>
                      {l.spotlight!.title}{' '}
                      <span className="muted" style={{ fontWeight: 400 }}>
                        · Unit {u.n}
                      </span>
                    </span>
                  </summary>
                  <div>
                    <SpotlightView s={l.spotlight!} />
                  </div>
                </details>
              )),
          )}
        </section>
      </div>
    </Shell>
  );
}
