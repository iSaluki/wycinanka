# Wycinanka

*vi-chi-NAN-ka* — the Polish folk art of paper cutting.

A free Polish course for British English speakers, from complete beginner to B1. Every lesson you finish cuts a new layer into your own paper rosette. Runs entirely on Cloudflare Workers + D1, within the free plan.

- **54 lessons in 18 units** (A1–B1): sounds, greetings, the seven cases, verb groups, aspect, past, future and conditional
- **Spaced review** scheduled by FSRS, the modern algorithm used in Anki
- **The 500 most frequent words**, learnt in batches of eight
- **Sounds**: the Polish sound system and a minimal-pair listening game (*wieś / wiesz*)
- **Grammar reference**: the seven cases, a declension explorer and every lesson's grammar notes
- **Placement check** so learners can start at their own level
- **Guest mode**: learn without an account. Nothing is saved; sign up to keep progress, and that visit's work comes with you.
- Mobile and desktop, light and dark themes, reduced motion, keyboard shortcuts (1–4 to choose, Enter to check)

The research behind the course design, the curriculum, architecture and security model are in [docs/PLAN.md](docs/PLAN.md).

## Stack

| Layer | Choice |
|---|---|
| Front end | React 19 + Vite, plain CSS; self-hosted fonts (Poltawski Nowy, Lato) |
| API | Hono on Cloudflare Workers (`src/worker`) |
| Data | Cloudflare D1 (`migrations/`) |
| Audio | The browser's built-in Polish speech synthesis (free, no API) |
| Shared | FSRS scheduler, answer grader, validation and progress rules (`src/shared`), used by both browser and Worker |
| Content | TypeScript data in `src/content`, validated by tests |

## Develop

Requires Node 20+.

```sh
npm install
cp .dev.vars.example .dev.vars        # local-only pepper for password hashing
npm run db:migrate:local
npm run build && npx wrangler dev      # app + API on http://localhost:8787
```

For fast front-end iteration, run `npx wrangler dev` in one terminal and `npm run dev` in another. Vite proxies `/api` to the Worker.

## Test

```sh
npm test            # unit tests + Worker integration tests (real D1 in Miniflare)
npm run test:e2e    # Playwright end-to-end tests: builds the app and starts a fresh local Worker
npm run typecheck
```

The end-to-end tests complete real lessons by reading answers from the course content, so they will catch content that can't be answered.

## Deploy (free plan)

```sh
npx wrangler login
npx wrangler d1 create wycinanka                 # copy the database_id into wrangler.jsonc
openssl rand -base64 48 | npx wrangler secret put PEPPER
npm run deploy                                   # builds, applies migrations, deploys
```

`PEPPER` must be at least 32 characters. Keep a copy somewhere safe: if it changes, every existing password stops working.

The free plan limits each request to about 10 ms of CPU, so `PBKDF2_ITERATIONS` in `wrangler.jsonc` defaults to 30,000. On the paid plan, raise it to 100,000 (the Workers maximum). Existing password hashes are upgraded automatically the next time each user signs in.

A daily Cron Trigger removes expired sessions and stale sign-in throttling rows.

## Security

Designed against the OWASP Top 10 and ASVS level 1, with selected level 2 controls (full table in [docs/PLAN.md](docs/PLAN.md#5-security-owasp)):

- Passwords: PBKDF2-HMAC-SHA256 with a per-user salt and a secret pepper; NIST-style policy (length and a blocklist, no composition rules)
- Sessions: 256-bit random tokens in `__Host-` cookies (`HttpOnly`, `Secure`, `SameSite=Lax`); only their SHA-256 hash is stored; revoked on sign-out and on password change
- CSRF: same-origin `Origin` check and JSON-only bodies on every state-changing request
- Throttling and lockout on sign-in, registration and password-confirmed actions
- Strict validation (unknown fields rejected), prepared statements only, body size limits
- Strict CSP with no inline scripts or third-party origins, plus HSTS, `X-Frame-Options`, `nosniff` and more
- Privacy: username only, no email or tracking; users can export or delete all their data

## Content

- Course: `src/content/units/*.ts`, built with the helpers in `src/content/build.ts`. IDs derive from the lesson ID and the Polish text, so don't change the Polish of an item that is already live: that would reset learners' review cards for it.
- Frequency list: `src/content/frequency.ts`, ordered using the OpenSubtitles 2018 Polish list ([hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)), grouped by dictionary form.
- `npm run test:unit` checks content integrity: unique IDs, Unicode NFC, drills that can be answered, and distractor tiles that aren't also correct words.
