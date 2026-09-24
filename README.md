# Wycinanka

*vi-chi-NAN-ka* — the Polish folk art of paper cutting.

A free Polish course for British English speakers, from complete beginner to B1. Every lesson you finish cuts a new layer into your own paper rosette. Runs entirely on Cloudflare Workers + D1, within the free plan.

- **60 lessons in 19 units** (A0–B1), starting with an alphabet and phonics unit, then greetings, the seven cases, verb groups, aspect, past, future and conditional
- **Small steps**: lessons introduce new words three at a time and practise each group straight away before the next, with matching rounds that mix new words with ones met earlier; the grammar spotlight follows once its words are familiar
- **More than one right answer**: typing any course word that means the English prompt is accepted (*cześć* as well as *dzień dobry* for "hello"), with a note naming the word the card was teaching and how they differ; multiple-choice questions never offer a second right answer as a wrong option
- **Help when stuck, honest about accents**: a hint button rules out wrong options or reveals the start of the answer, step by step; an answer typed without its Polish letters (*dziekuje* for *dziękuję*) isn't accepted until they're added. Answers that needed either come back sooner in review, and the finish screen lists them to look over
- **Reinforcement, not one-off teaching**: FSRS spaced review (the algorithm used in Anki) for every word, sentence and grammar drill; each lesson opens with a warm-up from earlier ones; signed-in learners also get revision questions sprinkled through each lesson, picked at random but weighted heavily towards what they've got wrong; trouble spots by skill, a "tricky words" list and unit revision target what you get wrong most
- **Lexical chunks**: 36 everyday phrases (*nie ma sprawy*, *czy mogę prosić o…*, *mam ochotę na…*) learnt as whole units, each with its word-for-word meaning to show why translating piece by piece fails. In sentence building, known phrases are a single tile, and multi-word lesson items are flagged as phrases to learn whole
- **The 500 most frequent words**, learnt in batches of eight
- **Picture flashcards**: 72 everyday objects in nine themed decks. Meet each picture with its Polish and English name, then name it from four Polish words; learnt pictures come back on the spaced-review schedule. Images are [Twemoji](https://github.com/jdecked/twemoji) (CC BY 4.0), self-hosted in `public/pictures`
- **Sounds**: an alphabet chart, English-style respellings on every word (*VRO-tswaf*) and a minimal-pair listening game (*wieś / wiesz*)
- **Tools** outside the course: a pronouncer (type *cz* or any word and see how to say it and why), Polish numbers and prices, telling the time, and a phrasebook
- **Culture notes**: short English articles on Polish traditions (Wigilia, Easter, name days, All Saints', Fat Thursday, paper cutting and more), each with Polish words to hear and take away. Five carry one hand-picked video from the performer's or institution's own channel (fans and players singing *Sto lat*, a stadium singing the anthem, Chopin from the Chopin Institute, a Łowicz paper-cutter, Wigilia's twelve dishes). Nothing loads from YouTube until the learner presses play, and then only from youtube-nocookie.com, the one third-party origin the CSP allows (as a frame)
- **Installable app (PWA)**: mobile learners are invited to add Wycinanka to their home screen (the browser's own install prompt on Android, Share → Add to Home Screen instructions on iPhone)
- **Daily reminders**: signed-in learners can switch on a push notification at a time they choose, sent only on days they haven't practised yet
- **Grammar reference**: the seven cases, a declension explorer and every lesson's grammar notes
- **Placement check** so learners can start at their own level
- **Guest mode**: learn without an account. Nothing is saved; sign up to keep progress, and that visit's work comes with you.
- Mobile and desktop, light and dark themes, reduced motion, keyboard shortcuts (1–4 to choose, Enter to check)

The research behind the course design, the curriculum, architecture and security model are in [docs/PLAN.md](docs/PLAN.md).

## Stack

| Layer | Choice |
|---|---|
| Front end | React 19 + Vite, plain CSS; self-hosted fonts (Poltawski Nowy, Signika) |
| API | Hono on Cloudflare Workers (`src/worker`) |
| Data | Cloudflare D1 (`migrations/`, applied by the Worker itself on first request) |
| Audio | The browser's built-in Polish speech synthesis (free, no API) |
| Shared | FSRS scheduler, answer grader, validation and progress rules (`src/shared`), used by both browser and Worker |
| Content | TypeScript data in `src/content`, validated by tests |

## Develop

Requires Node 22 (see `.node-version`).

```sh
npm install
cp .dev.vars.example .dev.vars        # local-only pepper for password hashing
npx wrangler dev                       # builds, then app + API on http://localhost:8787
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

Live at **https://polish.saluki.cloud**. The repository is set up so that a Cloudflare dashboard deploy works with the default settings:

- `wrangler.jsonc` names the Worker `learnpolish` (the repository name, which the dashboard suggests), binds the existing D1 database `learnpolish-db` and serves the Worker on the custom domain `polish.saluki.cloud`.
- `build.command` in `wrangler.jsonc` runs `npm run build`, so a plain `npx wrangler deploy` builds the front end first.
- The Worker applies any pending migrations itself on its first request (`src/worker/migrate.ts`), using the same `d1_migrations` table as `wrangler d1 migrations apply`. No separate migration step is needed.
- `PEPPER` is optional, so the first deploy works before any secret is set (see below).
- An hourly Cron Trigger (`triggers` in `wrangler.jsonc`) sends daily reminders (`src/worker/reminders.ts`). The Web Push (VAPID) key pair is generated on first use and stored in D1, so there is nothing to configure; `PUSH_CONTACT` in `vars` is the contact URL push services see. On the free plan one run sends at most 40 reminders, so a deployment with more learners reminded in the same hour needs the paid plan and a higher `MAX_PUSHES_PER_RUN`.

### Connect the repository (one time)

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**, and pick `iSaluki/learnpolish`.
2. Keep the defaults: project name `learnpolish`, root directory `/`, deploy command `npx wrangler deploy`. The build command can be left empty or set to `npm run build`.
3. Select **Create and deploy**. Every push to `main` then builds and deploys automatically.

Pull requests get [Worker Previews](https://developers.cloudflare.com/workers/previews/). The `previews` block in `wrangler.jsonc` is deliberately empty, so a Preview has no database: it can never touch production data, and it runs in guest mode (sign-up and sign-in say accounts aren't available in the preview).

### Add the pepper (recommended)

In the Worker, open **Settings → Variables and Secrets → Add**, choose type **Secret**, name it `PEPPER` and paste a random value of at least 32 characters (for example from `openssl rand -base64 48`). Keep a copy somewhere safe. Once it is set it must not change, because peppered passwords can only be checked with the same pepper.

Accounts created before the pepper was set keep working: their hashes are marked as unpeppered and are upgraded to peppered hashes the next time each person signs in.

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

Expired sessions and stale sign-in throttling rows are removed by the hourly Cron Trigger, and also at most once an hour in the background of normal API requests, so housekeeping continues even if the trigger is removed.

## Security

Designed against the OWASP Top 10 and ASVS level 1, with selected level 2 controls (full table in [docs/PLAN.md](docs/PLAN.md#5-security-owasp)):

- Passwords: PBKDF2-HMAC-SHA256 with a per-user salt and a secret pepper (a Worker secret, never stored in D1); NIST-style policy (length and a blocklist, no composition rules)
- Sessions: 256-bit random tokens in `__Host-` cookies (`HttpOnly`, `Secure`, `SameSite=Lax`); only their SHA-256 hash is stored; revoked on sign-out and on password change
- CSRF: same-origin `Origin` check and JSON-only bodies on every state-changing request
- Throttling and lockout on sign-in, registration and password-confirmed actions
- Strict validation (unknown fields rejected), prepared statements only, body size limits
- Strict CSP with no inline scripts or third-party origins (the one exception: culture videos may be framed from youtube-nocookie.com, and only load when played), plus HSTS, `X-Frame-Options`, `nosniff` and more
- Privacy: username only, no email or tracking; users can export or delete all their data

## Content

- Course: `src/content/units/*.ts`, built with the helpers in `src/content/build.ts`. IDs derive from the lesson ID and the Polish text, so don't change the Polish of an item that is already live: that would reset learners' review cards for it.
- Frequency list: `src/content/frequency.ts`, ordered using the OpenSubtitles 2018 Polish list ([hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)), grouped by dictionary form.
- `npm run test:unit` checks content integrity: unique IDs, Unicode NFC, drills that can be answered, and distractor tiles that aren't also correct words.
