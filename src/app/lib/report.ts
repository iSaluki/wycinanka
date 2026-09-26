/**
 * Tells the Worker when something goes wrong in this browser, so problems on devices we can't test (an old iPad,
 * an Android phone's recogniser) show up in the Worker's logs. Kept free of other app modules so it works even
 * when the rest of the app fails to load. Each distinct problem is sent once per visit, at most a few in all,
 * and never anything the learner typed or said.
 */

export type ReportKind = 'boot' | 'render' | 'error' | 'rejection' | 'speech';

const MAX_PER_VISIT = 8;
const sent = new Set<string>();

const describe = (err: unknown): [string, string | undefined] => {
  if (err instanceof Error) return [`${err.name}: ${err.message}`, err.stack];
  return [String(err), undefined];
};

/** The build this page came from: the hashed name of its main script. */
function build(): string | undefined {
  const src = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/"]')?.getAttribute('src') ?? '';
  return src.split('/').pop()?.slice(0, 40) || undefined;
}

export function report(kind: ReportKind, err: unknown, extra?: string): void {
  try {
    if (!import.meta.env.PROD) return;
    const [message, stack] = describe(err);
    const id = `${kind}:${message}`;
    if (sent.has(id) || sent.size >= MAX_PER_VISIT) return;
    sent.add(id);
    const detail = [extra, stack].filter(Boolean).join('\n') || undefined;
    void fetch('/api/report', {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind,
        message: message.slice(0, 500),
        detail: detail?.slice(0, 2000),
        path: location.pathname.slice(0, 200),
        build: build(),
      }),
    }).catch(() => undefined);
  } catch {
    // Reporting must never cause a problem of its own.
  }
}

/** Uncaught errors and rejected promises anywhere on the page. */
export function watchForErrors(): void {
  window.addEventListener('error', (e) => {
    // A resource that failed to load (an image, a recording) is not worth a report.
    if (!(e.error instanceof Error) && !e.message) return;
    report('error', e.error ?? e.message, e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : undefined);
  });
  window.addEventListener('unhandledrejection', (e) => report('rejection', e.reason));
}
