/*
 * Wycinanka service worker: makes the app installable, keeps it opening when the network drops,
 * and shows daily practice reminders sent by the Worker (see src/worker/reminders.ts).
 *
 * Caching is deliberately small. Hashed build files (/assets/*) and recordings (/voice/*) never change,
 * so they are served from the cache first (recordings once they have been played); everything else is
 * left to the browser's normal HTTP cache. Pages always try the network first and fall back to the
 * cached app shell.
 * The API is never cached: progress must always come from the server.
 */

// Three caches, each pruned to a size: the app shell, build files and recordings. Bump a name to start it afresh;
// activate deletes every cache not listed here.
const CACHE = 'wycinanka-shell-v2';
const ASSETS = 'wycinanka-assets-v2';
const VOICE = 'wycinanka-voice-v2';
const KEEP = [CACHE, ASSETS, VOICE];
/** Most entries kept per cache. Build files change with every release; recordings add up (about 5 KB each). */
const LIMITS = { [ASSETS]: 40, [VOICE]: 1500 };
const SHELL = '/';

/** Drops the oldest entries (Cache keys come back in the order they were added) beyond the cache's limit. */
async function trim(name) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  const extra = keys.length - (LIMITS[name] ?? Infinity);
  for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
}

/**
 * Audio elements ask for byte ranges and expect "206 Partial Content", which the Cache API can't store. So
 * recordings are fetched and cached whole, and a range is cut from the whole file when one is asked for.
 */
async function answerRange(req, res) {
  const range = req.headers.get('range');
  if (!range || res.status !== 200) return res;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  const body = await res.arrayBuffer();
  const size = body.byteLength;
  if (!m || (!m[1] && !m[2])) return new Response(body, { status: 200, headers: res.headers });
  let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  let end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'audio/mpeg',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(SHELL, copy));
          }
          return res;
        })
        .catch(() => caches.match(SHELL).then((r) => r ?? Response.error())),
    );
    return;
  }

  // The list of recordings: fresh when online, the last copy offline, so recorded audio keeps working.
  if (url.pathname === '/voice-index.json') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r ?? Response.error())),
    );
    return;
  }

  // Recordings and build files never change: once fetched, they come from the cache, offline too.
  const store = url.pathname.startsWith('/assets/') ? ASSETS : url.pathname.startsWith('/voice/') ? VOICE : null;
  if (store) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(store);
        // Look up and fetch by URL alone, so a byte-range request still finds (and stores) the whole file.
        const hit = await cache.match(url.href);
        if (hit) return answerRange(req, hit);
        const res = await fetch(url.href, { credentials: 'same-origin' });
        if (res.status === 200) {
          const copy = res.clone();
          event.waitUntil(cache.put(url.href, copy).then(() => trim(store)).catch(() => undefined));
        }
        return answerRange(req, res);
      })(),
    );
  }
});

const DEFAULT_REMINDER = {
  title: 'Czas na polski!',
  body: 'Time for Polish: a few minutes today keeps your streak and your review deck on track.',
  url: '/',
};

self.addEventListener('push', (event) => {
  let data = DEFAULT_REMINDER;
  try {
    if (event.data) data = { ...DEFAULT_REMINDER, ...event.data.json() };
  } catch {
    // A payload that isn't JSON still gets the standard reminder.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'daily-reminder',
      lang: 'en-GB',
      data: { url: data.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url ?? '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      // Bring an open copy of the app forward as it is: navigating it could throw away a lesson in progress.
      const open = wins.find((w) => new URL(w.url).origin === self.location.origin);
      return open ? open.focus() : self.clients.openWindow(target);
    }),
  );
});
