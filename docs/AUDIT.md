# Wycinanka — repository audit (September 2026)

A full sweep of the course content, the Worker and front-end code, security, UI/UX and possible next steps.
The goal I judged everything against: **someone who starts at zero and wants to hold a real conversation in Polish.**

How the audit was done: I read every course unit, the phrasebook, chunks, grammar reference, placement test,
culture notes (checking facts) and a sample of the frequency list. I read the whole Worker (auth, sessions, throttling,
progress, push, speech), the shared engine (FSRS, grader, schemas) and the main front-end flows. I ran
`npm run typecheck` and the unit and Worker tests (all 168 pass, typecheck clean, `npm audit` finds nothing). I also ran the
app locally and took screenshots on a phone-sized screen. I checked the grader's behaviour by running it directly.

## Status (follow-up work)

Everything in the ranked list except item 10 (account recovery) has since been implemented:

| # | What was done |
|---|---|
| 1 | The grader compares answers word by word. A changed ending is a grammar mistake (verdict `form`, never passed); a real form typed without its Polish letters (*mama* for *mamą*, *pracuje* for *pracuję*) is too. Real typos are still forgiven, using a list of every Polish form in the course (`src/content/lexicon.ts`). Feedback names the ending and, where a drill teaches it, the rule. |
| 2 | Guest progress is saved on the device (`src/app/lib/saved.ts`) and imported on sign-up however old it is, as long as each entry's day matches its time. Results a signed-in learner can't send wait in an outbox and go when the connection is back. Lesson results carry a key so a re-send is counted once (migration `0003_sync.sql`), and may arrive up to a week late. |
| 3, 5 | Twelve new units, 36 lessons (`src/content/units/everyday.ts`, `grammar-plus.ts`): small talk and friends, family and describing people, weather, seasons and time between the hours, free time and invitations, commands, health, comparing, should/must/can, plurals and numbers for people, *który*, *swój* and reported speech, prefixed verbs of motion and the airport, work, the phone and renting. Each sits where its grammar has been met; units keep their ids, and "Unit n" is now a unit's place in the course. |
| 4 | Every lesson after the alphabet has a dialogue. Lessons end with the conversation heard at natural speed with no text, one or two questions answered from the sound alone, the dialogue read along, then the learner choosing their own replies. (Choosing replies is fixed-path: dialogues don't branch into different conversations yet.) |
| 6 | GitHub Actions CI (typecheck, unit, Worker and end-to-end tests) and Dependabot. |
| 7 | Sentence and drill ids come from their text; existing ones keep their numbers (`src/content/legacy-ids.ts`). `test/unit/card-ids.json` records every id and a test fails if one disappears or moves. |
| 8 | C1–C10 fixed. |
| 9 | S1–S6 fixed: failed sign-ins lock only the network they come from (with a high all-network limit); IPv6 is throttled per /64; speech has a daily budget with half kept for signed-in learners and a per-learner limit; username checks via sign-up are limited; push subscriptions can't be moved without their keys; a missing pepper logs an error. S7 (the VAPID key in D1) is accepted: moving it would break every existing subscription. |
| 11 | The service worker caches recordings whole and answers byte-range requests from them, and keeps each cache to a size. |
| 12 | Grammar-aware feedback; guest wording; the Learn page folds finished and far-off units and opens at the current one, with words and a time estimate per lesson; leaving a lesson or review keeps the review answers already given; hint respellings match the automatic ones (tested); a note says whose gendered forms a lesson shows; Alt/Option + letter types Polish letters; the words of a Polish answer can be tapped to hear them. |

---

## Top improvements, ranked by how much they improve the app

| # | Improvement | Why it matters | Effort |
|---|---|---|---|
| 1 | **Stop the grader accepting wrong case and verb endings as "typos"** | The typo allowance hides exactly the grammar mistakes the course is trying to teach (details in T1). Every grammar lesson depends on this. | S |
| 2 | **Save guest progress and failed syncs on the device** | Guests lose everything when they refresh or the phone closes the tab. A signed-in learner who finishes a lesson offline loses it on reload. This is the biggest reason a learner might quit. | M |
| 3 | **Fill the grammar gaps that block conversation**: the imperative, comparatives, *powinienem / trzeba / można*, noun plurals (including *Polacy, studenci*), *który*, *swój*, and numbers with groups of men (*dwóch / pięciu*) | These come up in almost every real conversation. None of them is taught at the moment, and "B1" is only 6 lessons long (A1 has 36, A2 has 18). | L |
| 4 | **Much more conversation: dialogues in every lesson, natural-speed listening, and role-plays that branch** | Only 11 of the 60 lessons have a dialogue (50 lines in total), although PLAN.md says every lesson has one. Learners practise words and sentences but hardly ever an exchange. | L |
| 5 | **Add the everyday topics that are missing**: *co u ciebie / jak leci*, weather, health and the doctor, hobbies, describing people, home and renting, work small talk, grandparents and parents, half past and quarter to | These are the first things people talk about. At the moment most exist only as a single entry in the frequency list. | M–L |
| 6 | **Run the tests on every pull request (CI)** | There is no `.github/`. Every push to `main` deploys straight to production and nothing runs the 168 tests first. | S |
| 7 | **Give sentence and drill IDs stable keys** | Sentence and drill IDs are their position in the lesson (`:s1`, `:d2`). Inserting or reordering one silently moves learners' review history onto a different card. The README says the opposite. | S |
| 8 | **Fix the content errors and misleading entries** (C1–C10) | Small fixes, but a learner trusts every line of a course. | S |
| 9 | **Harden sign-in and speech against abuse**: account-lockout attack, IPv6 rotation, the open speech endpoint | Anyone can lock any known username out; one determined person can use up the shared Whisper allowance for a whole day. | S–M |
| 10 | **A way back into an account** (recovery codes) | Accounts have no email by design, so a forgotten password means losing all progress. | S–M |
| 11 | **Service worker: prune the cache and make recordings actually cache** | The cache never shrinks. Audio is fetched with Range requests (206 responses), which the Cache API rejects, so offline audio probably never gets stored (needs checking on a device). | S |
| 12 | **UI polish**: feedback that names the grammar point, a shorter Learn page, "resume lesson", matching respellings | See the UI/UX section. | S–M |

S = up to a day, M = a few days, L = a week or more of content writing.

---

## 1. Course content

### 1a. Inaccuracies and misleading entries

| ID | Where | Problem | Fix |
|---|---|---|---|
| C1 | `units/phonics.ts:183` | The example words for **trz** include *wiatr*, which has no *trz* (it ends in *-tr*). | Replace it with *trzeba*, which is also a useful word. |
| C2 | `units/a1-part1.ts:74` | "At the **end** of a word, voiced consonants lose their voice: … *żabka* like *zhapka*." In *żabka* the *b* is in the middle of the word; it becomes *p* because *k* follows (assimilation), not because it is last. | Keep *chleb* for final devoicing. Give *żabka* / *wódka* its own sentence: "…and before p, t, k, s, sz". |
| C3 | `units/a1-part1.ts:495` (`moja przyjaciółka`) | `altEn` includes **"my girlfriend"**. *Przyjaciółka* is a close female friend; a girlfriend is *dziewczyna*. This teaches a mistake that causes real awkwardness. | Remove it. Add a note: *przyjaciel/przyjaciółka* = close friend, *kolega/koleżanka* or *znajomy/znajoma* = friend or acquaintance, *chłopak/dziewczyna* = boyfriend/girlfriend. |
| C4 | `units/a1-part1.ts` u04-l1 spotlight | "consonant → masculine… right about 95% of the time", with no mention of the large group of feminine nouns ending in a consonant: *noc* (taught as feminine in u01), *rzecz, twarz, miłość, wieś, sól, jesień* and every noun in **-ść**. | Add a line: "Nouns in **-ść** and a few others (*noc, rzecz, twarz*) are feminine." Add one drill (*ta noc*). |
| C5 | `units/a1-part1.ts:378` | *Przepraszam, proszę.* → "Excuse me, please." Nobody says this in Polish. | Use *Przepraszam, czy mogę?* ("Excuse me, may I?") or *Przepraszam pana/panią…* |
| C6 | u01-l3 sentence vs later lessons | *Cześć, Kasia!* uses the nominative, but the course elsewhere uses the vocative (*pani Anno, mamo, Kasiu*, and a drill with *Kasiu*). Either form is heard casually, but the inconsistency confuses. | Make it *Cześć, Kasiu!* and add one line about the vocative for names (*Kasiu, Tomku, Aniu*), which learners will hear constantly. |
| C7 | u06-l1 spotlight | "only feminine nouns visibly change" in the accusative. Two units later that stops being true (*brata, psa, kota*). | Say "for things, only feminine nouns change; people and animals come in Unit 8". |
| C8 | Respellings | The same word is respelt differently in different places: *ręka* "REN-ka" (u01-l3) against "RENG-ka" (phonics); *poproszę* "po-PRO-she" (automatic) against "po-PRO-sheh" (hint), as the lesson screenshot shows. *są* → "sown" suggests the British "oh" glide the course warns against. | Take hint respellings from `respell()` rather than typing them by hand, or add a test that the two agree. Use "sõ(w)" / "like French *son*" for *są*. |
| C9 | u17-l2 | *gdybym był tobą* is taught as the main way to say "if I were you". It is a calque from English; *na twoim miejscu* is the natural form. | Keep it but mark it "(heard, but *na twoim miejscu* is more natural)", or drop it. |
| C10 | u10-l2 `godzina` | `altEn` includes "o'clock", so "o'clock" → *godzina* would be accepted in reverse. The "time" gloss clashes with *czas*. | Keep "hour" only. |

The rest of the content is accurate: the declension tables, pronoun table, numeral–noun agreement, aspect pairs, and the history (966, 1025, 1569, the partitions, 1944, 1980–89) all check out. The phonics unit is unusually good for English speakers.

### 1b. What's missing for someone becoming conversational

**Grammar never taught (only met by accident):**

- **The imperative.** *Zamknij okno*, *Daj to bratu*, *Poczekaj*, *Chodź* all appear in sentences and drills, but no lesson explains how to form commands, including the polite *proszę + infinitive* versus *niech pan…*. Needed for directions, cooking, the doctor and friends.
- **Comparatives and superlatives** (*lepszy, większy, najlepszy, bardziej*). They appear only in the frequency list. You can't state a preference or compare two things without them.
- **Should, have to, it's possible:** *powinienem / powinnam*, *trzeba*, *można*, *warto*, *nie wolno*. They are among the most common structures in speech, and the course has none of them.
- **Noun plurals** as a topic, including the plural for groups of men (*Polacy, studenci, nauczyciele*) and the matching adjectives (*nowi*). Only a few set phrases are covered (*koty, kawy*).
- **Relative clauses with *który*** ("the man who…", "the book that…"). Without them you can't build a longer sentence.
- ***Swój*** (one's own). Learners will say *Kocham moją żonę* for *swoją*; it's a classic error.
- **Numbers with groups of men** (*dwóch/dwaj mężczyzn*, *pięciu studentów*) and collective numerals, used as soon as you talk about people.
- **The vocative** exists only in the grammar reference. You need it for every name you use.
- **Prepositions with two cases** (*w/na* + accusative for motion against locative for place are covered; *przed/za/nad/pod* + instrumental against accusative are not).
- **Verbs of motion with prefixes** (*przyjść, wyjść, wejść, dojechać, wrócić*). A few appear as vocabulary items, but the system isn't taught, and it is central to talking about your day.

**Topics missing or only in the 500-word list:**

- Small-talk openers people actually use: *Co u ciebie?*, *Jak leci?*, *Co nowego?*, *Jak minął dzień?* (u02-l3 teaches only the textbook *Jak się masz?*).
- Weather (*pada, jest ciepło, jest upał*) and seasons.
- Health: *boli mnie…*, body parts, at the doctor, at the chemist, symptoms. Only one chunk and one phrasebook line exist.
- Hobbies and free time (*interesuję się…, gram w…, lubię + infinitive*).
- Describing people: appearance and character.
- Family beyond the nuclear family: *rodzice, dziadek, babcia, wujek, kuzyn*.
- Home: rooms, renting, repairs, neighbours.
- Work small talk and the phone: *Halo?, dzwonię w sprawie…, oddzwonię*.
- Telling the time beyond the hour: *wpół do, kwadrans po, za pięć*.
- Contactless and app payments, which are how Poles pay: *zbliżeniowo, BLIK*, "Czy potrzebuje pan torby?". Also *woda niegazowana*, *płacimy osobno/razem*.
- Conversation strategies: *Możesz powtórzyć?, Co masz na myśli?, Chodzi mi o to, że…, No właśnie, Wiesz co…* (fillers and repairs). A few exist as chunks; they deserve a unit.

**Scale.** The course teaches 470 lesson items, 207 sentences and 500 frequency words. Conversational B1 usually needs 2,000–2,500 active words. The frequency list helps with recognition, but most of its words are never practised in sentences. Only 6 lessons are labelled B1, and they cover the conditional and quantities. A learner who finishes will be a solid A2 with a few B1 structures. The README's "A0–B1" should either say that, or the B1 part should grow (see item 3).

### 1c. Pedagogy

- **Too little listening at normal speed.** Recordings are clear single sentences read slowly. Add short monologues and dialogues (30–60 s) at natural speed, with comprehension questions.
- **Speaking goes only one way.** Speaking exercises repeat or translate a fixed sentence; nothing asks the learner to answer a question in their own words. See feature F1.
- **Placement is easy to guess.** It has 18 multiple-choice questions with 3–4 options and 3 questions per band, so guessing passes a band about a quarter of the time. p18 repeats a point from band 1. Add typed answers and a second question per grammar point.

---

## 2. Technical problems

### Correctness

**T1 — The grader passes grammar mistakes as typos** (`src/shared/grade.ts:111-122`). One edit is forgiven in answers of 6 or more characters, measured over the whole sentence with Polish letters stripped. Checked by running the grader directly:

| Typed | Expected | Verdict |
|---|---|---|
| `Poproszę kawa` | `Poproszę kawę` | **typo, counts as a pass** (the whole point of u06-l1) |
| `Mam koty` | `Mam kota` | **typo, counts as a pass** |
| `Idę do pracę` | `Idę do pracy` | **typo, counts as a pass** |
| `Rozmawiałam z mama` | `…z mamą` | "missing Polish letters" (it's a wrong case) |
| `pracuje` | `pracuję` | "missing Polish letters" (it's the wrong person, which u07-l2 calls "vital") |

Fix: never forgive an edit in the last two letters of a word, or when the typed word is another form of a word the course teaches. Say "wrong ending" rather than "check the spelling". When stripping accents turns the answer into a *different* real form (*mama/mamą*, *pracuje/pracuję*), say so ("that's *with Mum* in the wrong case") instead of calling it a missing accent. Add these five cases to `test/unit/grade.test.ts`.

**T2 — Guest progress is kept only in memory** (`src/app/lib/store.ts:19-20`). A refresh, a crash, or iOS closing a background tab wipes the guest's lessons, and the Home page says "progress is not saved". Save `guestLog` and `progress` to IndexedDB or localStorage. The import endpoint's two-day window (`routes/progress.ts:93`) would then need widening, or it can stay and simply check order and plausibility, since imports only ever go into an empty account.

**T3 — Failed saves aren't retried** (`store.ts:136-170`). "It's kept on this device until you reload". The app is an installable PWA that opens offline, but lessons done offline are lost. Keep a small outbox in IndexedDB and send it on `online`/`visibilitychange`. The server already makes a re-sent batch harmless (`applyReviews` ignores older ratings); lesson posts would need an idempotency key.

**T4 — Content IDs depend on position** (`src/content/build.ts:44-51`). `s${i+1}` and `d${i+1}` mean that editing a lesson's sentence list reassigns everyone's FSRS history. Use `key ?? slug(pl)` as items do, keep the current IDs through a one-off `key` for existing entries, and add a snapshot test of all card IDs so any change fails CI on purpose.

**T5 — Service worker** (`public/sw.js`):
- `CACHE = 'wycinanka-v1'` never changes and nothing is evicted, so old hashed `/assets/*` pile up forever, along with every recording played (the 2,260 files total 18 MB).
- `<audio>` fetches use `Range` and get `206 Partial Content`. `cache.put` rejects partial responses, so the "plays from the cache, offline too" promise likely fails without any error, since the rejection isn't handled. Fix: for `/voice/*`, fetch the URL without the Range header and cache the full 200 response, then serve ranges from it (or play recordings through `fetch` → blob). Prune assets on `activate` using the current asset list.

**T6 — Reminders don't scale and aren't fair** (`src/worker/reminders.ts`). Every hour the Worker reads every push subscription and every user's settings, then filters in JavaScript. Beyond 40 due learners it silently drops the rest, and always the same ones, because the order is fixed. A `failed` send also sets `last_sent_day`, so it is never retried. Store `reminder_utc_hour` in an indexed column, order by `last_sent_day` so different people miss out each time, and consider Cloudflare Queues.

**T7 — No CI.** Add `.github/workflows/ci.yml` to run `npm ci && npm run typecheck && npm test` (and Playwright on a schedule), plus Dependabot or Renovate. Both fit the free tier.

**T8 — Minor.** `bodyLimit` reads a whole chunked body before checking it (Workers caps bodies at 100 MB). Deleting an account leaves its `login:user:` throttle row behind. Snapshot `activity` stops at 400 days, which is harmless now.

### Security

The code is careful overall: prepared statements everywhere, strict Zod schemas, `__Host-` HttpOnly cookies storing only a hashed session token, an Origin check plus JSON-only bodies against CSRF, a tight CSP, an allow-list for push endpoints against SSRF, timing-equal logins, and sign-out everywhere on a password change. What remains:

| ID | Severity | Issue | Fix |
|---|---|---|---|
| S1 | Medium | **Lockout attack.** `loginUser` locks a username after 8 failures in 15 minutes, from any IP (`routes/auth.ts:62-65`). Anyone who knows a username (they are public-ish and shown on screen) can keep that person locked out indefinitely. | Lock on (username, IP) or (username, /64) instead, or replace the hard lock with growing delays. Let a correct password from a device with a recent session through. |
| S2 | Medium | **Speech transcription is open to anyone** (`routes/speech.ts`), limited only to 180 requests an hour per IP. The Workers AI allowance is shared by everyone, and the Origin check doesn't stop scripts. A handful of IPs can use up a day's Whisper allowance for everyone. | Require a session, or a short-lived signed guest token issued with the page. Add a global daily budget counter and return 503 before the allowance runs out. |
| S3 | Low–Medium | **IPv6 rotation.** `clientIp` uses the full address, so on IPv6 every limit keyed by IP (register, login, speech) can be dodged by rotating inside one /64. | Key IPv6 by /64. |
| S4 | Low–Medium | **Weak password hashing if the pepper isn't set.** `PEPPER` is optional and PBKDF2 runs at 30,000 iterations (OWASP recommends 600,000). If production never got the secret, a leaked database can be cracked at speed. | Check the secret is set in production. Log or alert when it isn't, e.g. an `/api/health` flag or a startup `console.error` in production. Raise iterations when the plan allows. |
| S5 | Low | **Usernames can be checked without limit.** `/register` checks whether a username exists *before* counting the attempt. | Count the attempt first (a lower limit is fine). |
| S6 | Low | **Push subscriptions can be taken over.** `/push/subscribe` with `ON CONFLICT(endpoint)` moves an endpoint to whichever user sends it. Endpoints are secret, so the risk is small. | Only update rows where `user_id` matches, otherwise refuse. |
| S7 | Low | **The VAPID private key is kept in plain text in D1.** | Move it to a Worker secret, or accept the risk and write it down. |
| S8 | Info | **Scores come from the client.** Lesson score, XP and review ratings are all trusted as sent. That's fine now, but it must change before any leaderboard or shared feature. | — |
| S9 | Info | **No account recovery, and no list of active sessions.** | Recovery codes shown once at sign-up; a "signed-in devices" list with a revoke button. |

---

## 3. UI/UX

From the screenshots and the code:

1. **Feedback should name the grammar, not "spelling".** After T1, show "Wrong ending: after *poproszę* use the accusative → *kawę*". The rule data is already there in each drill's `why` and the spotlights.
2. **The guest warning scares people off.** "guest — progress is not saved" on Home, straight after the welcome, is off-putting. Once T2 is done, change it to "saved on this device — create an account to keep it everywhere".
3. **The Learn page is one 11,000-pixel scroll** on a phone, listing all 60 lessons. Collapse finished units, open at the current unit, and add a sticky "continue" button.
4. **Leaving a lesson throws it all away** ("Your progress in this lesson will be lost"). Save partial results; at least count the reviews already answered.
5. **Respellings disagree** between the automatic chip and the hint (C8), and learners notice.
6. **Say what's coming.** Show a count of new words and a time estimate on the lesson start screen. The in-lesson progress bar has about 40 ticks and is hard to read.
7. **Diacritic entry.** Make sure the Polish-letter bar is on every typed answer and shows long-press hints (hold *a* → *ą*) for people using a physical keyboard.
8. **Show the gender of the forms you pick.** In settings, *speaker m/f* already sets which forms appear. Show a small "(you're answering as a woman)" chip in exercises, so a male learner who sees *byłam* understands why.
9. **Clickable words everywhere.** Culture articles let you tap any Polish word to hear it; lesson sentences should too, with a gloss and a link to the verb table.
10. **Accessibility:** `aria-live` and `lang="pl"` are used well. Also check colour contrast of the muted text on paper in dark mode, and that the matching game can be used with the keyboard alone.

---

## 4. Future modules and features

Ranked by how much they help someone become conversational.

| # | Idea | Notes |
|---|---|---|
| F1 | **Conversation partner (role-play with AI)**: scenarios such as ordering, the landlord, meeting the in-laws, and the doctor, with a model that stays within the learner's level, then a corrected summary | Workers AI offers text models on the same free allowance. Pair it with Whisper, which is already in place, for voice. Limit it per user. This is the missing piece between drills and real conversation. |
| F2 | **Stories to listen to**: short stories at A1–B1 at natural speed with tappable transcripts, then questions | Uses the existing Piper pipeline. Plenty of input you can understand, which the course currently lacks. |
| F3 | **Endings trainer**: pick a noun and a case, or a verb, person and tense, and produce the form | Uses `DECLENSIONS`. Targets the biggest source of mistakes. |
| F4 | **"Survival conversation" unit**: fillers, asking someone to repeat, changing the subject, polite disagreement | Cheap to write, high value. |
| F5 | **Themed units**: health, weather, home, work, hobbies, family, feelings, the phone | See §1b. |
| F6 | **B1 expansion**: the imperative, comparatives, *powinien/trzeba/można*, *który*, prefixed motion verbs, reported speech (*powiedział, że…*), impersonal *się* (*tu się nie pali*) | Would make "B1" true. |
| F7 | **Words you've learnt in real contexts**: search subtitles or example sentences (Tatoeba, CC BY) for each learnt word | Recognition practice, with a dictionary search across all course content. |
| F8 | **Pronunciation feedback** on single sounds (*ś/sz/s*) using the existing recogniser plus minimal pairs | Extends the Sounds section. |
| F9 | **Streak freeze, weekly summary, study-buddy link** | Helps people keep going without hearts or penalties. |
| F10 | **Teacher or tutor sharing**: export a learner's trouble spots as a link | For learners with a tutor or a Polish partner. |

---

## 5. What's already good (keep it)

- Pronunciation is taught first, with respellings everywhere; excellent for English speakers.
- FSRS reviews with grammar drills as cards; warm-ups and revision weighted towards mistakes.
- It accepts more than one right answer (synonyms, forms for either gender) and is honest about accents.
- Lexical chunks with word-for-word glosses.
- The security basics (see §2); privacy-first design, data export and account deletion.
- Culture notes are accurate, well sourced and credited.
- Typecheck is clean, and the 168 tests cover the grader, FSRS, content integrity, the migrations and the API.
