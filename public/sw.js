/*
 * Wycinanka service worker: makes the app installable, keeps it opening when the network drops,
 * and shows daily practice reminders sent by the Worker (see src/worker/reminders.ts).
 *
 * Caching is deliberately small. Hashed build files (/assets/*) never change, so they are served
 * from the cache first; everything else is left to the browser's normal HTTP cache. Pages always
 * try the network first and fall back to the cached app shell.
 * The API is never cached: progress must always come from the server.
 */

const CACHE = 'wycinanka-v1';
const SHELL = '/';

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
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
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

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ??
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
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
