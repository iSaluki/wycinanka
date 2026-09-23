# Wycinanka — product & technical plan

> *Wycinanka* (vi-chi-NAN-ka) is the Polish folk art of paper cutting. Every lesson a learner finishes cuts
> one more petal into their own paper rosette. The name is also the app's first pronunciation lesson.

A free Polish course for (British) English speakers. It runs entirely on Cloudflare's Workers platform,
within the free tier. Anyone can learn without an account. An account saves progress across devices.

---

## 1. Research: what works for an English speaker learning Polish

### 1.1 How big the task is

- The US Foreign Service Institute puts Polish in **Category III**: roughly **1,100 class hours (44 weeks)** for
  an English speaker to reach professional working proficiency (about CEFR C1). That is twice as long as
  French or Spanish. ([FSI ranking](https://www.fsi-language-courses.org/blog/fsi-language-difficulty/),
  [Language Lab](https://language-lab.io/blog/how-long-to-learn-polish/))
- Implication: the app cannot pretend to make someone fluent. It should get a learner through A1–B1 with
  a solid base, build a habit, and make the long road feel measurable.

### 1.2 Evidence-based learning techniques

| Technique | Evidence | How Wycinanka uses it |
|---|---|---|
| **Spaced practice** | Kim & Webb (2022) meta-analysis of 48 L2 experiments (N = 3,411): medium-to-large effect for spaced vs massed practice; longer gaps help delayed retention. ([Language Learning](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479)) | Every word and sentence learnt becomes a review card scheduled by **FSRS** (the modern successor to SM-2 used in Anki). |
| **Retrieval practice** | Rowland (2014) meta-analysis, 159 effect sizes: g ≈ 0.50 for testing over re-studying. | Lessons are mostly *doing*, not reading: recall, type, build, listen. Review cards always ask before showing. |
| **Frequency-first vocabulary** | In English the first 1,000 word families cover ~72–81% of running text; 98% coverage needs 8–9k families (Nation; Schmitt et al. 2011). Our own count on the OpenSubtitles Polish list (hermitdave/FrequencyWords, 2018): top **100** forms ≈ **43.5%** of spoken tokens, top **1,000** ≈ **68.4%**. | A dedicated **Words** deck ordered by frequency, in bands of 50, so learners see their "coverage" climb. Lessons front-load high-frequency words. |
| **Productive over receptive** | Producing a form (typing) builds stronger memory than recognising it; recognition is an easier on-ramp. | Each item is introduced receptively (choose), then produced (type / build) within the same lesson. |
| **Comprehensible input / chunks** | Learners acquire grammar from meaningful, slightly-above-level input; fixed phrases (*chunks*) are learnt as units before they are analysed. | Lessons teach whole phrases first (*Poproszę kawę*), then explain the grammar that makes them work. Every lesson has a short dialogue. |
| **Interleaving** | Mixing related problem types improves discrimination (e.g. which case?). | Review sessions mix cards from all units; case drills mix endings. |
| **Explicit form-focus for hard grammar** | For morphologically rich languages, short explicit rules + practice outperform input alone for adult learners. | Short **Grammar spotlight** cards inside lessons, plus a reference section with an interactive declension explorer. |
| **Perception training (minimal pairs)** | High-variability phonetic training improves perception of non-native contrasts, which then helps production. | A **Sounds** section with minimal-pair listening games for the contrasts English lacks. |
| **Immediate, specific feedback** | Feedback that names the error (not just "wrong") speeds learning. | The grader distinguishes "right word, missing diacritic" (*"Nearly — it's **ł**, not l"*) from wrong answers, and accepts alternative answers. |
| **Habit & small daily goals** | Consistency beats bursts (spacing); light gamification helps adherence when it doesn't replace the learning. | Daily goal ring, streak, XP. No hearts/lives, no timers, no punishment, no ads. |

### 1.3 What is specifically hard about Polish for English speakers

1. **Sibilants — three series where English has two.** Polish contrasts alveolar *s z c dz*,
   retroflex *sz ż/rz cz dż*, and alveolo-palatal *ś ź ć dź* (also written *si zi ci dzi*). The third
   series has no English equivalent, and mixing them changes meaning (*kasza* "groats" vs *Kasia*).
   ([Illinois Elementary Polish](http://faculty.las.illinois.edu/gladney/Elementary_Polish/001_Introduction.html),
   [Babbel](https://www.babbel.com/en/magazine/polish-pronunciation))
2. **Spelling-to-sound rules** are regular but unfamiliar: *w* = v, *ł* = w, *ch/h* = kh, *rz = ż*,
   *ó = u*, *c* = ts, *j* = y, *ie* = ye. Final devoicing (*chleb* → "khlep"). Fixed penultimate stress.
3. **Nasal vowels** *ą* and *ę*, which change pronunciation by position.
4. **Consonant clusters** (*szczęście*, *chrząszcz*, *wszystko*).
5. **Seven cases** (nominative, genitive, dative, accusative, instrumental, locative, vocative), three
   genders in the singular, a masculine-personal/non-personal split in the plural.
6. **Verbal aspect** — nearly every verb is a pair (*robić / zrobić*). English has no direct equivalent.
7. **Numbers govern case** (*dwa koty*, *pięć kotów*).
8. **Formal address** — *pan / pani* + third person verb, used far more than British English speakers expect.
9. **British-specific friction:** UK keyboards have no Polish layout by default, so the app provides an
   on-screen diacritic bar and tolerant grading; British spelling in English glosses (*colour, flat,
   queue, crisps, chips*); real-world contexts the learner will actually meet (the UK has ~700k Polish
   speakers — the corner *polski sklep*, a Polish colleague, a trip to Kraków).

### 1.4 Design consequences

- **Pronunciation first, briefly.** Unit 1 teaches the sound system in 3 short lessons, then pronunciation
  keeps coming back through audio on every word. The Sounds section is always available.
- **Chunks before cases.** A1 teaches cases as phrases (*w domu*, *z mlekiem*) and only names them once the
  learner has used them.
- **Case introduction order** follows usefulness and frequency: accusative (object) → locative (where)
  → genitive (negation, "of", quantities) → instrumental (being / with) → dative (to/for, *podoba mi się*).
- **Aspect is introduced in A2** once past tense exists, framed as "process vs result".
- **Every Polish string can be heard.** Audio uses the browser's built-in `pl-PL` speech synthesis
  (free, offline-capable, no API costs); the Sounds section falls back to IPA + English approximations when no
  Polish voice is installed.

---

## 2. Learner journeys

### 2.1 Entry at any level

On first visit the learner picks a starting point:

| Choice | Starts at |
|---|---|
| **Complete beginner** — "I know *pierogi* and not much else" | Unit 1 (sounds) |
| **I know some basics** — greetings, numbers, a few phrases | Placement check, or jump to Unit 5 |
| **I get by** — I can hold a simple conversation | Placement check, or jump to A2 |

The **placement check** is up to 18 questions spanning A0→B1 (sounds, vocabulary, cases, aspect,
conditional), grouped into six bands. It stops as soon as a band can no longer reach two-thirds correct, and suggests
the first unit of that band. Nothing is ever locked: every unit can be opened from the course map; the map only
*suggests* the next lesson, and units below the suggested start are labelled as ones the learner probably knows.

### 2.2 A lesson (5–8 minutes)

1. **Meet** — new words/phrases as tappable cards (Polish, audio, British English gloss, a pronunciation hint).
2. **Grammar spotlight** (if the lesson has one) — one idea, one table, two examples.
3. **Practise** — 10–14 mixed exercises generated from the lesson's items:
   - *Choose the meaning* (Polish → English, multiple choice)
   - *Say it in Polish* (English → Polish, typed, with diacritic bar)
   - *Listen and choose* (audio only)
   - *Build the sentence* (word tiles, including distractor tiles)
   - *Match pairs* (5 pairs, tap to connect)
   - *Fill the gap* (choose the correct ending/form — used for cases and conjugation)
4. **Dialogue** — a short real-world exchange to read and listen to.
5. **Finish** — accuracy, XP, the new petal is cut into the learner's wycinanka, and the lesson's items
   enter the review deck.

Mistakes are re-queued at the end of the lesson (retrieval until correct), not punished.

### 2.3 Review (daily)

A due-cards queue scheduled by FSRS. Each card is asked (type or choose, depending on how mature the card
is), then the learner sees the answer and the app records Again / Hard / Good / Easy automatically from
correctness and speed, with a manual override.

### 2.4 Other sections

- **Words** — the frequency list: 500 core lemmas in 10 bands of 50, each with gloss, part of speech and an
  example. Learners can drill a band, and see coverage stats.
- **Sounds** — the alphabet and sound board (tap any letter/digraph), plus minimal-pair listening games.
- **Grammar** — reference cards: cases (with interactive declension explorer), verb conjugation groups,
  aspect, numbers, formal address.
- **Profile** — streak, XP history, level, daily goal, settings (speech rate, theme, reduce motion, and whether the
  learner is a man or a woman, so past-tense and conditional forms are shown in their own gender), account (change
  password, export data, delete account).

---

## 3. Curriculum (initial content)

18 units, 3 lessons each (54 lessons), each lesson ~6–9 items + 3–5 sentences + an optional grammar
spotlight and dialogue. Target: ~450 taught items and ~250 sentences.

| # | Unit | CEFR | Core grammar / skill |
|---|---|---|---|
| 1 | Sounds of Polish | A1 | Alphabet, vowels, digraphs, the three sibilant series, stress |
| 2 | Hello & goodbye | A1 | Greetings, politeness, *pan/pani* |
| 3 | Who I am | A1 | *być*, *nazywam się*, nationalities, *z Anglii / z Wielkiej Brytanii* |
| 4 | This & that | A1 | Gender, *to jest*, *ten/ta/to*, adjectives agreement (nominative) |
| 5 | Numbers & money | A1 | 0–100, *złoty/złote/złotych*, *ile kosztuje?* |
| 6 | At the café | A1 | *poproszę* + accusative, food & drink |
| 7 | Everyday verbs | A1 | Conjugation groups *-ę/-esz*, *-m/-sz*, *-ę/-isz* |
| 8 | Family & having | A1 | *mieć*, family words, possessives, *nie mam* + genitive |
| 9 | Where is it? | A1 | Locative after *w/na/o*, places in town |
| 10 | Time & days | A1 | Days, *o której?*, *dzisiaj/jutro*, daily routine |
| 11 | What I did | A2 | Past tense, gender in the past |
| 12 | Aspect | A2 | Imperfective vs perfective pairs |
| 13 | Plans & the future | A2 | *będę* + infinitive, perfective future |
| 14 | With & as | A2 | Instrumental: *z*, *jestem nauczycielem* |
| 15 | Getting around | A2 | *iść/jechać*, *do* + genitive, directions |
| 16 | Likes & gifts | A2 | Dative, *podoba mi się*, *dać komuś* |
| 17 | Would you? | B1 | Conditional *chciałbym*, polite requests, *gdybym* |
| 18 | Quantities | B1 | Numbers + genitive plural, *dużo/mało/kilka* |

The frequency deck (500 lemmas) and the Sounds section are separate content, not part of the unit order.

Content quality rules:

- British English glosses and contexts (flat, queue, chemist, crisps, mobile, surname).
- Each Polish item has: `pl`, `en` (primary gloss), optional `alt` accepted answers, optional `hint`
  (pronunciation or usage), optional `g` (gender) for nouns.
- Sentences list accepted English and Polish variants where word order is flexible.
- Content lives in TypeScript files in `src/content/`, validated by a unit test (unique IDs, no empty
  glosses, every sentence tile set is buildable, diacritics are valid Unicode NFC).

---

## 4. Architecture

```
Browser (React SPA, Vite build)
  │  static assets: served by Workers Static Assets (free, no Worker invocation for assets)
  │  /api/*  ──────────────▶  Worker (Hono router, TypeScript)
                                  │
                                  └──▶ D1 (SQLite): users, sessions, progress, review cards, activity
```

- **Workers + Static Assets** — one deployable. `run_worker_first: ["/api/*"]`, SPA fallback for everything else.
- **D1** — the free tier gives 5 GB, 5M rows read/day and 100k rows written/day, with limits enforced since
  1 Sep 2026 ([changelog](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/)).
  Writes are batched: a finished lesson is one request with one `db.batch()`; review results are sent in batches
  of up to 50.
- **Content is static** and shipped with the front end. The database stores only per-user state, so reads are small.
- **No paid services.** Audio: Web Speech API. Fonts: self-hosted via Fontsource (no Google Fonts requests, which
  also avoids GDPR issues with third-party font hosts).
- **Shared code** (`src/shared/`): FSRS scheduler, answer grader, validation schemas, XP rules, used by both the
  Worker and the SPA, so the server can recompute schedules rather than trusting client numbers.

### 4.1 Guest vs account

- **Guest:** full access. Progress lives in memory for the current tab only (per the brief, it is not saved). A
  gentle banner explains this after the first lesson.
- **Sign up** from that banner carries the current session's progress into the new account (one-time import,
  only allowed while the account has no progress).
- **Signed in:** state loaded from `/api/progress` on start, writes go through the API, with an in-memory
  optimistic cache.

### 4.2 Data model (D1)

```sql
users(id TEXT PK, username TEXT UNIQUE COLLATE NOCASE, password_hash TEXT, created_at INT,
      level TEXT, daily_goal INT, settings TEXT JSON)
sessions(id_hash TEXT PK, user_id FK, created_at INT, expires_at INT, last_seen INT)
lesson_progress(user_id, lesson_id, best_score INT, completions INT, completed_at INT, PK(user_id, lesson_id))
cards(user_id, card_id, due INT, stability REAL, difficulty REAL, reps INT, lapses INT, state INT,
      last_review INT, PK(user_id, card_id))
activity(user_id, day TEXT 'YYYY-MM-DD', xp INT, lessons INT, reviews INT, PK(user_id, day))
auth_throttle(key TEXT PK, count INT, window_start INT, locked_until INT)
```

### 4.3 API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account (username, password), start session |
| POST | `/api/auth/login` | Start session |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Current user or 401 |
| POST | `/api/account/password` | Change password (current + new), revokes other sessions |
| GET | `/api/account/export` | Download all personal data as JSON (UK GDPR Art. 15/20) |
| DELETE | `/api/account` | Delete account and all data (requires password) |
| GET | `/api/progress` | Full snapshot: settings, lessons, cards, activity (last 90 days) |
| PUT | `/api/progress/settings` | Level, daily goal, preferences |
| POST | `/api/progress/lesson` | Record a finished lesson: score, items learnt, local day |
| POST | `/api/progress/reviews` | Batch of review ratings; server recomputes FSRS |
| POST | `/api/progress/import` | One-time guest progress import |

---

## 5. Security (OWASP)

Designed against the **OWASP Top 10 (2021)** and **ASVS 4.0 Level 1** with selected Level 2 controls.

| Area | Control |
|---|---|
| **A01 Broken access control** | Every progress query is scoped by `user_id` from the server-side session, never from the request. No IDs of other users are ever accepted. |
| **A02 Cryptographic failures** | Passwords: PBKDF2-HMAC-SHA256 via WebCrypto with a 16-byte random salt, **plus an HMAC pepper held as a Worker secret** (never in D1). Iteration count is stored in each hash and re-hashed on login when the configured count changes. Session tokens: 32 random bytes; only the SHA-256 of the token is stored. HTTPS only (HSTS). |
| **Platform constraint** | OWASP recommends 600k PBKDF2 iterations; Cloudflare Workers caps PBKDF2 at 100k and the free plan allows ~10 ms CPU per request ([workerd #1346](https://github.com/cloudflare/workerd/issues/1346)). Measured cost is roughly 0.45 ms per 1,000 iterations, so we default to **30,000** on the free plan and 100,000 on paid (configurable `PBKDF2_ITERATIONS`) and compensate with the pepper, which makes a stolen database alone uncrackable offline, and strict login throttling. Argon2id via WASM would exceed the free CPU budget. |
| **A03 Injection** | Only prepared statements (`.bind()`); JSON bodies validated with strict schemas (zod), unknown keys rejected; size limits on bodies (16 KB, 64 KB for import). React escapes output; no `dangerouslySetInnerHTML`. |
| **A04 Insecure design** | Generic auth errors ("Username or password is incorrect"); constant-ish work on unknown users (dummy hash); throttling on login and registration per IP and per username with lockout windows. |
| **A05 Misconfiguration** | Strict CSP (`default-src 'self'`, no inline script, `frame-ancestors 'none'`), `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (microphone allowed for self only), `Cross-Origin-Opener-Policy`. Errors never leak stack traces. |
| **A06 Vulnerable components** | Small dependency set, lockfile committed, `npm audit` in CI script. |
| **A07 Identification & auth** | Password 10–128 chars, blocked if in a common-password list or equal to the username; no composition rules (NIST 800-63B). Sessions: `__Host-` cookie, `HttpOnly; Secure; SameSite=Lax; Path=/`, 30-day absolute expiry, rotated on login, revoked on logout and on password change. |
| **CSRF** | SameSite=Lax cookie + `Origin` header check on every state-changing request + JSON-only content type. |
| **A08 Integrity** | No third-party scripts or CDNs at runtime. The server recomputes FSRS schedules and XP from validated inputs. |
| **A09 Logging** | Security events (login failure, lockout, account deletion) logged without secrets or passwords via Workers logs. |
| **A10 SSRF** | The Worker makes no outbound requests. |
| **Privacy** | Username only — no email, no real name, no tracking or analytics. Data export and deletion built in. |

---

## 6. Design system

**Direction:** Polish folk paper-cutting (*wycinanki*) and Łowicz striped wool (*pasiak*), handled with modern
restraint. Clean, cool paper surfaces; saturated coloured "paper" only where it carries meaning.

**Palette**

| Token | Hex | Role |
|---|---|---|
| `bibuła` (tissue paper) | `#F4F6FB` | App background (light) |
| `atrament` (ink) | `#141C4F` | Text, dark surfaces |
| `kobalt` | `#2447D6` | Primary action, A1 |
| `szmaragd` (emerald) | `#0A8F63` | Correct, A2 |
| `malina` (raspberry) | `#D3245C` | Incorrect, B1 |
| `słonecznik` (sunflower) | `#FFB915` | Streak, XP |
| `pomarańcz` (orange) | `#FF6B2C` | Accent layer in the rosette only |

Dark mode swaps the paper for a night-ink `#0C1030` with `#161C45` surfaces.

**Type**

- **Poltawski Nowy** — a revival of *Antykwa Półtawskiego*, the typeface Adam Półtawski designed in the 1920s
  specifically for the shapes of Polish text and diacritics. Used for **every Polish word** in the app and for
  display headings. The Polish language is always set in a Polish typeface.
- **Lato** — designed by Polish type designer Łukasz Dziedzic; used for English UI text.

**Signature:** *Twoja wycinanka* — a generative, symmetrical papercut rosette (SVG). Each unit is a ring in its
level colour; each finished lesson cuts a petal into that ring. It lives on the home screen and animates the new
petal "unfolding" at the end of every lesson. Everything else stays calm: plain cards, generous spacing,
motion only on feedback.

**Interaction principles:** tactile tiles and keys (press states, subtle paper shadows), instant audio on tap,
feedback in a bottom sheet (emerald/raspberry), keyboard shortcuts on desktop (1–4 to choose, Enter to check),
`prefers-reduced-motion` respected, visible focus rings, 44px touch targets, WCAG AA contrast.

**Layout:** desktop — left rail navigation, content column, right column with rosette and daily goal. Mobile —
top status bar, single column, bottom tab bar. Lessons are full-screen focus mode on both.

---

## 7. Testing

- **Unit (Vitest):** FSRS (initial states, monotonic intervals, lapses), grader (diacritic hints, alternatives,
  punctuation/case tolerance), password hashing (round trip, wrong password, pepper, re-hash), validation
  schemas, exercise generator, content integrity (IDs, buildable tiles, NFC).
- **API integration (Vitest + `@cloudflare/vitest-pool-workers`, real D1 in Miniflare):** register/login/logout,
  session expiry, throttling/lockout, CSRF origin check, access-control isolation between two users, progress
  writes, reviews recomputed server-side, import once-only, export, deletion, security headers.
- **End-to-end (Playwright, Chromium):** guest completes a lesson; sign up imports progress; placement check;
  review session; mobile and desktop viewports; screenshots for visual review.

## 8. Delivery plan

1. Scaffold: Vite + React + TS, Worker + Hono, D1 migrations, wrangler config, test harnesses.
2. Shared core: FSRS, grader, schemas, XP.
3. Worker API with security controls + integration tests.
4. Content: units 1–18, frequency list, sounds, grammar reference, placement check + integrity tests.
5. Front end: design tokens, shell, home + rosette, course map, lesson player & exercises, review, words,
   sounds, grammar, profile/auth.
6. E2E tests + visual review at mobile and desktop sizes; accessibility pass.
7. README with setup and deployment (`wrangler d1 create`, `wrangler secret put PEPPER`, `npm run deploy`).

## 9. Later

Passkeys (WebAuthn) as a passwordless option; Turnstile on sign-up if bots appear; speech-recognition
pronunciation scoring (Chrome only today); B1/B2 units; reading texts with tap-to-translate; offline PWA.

---

## 10. Implementation status

Delivered in the first release:

- Everything in sections 2–7, including all 18 units, the 500-word frequency deck, sounds, grammar reference and
  placement check.
- Tests: 38 unit tests, 26 Worker integration tests against a real local D1, and 9 Playwright end-to-end tests
  (full lessons answered from the content, guest → account import, placement, review, mobile layout, CSP).

Deviations from the plan:

- PBKDF2 defaults to 30,000 iterations to fit the free plan's CPU budget (see section 5); raise to 100,000 on a paid plan.
- The placement check suggests a starting unit rather than pre-loading earlier units' words into the review deck;
  learners who skip ahead can still open any earlier lesson.
- `/api/auth/me` returns `{ "user": null }` for guests instead of a 401, since being a guest is a normal state.
