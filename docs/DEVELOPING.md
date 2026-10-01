# Developing and deploying Wycinanka

How the app is built, how to run and test it, and how it is deployed on Cloudflare's free plan.

## Stack

| Layer | Choice |
|---|---|
| Front end | React 19 + Vite, plain CSS; self-hosted fonts (Poltawski Nowy, Signika) |
| API | Hono on Cloudflare Workers (`src/worker`) |
| Data | Cloudflare D1 (`migrations/`, applied by the Worker itself on first request) |
| Speech recognition | The browser's own (Web Speech API) where it has one; otherwise, and always on iPhone and iPad (whose recogniser goes through Siri and is unreliable for Polish), a short WAV clip taken straight from Web Audio is transcribed on the Worker by Whisper on Workers AI (`src/worker/routes/speech.ts`, nothing stored); only when neither works do learners listen back and mark themselves |
| Audio | Every fixed Polish text pre-recorded with [Piper](https://github.com/OHF-Voice/piper1-gpl), free neural voices run locally (`scripts/voice.py`): *mc_speech* (male) for everything, *gosia* (female) for the texts `src/app/lib/voices.ts` gives it. Served as small MP3s; the browser's own Polish voice for text typed into the tools, or for everything if the learner prefers it |
| Shared | FSRS scheduler, answer grader, validation and progress rules (`src/shared`), used by both browser and Worker |
| Content | TypeScript data in `src/content`, validated by tests |

## Develop

Requires Node 22 (see `.node-version`).

```sh
npm install
cp .dev.vars.example .dev.vars        # local-only pepper for password hashing
npx wrangler dev --local               # builds, then app + API on http://localhost:8787
```

`--local` runs without Workers AI, which always runs on Cloudflare and needs `npx wrangler login`. Speaking still works: browsers with their own speech recognition use it, and others fall back to listening back. Drop `--local` (after logging in) to try Whisper transcription locally; it counts towards your account's Workers AI allowance.

For fast front-end iteration, run `npx wrangler dev --local` in one terminal and `npm run dev` in another. Vite proxies `/api` to the Worker.

## Test

```sh
npm test            # unit tests + Worker integration tests (real D1 in Miniflare)
npm run test:e2e    # Playwright end-to-end tests: builds the app and starts a fresh local Worker
npm run typecheck
```

The end-to-end tests complete real lessons by reading answers from the course content, so they will catch content that can't be answered.

GitHub Actions (`.github/workflows/ci.yml`) runs the typecheck and all three test suites on every pull request and every push to `main`. Cloudflare deploys `main` on its own, so keep CI green before merging.

## Deploy (free plan)

Live at **https://polish.saluki.cloud**. The repository is set up so that a Cloudflare dashboard deploy works with the default settings:

- `wrangler.jsonc` names the Worker `learnpolish` (the repository's original name; the Worker keeps it so its domain, database and secrets stay attached), binds the existing D1 database `learnpolish-db` and serves the Worker on the custom domain `polish.saluki.cloud`.
- `build.command` in `wrangler.jsonc` runs `npm run build`, so a plain `npx wrangler deploy` builds the front end first.
- The Worker applies any pending migrations itself on its first request (`src/worker/migrate.ts`), using the same `d1_migrations` table as `wrangler d1 migrations apply`. No separate migration step is needed.
- `PEPPER` is optional, so the first deploy works before any secret is set (see below).
- Workers AI is bound as `AI` for speech transcription (Whisper). There is nothing to set up: it's part of every Workers account, and the free plan's daily allowance (10,000 neurons, roughly a few thousand short spoken answers) is shared by everyone who uses a browser without its own recognition. Beyond it, or if the binding is removed, speaking falls back to listening back and marking yourself. Transcription is throttled to 180 requests an hour per network (and per learner when signed in), and stops for the day at `SPEECH_DAILY_LIMIT` in `wrangler.jsonc` (2,000 by default), of which guests may use half, so a flood of requests can't use up the allowance for everyone.
- Daily reminders (`src/worker/reminders.ts`) are sent by a Durable Object, `ReminderClock` (`src/worker/clock.ts`), whose alarm fires a minute past every hour and sets the next one. It needs no Cron Trigger (the free plan allows five per account) and starts itself on the first API request after a deploy. SQLite-backed Durable Objects and their alarms are part of the free plan. A reminder that misses its hour still goes out in the hour after. The Web Push (VAPID) key pair is generated on first use and stored in D1, so there is nothing to configure; `PUSH_CONTACT` in `vars` is the contact URL push services see. On the free plan one run sends at most 40 reminders, so a deployment with more learners reminded in the same hour needs the paid plan and a higher `MAX_PUSHES_PER_RUN`.

### Problems in learners' browsers

The app reports what goes wrong on learners' devices to `/api/report`, and the Worker writes each report to its logs as a `client_problem` event: the app failing to start (including a browser too old to parse it, caught by the plain `public/boot-watch.js`), crashes while rendering, uncaught errors, and speech checking giving up. Each carries the path, the build, the user agent and the country, never anything the learner typed or said. Find them in the dashboard under **Workers & Pages → learnpolish → Observability** (observability is on in `wrangler.jsonc`), filtering on `event = client_problem`. Reports are throttled per network.

### Content Security Policy and Cloudflare's own scripts

Cloudflare adds scripts to pages on this zone: Bot Fight Mode's JavaScript Detections (inline, and it can't be switched off) and the Web Analytics beacon. Pages therefore run through the Worker (`run_worker_first` in `wrangler.jsonc`, `src/worker/pages.ts`), which gives each page a fresh CSP nonce; Cloudflare reads it from the header and puts it on the scripts it injects, so nothing inline is allowed in general. The beacon's hosts are allowed. Everything else is served straight from the assets with the policy in `public/_headers`; a test keeps the two in step.

### Deploy your own copy

The **Deploy to Cloudflare** button in the [README](../README.md) copies this repository to your GitHub account and deploys it to your Cloudflare account. It creates a new D1 database for the `DB` binding and asks for the `PEPPER` secret (listed in `.dev.vars.example`): give it a random value of at least 32 characters, for example from `openssl rand -base64 48`, and keep a copy.

Before deploying, or in your copy straight after, remove the `routes` line from `wrangler.jsonc`: it puts the Worker on `polish.saluki.cloud`, which only this project's Cloudflare account can use. Without it your copy runs on its `*.workers.dev` address, or you can put your own domain there. Also change `PUSH_CONTACT` to your own site or a `mailto:` address.

### Connect the repository (one time)

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**, and pick `iSaluki/wycinanka`.
2. Set the project name to `learnpolish`: it must match `name` in `wrangler.jsonc`, or builds fail. Keep root directory `/` and deploy command `npx wrangler deploy`. The build command can be left empty or set to `npm run build`.
3. Select **Create and deploy**. Every push to `main` then builds and deploys automatically.

Pull requests get [Worker Previews](https://developers.cloudflare.com/workers/previews/). The `previews` block in `wrangler.jsonc` is deliberately empty, so a Preview has no database: it can never touch production data, and it runs in guest mode (sign-up and sign-in say accounts aren't available in the preview).

### Add the pepper (recommended)

In the Worker, open **Settings → Variables and Secrets → Add**, choose type **Secret**, name it `PEPPER` and paste a random value of at least 32 characters (for example from `openssl rand -base64 48`). Keep a copy somewhere safe. Once it is set it must not change, because peppered passwords can only be checked with the same pepper.

Accounts created before the pepper was set keep working: their hashes are marked as unpeppered. Within the hour after the pepper is set, housekeeping (`src/worker/housekeeping.ts`) wraps each of them with the pepper, which needs no password, so a leaked database can't be attacked offline even for accounts that never sign in again. Each is then replaced by an ordinary peppered hash the next time that person signs in.

### From the command line instead

```sh
npx wrangler login
npm run deploy                                   # builds and deploys
openssl rand -base64 48 | npx wrangler secret put PEPPER
```

### Adding a migration

Add the `.sql` file to `migrations/` **and** the same text to `src/worker/migrations.ts`. A unit test fails if the two differ. The next deploy applies it on the first request.

### Limits

The free plan limits each request to about 10 ms of CPU, so `PBKDF2_ITERATIONS` in `wrangler.jsonc` defaults to 30,000. On the paid plan, raise it to 100,000 (the Workers maximum). Existing password hashes are upgraded automatically the next time each user signs in.

Expired sessions and stale sign-in throttling rows are removed by the hourly reminder clock, and also at most once an hour in the background of normal API requests, so housekeeping continues even if the clock stops.

## Security

Designed against the OWASP Top 10 and ASVS level 1, with selected level 2 controls (full table in [docs/PLAN.md](PLAN.md#5-security-owasp)):

- Passwords: PBKDF2-HMAC-SHA256 with a per-user salt and a secret pepper (a Worker secret, never stored in D1); NIST-style policy (length and a blocklist, no composition rules)
- Sessions: 256-bit random tokens in `__Host-` cookies (`HttpOnly`, `Secure`, `SameSite=Lax`); only their SHA-256 hash is stored; revoked on sign-out and on password change
- CSRF: same-origin `Origin` check and JSON-only bodies on every state-changing request
- Throttling and lockout on sign-in, registration and password-confirmed actions. Failed sign-ins lock an account only for the network they come from (IPv6 counted per /64), with a much higher limit across all networks, so nobody can lock someone else out; checking whether a username exists by trying to register is limited too
- Strict validation (unknown fields rejected), prepared statements only, body size limits
- Strict CSP with no inline scripts or third-party origins (the one exception: culture videos may be framed from youtube-nocookie.com, and only load when played), plus HSTS, `X-Frame-Options`, `nosniff` and more
- Privacy: username only, no email or tracking; users can export or delete all their data
- Speaking: the microphone is used only while the learner has tapped it. Clips sent to the Worker are transcribed and discarded, never stored or logged. Browsers' own recognisers are run by the browser maker (Chrome sends audio to Google), and the speaking section says which is in use; recordings for playing back stay in the page (`blob:` media, allowed by the CSP)

## Content

- Course: `src/content/units/*.ts`, built with the helpers in `src/content/build.ts`, in the order set by `UNITS` in `src/content/course.ts`. A unit's id (`u06`) never changes; its "Unit n" is its place in that list, so new units can go wherever they fit.
- Card IDs derive from the lesson ID and the Polish text (older sentences and drills keep the numbered ids they were saved under, listed in `src/content/legacy-ids.ts`), so adding, removing or reordering content never moves a learner's review history onto something else. `test/unit/card-ids.json` records every id learners may have: after adding content run `npm run ids`; when correcting the Polish of a live sentence, give it `key` (its old id) and note it in `CORRECTED` in `test/unit/card-ids.test.ts`.
- Frequency list: `src/content/frequency.ts`, ordered using the OpenSubtitles 2018 Polish list ([hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)), grouped by dictionary form.
- `npm run test:unit` checks content integrity: unique IDs, Unicode NFC, drills that can be answered, and distractor tiles that aren't also correct words.

### Recorded voice

Lessons, phrases, words and the other fixed Polish text are read by the mc_speech Piper voice (trained on a CC0 dataset), recorded ahead of time rather than synthesised in the browser. After adding or changing Polish text, record it:

```sh
pip install piper-tts lameenc   # once; Python 3.9+
npm run voice                   # records only what's new, deletes what's gone
```

The first run downloads the voice model (about 60 MB) to `~/.cache/wycinanka-voice`. `src/app/lib/spoken.ts` lists every text that is recorded; each file in `public/voice/<voice>/` is named by a hash of its text, and `public/voice-index.json` lists them, so the app knows what it can play without a lookup table. `npm run test:unit` fails if any text is missing a recording. Text without one (a number typed into the tools, for example) falls back to the browser's voice.
