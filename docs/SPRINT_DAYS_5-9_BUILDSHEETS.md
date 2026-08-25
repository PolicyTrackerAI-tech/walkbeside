# SPRINT DAYS 5–9 — EXECUTION BUILDSHEETS (FINAL) · RENAME ON HOLD

> **⚠️ STALE — superseded (bannered 2026-08-25, audit A9).** All five days have shipped (Day 5 #170, Day 6 #171, Day 7 #172, Day 8 billing #182; Day 9's QA/docs-truth scope was absorbed by the August 11-day site audit — see the LEDGER), so "Days 5–8 have not run … run strictly in order" is false today; and the rename below is not "on hold" but dead — the 2026-08-18 naming decision fixed the brand as "Honest Funeral Co." permanently ("Open Farewell" will never happen). Kept for history; do not execute from this document.

> **⛔ RENAME ON HOLD (founder decision 2026-07-27).** The founder does not like the
> "Open Farewell" name and is waiting. Every rename-related item in this file is
> **inert until the founder re-decides**: Day-8 founder action C (DNS pre-staging) —
> skip; Day-9 rename-clearance checklist + Rename-Day PR prep (old Tasks 5–6, Lane C)
> — skip; the §RENAME DAY section — do not execute, do not schedule. The
> `lib/brand.ts` BRAND-constant rule **stays law** (it is name-agnostic; it is what
> makes whatever name is eventually chosen a one-file flip). The openfarewell domain
> stack/socials stay purchased (sunk; renew 2027-07-15). The §RENAME DAY mechanics
> below are kept as reference for a future rename under whatever name wins.

**What this file is.** The execution spec for the remaining sprint days — Day 5 (delivery),
Day 6 (hospice pages + claim), Day 7 (ISR city pages + citable index), Day 8 (Migration B +
institutional billing), Day 9 (QA + docs truth), and (ON HOLD) Rename Day. This
document **supersedes those day sections of `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md`**
(which stays in the repo for history — never execute from it for these days). Every repo fact
in this file was verified against `origin/main @ b19983a` on **2026-07-26**, then corrected by
an adversarial verifier pass; where a day says "re-verify" or "locate by grep," do that —
line anchors drift as prior days merge.

**Executor contract (every day):**
- Each day = ONE fresh Opus 5 session in a fresh worktree off **current** `origin/main`
  (`git fetch` first). Days 5, 6 run **ultracode**; Day 7 runs **standard model** (its sheet
  says so — do not burn ultracode there); Days 8 and 9 run as their sheets state
  (Rename Day: ON HOLD, do not schedule).
- Copy `/Users/ryancurrie/FH/.env.local` into the worktree (worktrees don't inherit it), then
  `npm install`.
- Fan-outs FIRST (design/copy proposals → judge → adversarial channel-survival/word-ban review),
  mechanical wiring after, **adversarial multi-lens diff review before the day gate** — this
  caught real bugs on every one of Days 1–4; it is never optional.
- One PR per day; **no merge without founder go.** Kill switches (`OUTREACH_LIVE`,
  `OUTREACH_NOTIFICATIONS_ENABLED`, `PARTNER_DIGEST_ENABLED`, `BILLING_LIVE`) stay off/unset in
  production all sprint.
- Each day section ends with its kickoff prompt — paste it verbatim to open the session.

## ⚠ CALENDAR NOTE (read before scheduling anything)

The original calendar dates (Jul 21–27) in the source specs are **stale** — Day 4 merged
2026-07-23 and Days 5–8 have not run as of this file's assembly (2026-07-26). Days are
**ordinal now**: run strictly in order **Day 5 → Day 6 → Day 7 → Day 8 → Day 9**,
one session per day, at whatever real-world pace the founder sets.

~~Two date-coupled exceptions~~ **Removed 2026-07-27 — the rename is ON HOLD** (see the
banner at the top of this file). The former exceptions here were (1) Rename Day's
clearance gate/target date and (2) the Day-8 DNS pre-staging urgency; both are inert
until the founder picks a name they like. Nothing in Days 8–9 is time-coupled anymore.

---

## DAY 5 — Delivery day: the hand-off, both directions 🔥 ULTRACODE

**Source lineage:** successor to `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md` §DAY 5-REPLAN,
which drifted from the repo — this section supersedes it entirely.

**Objective:** the delivery path is real and proven end-to-end — a hospice that says yes can put the tool in a family's hands the same day, and the family's first screen from that hand-off is calm, free, and legible on a phone. Every surface exists but has processed **zero real cases**: this day is **polish + proof, not greenfield**. Channel-survival is law throughout (CLAUDE.md): *family-initiated activation only · delivered post-admission only · the hospice transmits nothing · navigation and education, never "arranging."* No migration today. `OUTREACH_LIVE` / `PARTNER_DIGEST_ENABLED` / `BILLING_LIVE` stay off.

### ⚠️ Repo-verified reality corrections (the old §DAY 5-REPLAN spec drifted — trust THIS section)

Verified at `origin/main @ b19983a`:

1. **The family arrival screen is `/plan-now?ref=CODE`, NOT `/partner/[code]`.** Every referral URL the product mints points there: `app/portal/materials/page.tsx:39` and `components/partner/LinksClient.tsx` both build `${PUBLIC.appUrl}/plan-now?ref=${code}`. `app/partner/[code]/page.tsx` is the **public, unauthenticated SAMPLE sales report** (ProofSheet, `live={false}`) with a load-bearing import rule in its header comment: it may import only `fallbackOutcomesDigest`, never `buildOutcomesDigest` or anything from `lib/claude`. **NEVER convert it into a family surface and never touch its imports.** Task 4 (family side) targets `app/plan-now/page.tsx` + `app/plan-now/PlanNow.tsx` + `components/ReferralCoBrand.tsx`.
2. **`/portal` already has a first-run state** (`app/portal/page.tsx:44`) — but only for `familiesHelped === 0 && codeCount === 0`. The gap is the middle state: codes exist, zero activity.
3. **`/portal/materials` already has** the print one-pager (PrintHeader letterhead, QR via the `qrcode` package, NeutralityPledge box, per-code QR posters), a spoken hand-off script, and a family-email paragraph — all via `CopySnippet`. Gaps: the "what your families see" preview link, the internal team email snippet, the free-with-or-without-link line, and print analytics.
4. **The digest cron** (`app/api/cron/partner-digest/route.ts`) sends the deterministic `buildPartnerDigest` (`lib/partner-digest.ts:36`) only — the AI paragraph (`buildOutcomesDigest`, `lib/partner-report-digest.ts:69`, deterministic fallback + n-suppression built in) is not wired in, and there is no admin dry-run. The route also hardcodes `https://honestfuneral.co` in `reportUrl` (line 119) — a Rename-Day landmine you fix while touching the file.
5. **`ToolEvent`** lives at `lib/analytics.ts:8` and already carries the four Day-4 loop events. The pageview sanitizer already strips all query strings (so `?ref=` never reaches analytics).
6. **`scripts/seed-demo.mjs`** seeds "Demo Hospice" + "Demo Employer" partner orgs with portal seats (`demo-hospice-owner@honestfuneral.co` etc., password = `DEMO_PASSWORD`), referral codes, and an n>5 closed-case cohort — exactly what the gate's dry run needs. It is idempotent and refuses to touch any partners row not carrying its demo marker.

### Preconditions

- **This buildsheet must be ON `origin/main` before kickoff:** merge the Days 5–9 docs PR first (the file `docs/SPRINT_DAYS_5-9_BUILDSHEETS.md` does not exist at `b19983a`). If the fresh worktree lacks it, stop and merge the docs PR — do NOT substitute the old §DAY 5-REPLAN in `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md`, which targets the wrong arrival surface.
- Fresh worktree off **current** `origin/main` (`git fetch` first); copy `/Users/ryancurrie/FH/.env.local` in (worktrees don't inherit it) and `npm install`. Branch e.g. `claude/day-5-delivery-<suffix>`.
- Days 1–4 merged — sanity check: `lib/copy.ts` exports `FREE_FOR_EVERY_FAMILY`; `components/HospiceFinder.tsx` exists.
- **Founder action that must precede the manual gate** (not the coding): demo partner orgs seeded — see Founder actions below.
- No founder-applied migration today; none is written today.

### Ultracode orchestration (run FIRST — bank the intelligence before wiring)

1. **Scout (single agent, ~15 min):** read all five surfaces (`app/portal/page.tsx`, `app/portal/materials/page.tsx` + `CopySnippet.tsx`, `app/portal/links/page.tsx` + `components/partner/LinksClient.tsx`, `app/plan-now/*`, `app/partner/r/[token]/*`) plus `components/ReferralCoBrand.tsx`, `components/partner/NeutralityPledge.tsx`, `lib/partner-digest.ts`, `lib/partner-report-digest.ts`, `app/api/cron/partner-digest/route.ts`, `lib/analytics.ts`, `lib/admin-auth.ts`. Confirm this sheet's reality corrections still hold; correct silently to current main if anything moved.
2. **Copy fan-out (2–3 independent proposals each, in parallel):** (a) the internal link-kit team email (hospice + employer variants); (b) placement/integration of the family free-forever sentence in `ReferralCoBrand` (see Task 4 constraints); (c) the one-pager free-line placement + coordinator script check; (d) the digest email with the AI paragraph inserted. Then a **judge** pass picks winners.
3. **Adversarial channel-survival + word-ban review** of the winning copy BEFORE any wiring: family-initiated-only, post-admission-only, hospice-transmits-nothing, navigation-never-arranging, word-ban (`featured|recommended|sponsor` = 0 on these surfaces; employer copy never says Medicare/CAHPS/CMS; NEVER pitch CAHPS), **no present-tense adoption claims** about any partner ("can offer", never "offers") — this killed two Day-4 blockers; treat as law.
4. Mechanical wiring (Tasks 2–7), then an **adversarial multi-lens diff review before the gate** — lenses: correctness, auth/security (the dry-run gate especially), channel-survival, copy-law verbatimness, print CSS, analytics privacy, brand-constant usage. This caught real bugs on every one of Days 1–4; do not skip.

### Tasks

**1. Copy constants (`lib/copy.ts`).** Add a SECOND exported constant:
```ts
export const FREE_WITH_OR_WITHOUT_LINK =
  "Everything here is free for you — with or without this link.";
```
The sentence is **VERBATIM LAW** (em-dash, exact words). It is a DIFFERENT string from `FREE_FOR_EVERY_FAMILY` (the homepage/finder GATE sentence, rendered at `app/page.tsx:108` and `components/HospiceFinder.tsx:109`) — **never conflate, replace, or "harmonize" the two.** Both stay exported; new surfaces import, never retype. Add a doc comment naming its render sites (Task 2 one-pager, Task 4 arrival banner).

**2. Hospice-side: finish the handoff kit (`app/portal/materials/page.tsx`).** Gap-fill only — do not rebuild what renders today:
   (a) **One-pager free line:** render `{FREE_WITH_OR_WITHOUT_LINK}` on the print one-pager (family-facing — it is handed to the family), near the QR/link block, inside the existing `print-keep-together` conventions.
   (b) **Coordinator framing line (screen-only intro):** the phrase **"free to every family you serve, with or without this link"** appears verbatim in the coordinator-facing intro copy (this is the coordinator-voice twin of the family sentence — inline copy, not a constant swap).
   (c) **Link kit — internal team email:** a new `CopySnippet` titled "Email to your team (internal)" with a subject line + body the coordinator pastes to their OWN colleagues (social workers / front desk; employer variant: HR/benefits team via the existing `isEmployer` branch). Body must carry the delivery rules in plain words: hand it to families **after admission**; the **family activates it themselves**; staff never enter anything about a family and we never contact a family who didn't come to us first. Include the referral link + a pointer to the printed one-pager. **This is a CopySnippet, NOT a `mailto:` — grep-enforceable invariant: no family-recipient mailto on any portal surface** (the only pre-existing mailto is `app/portal/paused/page.tsx` → ryan@, internal; leave it).
   (d) **"What your families see" preview:** screen-only (`print:hidden`) link `→ urlFor(activeCodes[0].code)` opened in a new tab (`target="_blank" rel="noopener"`), labeled so a coordinator understands it shows the family's exact arrival screen. Gate it behind `activeCodes.length > 0` like the snippets.
   (e) Verify the existing spoken hand-off script still passes the channel-survival review (it already carries "After admission…" framing); adjust wording only if the adversarial pass flags it.
   *Traps:* this is a server component — interactive additions live in client children (`CopySnippet`, `PrintButton`). Turbopack JSX trap: explicit `{" "}` after every inline `{expr}` mid-sentence, and verify the **rendered DOM**, not source. Never edit `NeutralityPledge` wording — it's the single reviewed constant, rendered never edited.

**3. Hospice-side: portal first-run middle state (`app/portal/page.tsx`).** Today: both-zero → 3-step checklist; anything else → ProofSheet. Add the middle state — `stats.familiesHelped === 0 && codeCount > 0` → the ProofSheet renders as today but **led** by a "Start here: share the tools" card (inject via the existing `portalNav` slot, which is already a `space-y-4` stack) linking to `/portal/materials`, with the 3-step hand-off: approve → print/share the materials → families activate themselves. No new tables, no client JS — presence of activity decides which card leads. *Trap:* don't disturb the existing both-zero checklist or the live-report path; the card disappears the moment `familiesHelped > 0`.

**4. Family-side: the arrival screen (`app/plan-now/page.tsx`, `app/plan-now/PlanNow.tsx`, `components/ReferralCoBrand.tsx`).** This is the family's first impression from a hospice hand-off; phone-first pass at 375px:
   - **The verbatim sentence:** `FREE_WITH_OR_WITHOUT_LINK` renders whenever a referral is present. Vehicle: `ReferralCoBrand`'s sub-line (the component already carries the Day-4 type-neutral line "It's free for everyone they serve, link or no link — the link never unlocks anything."). **Reuse the component — never fork it or add a parallel banner.** The copy fan-out decides the integration (replace the Day-4 sentence with the constant, optionally keeping "the link never unlocks anything" as a trailing clause) under two hard constraints: the constant appears verbatim, and exactly ONE free-promise line renders (never two stacked near-duplicates). **Scope: exactly one free-promise line PER banner.** Known pre-existing edge — a slug-style `?ref` in the URL plus a remembered HF-code on-device renders BOTH the cosmetic PlanNow banner and ReferralCoBrand (it falls back to `readReferral()`); that co-render is out of scope today — do not build cross-component dedup on the arrival path. Note this changes the banner on `/analyzer` and the negotiate wizard too — that's correct and consistent.
   - Also append the constant (with the `{" "}` trap in mind) to `PlanNow.tsx`'s cosmetic `partner` banner (~line 160), which shows for slug-style `?ref=` values where `ReferralCoBrand` returns null.
   - **Phone pass:** co-brand banner + pledge legible at 375px; ONE primary action above the fold (the step-1 path cards — don't add competing CTAs); zero data asked before value (already true: step 1 asks a leaning, zip arrives step 2 — keep it that way).
   - **Verify, don't rebuild:** `RememberReferral` (root layout) writes the 30-day on-device memory; a real `HF-XXXXXX` code resolves via `/api/partner/resolve`; attribution stays reporting-only — `lib/negotiation/directory.ts` must contain zero reads of `partner_id`/`partner_code` (grep in the gate).
   - *Tripwires:* NEVER add a server write, account gate, or any data request to the arrival path. Nothing ever flows back to the hospice. The identical free product must render with no `?ref` at all.

**5. The monthly delivery TO the hospice — digest AI paragraph + admin dry-run (`app/api/cron/partner-digest/route.ts`, `lib/partner-digest.ts`).**
   - **AI paragraph:** add optional `outcomesDigest?: string` to `DigestInput`; `buildPartnerDigest` inserts it as its own short paragraph after the "Since your pilot began" block (exact framing from the copy fan-out; it's plain-English color, never new numbers). In the cron loop: when `cohort.familiesHelped > 0`, `const outcomesDigest = await buildOutcomesDigest(partner.name, cohort, partnerType)` — it internally handles smallSample → `smallSampleDigest()` and falls back deterministically on any Claude failure, so suppression travels with it by construction.
   - **Admin dry-run:** at the TOP of `GET`, before the bearer check (an admin's browser GET carries no bearer): if `?test=<partnerId>` is present → `const denied = await requireAdminApi(); if (denied) return denied;` (from `lib/admin-auth.ts` — NOT the cron bearer), then build the exact `{ subject, text }` that WOULD send for that one partner (fetch by exact id) plus `wouldSend: shouldSendDigest(input)`, and return JSON. **The dry-run branch sends NOTHING and ignores `PARTNER_DIGEST_ENABLED`** (it's a render, not a send). The existing bearer + flag path is untouched below it; flag off → cron still returns `{disabled:true}`. **Contract:** the `?test` branch returns before `requireServer("CRON_SECRET")` is ever evaluated (dev may not set it), constructs its own service-role client (the existing admin client is created below the flag gate), and reuses the same periodLabel + negotiations-cohort logic the loop uses — extract a small `buildDigestInputForPartner` helper both paths call rather than duplicating the queries.
   - **While touching the file:** replace the hardcoded `https://honestfuneral.co` in `reportUrl` (line 119) with `` `${PUBLIC.appUrl}/partner/r/${partner.report_token}` `` (`PUBLIC` is already imported) — touched code never hardcodes the brand domain (Rename Day is coming).
   - **Rewrite the import-rule doc comment** in `lib/partner-report-digest.ts` (lines 11–15) to match reality: today the sole `buildOutcomesDigest` importer is `lib/partner/report-data.ts` (`buildPartnerReportData` — serving the auth-gated `/portal` overview and the `report_token`-gated `/partner/r/[token]` report); add `app/api/cron/partner-digest/route.ts` as the second permitted importer (bearer- or admin-gated both ways). `app/partner/[code]/page.tsx` keeps `fallbackOutcomesDigest` only — grep-pinned in the gate.
   - *Tripwires:* exactly ONE `sendEmail` call in the file, inside the flag-gated cron branch. Never let the dry-run reach `sendEmail`. Never weaken the bearer check. Keep `maxDuration = 60`.

**6. Delivery analytics (`lib/analytics.ts` + call sites).** Extend the `ToolEvent` union (after the Day-4 loop events) with `"materials_printed"` and `"partner_landing_viewed"`.
   - `materials_printed`: `components/partner/PrintButton.tsx` is shared with `ProofSheet` — add an optional `track?: ToolEvent` prop, fire `trackTool(track)` before `window.print()` when set; materials passes `"materials_printed"`; ProofSheet call sites unchanged.
   - `partner_landing_viewed`: fire once from `ReferralCoBrand` when a name successfully resolves (useRef guard against re-fires), with **NO properties at all** — no referral code, no partner name; the URL sanitizer already strips `?ref` from pageviews, keep event properties aggregate-only.
   - This task is the first cut line — build it last.

**7. Tests.** Extend `lib/__tests__/partner-digest.test.ts`: digest text with and without `outcomesDigest` (inserted paragraph present/absent; small-sample cohort + `smallSampleDigest` text carries no dollar figures). Pin `FREE_WITH_OR_WITHOUT_LINK !== FREE_FOR_EVERY_FAMILY` and both non-empty (a one-line copy-law test, e.g. in `lib/__tests__/readability.test.ts` or a new `lib/__tests__/copy.test.ts`). Do NOT invent a new route-test harness for the cron route if none exists — the dry-run auth is covered by the manual gate + diff review.

### Acceptance gate (all of it, before the PR is declared done)

```bash
npm run typecheck && npm run lint && npm run build && npx vitest run
```

Guardrail greps (expected results noted):
```bash
# no family-recipient mailto on portal/partner/arrival surfaces (only the pre-existing ryan@ hit may remain):
grep -rn "mailto:" app/portal app/partner app/plan-now components/partner components/ReferralCoBrand.tsx | grep -v "ryan@honestfuneral.co"   # → empty
# attribution never influences choice:
grep -n "partner_id\|partner_code" lib/negotiation/directory.ts                                    # → empty
# public sample report can never reach a real Claude call:
grep -n "buildOutcomesDigest\|lib/claude" "app/partner/[code]/page.tsx"
#   → exactly the 2 header-comment lines that state the ban (lines 3–4); zero hits in import
#     statements or code. Any hit outside that comment is a violation.
# exactly one send path in the digest route, inside the flag-gated branch:
grep -n "sendEmail" app/api/cron/partner-digest/route.ts
#   → 2 lines (the import + the single call inside the flag-gated cron branch)
# word-ban (rendered copy = 0; hand-review any comment/test hits):
grep -riE "featured|recommended|sponsor" app/portal app/partner app/plan-now components/partner components/ReferralCoBrand.tsx
# employer-adjacent surfaces never say Medicare/CAHPS/CMS:
grep -riE "medicare|cahps|\bcms\b" app/portal components/partner
#   → only the pre-existing components/partner/ProofSheet.tsx hits (the variant-rule comment at
#     lines 49–51 + two hospice-variant-only rendered blocks near lines 357 and 436, both inside
#     the non-employer arm of partnerType ternaries). Zero NEW hits, zero hits reachable in the
#     employer variant, zero on any surface Day 5 touches. Do not edit the existing ProofSheet copy.
# verbatim law present, never retyped:
grep -rn "with or without this link" app components lib | grep -v "lib/copy.ts"
#   → exactly ONE hit: the Task-2b coordinator line in app/portal/materials/page.tsx (constant
#     renders reference FREE_WITH_OR_WITHOUT_LINK and can never match the literal). Any other
#     hit is a retyped sentence — replace it with the constant.
```

Manual checks — **the full dry-run delivery in dev against a demo partner** (founder drives, session verifies):
1. Seed if needed (Founder actions). `npm run dev`.
2. **Founder plays coordinator:** sign in at `/portal/login` as `demo-hospice-owner@honestfuneral.co` → portal shows the correct leading card for its activity state (also verify the codes-but-zero-activity middle state, e.g. with a fresh org or by reasoning over the branch) → `/portal/materials` → print preview of the one-pager (letterhead, QR, pledge, `FREE_WITH_OR_WITHOUT_LINK` visible; `materials_printed` fires) → copy the internal team email snippet → click "what your families see."
3. **Founder plays family:** open `/plan-now?ref=<demo HF-code>` at 375px width → co-brand + pledge + the verbatim free-forever sentence visible, one primary action, zero data asked before value → run through to a fair-price range. Then a second run in a private window with **no** link → the identical free product, nothing gated.
4. **Digest:** signed in as an admin (dev is permissive until `ADMIN_EMAILS` is set), `GET /api/cron/partner-digest?test=<demo-partner-id>` → JSON with subject + text containing the stats AND the AI paragraph (deterministic fallback text acceptable if `ANTHROPIC_API_KEY` absent), suppression respected for a small-sample partner; **no email arrives anywhere**. Unauthenticated `?test=` → 401. Bearer call without `?test=` and flag off → `{disabled:true}`.
5. Rendered-DOM spot-check of every new prose block for the eaten-space Turbopack bug.

Then: adversarial multi-lens diff review findings applied → PR (body carries the gate transcript + dry-run notes) → **no merge without founder go**.

### Cut lines (in drop order)

1. Task 6 analytics events (both) — cut first.
2. Task 3 portal first-run middle state → degrade to a static tip card on the ProofSheet path.
3. **Never cut:** the materials one-pager + link kit (Task 2), the `/plan-now` phone pass (Task 4), the free-without-referral sentence rendering verbatim, the digest dry-run (Task 5 — it is the paying-partner deliverable).

### Founder actions (explicit, separate from the session)

1. **Before the manual gate:** seed the demo partner orgs — `DEMO_PASSWORD=<pick> DEMO_ZIP=84101 node scripts/seed-demo.mjs` with `.env.local` loaded (idempotent; adopts only marker-tagged demo rows; aborts rather than touch a real partner — prod's real "DEMO 1" partner is name-collision-protected). Skip if "Demo Hospice" already exists from a prior walkthrough.
2. Drive the two-role dry run in step 2–3 of the manual gate personally — this rehearsal IS the pilot-delivery runbook.
3. Keep `PARTNER_DIGEST_ENABLED`, `OUTREACH_LIVE`, `BILLING_LIVE` unset/off — today wires the digest but nothing turns on.
4. Review + merge the PR on your go only. No migration to apply today.

### Kickoff prompt (paste to open the session)

```text
ultracode. git fetch and branch off current origin/main in a fresh worktree (copy /Users/ryancurrie/FH/.env.local in — worktrees don't inherit it — then npm install). Read CLAUDE.md and docs/SPRINT_DAYS_5-9_BUILDSHEETS.md §DAY 5 — execute Day 5 only (delivery day: the hand-off, both directions), exactly as specced. Trust the sheet's "repo-verified reality corrections" over the old §DAY 5-REPLAN text — the family arrival screen is /plan-now?ref=, NOT /partner/[code]. Order: scout the five delivery surfaces first, then the ultracode copy fan-outs (internal team email, free-forever sentence placement, one-pager line, digest paragraph) → judge → adversarial channel-survival/word-ban review, mechanical wiring after, adversarial multi-lens diff review before the gate. Day gate before done: typecheck/lint/build/vitest, every guardrail grep in the sheet, and the coordinator→family dry run with me driving (I'll seed the demo org if needed). PR; no merge without my go. Kill switches stay off; no migration today.
```

---

## DAY 6 — Hospice pages + claim (50-state SEO surface) 🔥 ULTRACODE (last heavy day — runs the session after Day 5)

**Source lineage:** old `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md` §DAY 7 tasks 1–4 only (task 5 digest shipped Day 5; task 6 DNS pre-staging is a Day-8 founder action). The old doc's own "§DAY 6" is a DIFFERENT, superseded day (Migration B) — never execute from it.

**Objective:** ship the product-side top of the partner funnel as a public surface: `/hospices/[state]` (51 indexed state directory pages with real CMS aggregates + a family-facing education block), `/hospices/[state]/[ccn]` (noindexed facility pages with a claim-this-page path into `partner_leads`), and the homepage finder linking into them. This is the last ultracode day — the spend is 50-state content quality + the adversarial copy pass, not plumbing.

### Preconditions

- **The Days 5–9 buildsheets docs PR must be merged to `origin/main` before this session opens** (this file did not exist at `b19983a`). If `docs/SPRINT_DAYS_5-9_BUILDSHEETS.md` is missing from the fresh worktree, STOP and tell the founder — do NOT fall back to `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md` §DAY 6, which is a different (superseded Migration-B) day; the old hospice-pages spec lives under its §DAY 7.
- Migration A is applied in prod with ~6,852 CMS rows imported (done 2026-07-20). Verify before building: `curl -s 'https://honestfuneral.co/api/hospices/search?q=trinity'` returns hospices. If it returns `{"hospices":[]}` stop and tell the founder.
- Fresh worktree off current `origin/main` (`git fetch` first — main moves fast). Copy `/Users/ryancurrie/FH/.env.local` into the worktree (worktrees don't inherit it) and `npm install`. Branch `claude/day-6-hospice-pages-<suffix>`. NOTE: with `.env.local` present, dev + `npm run build` read the PROD Supabase project via the service role, and any live claim test writes a real `partner_leads` row and emails `support@` — flag test rows in the PR body for founder cleanup (Day-4 precedent).
- No migration today. Kill switches `OUTREACH_LIVE` / `PARTNER_DIGEST_ENABLED` / `BILLING_LIVE` stay off; nothing today touches them.
- No founder action blocks the start of this day.

### Ground truth (verified at b19983a, post-Day-4 main — do not re-derive the schema/contracts, do not invent columns. Day 5 merges before today and touches `lib/analytics.ts`, so the `ToolEvent` union will be longer than described and cited line numbers may have drifted a few lines: locate the `RATE_LIMITS` nominate entry and the `PartnersClient` badge ternary by grep, never by line number.)

- `public.hospices` columns are EXACTLY: `id, ccn, name, city, state, zip, ownership, created_at` (see `supabase/migrations/2026-07-20-hospices-consent.sql`). No CAHPS scores, no certification dates, no phone, no address. "Aggregates" therefore means: count + ownership mix (`group by ownership` computed in JS) per state. "Medicare-certified" is a dataset-level fact (CMS Provider Data Catalog yc9t-dgbk) and fine to state on these surfaces.
- `ccn` is a ZERO-PADDED STRING (`'011500'`). Never `Number()`/`parseInt` it anywhere — routes, links, queries, tests. `hospices.state` stores the two-letter uppercase abbreviation. `name`/`city` are VERBATIM UPPERCASE — every rendered name/city goes through `displayHospiceName()` from `lib/hospice-display.ts` (it handles cities too); data, API queries, and route params stay verbatim.
- Table is RLS deny-all: all reads go through the service role, degrading to empty on failure — mirror `app/api/hospices/search/route.ts` (`createServiceClient(PUBLIC.supabaseUrl, requireServer("SUPABASE_SERVICE_ROLE_KEY"))`, catch → empty, never a 500/build failure).
- `lib/us-states.ts` `US_STATES` is the canonical 50+DC list with `abbr`/`name`/`slug` — use its `slug` for routes (`/hospices/utah`), `abbr` for queries. The CMS table also contains territory rows (PR/GU/VI/MP); those get NO pages this sprint — `dynamicParams = false` on `[state]` handles it.
- `partner_leads` (2026-07-13-portal-identity.sql): `name, org, email NOT NULL, note, source default 'demo-request', handled_at, created_at`. `email` must fall back to `""`.
- `app/api/partner/nominate/route.ts` is the exact template for the claim route: zod body, `readLimitedJson(req, 10)`, in-route hourly `rateLimit` + a proxy `RATE_LIMITS` entry in `lib/rate-limit.ts` (next to `"/api/partner/nominate": { limit: 5, windowMs: 60_000 }` — locate by grep), consent-gated email retention, newline-flattened + label-prefixed founder email to `BRAND.supportEmail`, best-effort insert/email with 503 only when BOTH fail, `emailed = FEATURES.email()` (a dry-run send never counts). Its tests: `app/api/partner/nominate/__tests__/route.test.ts` — mirror scope.
- `app/partners/apply/ApplyForm.tsx` does NOT accept an org prefill today (`const [org, setOrg] = useState("")`); `app/partners/apply/page.tsx` reads only `searchParams.type`. Both need the edit in Task 3.
- `app/admin/partners/PartnersClient.tsx` badge ternary (locate by grep for `family_nomination`) knows only `family_nomination` → "family nomination", else "demo request" — a `hospice_claim` lead would render mislabeled as "demo request". Task 4 fixes it.
- `components/HospiceFinder.tsx`: result rows are full-row select `<button>`s; selecting reveals a two-path panel (`selected` state carries `{ccn, name, city, state}`). `app/sitemap.ts` builds route arrays from lib list helpers; add a `hospices` array there. Loop analytics live in `lib/analytics.ts` `ToolEvent` union.
- Brand: new code renders `BRAND.name` from `lib/brand.ts`, never the literal string. The gate sentence constant is `FREE_FOR_EVERY_FAMILY` in `lib/copy.ts` — reuse, never retype.

### Ultracode orchestration (fan out FIRST — bank the intelligence before wiring)

1. **Template design fan-out (2–3 independent proposals, then judge):** the `/hospices/[state]` page IA (how to present count + ownership mix + a possibly-1,500-row list for CA/TX — grouping by city with anchors is allowed; a plain crawlable list of facility links is the floor) and the `[ccn]` facility template (CMS facts, neutral tone, family path, claim panel). Judge on: calm on a phone, crawlability, zero steering surface.
2. **Copy fan-out (independent of #1):** the family education block — "questions to ask the hospice that's caring for your family about after-death support" — plus state-page titles/meta and the claim-panel microcopy. Hard constraints for every proposal: education never solicitation; post-admission framing ONLY (it addresses a family whose hospice is already caring for them — never comparison-shopping hospices, never "choose this hospice", never a benefit that could induce hospice selection); never CAHPS; capability-not-adoption phrasing ("hospices can offer", never "these hospices offer" until a partner is live); `FREE_FOR_EVERY_FAMILY` renders verbatim where the free promise appears.
3. **Adversarial channel-survival + word-ban review of the WINNING templates before any wiring** — reviewer gets CLAUDE.md's channel-survival section + the word-ban nuance below and tries to kill the copy. Fix, then wire.
4. After wiring, before the gate: the standard **adversarial multi-lens diff review** (correctness / security / a11y / channel-survival / copy-tone lenses on the full diff). This caught real bugs on every one of Days 1–5 — not optional.

### Word-ban nuance (write it into a comment atop both page.tsx files, per spec)

These are hospice-DIRECTORY surfaces: CMS facts — "Medicare-certified", ownership type, the CMS dataset citation — are factual and FINE here. The Medicare/CAHPS/CMS word-ban applies to EMPLOYER surfaces only. Still banned here: `featured|recommended|sponsor` (any form, zero tolerance in rendered copy — currently 0 across all partner surfaces, keep it 0); pitching or mentioning CAHPS (banned everywhere, always); pre-admission benefit framing ("families they serve", never "choose this hospice"); present-tense adoption claims about any named hospice. (Known pre-existing exception at main: `app/partners/page.tsx` ~lines 185–196 still carries the retired CAHPS/Care-Compare pitch bullet. OUT OF SCOPE today — do not touch it; it is queued for the Day-9 docs/copy truth pass, §DAY 9 Task 1.3.)

### Tasks

**1. `lib/hospice-directory.ts` — server-only reads + pure aggregates.**
- `listHospicesByState(abbr: string): Promise<HospiceRow[] | null>` — service-role read mirroring the search route's client construction; `.eq("state", abbr).order("name")`. **TRAP: Supabase caps responses at 1,000 rows and CA/TX exceed it** — paginate with `.range(offset, offset + 999)` in a loop until a short page. Return `null` on any error (degrade; the page renders an honest "directory temporarily unavailable" state and the build never fails). No `"use client"` anywhere in this file; never import it from a client component.
- `summarizeOwnership(rows): { label: string; count: number }[]` — pure, exported, ownership verbatim from the column grouped + sorted by count desc.
- `getHospiceByCcn(ccn: string): Promise<HospiceRow | null>` — `.eq("ccn", ccn)` verbatim string, `maybeSingle()`, null on error/miss.
- Unit tests for `summarizeOwnership` and the pagination chunking (extract the merge as a pure helper) in `lib/__tests__/hospice-directory.test.ts`.

**2. `app/hospices/` — index, state pages, facility pages.**
- `app/hospices/page.tsx` — small indexed index: h1 + one-paragraph framing + the 51 state links (this is the crawl path; without it the state pages are sitemap-orphans). Static.
- `app/hospices/[state]/page.tsx` — `generateStaticParams()` over `US_STATES` slugs (51), `export const dynamicParams = false` (junk slugs 404), `export const revalidate = 86400`. Content: count + ownership mix from Task 1 ("N Medicare-certified hospices in {name} — from the CMS Provider Data Catalog (directory data as of July 2026)"; hardcode the as-of month of the most recent import as a constant next to the page, and never promise a refresh cadence the repo doesn't automate — the count consulted the store, so citing the source IS the badge-honesty), the hospice list (display-cased name + city, each linking its facility page), the winning education block, `FREE_FOR_EVERY_FAMILY`, and an "operate one of these hospices?" block → `/partners/apply`. `generateMetadata` with title/description from the copy fan-out + `ogImage()` (mirror `app/estate/[state]/page.tsx`). INDEXED (no robots override).
- `app/hospices/[state]/[ccn]/page.tsx` — NO `generateStaticParams` (6,852 pages would wreck the build; render on demand, `revalidate = 86400`). Validate the state slug against `US_STATES` and fetch by ccn VERBATIM; `notFound()` on miss or state/ccn mismatch. `export const metadata`-via-`generateMetadata` MUST include `robots: { index: false, follow: true }` — the gate greps the rendered HTML for the noindex meta. Content: the CMS facts that exist (name, city/state/zip, ownership, CCN, dataset citation), breadcrumb → the state page, a family path (link to `/analyzer` + a `/tell-your-hospice?hospice=…&city=…&state=…` link, params VERBATIM matching what `HospiceFinder` already sends), and the org path: "Is this your organization? Offer {BRAND.name} to your families — free to them" → `/partners/apply?org=<displayHospiceName(name)>` + the claim panel (Task 3). Neutral tone throughout — this page describes, it never endorses.
- **TRAP (bit Day 4):** the Next 16.2.4/Turbopack JSX compiler eats the space after inline `{expr}` in flowing prose — explicit `{" "}` after every mid-sentence expression (`{displayHospiceName(h.name)}{" "}serves…`), and verify rendered DOM, not source.

**3. Claim: `app/api/partner/claim/route.ts` + the facility-page `ClaimPanel.tsx` + apply prefill.**
- Route mirrors `/api/partner/nominate` EXACTLY in structure. Body (zod): `{ ccn: string (trim, 4–10 chars, ^[0-9A-Za-z]+$ — NEVER numeric-cast), note?: ≤600, email?: valid ≤254, contactOk?: boolean }`. Resolve the hospice server-side via `getHospiceByCcn` (the org is server-derived — a forged body can't plant an arbitrary org name); unknown ccn → 400/404, no row, no email.
- Export pure `buildClaimLead(hospice, body)` → `{ org: displayHospiceName(hospice.name), email: contactOk === true ? (email ?? "") : "", note: "CCN <ccn> · <CITY>, <ST>" + optional user note (flattened), source: "hospice_claim" }`. Email kept ONLY on explicit consent; `""` fallback for the NOT NULL column — both invariants copied from `buildNominationLead`, both unit-tested in `app/api/partner/claim/__tests__/route.test.ts` (mirror the nominate test file's scope).
- Rate limits, both layers: `lib/rate-limit.ts` gains `"/api/partner/claim": { limit: 5, windowMs: 60_000 }` (proxy burst guard) AND the in-route `rateLimit(\`partner-claim:${clientIp(req.headers)}\`, { limit: 5, windowMs: 60 * 60_000 })` hourly cap. `readLimitedJson(req, 10)`.
- Founder email to `BRAND.supportEmail`: subject `Hospice page claim: <flat(org)>`, every user-controlled fragment newline-flattened + label-prefixed, the no-consent variant says contact info was withheld — do not follow up. Best-effort insert + email; `emailed = FEATURES.email()` only on a real send; 503 only when both fail. **This route NEVER emails the hospice and NEVER emails any family — internal founder notification only** (guardrail: nothing ever cold-contacts anyone; write that sentence in the route doc-comment).
- `ClaimPanel.tsx` (`"use client"`, in the `[ccn]` dir): work-email input + explicit "OK to contact me about this claim" checkbox + optional note; POSTs `{ ccn, … }`; calm sent/error states. On success fire `trackTool("hospice_claim_submitted")` — add that literal to the `ToolEvent` union in `lib/analytics.ts` with the loop-events comment block.
- Apply prefill: `app/partners/apply/page.tsx` reads `searchParams.org` (accept only `typeof === "string"`, `.slice(0, 160)`) and passes `defaultOrg` to `ApplyForm`; `ApplyForm.tsx` gains `defaultOrg?: string` and seeds `useState(defaultOrg ?? "")`. A prefilled org ≥2 chars will fire the suggestions fetch on mount — harmless, leave it.

**4. `app/admin/partners/PartnersClient.tsx` badge fix.** Replace the two-way ternary (locate by grep for `family_nomination`) with an explicit map: `family_nomination` → "family nomination", `hospice_claim` → "hospice claim", default → "demo request". Also check the name-fallback line just above it: a claim lead has `org` but may have no `name` — make the org-as-title fallback cover `hospice_claim` too.

**5. `components/HospiceFinder.tsx` — link the facility page.** In the SELECTED panel header (next to the name/city line), add a small "See this hospice's page →" `Link` to `/hospices/<slug>/<ccn>`, mapping `selected.state` abbr → slug via `US_STATES` (omit the link when state is null/unmapped — territories). Decision + justification: the rows stay pure select-buttons (a nested link inside a `<button>` is invalid HTML and a keyboard trap), and the panel is where both paths already reveal — the link is a third, quieter affordance there.

**6. `app/sitemap.ts` — state pages only.** Add a `hospiceRoutes` array: `/hospices` (priority 0.7) + the 51 `/hospices/<slug>` entries (priority 0.7, monthly), spread into the return. Facility pages NEVER go in the sitemap (they're noindexed — a sitemap entry contradicting robots is a crawler smell).

### Acceptance gate (all must pass before the PR is opened)

```
npm run typecheck && npm run lint && npm run build && npx vitest run
```
- Build succeeds and statically generates the 51 state pages (watch the build output; the DB reads happen at build via `.env.local` — if the degrade path fired, counts will be the unavailable state: investigate, don't ship zeros silently).
- Word-ban / guardrail greps:
  - `grep -RIniE "featured|recommended|sponsor" app/hospices app/api/partner/claim components/HospiceFinder.tsx` — must be empty.
  - `grep -RIni "cahps" app/hospices app/api/partner/claim components/HospiceFinder.tsx` — must be empty, AND `git diff origin/main | grep -i cahps` — must be empty (the word already exists at main inside the digest word-ban guards, their tests, ProofSheet's disclaimers, and one legacy `/partners` bullet; Day 6 must simply add zero new occurrences).
  - `grep -RIn "Honest Funeral\|honestfuneral" app/hospices app/api/partner/claim` (brand via `lib/brand.ts` only) — must be empty.
  - Manual read for the un-greppable bans: no "choose/pick/compare hospices" framing, no present-tense adoption claim about any named hospice, no pre-admission benefit framing.
- Manual, on `npm run dev`:
  - `/hospices/utah` renders a real count + ownership mix + list; names/cities Title-Cased (no SHOUTING); a CA or TX page renders MORE than 1,000 rows (the pagination trap check).
  - `curl -s localhost:3000/hospices/utah/<real UT ccn> | grep -i 'name="robots"'` shows `noindex` — the literal gate check. Same curl on a state page shows NO noindex. A leading-zero CCN URL (e.g. one starting `01`) resolves — zero-padding survived.
  - `/hospices/not-a-state` and `/hospices/utah/999999x` → 404.
  - Claim: submit once live with note "TEST — founder delete"; verify the `partner_leads` row has `source='hospice_claim'`, `email=''` when the consent box was unchecked, and the founder email arrived flattened/labeled; `/admin/partners` shows the "hospice claim" badge (not "demo request"). 6th rapid POST → 429.
  - `/partners/apply?org=Test%20Hospice` arrives prefilled.
  - Finder: select a hospice → "See this hospice's page →" lands on its facility page.
  - `curl -s localhost:3000/sitemap.xml | grep -c "/hospices"` → 52.
  - Rendered-DOM spacing check on every new prose line containing an inline expression.
- Adversarial multi-lens diff review completed and findings applied BEFORE this gate runs.
- Open the PR (title `feat(seo): Day 6 — hospice state pages + facility claim (D5)`), body lists the live-test artifacts to clean up. NO merge without founder go.

### Cut lines (in drop order)

1. Facility `[ccn]` pages → state pages only. If cut: the state page keeps an "is one of these yours?" block → `/partners/apply` (org typed by them); `/api/partner/claim` + tests + the badge fix still ship (small, complete, tested); the finder link (Task 5) is cut with it.
2. Finder facility link (Task 5) alone.
3. OG images + city-grouping polish on state pages → a plain list + default OG is acceptable.
- **Never cut:** the noindex on any facility page that ships; `displayHospiceName()` on every rendered CMS string; zero-padded CCN handling; both rate-limit layers + the consent-gated email retention on claim; the word-ban; the sitemap addition for whatever indexed pages ship.

### Founder actions (none block the day)

- After the PR: skim 3 state pages + 1 facility page on the preview deploy (tone check — this is public SEO surface), delete the "TEST — founder delete" `partner_leads` row, ignore the matching support@ email, then give the merge go.
- ~~Rename DNS pre-staging reminder~~ removed 2026-07-27 — the rename is ON HOLD (top-of-file banner).

### Kickoff prompt (paste to open the session)

```text
ultracode. git fetch and branch off current origin/main in a fresh worktree (copy /Users/ryancurrie/FH/.env.local in, npm install). Read CLAUDE.md and docs/SPRINT_DAYS_5-9_BUILDSHEETS.md §DAY 6 — execute Day 6 only, exactly as specced. If docs/SPRINT_DAYS_5-9_BUILDSHEETS.md is missing at your origin/main, STOP and tell the founder — do NOT fall back to docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md §DAY 6, which is a different (superseded Migration-B) day; the old hospice-pages spec lives under its §DAY 7. Verify the hospices search API is live first, then the ultracode fan-outs (state/facility template designs → education-block + meta copy → adversarial channel-survival/word-ban review of the winners) BEFORE any wiring, mechanical wiring after, adversarial multi-lens diff review before the gate. Remember the traps: Supabase 1,000-row cap on CA/TX state reads, zero-padded CCNs never numeric-cast, displayHospiceName() on every rendered CMS string, {" "} after inline JSX expressions, facility pages noindexed and never in the sitemap. Day gate before done (including the rendered-HTML noindex grep and the live claim test flagged for my cleanup); PR; no merge without my go.
```

---

## DAY 7 — Programmatic reach: ISR city pages + citable Fair-Price Index (D4) — STANDARD MODEL (still run reviews)

**Source lineage:** old `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md` §DAY 4 (sprint D4) + the REPLAN banner — this section supersedes both.

**Objective:** a founder promotion on `/admin/benchmarks` surfaces on the SEO city pages and the Fair-Price Index **within the hour, with no deploy** (ISR + the existing post-promote `revalidatePath` hook), and the index becomes citable (public JSON/CSV dataset + cite-this block + JSON-LD `distribution`). Mechanical day, standard model is fine — but still run the fan-outs and the adversarial diff review; they caught real bugs on every prior day.

**The one law that rules this day — badge-honesty (guardrail #4: "Never publish a number we can't defend"):** a `verified`/`community` label may only ever sit beside a number that actually came from `regional_benchmarks`. The modeled whole-service table stays labeled modeled. Zero overrides for a metro ⇒ every touched page renders **byte-identical to today** (pinned by test).

### Preconditions

- **The docs PR that lands `docs/SPRINT_DAYS_5-9_BUILDSHEETS.md` must be merged to `origin/main` before this kickoff runs** (the file is not on main as of `b19983a`); if it isn't, paste this §DAY 7 section text into the session instead.
- Days 1–4 merged (`origin/main` ≥ `b19983a`). Days 5/6 may or may not have merged — this day touches none of their files; just branch off whatever `origin/main` is now.
- `regional_benchmarks` exists in prod (migration `supabase/migrations/2026-07-17-regional-benchmarks.sql`, applied during product week; prod tier API verified then). **No migration today. No founder action blocks the build.**
- Founder data track (decoupled): if the founder has ingested Utah GPLs and promoted SLC groups by today, run gate **Branch A**; if not, run **Branch B** (both defined below — plan the code identically either way; only the gate differs).
- Fresh worktree off current `origin/main`; copy `/Users/ryancurrie/FH/.env.local` in (worktrees don't inherit it) and `npm install`.

### Verified implementation anchors (re-checked @ b19983a — trust these, but re-read each file before editing)

- **Store read path:** `lib/benchmarks-store.ts` — `benchmarksForZip(zip): Promise<Map<string, RegionalBenchmark>>` (React `cache()`-wrapped; narrowest scope wins; degrades to empty Map on missing table/env — never throws). `RegionalBenchmark` = `{ lineItemId, fairLowCents, fairHighCents, predatoryAtCents, tier: "verified"|"community", n, version, effectiveAt, scope }`. **All store amounts are CENTS; `lib/pricing-data.ts` LINE_ITEMS are DOLLARS** — convert deliberately at the render/serialize edge. Also exports `tierForZip(zip)` → `{ tier, n, itemCount, lastUpdated }` (lastUpdated already `YYYY-MM-DD`). There is **no list-all function yet** — you add one (Task 1).
- **City data:** `lib/city-pages.ts` — `CITIES` (89 entries; fields `slug, name, state, stateSlug?, zipPrefix, zipExample, blurb?`), `getCity`, `listCitySlugs`, and `citySlugsForMetro(metro)` (line ~368, matches via `regionForZip(c.zipExample)?.metro`). SLC entry: `slug: "salt-lake-city", zipExample: "84111"`, metro label `"Salt Lake City"`.
- **City page:** `app/funeral-costs/[city]/page.tsx` (324 lines) — fully static today: `generateStaticParams`, no `revalidate`, no DB read. Whole-service table = `SERVICE_TOTALS × multiplier` with a **hardcoded `<DataTierBadge tier="modeled" />`** at line ~159 and the modeled-source note at ~161–167. Local `fmtRange(low, high, multiplier)` works in DOLLARS.
- **Badge:** `components/DataTierBadge.tsx` — props `{ tier, n?, lastUpdated?, partial?, className? }`; `partial` exists exactly for "local data covered only some items" (guardrail #4 comment in-file). Server-safe (no "use client").
- **Index page:** `app/fair-price-index/page.tsx` (175 lines) — static, sync component; `GROUPS` + `ALL_GROUPS` ungrouped-catch; Dataset JSON-LD const `jsonLd` at ~47–58 (hardcodes "Honest Funeral"/`https://honestfuneral.co` — **leave those literals alone**, Rename Day sweeps them atomically per `lib/brand.ts` header comment); modeled disclaimer Card at ~139.
- **Revalidate hook (already shipped, Day 2):** `app/api/admin/benchmarks/promote/route.ts:179–186` — after a successful promote, calls `revalidatePath('/funeral-costs/${slug}')` for every `citySlugsForMetro(scopeValue)` slug + `revalidatePath("/fair-price-index")`, best-effort. Promote is **metro-scope-only this week** (422 otherwise, line ~65), so the hook fully covers the city pages — the in-file comment at ~169 even says the purge is "inert until Day 4 (sprint D4)" — that inertness is what today removes. Pinned by `app/api/admin/benchmarks/promote/__tests__/route.test.ts` (asserts the revalidated path list). **Do not modify the promote route.**
- **Pricing data:** `lib/pricing-data.ts` — `LINE_ITEMS` (30 items; `{ id, name, fairLow, fairHigh, predatoryAt, required, notes, categories, highMarkup?, perUnit? }`, dollars), `fmtUSD`, `SERVICE_TOTALS` (:513), `PRICING_LAST_UPDATED = "2026-06-26"` (:672).
- **Consent seam — state this in the PR body:** these surfaces read **only `regional_benchmarks`** (founder-promoted aggregates). The contribute-consent filter (`contributed !== false`, NULL = grandfathered) lives in `lib/benchmark-sources.ts` `fetchBenchmarkRecords` (~line 30–35) and runs at **promote time**, so every published row is consent-clean by construction. **NEVER read `price_list_analyses` or `negotiation_outreach` from any page or public API built today** — no hand-rolled raw-table reads.
- **Schema:** `regional_benchmarks.sources` is `jsonb` — provenance array `[{name, url?, kind, accessed}]`; the promote route writes a single founder-note entry. `n_data_points`, `version`, `effective_at`, `active` all present.
- **Public cached GET pattern to mirror:** `app/api/benchmarks/tier/route.ts` — in-route `rateLimit(`${clientIp(req.headers)}:<route>`, { limit: 30, windowMs: 60_000 })` (the proxy limiter only guards POSTs), zod-free param validation, `Cache-Control: public, max-age=3600`, and **errors degrade to a valid 200 payload, never a 500**.
- **Brand:** new code reads `lib/brand.ts` `BRAND` (`name`, `url` = `NEXT_PUBLIC_APP_URL`), never the literal string.
- **Sitemap:** `app/sitemap.ts` already carries `/fair-price-index` (line 30) and all city routes (lines 122–127). **Nothing to add; API routes never go in a sitemap.**

### Orchestration (standard model, but keep the discipline)

1. **Fan out FIRST (before wiring):** two or three independent proposals for (a) the "Verified local prices" section copy — heading, per-tier count sentence, community-tier wording — and the cite-this block; (b) the data-endpoint payload schema (field names, units declaration, CSV columns). Judge on: badge-honesty, calm family-facing tone, zero word-ban hits, machine-citability.
2. **Adversarial channel-survival/word-ban pass on the winning copy** before it lands in JSX.
3. **Wire mechanically** (Tasks 1–5).
4. **Adversarial multi-lens diff review before the gate** — required lenses: badge-honesty/guardrail-#4 (any verified label beside a modeled number?), cents-vs-dollars unit audit on every conversion, consent-seam (any raw-table read?), ISR/caching semantics (does `revalidate` + the existing hook actually connect?), zero-override identity (does the empty-store path change ANY byte of today's render?), data-endpoint leakage (raw observations? home-identifying rows? sources carrying prices?), JSX space-after-`{expr}`.

### Tasks

**1. `lib/benchmarks-store.ts` — add `listActiveBenchmarks()`** (the one new read):
```ts
export interface ActiveBenchmarkRow extends RegionalBenchmark {
  scopeValue: string;
  sources: { name: string; url?: string; kind?: string; accessed?: string }[];
}
export async function listActiveBenchmarks(): Promise<ActiveBenchmarkRow[]>
```
Service-role read of ALL `active = true` rows (start from `benchmarksForZip`'s select string, which already carries `scope_value`, and add `sources`), same try/catch-to-empty posture as `benchmarksForZip` (missing table/env ⇒ `[]`, never a throw). **Sanitize `sources` on the way out:** map each entry to only `{name, url, kind, accessed}` (strings), drop anything else — sources are provenance, never prices; if an entry somehow carries a numeric/price-like field, it must not pass through. Order by `scope_value, line_item_id`. Extend `lib/__tests__/benchmarks-store.test.ts` (queue-based fake + `vi.resetModules` pattern already in the file) with: returns rows; missing table ⇒ `[]`; sources sanitized.

**2. City pages read the store — `app/funeral-costs/[city]/page.tsx`:**
- Add `export const revalidate = 3600;` (keep `generateStaticParams` — this makes the pages ISR; the Day-2 hook's `revalidatePath` then purges them on promote).
- Fetch `const overrides = await benchmarksForZip(city.zipExample);`.
- New **"Verified local prices"** Card, rendered **only when `overrides.size > 0`**, placed between the whole-service table Card and the "Local fair pricing" CTA Card. Contents: one row per overridden item — item display name from `LINE_ITEMS` (`byId` lookup; reuse the index page's `name.split("/")[0].split("—")[0].trim()` display trick), range `fmtUSD(fairLowCents/100)–fmtUSD(fairHighCents/100)`, and `<DataTierBadge tier={row.tier} n={row.n} lastUpdated={row.effectiveAt.slice(0,10)} />`. Then the count line, verbatim law (verified rows): *"{X} of the {LINE_ITEMS.length} benchmarked items in this metro come from real price lists; the rest are modeled."* If the overrides are community-tier, that clause reads *"come from prices reported by families in the area"* — never say "price lists" for community rows, never conflate the tiers (count them separately when mixed).
- Put the row-building + counting logic in a small pure helper (suggest `lib/verified-local-prices.ts`, exporting something like `verifiedLocalRows(map): { rows, verifiedCount, communityCount }`) so it's unit-testable without rendering the page.
- **The whole-service table does not change:** it stays `SERVICE_TOTALS × multiplier`, keeps its hardcoded `<DataTierBadge tier="modeled" />` (~:159) and its modeled-source note (~:161–167). Per-item local overrides cannot apply to whole-service bands — update the in-file comment to say the page now ALSO reads per-item overrides in a separate section, so the "no DB read" half of the old comment doesn't lie.
- **Traps:** cents→dollars at exactly one edge (the helper). Explicit `{" "}` after every inline `{expr}` in flowing prose (Turbopack eats the space — verify rendered DOM, not source). Do not use the page's local `fmtRange` for override rows (it multiplies by the regional multiplier — store values are already local; multiplying again is a correctness bug).

**3. Fair-Price Index verified-metros section — `app/fair-price-index/page.tsx`:**
- Add `export const revalidate = 3600;`, make the component `async`.
- Read `listActiveBenchmarks()`; filter `scope === "metro"`; group by `scopeValue`. Render a **"Verified metros"** section (between the last item group and the modeled-disclaimer Card) only when non-empty — **degrade to completely absent** (today's exact render) when empty or on read failure. Per metro: metro name · items covered (count) · min `n` across its rows · latest `version` — and link to `/funeral-costs/[slug]` via `citySlugsForMetro(metro)` when a slug matches (no match ⇒ plain text, no dead link).
- Extend the modeled-disclaimer Card by ONE sentence pointing at the section (only when it rendered), e.g. "The metros listed above have upgraded ranges backed by real local data." — fan-out polishes wording; the disclaimer's existing text about the whole index being modeled must be softened ONLY by that pointer, not rewritten (when no metros exist it must read exactly as today).
- **Cite-this block** (bottom of page, above the closing CTA): title, canonical URL, date. Use `BRAND.name` and `BRAND.url` (`${BRAND.url}/fair-price-index`, data at `${BRAND.url}/api/fair-price-index/data`). Date = the later of `PRICING_LAST_UPDATED` and the max `effectiveAt` (sliced to date) across active rows; fallback `PRICING_LAST_UPDATED` when the store read failed.
- **JSON-LD:** add a `distribution` array to the existing `jsonLd` — `[{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${BRAND.url}/api/fair-price-index/data` }, { …"text/csv"… "?format=csv" }]` and update `dateModified` to the same computed date. This forces `jsonLd` to be built per-render (it's currently a module const) — move it inside the component. **Leave the existing hardcoded "Honest Funeral"/honestfuneral.co literals in place** (Rename Day sweeps them in one atomic pass — `lib/brand.ts` header comment forbids piecemeal migration); only the NEW fields use `BRAND`.

**4. Public dataset endpoint — `app/api/fair-price-index/data/route.ts` (new):**
- `GET`, mirroring `app/api/benchmarks/tier/route.ts`: in-route `rateLimit` (30/min per IP is fine — it's cacheable), `Cache-Control: public, max-age=3600`, **any failure degrades to a valid 200 with the national-only payload, never a 500**.
- JSON payload (all money in **DOLLARS**, declare `"units": "USD"`): metadata (`name` via `BRAND.name`, `url`, `lastUpdated` as computed in Task 3, `methodology: ${BRAND.url}/methodology`), `national`: LINE_ITEMS mapped to `{ item: id, name, fairLow, fairHigh, predatoryAt, perUnit }`, `overrides`: `listActiveBenchmarks()` rows mapped to `{ scope, value: scopeValue, item: lineItemId, tier, fairLow, fairHigh, predatoryAt, n, version, updated: effectiveAt.slice(0,10), sources }` (the Task-1 sanitized sources only). `predatoryAtCents` may be null — emit `predatoryAt: null` in JSON and an empty (still-quoted) `predatory_at` field in CSV; never coerce to 0.
- **`?format=csv`:** one flat table, national rows as `scope=national, tier=modeled` + override rows; columns `scope,value,item,name,tier,fair_low,fair_high,predatory_at,n,version,updated,sources` (sources = semicolon-joined names). Quote every field; prefix any field starting with `=`, `+`, `-`, `@` with `'` (CSV-injection hygiene — sources names are free-text founder notes). `Content-Type: text/csv`, `Content-Disposition: attachment; filename="fair-price-index.csv"`.
- **NEVER in this payload:** raw observations, per-home prices, home names attached to prices, family/case data, any row below the n≥5 gate (structurally impossible if you read only `regional_benchmarks` — which is the point; the promote route is the only gate-keeper). Add a route-top comment saying exactly this.
- Route test (`__tests__/route.test.ts`, mock `lib/benchmarks-store`): JSON shape + units; CSV header + injection-escape; store-throw ⇒ 200 national-only; no forbidden keys (assert the serialized payload contains no `user_id`/`zip`-of-a-family/`price_list_analyses`-shaped fields).

**5. Sitemap check (no-op, verify only):** `/fair-price-index` (sitemap.ts:30) and all `/funeral-costs/[slug]` routes (:122–127) are already present. **Add nothing** — especially not the API route.

**6. Unit pins (the Branch-B backbone — write them regardless of branch):**
- `lib/__tests__/verified-local-prices.test.ts` (or wherever the Task-2 helper lands): empty Map ⇒ no rows/zero counts (the section-absent contract); populated Map ⇒ correct dollars conversion, per-tier counts, sorted output.
- **Zero-override identity pin:** with the store mocked empty, the city page module renders no "Verified local prices" text and the index page renders no "Verified metros" text (if full page-render testing is impractical in vitest, pin the helper + a thin condition-function instead, and cover the page byte-identity manually in the gate).
- Confirm (don't rewrite) `app/api/admin/benchmarks/promote/__tests__/route.test.ts` still pins the revalidated-path list covering `/funeral-costs/<metro slugs>` + `/fair-price-index` — that test IS the "promotion purges the pages" contract.

### Acceptance gate

Both branches, always:
```bash
npm run typecheck && npm run lint && npm run build && npx vitest run
```
- `npm run build` output shows `/funeral-costs/[city]` and `/fair-price-index` built with ISR (revalidate 1h marker), not fully dynamic and not plain static. If the build table doesn't print a revalidate column on this Next version, verify deterministically instead: `.next/prerender-manifest.json` must show `"initialRevalidateSeconds": 3600` for `/fair-price-index` and every `/funeral-costs/<slug>` route.
- Greps (all must be empty):
```bash
grep -rniE '\b(featured|recommended|sponsor[a-z]*)\b' app/funeral-costs app/fair-price-index app/api/fair-price-index
grep -rn 'tier="verified"\|tier="community"' app components   # tier labels must only ever come from store data
grep -rn 'price_list_analyses\|negotiation_outreach' app/funeral-costs app/fair-price-index app/api/fair-price-index
grep -rn 'honestfuneral\|Honest Funeral' <every NEW file in the diff>   # new code reads BRAND
```
- `npm run dev` against prod DB (`.env.local`): `curl -s localhost:3000/api/fair-price-index/data | python3 -m json.tool | head -40` returns valid JSON with `units`, `national`, `overrides`; `curl -s "localhost:3000/api/fair-price-index/data?format=csv" | head -5` returns the CSV header + rows.

**Branch A — real promotions exist in prod (founder data track ran):** dev against prod DB shows the "Verified local prices" section on `/funeral-costs/salt-lake-city` with per-item badges + n + the count line, and Salt Lake City listed under "Verified metros" on `/fair-price-index` linking back to the city page; the `overrides` array in the data endpoint carries the rows. Then the no-deploy beat: founder promotes ONE more real group (real data, n≥5 — never a fabricated row) via `/admin/benchmarks` against a locally running `next build && next start`, and the city page shows it on next load without rebuild. Verify rendered DOM spacing around every inline `{expr}`.

**Branch B — no real promotions yet (the Day-2 precedent: write-free static proof):** (1) all Task-6 unit pins green, including the promote-route revalidate-list pin; (2) live zero-override identity — dev against prod DB renders `/funeral-costs/salt-lake-city` and `/fair-price-index` **visually identical to production today** (no verified section, no verified-metros section, disclaimer unchanged); (3) the data endpoint returns national ranges + empty `overrides`. **NEVER seed a row into prod `regional_benchmarks` to "prove" the render** — that publishes an unverified number to the public site (guardrail #4 violation); the override-render path is proven by the unit pins and mocked-store tests only. The live-SLC beat joins the §2 demo whenever the founder data track lands.

Then: PR (state the consent-seam sentence and which gate branch ran, with evidence); **no merge without founder go.**

### Cut lines (in drop order)

1. CSV format → JSON only (drop `?format=csv`, keep the JSON endpoint + both JSON-LD/cite-this pointers pointing at JSON only).
2. Cite-this block styling → a plain paragraph is fine; the URLs + date must survive.
3. Verified-metros linking → plain-text metro names (keep the section itself — it's the payoff surface).

**Never cut:** the ISR `revalidate` on both pages (the whole point of the day), the verified-metros section, the zero-override identity pin, badge-honesty anywhere.

### Founder actions

- **None required before or during the build.** No migration today; nothing to apply.
- **Optional, unlocks gate Branch A + the demo beat:** run the data track — ingest Utah GPLs via `/admin/ingest-gpl`, promote SLC metro×item groups that cross n≥5 on `/admin/benchmarks`. Whenever this lands (today or later), the pages pick it up within the hour with no deploy — that's the beat to show in the §2 demo.
- Merge decision on the PR.

### Kickoff prompt (paste to open the session)

```text
Standard model (no ultracode) — but keep the discipline: copy/schema fan-outs first, adversarial multi-lens diff review before the gate. git fetch and branch off current origin/main (fresh worktree; copy /Users/ryancurrie/FH/.env.local in and npm install). Read CLAUDE.md and docs/SPRINT_DAYS_5-9_BUILDSHEETS.md §DAY 7 — execute Day 7 only, exactly as specced: ISR city pages reading regional_benchmarks + the citable Fair-Price Index (verified-metros, cite-this, JSON/CSV data endpoint). Copy/schema fan-outs first, mechanical wiring after, adversarial multi-lens diff review (badge-honesty, cents-vs-dollars, consent-seam, zero-override identity, data-leakage) before the gate. Badge-honesty is the law of the day: verified/community labels only beside numbers that came from the store, and zero overrides must render byte-identical to today. Ask me first whether my GPL/promotion data track has run — that decides gate Branch A (live SLC proof) vs Branch B (write-free dev-data proof + unit pins); never seed prod regional_benchmarks to fake Branch A. No migration today. Day gate before done; PR; no merge without my go.
```

---

## DAY 8 — Migration B + institutional billing (Stripe, test mode, structurally family-invisible)

*Successor to old §DAY 6 (`docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md` lines 526–603). Standard model is fine for the wiring; the fan-outs below are small but mandatory. This is a **guardrail-critical** day: consumer payment is decommissioned law (CLAUDE.md guardrail #2 — "Never charge the grieving family"; guardrail #1 — "Never take money from funeral homes or from an insurer as our payer"). Zero family surface may import the Stripe client, ever, and the day's tests pin that structurally.*

### Objective

A hospice owner can subscribe in-product, in Stripe **test mode**, end-to-end — checkout → webhook → `billing_status='active'` → visible in the portal Billing card and the admin partners table — while families remain structurally unable to ever encounter it: the Stripe client factory is invocable only under `app/api/stripe/`, insurers are 403'd by type, and the whole surface sits behind `BILLING_LIVE` (off in prod).

### Preconditions

- Fresh worktree off **current `origin/main`** (`git fetch` first — Days 5–7 PRs may have merged since this sheet was written). Copy `/Users/ryancurrie/FH/.env.local` into the worktree (worktrees don't inherit it) and `npm install`.
- Branch for the day, e.g. `claude/day-8-institutional-billing-<slug>`. PR at end; **no merge without founder go**.
- `stripe@^17.5.0` is already in `package.json`; `lib/stripe.ts` already exports the lazy factory `stripe()` (throws without `STRIPE_SECRET_KEY`), `stripeAvailable`, and `fmtCents`. `fmtCents` is legitimately imported on family surfaces (negotiate pages, `/funeral-homes/[zip]`, dashboard) — the scope pin targets the **factory**, not the module.
- Founder must have Stripe **test-mode** keys available today (see Founder actions — pricing decision #1 is due). Dev gate needs the Stripe CLI (`brew install stripe/stripe-cli/stripe`) for webhook forwarding.
- Kill-switch posture unchanged: `OUTREACH_LIVE`, `PARTNER_DIGEST_ENABLED` stay off. `BILLING_LIVE` is the NEW switch this day introduces — it is set `true` only in dev/preview for the gate, **never in production this sprint**.
- Repo facts re-verified 2026-07-26 @ b19983a (correct silently if drifted again): `lib/env.ts:31` = the `FEATURES.stripe` scaffold; `lib/partner/auth.ts:167` = `requirePartnerApi(minRole?: "owner")` returning `PortalContext | NextResponse` (partner carries `partner_type: "hospice" | "employer" | "insurer"`); `lib/rate-limit.ts:20` = `RATE_LIMITS` (enforced in `proxy.ts` by exact pathname); `lib/http-guards.ts` exports `readLimitedText` / `readLimitedJson`; house route style = `app/api/portal/settings/route.ts` (in-route `rateLimit()` + `readLimitedJson` + `requirePartnerApi("owner")`); house mock style = `lib/partner/__tests__/auth.test.ts` (vi.mock env/supabase/getUser + queue-based `scriptSvc` fake).

### Orchestration (fan-outs FIRST, wiring after)

1. **Copy fan-out (small):** 2–3 independent proposals for the Billing card's three states (below) + judge. Criteria: quiet-friend tone; **no hardcoded dollar amount anywhere** (the number lives in Stripe and decision #1 may change — checkout displays it); no word-ban hits (`featured|recommended|sponsor` any form); no present-tense adoption claims; never implies a family could pay anything.
2. **Adversarial contract review BEFORE wiring:** one agent attacks the three route contracts below with the lenses: guardrail #1 (can an insurer ever reach checkout?), guardrail #2 (can any family flow reach these routes or see this UI?), webhook forgery (what if signature verification is skipped/bypassed?), replay/ordering (subscription.updated arriving after .deleted), and the check-constraint trap (webhook writing a `billing_status` value the DB rejects). Fix the spec before writing code.
3. Mechanical wiring (Tasks 1–6).
4. **Adversarial multi-lens diff review before the gate** (security / guardrails / copy / test-honesty lenses) — this caught real bugs on every prior day; non-optional.

### Tasks

**1. Migration B — `supabase/migrations/<APPLY-DATE>-partner-billing.sql`.** Name the file for the REAL apply day (e.g. `2026-07-28-partner-billing.sql` if Day 8 runs that Monday — anything sorting after `2026-07-20` is safe for BOOTSTRAP ordering) and keep the VERIFY block's date comment in sync with the filename.

```sql
-- Migration B (sprint Day 8): institutional billing columns on partners.
-- INSTITUTIONAL BILLING ONLY. Families are never charged (Operating Plan
-- guardrail #2 — the consumer payment is decommissioned); insurers are never
-- payers (guardrail #1). No family-facing table ever references these columns.
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor. Idempotent.

alter table public.partners
  add column if not exists stripe_customer_id text,
  add column if not exists billing_status text not null default 'none'
    check (billing_status in ('none','active','past_due','canceled')),
  add column if not exists billing_plan text,
  add column if not exists billing_started_at timestamptz;
```

Add `comment on column` lines for all four (stripe_customer_id = "Stripe customer id, test-mode until BILLING_LIVE ships to prod"; billing_plan = "Stripe price id of the active subscription"; etc. — match the comment style of `2026-07-20-hospices-consent.sql`).

- **Bootstrap regen is required** (the script header says so): `node scripts/build-bootstrap-sql.mjs` and commit the regenerated `supabase/BOOTSTRAP.sql`.
- **`supabase/VERIFY.sql`:** append the house expect-N block (match the existing `-- Confirm the 2026-07-20 …` blocks exactly; use the migration's real filename date in the comment):

```sql
-- Confirm the <apply-date> partner-billing migration landed (expect 4 rows):
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'partners'
  and column_name in ('stripe_customer_id','billing_status','billing_plan','billing_started_at')
order by column_name;
```

*Trap:* `partners` is RLS deny-all with zero policies — the migration adds columns only; do NOT add policies or grants.

**2. Env contract** (`lib/env.ts` + `docs/PROD_SETUP.md`):

- Existing: `FEATURES.stripe = () => hasServer("STRIPE_SECRET_KEY")` (line 31). NEW envs: `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PILOT`, `BILLING_LIVE`.
- Add `FEATURES.billing = () => hasServer("STRIPE_SECRET_KEY") && hasServer("STRIPE_PRICE_PILOT")` (checkout-capable) — the UI's "configured" signal is `FEATURES.billing() && process.env.BILLING_LIVE === "true"`.
- **Read `BILLING_LIVE` via `process.env` at request time inside handlers, never a module-top-level const** — the guardrail tests stub it with `vi.stubEnv` and a frozen const would make the 409 pin pass vacuously or fail.
- `requireServer()` calls only inside request handlers, never at module scope: **ALL envs absent → nothing throws anywhere** — the Billing card renders the "invoicing by arrangement" state, routes return 409/503, build stays green with an empty env.
- Do NOT add the Stripe vars to `LIVE_REQUIRED_VARS` — the comment block at `lib/env.ts:60-70` documents that decoupling deliberately; `docs/PROD_SETUP.md` (~line 87) already explains it. Add the three new vars to PROD_SETUP.md's env table as optional/billing-scoped with one line each.

**3. Routes — all three under `app/api/stripe/` (this exact directory; the fs-scan pin keys on it):**

- **`app/api/stripe/checkout/route.ts`** — POST. Order of gates (pin-relevant):
  1. `const gate = await requirePartnerApi("owner"); if (gate instanceof NextResponse) return gate;`
  2. `if (gate.partner.partner_type === "insurer") return NextResponse.json({ error: "unavailable" }, { status: 403 });` — guardrail #1, **checked BEFORE the flag** so the pin holds even with `BILLING_LIVE=true`.
  3. `if (process.env.BILLING_LIVE !== "true") return … 409`.
  4. `if (!FEATURES.billing()) return … 503`.
  5. In-route rate limit per house pattern (`rateLimit(\`stripe-checkout:${gate.partner.id}\`, { limit: 10, windowMs: 60 * 60_000 })` → 429). No body is read (no client-supplied fields — partner comes from the session gate only).
  6. Get-or-create customer: read `partners.stripe_customer_id` via service role; if null, `stripe().customers.create({ email: partner.contact_email ?? undefined, name: partner.name, metadata: { partner_id: partner.id } })` and persist the id via service-role `.update().eq("id", partner.id)` before creating the session.
  7. `stripe().checkout.sessions.create({ mode: "subscription", customer, line_items: [{ price: requireServer("STRIPE_PRICE_PILOT"), quantity: 1 }], success_url: \`${PUBLIC.appUrl}/portal/settings?billing=success\`, cancel_url: \`${PUBLIC.appUrl}/portal/settings\`, metadata: { partner_id: partner.id }, client_reference_id: partner.id, subscription_data: { metadata: { partner_id: partner.id } } })` → `NextResponse.json({ url: session.url })`. The `subscription_data.metadata` line is load-bearing: subscription.updated/.deleted events don't carry the session's metadata.
- **`app/api/stripe/webhook/route.ts`** — POST. **RAW BODY**: `readLimitedText(req, 512)` then `stripe().webhooks.constructEvent(body, req.headers.get("stripe-signature") ?? "", requireServer("STRIPE_WEBHOOK_SECRET"))` in try/catch → 400 on failure. **NEVER `readLimitedJson`** — parsing destroys the exact bytes the signature covers. If `!hasServer("STRIPE_WEBHOOK_SECRET")` → 503 before reading anything. Do NOT `validateOrigin` (Stripe posts server-to-server, no Origin header). NOT gated by `BILLING_LIVE` (a flag flip must never desync billing state; the signature is the auth). Handle:
  - `checkout.session.completed` → resolve partner by `session.metadata.partner_id ?? session.client_reference_id`; service-role update: `billing_status='active'`, `billing_started_at = now()` **only if currently null**, and backfill `stripe_customer_id` if null.
  - `customer.subscription.updated` → resolve by `sub.metadata.partner_id`, fallback lookup by `stripe_customer_id = sub.customer`; map status with an explicit function: `active|trialing → 'active'`; `past_due|unpaid|incomplete|incomplete_expired → 'past_due'`; `canceled → 'canceled'`; **anything else → no write** (the DB check constraint rejects unknown values — an unmapped write would 500 and churn Stripe retries forever). Also set `billing_plan = sub.items.data[0]?.price?.id ?? null`.
  - `customer.subscription.deleted` → same resolution → `billing_status='canceled'`.
  - Unknown event types and unresolvable partners → **200 ignore**. Return 200 fast in all handled paths.
  - The webhook writes **ONLY the four billing columns on `partners`** — never family data, never any other table. State this in a comment.
  - **No `RATE_LIMITS` entry for `/api/stripe/webhook`** — `proxy.ts` keys on exact pathname, and throttling Stripe's own retries drops events. Write that as a comment IN the route file so a future rate-limit sweep doesn't "fix" it.
- **`app/api/stripe/portal-link/route.ts`** — POST, same gate order as checkout (owner → insurer 403 → flag 409 → configured 503); requires `stripe_customer_id` (else 409); `stripe().billingPortal.sessions.create({ customer, return_url: \`${PUBLIC.appUrl}/portal/settings\` })` → `{ url }`. **This route + its UI button = the FIRST cut line** — if the day runs long, ship checkout + webhook and drop this cleanly.

*Traps:* Node runtime only (no `export const runtime = "edge"` anywhere — the SDK and raw-body flow assume Node; App Router default is fine, just don't add the line). Don't pin `apiVersion` in a second `new Stripe(…)` — there must be **zero** `new Stripe(` outside `lib/stripe.ts`; reuse the factory.

**4. UI (two surfaces, both behind existing owner/admin gates — no new nav, no family-visible pixel):**

- **`/portal/settings` Billing card.** `app/portal/settings/page.tsx` already fetches `contact_name` via a service-role try/catch — add a **separate** try/catch query for `billing_status, billing_plan, billing_started_at` (separate because pre-migration prod lacks the columns; one merged select would error and blank contact_name too; on error treat as unconfigured). New client component `components/partner/BillingCard.tsx` (**mandatory path — the acceptance-gate word-ban grep keys on it**), rendered from `SettingsClient` after the Quick link card, matching the existing `Card`/`CardTitle` structure (`components/ui/Card.tsx`), props: `{ configured: boolean; billingStatus: string | null; billingStartedAt: string | null }` where `configured` is computed **server-side** (`FEATURES.billing() && process.env.BILLING_LIVE === "true"`) — never ship env logic to the client. Three states (copy law; refine via fan-out but keep the meaning and the constraints exactly):
  - `configured === false` → heading **Billing**, body: *"Your organization is invoiced by arrangement. There's nothing to set up on this page — questions go to your usual contact."* No button.
  - configured, status `none`/null/`canceled` → body: *"Start the pilot subscription for your organization. You'll review the amount on the secure checkout page before anything is charged."* Button **Start the pilot subscription** → POST `/api/stripe/checkout` → `window.location.assign(url)`; render the API's 409/403 as a quiet inline sentence, never a thrown error. If `canceled`, prepend a one-line *"Your previous subscription ended."*
  - configured, status `active` (or `past_due`) → status chip (**Active** / **Past due**) + since-date from `billingStartedAt` + **Manage billing** button → POST `/api/stripe/portal-link` → redirect. (Manage billing rides the portal-link cut line.)
  - **Post-checkout interim state:** when the URL carries `billing=success` and `billingStatus` is not yet `active` (the redirect usually beats the webhook), render a quiet interim line — *"Checkout complete. Your subscription is being confirmed and will appear here shortly."* — instead of the start button (client-side read of `window.location.search` in BillingCard is fine; no polling required this sprint).
  - Card-level comment: families never see this — the page is `requirePartnerMember("/portal/settings", "owner")`-gated; the card must never be extracted to a shared component.
- **`/admin/partners` billing column.** `app/admin/partners/PartnersClient.tsx` **changed on Day 4** (leads badges, `source: "family_nomination"` handling) and again on Day 6 (`hospice_claim` badge) — read the current file before touching it. Add optional `billing_status?: string | null` to `PartnerRow`; in `app/admin/partners/page.tsx` fetch `id, billing_status` in a **separate** try/catch query and merge by id (same pre-migration-safety reason as above; the existing select at page.tsx:39 stays untouched). Render a small "Billing" cell/chip in the active-partners table: `active` / `past due` / `—` (for none/undefined). Display only — no admin mutation of billing state this sprint.

*Traps:* JSX prose in the new card — the Next 16.2.4/Turbopack compiler eats the space after inline `{expr}` mid-sentence; use explicit `{" "}` and verify the **rendered DOM**. Brand: any copy needing the product name reads `BRAND` from `lib/brand.ts`, never the literal (any future rename must stay a one-file flip).

**5. Guardrail pins — new `lib/__tests__/billing-guardrails.test.ts`:**

- **(a) fs-scan scope pin:** walk `app/`, `components/`, `lib/` (walk with fs + path, skipping only `node_modules` and `.next` — `__tests__` files ARE in scope, so no test file may ever contain a static `import { stripe } from '@/lib/stripe'`: capture the mock via vi.hoisted instead — `const { stripeMock } = vi.hoisted(() => ({ stripeMock: vi.fn() })); vi.mock('@/lib/stripe', () => ({ stripe: stripeMock, stripeAvailable: () => true, fmtCents: (c: number) => String(c) }));` — and assert on `stripeMock`. If the scan or the gate grep ever flags a test file, fix the test to this pattern; never exclude the file.) Asserting: (1) every file matching `/import\s*\{[^}]*\bstripe\b[^}]*\}\s*from\s*["']@\/lib\/stripe["']/` lives under `app/api/stripe/`; (2) `new Stripe(` appears nowhere outside `lib/stripe.ts`. `fmtCents`/`stripeAvailable` imports elsewhere are fine and expected (they exist today on family surfaces) — the regex must key on the **`stripe` named specifier**, not the module path alone. This is the structural "family-invisible" guarantee; write a comment saying exactly that, citing guardrail #2.
- **(b) insurer 403 pin:** route test for `app/api/stripe/checkout/route.ts` — mock `@/lib/partner/auth` to resolve a `PortalContext` whose partner has `partner_type: "insurer"`, `vi.stubEnv("BILLING_LIVE", "true")`, mock `@/lib/stripe` (via the vi.hoisted pattern above) and `@supabase/supabase-js`; expect 403 **even with the flag on**. Cites guardrail #1.
- **(c) flag pin:** same harness, `partner_type: "hospice"`, `BILLING_LIVE` unset → expect 409, and assert the mocked `stripe()` factory (`stripeMock`) was **never called**.
- Follow the house mock pattern from `lib/partner/__tests__/auth.test.ts` (vi.mock `@/lib/env`, `@/lib/supabase/server`, `@supabase/supabase-js`; queue-based `scriptSvc` fake) — read it first. Nice-to-have if time permits (not gate-blocking): webhook bad-signature → 400 test with `constructEvent` mocked to throw.

**6. Docs-of-day:** PROD_SETUP.md env rows (task 2); one paragraph in the PR body: what Migration B adds, the three routes, the flag posture (`BILLING_LIVE` off in prod), and the founder runbook (below) verbatim.

### Acceptance gate

Static (all must pass, in the worktree):

```bash
npm run typecheck && npm run lint && npm run build && npx vitest run
# Stripe factory scope — expect ZERO lines (imports of the `stripe` factory outside app/api/stripe/):
grep -rn 'from "@/lib/stripe"' app components lib --include='*.ts' --include='*.tsx' | grep -v '^app/api/stripe/' | grep -v '^lib/stripe.ts' | grep -E 'import\s*\{[^}]*\bstripe\b'
grep -rn "new Stripe(" app components lib --include='*.ts' --include='*.tsx' | grep -v '^lib/stripe.ts'   # expect zero
# Word-ban on the new partner-surface copy — expect zero in rendered strings:
grep -rniE "featured|recommended|sponsor" components/partner/BillingCard.tsx app/portal/settings app/admin/partners
# No RATE_LIMITS entry for the webhook — expect zero:
grep -n "stripe/webhook" lib/rate-limit.ts
```

Live (dev, with founder's test-mode keys in `.env.local` + `BILLING_LIVE=true` + Migration B applied):

1. `stripe listen --forward-to localhost:3000/api/stripe/webhook` (paste its `whsec_…` into `STRIPE_WEBHOOK_SECRET`, restart dev).
2. Portal owner → `/portal/settings` → Start the pilot subscription → Stripe-hosted page → card `4242 4242 4242 4242` → redirected back with `?billing=success` (the interim "being confirmed" line renders until the webhook lands).
3. Stripe CLI shows `checkout.session.completed` → 200; SQL editor (or dev DB) shows the partner's `billing_status='active'`, `stripe_customer_id` set, `billing_started_at` stamped.
4. Billing card shows **Active**; `/admin/partners` shows the billing chip.
5. Trigger `customer.subscription.deleted` (cancel in the Stripe test dashboard or `stripe trigger`) → `billing_status='canceled'` → card returns to the start state with the "previous subscription ended" line.
6. Unset `BILLING_LIVE`, restart → Billing card shows the arrangement copy; POST to checkout returns 409. Insurer + flag pins green in vitest.
7. Adversarial multi-lens diff review completed and its findings fixed **before** this gate ran.

### Cut lines (in drop order)

1. **`portal-link` route + Manage billing button** → next sprint (checkout + webhook are the spine; a test-mode subscription can be managed from the Stripe dashboard).
2. Admin billing chip (the founder can read `billing_status` in the SQL editor).
3. The `canceled`-state nuance copy (fold into the plain start state).

**Never cut:** webhook signature verification · insurer exclusion (guardrail #1 pin) · the `BILLING_LIVE` gate · the fs-scan scope pin (guardrail #2, structural).

### Founder actions (two blocks, both on Day 8 itself — the former block C is gone)

**A. Migration B (morning, before the live gate):** run `supabase/migrations/<apply-date>-partner-billing.sql` in the **bhadjv** SQL editor, then the new VERIFY block (expect 4 rows).

**B. Stripe + pricing decision #1 (due today):** read Business Plan v2.0 §7.3 first — it lives on OPEN PR #167 (branch `claude/honest-funeral-business-plan-4eb258`), not yet on main; read it from the PR diff or merge #167 first. Restated here so the decision isn't blocked: recommended census tiers **$4,800 / $9,600 / $18,000 per year** (pilot $0, founding-partner −20%, per-family $60 fallback). In Stripe **TEST MODE**: create one product named with the locked channel-survival framing — **"Bereavement support program — pilot subscription"** (D1 locks invoice-line copy as "bereavement support program" per `docs/PRODUCT_SPRINT_2026-07-16.md` §3 D1; the name shows on checkout and invoices, and staying brand-neutral also keeps it safe under any future rename) — with one **monthly** recurring price at your chosen tier ÷ 12 (e.g. smallest tier → $400/mo). Put `STRIPE_SECRET_KEY` (test `sk_test_…`), `STRIPE_PRICE_PILOT` (the `price_…` id), `STRIPE_WEBHOOK_SECRET`, and `BILLING_LIVE=true` into Vercel **Preview env only** (production gets none of these this sprint), and into your dev `.env.local` for the gate. Click the test checkout yourself on the preview deploy. The session will walk you through the Stripe CLI forward for the webhook half.

**C. ~~Rename-Day DNS pre-staging~~ REMOVED (2026-07-27).** The rename is ON HOLD —
the founder is reconsidering the name. Do not stage openfarewell DNS, Workspace, or
Resend records, and do not chase counsel's TESS unless the founder asks. (The old
block's steps live in git history and §RENAME DAY if ever needed again.)

### Kickoff prompt (paste to open the session)

```text
ultracode. git fetch and branch off current origin/main in a fresh worktree (copy /Users/ryancurrie/FH/.env.local in, npm install). Read CLAUDE.md and docs/SPRINT_DAYS_5-9_BUILDSHEETS.md §DAY 8 — execute Day 8 only, exactly as specced: Migration B + the three app/api/stripe routes + Billing card + admin chip + guardrail pins. Fan-outs first (Billing-card copy proposals → judge; adversarial contract review of the routes BEFORE wiring), mechanical wiring after, adversarial multi-lens diff review before the gate. This is guardrail-critical: no family surface may import the Stripe factory, insurers 403, everything behind BILLING_LIVE — the pins in lib/__tests__/billing-guardrails.test.ts are law, and BILLING_LIVE never goes into production env. I'll apply Migration B in the bhadjv SQL editor and set up the Stripe test-mode product this morning (pricing decision #1 — I'll read Business Plan v2.0 §7.3 from open PR #167, or merge #167 first, since §7.3 isn't on main yet); walk me through the Stripe CLI webhook forward for the live half of the gate. Day gate (static greps + end-to-end test-mode subscription) before done; PR; no merge without my go.
```

---

## DAY 9 — QA + docs truth (rename-clearance lanes REMOVED — rename on hold)

**Source lineage:** successor to old `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md` §DAY 8 (the QA/truth day) — this section supersedes it. QA scope = the sprint doc's §5 checklist + §2 demo (`docs/PRODUCT_SPRINT_2026-07-16.md`).

**Objective:** every line of the sprint's §5 QA passes on production with command-level evidence (a ✓, a filed fix, or an N/A-with-reason — never a vibe); the strategy docs stop lying about what's shipped; and the §2 demo is recorded on prod. *(The former rename-clearance objective is REMOVED — rename on hold per the top-of-file banner. The docs-truth lane should also sweep stale "Rename Day" scheduling claims in the strategy docs to "on hold".)*

**Executor context:** line numbers below were verified at `origin/main` @ `b19983a` (Days 1–4 merged). Days 5–8 artifacts (delivery kit, hospice pages, city-page ISR, billing) are referenced by contract from their buildsheets — they should be on main by this morning. This sheet lives in `docs/SPRINT_DAYS_5-9_BUILDSHEETS.md`, which lands on main with the sprint-replan docs PR — if it is somehow absent from your worktree, stop and tell the founder rather than falling back to the older §DAY 8 sheet in `docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md` (this sheet supersedes it). **Scout first:** confirm each referenced artifact exists; if a prior day cut something, mark its QA lines N/A-with-reason (cite the cut), never silently skip and never build the missing thing today. This is a QA day: copy/meta/doc fixes land today; anything structural gets FILED (a GitHub issue or PR-body list), not built.

### Preconditions (verify before starting; stop and tell the founder if any fail)
1. Days 5–8 PRs merged to `origin/main` (founder merges any stragglers first, or names which stay open — QA then runs against main and notes the gap).
2. Prod migrations applied: all pre-sprint migrations through `2026-07-17-regional-benchmarks` + Migration A (`2026-07-20-hospices-consent.sql` — applied at the Day-4 morning gate; hospice search verified live in prod) + Migration B (the partner-billing migration, filename dated for its actual apply day per §DAY 8 Task 1, founder-applied on Day 8). VERIFY.sql is the authoritative check.
3. Stripe **test-mode** keys + `STRIPE_PRICE_PILOT` in Vercel **preview** env only (Day 8 founder action) — needed for the billing demo beat. `BILLING_LIVE` absent from production.
4. ~~Rename DNS pre-staging / TESS~~ removed 2026-07-27 — rename on hold; nothing to verify.
5. Founder available ~1–2h: VERIFY.sql, Vercel env eyeball, console checks, demo recording.
6. Mechanics: fresh worktree off current `origin/main`; **copy `/Users/ryancurrie/FH/.env.local` in** (worktrees don't inherit it) and `npm install`. Branch `claude/day-9-qa-truth`. One branch, one PR (the former second rename branch is removed).

### Ultracode orchestration
Scout pass first (one agent): confirm Days 5–8 artifacts on main; re-verify every file:line in this sheet against today's HEAD (they drift — correct silently). Then **four parallel lanes**:
- **Lane A — QA evidence squad:** one agent per §5 category (7 agents), each running the exact commands in Task 1 and returning a `command → output → verdict` row set. No agent may mark ✓ without pasted output.
- **Lane B — docs truth:** one agent per doc (ROADMAP, ENGINEERING_BACKLOG, GO_TO_MARKET, AI_STRATEGY, sprint docs), each diffing the doc's claims against the tree and proposing minimal truth edits.
- ~~Lane C — Rename-Day PR prep~~ removed (rename on hold).
- **Lane D — DEMO_SCRIPT copy fan-out:** 2–3 independent placement/copy proposals for the new beats → judge → adversarial channel-survival + word-ban + CAHPS-rule review (this doc is spoken sales copy; the ban applies to it).
Then apply trivial fixes, then the **adversarial multi-lens diff review** (lenses: guardrails, channel-survival, word-ban/CAHPS, docs-accuracy, JSX-space trap) **before** the gate — this caught real bugs on every one of Days 1–8.

### Tasks

**1. The §5 QA checklist — every line a command.** Evidence table goes in the Day-9 PR body.

**1.1 Mechanical**
- `npm run typecheck && npm run lint && npm run build && npx vitest run` — all green; test count ≥ 570 (the b19983a count; Days 5–8 only add). Any `.skip` found = a filed fix.
- Founder pastes `supabase/VERIFY.sql` into the **bhadjv** SQL editor — every expect block green (now includes Migration A + B blocks).
- `npm run smoke:check` against prod.

**1.2 Money guardrails**
- Stripe client scope: `grep -rn "stripe()" app lib components --include="*.ts" --include="*.tsx" | grep -v "app/api/stripe/" | grep -v "lib/stripe.ts" | grep -v __tests__` → **0 lines**. TRAP: `fmtCents` imports from `lib/stripe` on family surfaces are ALLOWED — it's a currency formatter; the ban is the `stripe()` client factory. (7 known at b19983a: the three negotiate pages — status/results/compare, `funeral-homes/[zip]`, quote-notifications cron, CoordinatorCheck, dashboard FuneralHomeOutreachCard — plus anything Days 5–8 added. Any import that pulls ONLY `fmtCents` is allowed wherever it appears; the ban is solely the `stripe()` client factory.)
- Day-8 pins: `npx vitest run lib/__tests__/billing-guardrails.test.ts` (fs-scan, insurer 403, `BILLING_LIVE`-unset 409).
- No family surface renders billing UI: `grep -rln "api/stripe\|BILLING_LIVE\|billing_status" app components | grep -vE "app/(api/stripe|portal|admin)/" | grep -v __tests__ | grep -v "app/paywall/page.tsx"` → 0. Documented allowlist: `app/paywall/page.tsx:10` is a comment-only historical reference inside the decommissioned-paywall tombstone (the page only `redirect()`s to `/how-it-works` — no rendered billing UI); disposition it in the evidence table, don't fix it.
- Founder eyeballs Vercel **production** env: `BILLING_LIVE` absent; Stripe test keys in preview only.

**1.3 Anti-steering + word bans**
- Attribution never read at the choice seam: `grep -n "partner_id\|referral\|ref_code\|attribution" lib/negotiation/directory.ts app/api/negotiate/choose/route.ts` → **0 hits** (verified 0 @ b19983a; must stay 0 — guardrail #3, "Never steer a family to a specific home").
- Word-ban grep (partner/directory/hospice surfaces):
  `grep -rniE "featured|recommend|sponsor" app/page.tsx app/faq app/partners app/employers app/partner app/portal app/tell-your-hospice app/hospices components/HospiceFinder.tsx components/PartnerCtaLink.tsx components/ShareThisPage.tsx components/partner components/ReferralCoBrand.tsx`
  **Documented allowlist (Day 4) — match by CONTENT, line numbers drift:** (a) `app/page.tsx` FAQ anchor href `/faq#why-did-my-hospice-or-employer-recommend-honest-funeral`; (b) `app/faq/page.tsx` question "Why did my hospice or employer recommend Honest Funeral?" (institution→platform direction — allowed); (c) `components/partner/ProofSheet.tsx` "the family who recommends" line (family→hospice). Any OTHER hit = a finding; the banned direction is the PLATFORM featuring/recommending/sponsoring a home or hospice. Days 5–8 may have added hits — the adversarial lens judges direction, then either allowlists (documented in the PR body) or fixes.
- Employer surfaces Medicare-free: `grep -rniE "medicare|cahps|\bcms\b" app/employers` → 0; `npx vitest run lib/__tests__/partner-report-digest.test.ts` (pins "Never mention CMS, CAHPS" for both digest audiences).
- **KNOWN FINDING — fix today (founder approves the reword in the PR):** `app/partners/page.tsx` (~line 192 @ b19983a, pre-dates the sprint; deferred out of scope on Day 6 — today is its fix day) says the CAHPS Emotional & Spiritual Support composite "risks your Medicare Annual Payment Update" — that is CAHPS-as-money, violating the never-pitch-CAHPS rule (the demo script's own note: reputation/scores, never reimbursement; scores are already ~91% — there is nothing to "repair"). Reword the bullet to reputation-only framing or cut it. Site-wide audit: `grep -rni "cahps" app components lib | grep -v __tests__` — every rendered-copy hit must frame reputation, never payment.
- Hospice-surface judgment read (adversarial lens, not grep): 3 state pages + 2 facility pages read for pre-admission benefit framing or current-patient-family targeting → none ("families they serve," never "choose this hospice" — channel-survival law).
- No present-tense adoption claims: grep new copy for `"offers this\|is offering\|partners with us"` — capability phrasing only until a partner is live. **Documented allowlist (Day 4, reviewed):** `HospiceFinder.tsx` ~146 (conditional "If … already offers this") and `ProofSheet.tsx` ~463/475 (the co-brand line on a partner's own report surface). The ban targets UNCONDITIONAL public claims that a named institution has adopted the platform; conditional phrasing and partner-scoped surfaces pass.

**1.4 Data honesty**
- Consent filter at the seam: `npx vitest run lib/__tests__/benchmark-sources.test.ts` — the proof is `fetchBenchmarkRecords contribute consent → "excludes contributed=false; keeps true, NULL, and pre-migration rows"` (line 79–103 @ b19983a; same file also pins staff-exclusion and the founder-ingest dedupe scope). Cite it by name in the evidence table.
- Badge honesty: `grep -rn "DataTierBadge" app components | grep -v __tests__` → Lane-A agent audits every usage traces to a `benchmarksForZip`/store read; no verified/community label beside a number that never consulted the store.
- Eval baseline committed: `ls test/evals/gpl/*.expected.json` non-empty; run `npm run eval:analyzer` (tagged `feature:"eval"`, cheap) and record the aggregate.

**1.5 Kill switches**
- `npx vitest run lib/negotiation/__tests__/send.test.ts` — `OUTREACH_LIVE !== "true"` → `dry_run` rows; confirm the gate at `lib/negotiation/send.ts:31` is unchanged and remains the ONLY send path to homes.
- Digest: `curl -s https://honestfuneral.co/api/cron/partner-digest` → 401 (bearer required); founder runs it with `CRON_SECRET` → `{"disabled":true,...}` (gate at `app/api/cron/partner-digest/route.ts:31` — line drifts after Day 5; locate by grep).
- `BILLING_LIVE` off in prod → sign in to the demo partner portal, `/portal/settings` Billing card renders the "invoicing by arrangement" copy.
- Founder eyeballs Vercel prod env: `OUTREACH_LIVE`, `OUTREACH_NOTIFICATIONS_ENABLED`, `PARTNER_DIGEST_ENABLED`, `BILLING_LIVE` all unset/false. Screenshot in the PR body.

**1.6 Privacy / RLS**
- `hospices` deny-all (SQL editor): `select count(*) from pg_policies where tablename='hospices';` → 0 AND `select relrowsecurity from pg_class where relname='hospices';` → true (design comment: `supabase/migrations/2026-07-20-hospices-consent.sql:34`).
- Anon probe: `curl -s "https://<bhadjv-ref>.supabase.co/rest/v1/hospices?select=ccn&limit=1" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"` → `[]`, never a row (ref + key from `.env.local`).
- Webhook column scope: read `app/api/stripe/webhook/route.ts` — updates touch ONLY `stripe_customer_id`/`billing_status`/`billing_plan`/`billing_started_at`; the Day-8 pin covers it; paste the update payload in evidence.
- No new family-PII path in Days 5–8: adversarial lens walks `git log --stat b19983a..HEAD` for new tables/columns/payloads carrying family data → none; portal payloads aggregate-only (`npx vitest run lib/__tests__/partner-report.test.ts`); no flow added where a hospice transmits family data (channel-survival: the hospice transmits nothing).

**1.7 SEO / perf smoke** — TRAP: always cache-bust prod probes (`?qa=$(date +%s)`) — the edge caches stale/404 (documented gotcha).
- Sitemap: `curl -s "https://honestfuneral.co/sitemap.xml?qa=$(date +%s)" | grep -c "/hospices/"` → 51 (50 states + DC, STATE pages only); facility URLs must NOT appear.
- Facility noindex: grab a ccn via `curl -s "https://honestfuneral.co/api/hospices/search?q=salt+lake"`, then `curl -s "https://honestfuneral.co/hospices/utah/<ccn>?qa=1" | grep -io noindex` → hit.
- `/portal` noindex: pinned at `app/portal/layout.tsx:10` (`robots: {index:false, follow:false}`); confirm the rendered meta on prod. Same for `/partner/[code]` (`app/partner/[code]/page.tsx:12`).
- Index dataset: `curl -s "https://honestfuneral.co/api/fair-price-index/data?qa=$(date +%s)"` → valid JSON (ranges + verified rows, no raw observations); `…&format=csv` → a CSV header row. N/A-with-reason if Day 7 exercised its cut line (CSV → JSON only), citing that sheet.
- Lighthouse: `npx lighthouse <url> --only-categories=performance,accessibility,seo --output=json --quiet --chrome-flags="--headless=new"` on `/`, `/funeral-costs/salt-lake-city`, `/hospices/utah`, `/portal`. Record all scores in the PR; a11y < 95 or perf < 75 = filed fix (not a same-day build).

**2. Docs truth pass (D10)** — truth annotations, never strategy rewrites; datestamp each flip "(shipped YYYY-MM-DD, PR #N)"; never delete history. Locations verified @ b19983a (re-verify):
- `docs/ROADMAP.md:23` — "no published **Fair-Price Index** product page; no methodology page" → both live (`/fair-price-index`, `/methodology`); rewrite the Gaps line; annotate the P4 items (lines 67–68) where shipped.
- `docs/ENGINEERING_BACKLOG.md:39` — #1 AI partner digest "agreed, build next" → SHIPPED in two parts: web-report digest PR #128 (pre-sprint); the email AI paragraph Day 5 of this sprint — datestamp both PRs in the annotation. ~line 70 (#2 line-item explain) → SHIPPED; line 113 (inbound parse) → SHIPPED (`app/api/inbound/email/route.ts`).
- `docs/GO_TO_MARKET.md:32` (Phase 0.2 still describes the $49 advocacy + free-email bypass) → decommission complete 2026-06-26 (PR #49/#50); same at line 108; note tombstone redirects are deliberate.
- `docs/AI_STRATEGY.md` §3.3 (line 261 "non-negotiables for day one") → mark all five foundations DONE (the eval harness — Day 1 of this sprint, #158/#160/#161 — completed the set).
- `docs/PRODUCT_SPRINT_2026-07-16.md` §4 table + buildsheet day headers: mark Days 4–9 ✅ with PR numbers.
- **PR #127 disposition:** `gh pr view 127 && gh pr diff 127` (verified 2026-07-26: OPEN since Jul 5, single file `docs/PLAN_OF_ATTACK.md`, title "docs: refresh PLAN_OF_ATTACK.md build-state claims"). Its refresh pre-dates this entire sprint, so its claims are stale AGAIN. Recommend to the founder (likely: close #127 and fold a fresh PLAN_OF_ATTACK truth-pass or "historical" banner into today's docs PR) — **the founder decides; never close or merge it yourself.**

**3. DEMO_SCRIPT.md additions** — the file is **`docs/sales/DEMO_SCRIPT.md`** (NOT `docs/DEMO_SCRIPT.md` — the sprint doc's path is wrong). Read the whole file first; match its SAY/SHOW/TRANSITION voice and pain-first framing. Add via Lane-D fan-out:
- **Nominate beat** (finder → prefilled intro → `family_nomination` lead in `/admin/partners`) — pitch-facing: organic-demand proof ("families are already asking their hospices for this").
- **Billing beat** (test-mode subscribe on `/portal/settings`) — belongs near the pilot ask: "when the pilot converts, the subscription is self-serve; invoicing by arrangement until then."
- **Ingest beat** (the 90-second GPL: `/admin/ingest-gpl` → parsed → verified tier) — a data-credibility beat or the logistics appendix.
- **Delivery beat** if Day 5 shipped the handoff kit (`/portal/materials` print one-pager + QR → family's first screen on a phone).
Copy law in this doc: never CAHPS-as-money (the doc's own Beat-6 note is the rule); no present-tense adoption claims about any named partner; word-ban direction rules apply to spoken lines; brand literals are fine here today (docs/sales gets swept whenever a future rename happens).

**4. The §2 demo, top-to-bottom on prod, recorded.** Founder records; the session drives the checklist (the 10 beats of sprint doc §2, lines 110–150). Amendments:
- Beat 2 (SLC verified badge via ISR): only if the founder data track produced a real promotion; otherwise record the write-free dev-data ISR proof and state on camera that the live-SLC beat joins when data lands (the Day-7 amendment).
- Beat 4 (billing): runs on the **preview deploy in Stripe test mode** (`BILLING_LIVE` stays off in prod — say so in the recording); everything else on prod.
- Beat 5 (digest email): the admin dry-run render (`GET /api/cron/partner-digest?test=<partnerId>` with an admin session, Day-5 artifact); flag stays off.
- Beat 6 (hospice pages + claim): use a real state page; claim writes a `hospice_claim` lead — verify the row appears in the `/admin/partners` leads strip, then note in the PR body that it is a founder test (the leads strip is read-only by design; the founder may delete the row in the SQL editor afterwards).
- Gate = the recording exists and is named/linked in the PR body.

**5. ~~Rename clearance checklist~~ REMOVED (2026-07-27 — rename on hold).** No clearance items to check, no verdict to state; do not probe openfarewell DNS or ask about TESS. (History in git.)

**6. ~~Prepare the Rename-Day code PR~~ REMOVED (2026-07-27 — rename on hold).** Do not create a rename branch or draft PR. When the founder eventually picks a name, the §RENAME DAY reference section + `docs/NAMING_SPRINT_2026-07.md` carry the mechanics (literal-sweep hotspots, 308 host redirect, Postmark-inbound invariant) — they are name-agnostic apart from the domain strings.

### Acceptance gate (run before declaring done)
```
npm run typecheck && npm run lint && npm run build && npx vitest run
```
plus, all of:
- The PR-body evidence table covers **every** §5 line (1.1–1.7 + the demo) with ✓ / filed-fix link / N/A-with-reason — zero blank rows.
- The word-ban grep output pasted with each hit dispositioned against the allowlist; the `/partners` CAHPS-as-money reword is in the diff.
- The demo recording exists and is named in the PR body.
- One PR open: the Day-9 QA+docs PR (mergeable on founder go).
- Adversarial multi-lens diff review ran; findings applied or explicitly rejected in the PR body.

### Cut lines (in drop order)
1. Lighthouse runs → record `/` and `/hospices/utah` only; file the rest.
2. The DEMO_SCRIPT ingest beat → keep nominate + billing (delivery only if Day 5 shipped it).
3. Docs-truth breadth → the four named docs are the floor; sprint-table checkmarks can slip.
4. PR #127 disposition → drops to a one-line recommendation in the PR body.
**Never cut:** the §5 evidence table (every line dispositioned) · the demo recording · the CAHPS-as-money fix.

### Founder actions (today)
1. Morning: merge any unmerged Day 5–8 PRs (or name which stay open).
2. QA hour with the session: run `supabase/VERIFY.sql` in the bhadjv SQL editor; eyeball Vercel prod env (`OUTREACH_LIVE`, `OUTREACH_NOTIFICATIONS_ENABLED`, `PARTNER_DIGEST_ENABLED`, `BILLING_LIVE` all unset); confirm Stripe test keys live in preview only; run the digest curl with `CRON_SECRET`.
3. Record the §2 demo (the session cues each beat; billing beat on the preview deploy).
4. ~~Consoles for clearance~~ removed — rename on hold.
5. Decide: PR #127 close-vs-refresh; approve the `/partners` CAHPS reword.
6. Merge the Day-9 PR on your go.

### Kickoff prompt (paste to open the session)

```text
ultracode. git fetch and branch off current origin/main. Read CLAUDE.md and docs/SPRINT_DAYS_5-9_BUILDSHEETS.md §DAY 9 — execute Day 9 only, exactly as specced. The rename is ON HOLD (top-of-file banner): no rename lanes, no clearance checks, no second branch. Scout first that Days 5–8 actually landed on main, then fan out the three lanes in parallel (§5 QA evidence squad, docs truth — including sweeping stale Rename-Day scheduling claims to "on hold" — and the DEMO_SCRIPT copy fan-out), trivial fixes only today (file anything structural), adversarial multi-lens diff review before the gate. Every §5 line ends in the PR body as ✓ with pasted command output, a filed fix, or an N/A-with-reason — no vibes. Cue me for VERIFY.sql, the Vercel env eyeballs, and the demo recording. Day gate before done; one PR; no merge without my go.
```

---

## RENAME DAY — ⛔ ON HOLD (founder decision 2026-07-27) — kept as name-agnostic reference only

> **DO NOT EXECUTE OR SCHEDULE.** The founder rejected the "Open Farewell" name and is
> waiting. This section survives only as the mechanical playbook for whenever a rename
> DOES happen under a name the founder likes — the literal-sweep hotspots, 308 host
> redirect, Postmark-inbound invariant, and console split-of-labor are name-agnostic;
> swap the domain strings. Everything below reads as written for Open Farewell; treat
> every date and gate in it as void.

**Objective:** by end of day, `https://openfarewell.com` IS the product — every rendered surface, email fallback, OG image, JSON-LD block, sitemap, and print letterhead says Open Farewell; every old-domain page URL 308s to its new-domain twin with path+query preserved; and the one thing that must not blink — Postmark inbound on `reply.honestfuneral.co` (in-flight `advocate+<hash>@` reply-tos) — provably did not blink. Sources reconciled: this section is the execution law; `docs/NAMING_SPRINT_2026-07.md` §5 and old buildsheet §RENAME DAY (lines 715–772) agree with it except where noted inline (⚠ RECONCILE markers) — where you find any further conflict, **flag it to the founder, never guess**.

**Split of labor (structural, non-negotiable):** the session drives the code PR + every verification; the FOUNDER drives every account console (Vercel, Squarespace DNS, Resend, Postmark, Google Workspace, Supabase Auth config, Search Console, Stripe, socials). The session never asks for credentials and never touches a console; it feeds the founder one console step at a time and runs its watch-point check before handing over the next step.

### Preconditions — the hard gate (check FIRST, before branching)
All from Day 9's clearance checklist. **If ANY is red, THIS DAY SLIPS A WEEK before anything else does — say it out loud, file what's red, and stop.**
0. The Days 5–9 buildsheets docs PR is merged — `docs/SPRINT_DAYS_5-9_BUILDSHEETS.md` §RENAME DAY exists on current `origin/main`. If it doesn't, stop and get the docs PR merged (or work from the plan text the founder pastes) before anything else.
1. Counsel's TESS knockout on "Open Farewell" is back **clean** (founder confirms in chat — the only legal gate).
2. Vercel shows `openfarewell.com` DNS-verified (records pre-staged in the Day-8 founder actions in Squarespace; the 24–72h propagation window should have elapsed).
3. Google Workspace secondary domain + Resend DKIM/SPF for `openfarewell.com` show green (pre-staged on Day 8).
4. The rename code PR exists on a branch (prepared during Day 9). If Day 9 didn't prepare it, today absorbs building it — that is Task 1 either way; rebase the prepared branch onto current `origin/main` and re-verify rather than trusting the Day-9 diff.
5. Rollback note written (see Rollback at bottom).
6. Kill switches confirmed OFF and staying off all day: `OUTREACH_LIVE`, `PARTNER_DIGEST_ENABLED`, `BILLING_LIVE`. (`BILLING_LIVE` only exists in code if the billing sprint day shipped before today — if the literal is absent from the repo and the Vercel env, that counts as OFF; do not go hunting for it.)

### Ultracode orchestration (fan out FIRST, wire after)
The sweep is huge (verified at `b19983a`: **437 literal hits across 134 files** in `app|lib|components|scripts|supabase`, plus 47 files in `docs/`). Do not sweep serially or from memory.
1. **Fan-out #1 — classification, before any edit:** partition the grep output (`grep -rn "Honest Funeral\|honestfuneral" app lib components scripts supabase docs`) into 5 parallel lanes — (a) pages+components rendered copy, (b) email + print + negotiation, (c) SEO/meta/OG/JSON-LD/sitemap/robots, (d) scripts + tests, (e) docs. Each agent returns a per-hit disposition table: `BRAND-ify` (reads `BRAND`/`LEGACY`) / `KEEP` (old-domain infra — allowlist with reason) / `HISTORY` (docs — leave, annotate only if a living doc). A judge agent merges into ONE manifest; conflicts resolved against the Task-2 rules below. The manifest is the sweep's spec — every edit traces to a manifest row.
2. **Fan-out #2 — adversarial lenses on the finished diff, before the gate** (this caught real bugs on Days 1–4; it is not optional): redirect correctness (`/api/` exemption, query preservation, www host, no redirect loop) · email invariants (reply-to NEVER moves off `reply.honestfuneral.co`; env-vs-fallback authority) · auth callback origins · localStorage key stability (no key renamed) · word-ban + adoption-claim scan on any touched copy (`featured|recommended|sponsor` = 0 on partner/directory/hospice surfaces; no Medicare/CAHPS/CMS on employer surfaces; capability phrasing only) · test honesty (no assertion weakened to pass) · the JSX `{expr}` space-eating trap on every touched prose line (explicit `{" "}` mid-sentence; verify rendered DOM, not source).

### Tasks

**1. The code PR (session — merged mid-day at founder console step F3, not at end of day).**
Rebase the Day-9-prepared branch onto current `origin/main`; if absent, build fresh. Contents, with contracts verified at `b19983a`:

- **1a. `lib/brand.ts` flips.** Exact new shape:
  ```ts
  import { PUBLIC } from "./env";

  export const BRAND = {
    name: "Open Farewell",
    domain: "openfarewell.com",
    url: PUBLIC.appUrl,               // NEXT_PUBLIC_APP_URL, founder sets in Vercel BEFORE merge
    supportEmail: "support@openfarewell.com",
    helloEmail: "hello@openfarewell.com",
  } as const;

  /** Pre-rename identity. ONLY the proxy.ts 308 redirect and the inbound
   *  email pipeline (reply.honestfuneral.co → Postmark → /api/inbound/email)
   *  may read these. In-flight negotiations carry reply-tos on this domain;
   *  it stays live indefinitely. */
  export const LEGACY = {
    name: "Honest Funeral",
    domain: "honestfuneral.co",
    hosts: ["honestfuneral.co", "www.honestfuneral.co"],
    inboundReplyDomain: "reply.honestfuneral.co",
  } as const;
  ```
  ⚠ Confirm `supportEmail`/`helloEmail` local-parts with the founder against the Workspace aliases staged on Day 8 BEFORE merge — the old buildsheet says "per founder's Workspace setup"; do not assume.

- **1b. The inbound-email invariant (the day's #1 tripwire).** `lib/negotiation/email-body.ts:122–129` — `outreachReplyTo()` returns `advocate+${negotiationId}@reply.honestfuneral.co`. **This literal moves to `LEGACY.inboundReplyDomain` and stays on the OLD domain.** Postmark inbound MX lives on `reply.honestfuneral.co`; pointing reply-tos at the new domain silently black-holes every funeral-home reply. New-domain reply-tos are minted only when the inbound-domain migration is deliberately done, later — NOT today. `outreachFromAddress()` (`email-body.ts:116–119`): fallback string flips to `` `${BRAND.name} <arrangements@${BRAND.domain}>` ``, but note the authority rule in 1e.

- **1c. Host-based 308 redirect in `proxy.ts`.** Insert at the very top of `proxy(request)` (before the rate-limit block at line 12 — redirects must be cheapest):
  ```ts
  const host = request.headers.get("host")?.toLowerCase().split(":")[0] ?? "";
  if (
    (LEGACY.hosts as readonly string[]).includes(host) &&
    !request.nextUrl.pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${BRAND.domain}`),
      308,
    );
  }
  ```
  Traps: (i) **`/api/` paths are NEVER redirected** — Postmark webhooks (`/api/inbound/email`), Resend webhook, crons must not bounce through redirects; (ii) 308 (not 301/307) so POST bodies survive if any non-API POST hits the old host; (iii) query string must be preserved (`nextUrl.search`); (iv) exact-match on `LEGACY.hosts` only, so Vercel preview hosts and localhost are untouched; (v) the existing `config.matcher` (line 43–47) already excludes `_next/static` etc. — do not change it. **Unit test required** (new `lib/__tests__/proxy-redirect.test.ts` — mock `@/lib/supabase/middleware`'s `updateSession` with `vi.mock`; vi.mock precedent in `lib/__tests__/admin-auth.test.ts` (mocks `@/lib/supabase/server`); NextRequest-driven route-test precedent in `app/api/admin/ingest-gpl/__tests__/route.test.ts`; `lib/__tests__/http-guards.test.ts` shows the Request-construction style only): old host + `/guides?a=b` → 308 with `location: https://openfarewell.com/guides?a=b`; old host + `/api/inbound/email` → falls through (no redirect); new host → falls through.

- **1d. The sweep, per the manifest.** Every one of the 437 hits becomes exactly one of: reads `BRAND`/`LEGACY` · KEEP+allowlist · docs-HISTORY. Verified hotspots at `b19983a` (re-verify each line before editing — they drift):
  - `lib/email.ts:13–14` — `FROM_DEFAULT = process.env.RESEND_FROM ?? "Honest Funeral <hello@honestfuneral.co>"` → fallback becomes `` `${BRAND.name} <${BRAND.helloEmail}>` ``.
  - `app/layout.tsx:24` `metadataBase: new URL("https://honestfuneral.co")` and `:37` og `url` → build from `BRAND.url`. **`:74` inline bootstrap script reads localStorage key `'honestfuneral.display.v1'` — KEEP the literal** (see 1f) and keep it in lockstep with `components/ComfortModeToggle.tsx:5` `COMFORT_KEY`.
  - `app/page.tsx:12–16` `ORG_SCHEMA` (name/url) + `:32` title; `app/fair-price-index/page.tsx:50–57` Dataset JSON-LD (name, description, creator, url, **license URL**); `app/methodology/page.tsx:13,246`.
  - `app/sitemap.ts:7` and `app/robots.ts:3` — `const SITE = "https://honestfuneral.co"` → `BRAND.url` (prod env is set before merge; dev falls back to localhost, same as every other `PUBLIC.appUrl` consumer — acceptable, note it in the PR).
  - OG: `lib/og.ts:20` alt; `app/opengraph-image.tsx:4,33`; `app/og/route.tsx:28,61,63` — **trap:** line 28's default eyebrow `?? "Honest Funeral"` and line 63's guard `eyebrow !== "Honest Funeral"` must BOTH become `BRAND.name` or eyebrow rendering breaks asymmetrically.
  - Print letterheads: `components/print/PrintHeader.tsx:42,76` ("Generated by Honest Funeral · honestfuneral.co"), the analyzer letterhead in `app/analyzer/Analyzer.tsx`, `components/partner/ProofSheet.tsx`.
  - Footers/help: `components/HelpFooter.tsx:43,46` (`support@`) → `BRAND.supportEmail`; `components/Brand.tsx:76,118,121,126,198` (name, `hello@`, disclaimer, `© 2026`).
  - Email bodies: `lib/welcome-email.ts`, `lib/nurture-email.ts`, `lib/anniversary-emails.ts`, `lib/partner-digest.ts`, `lib/family-digest.ts`, `lib/negotiation/*` (subject to 1b/1e).
  - Scripts (`.mjs` cannot import TS — update literals by hand to the new brand): `scripts/seed-demo.mjs` demo copy, `scripts/smoke-check.mjs:79` warn text, `scripts/build-bootstrap-sql.mjs`. Allowlist the new-brand literals in `scripts/` (see 1g).
  - Tests: every `lib/__tests__/*` hit (`env`, `admin`, `admin-auth`, `analytics`, `anniversary-emails`, `household-view`, `http-guards`, `partner-digest`, `readability`) — update expectations to the new brand; never delete an assertion to make it pass.
  - `supabase/` — **applied migrations are history; NEVER edit them.** Any hit there is allowlisted as-is.
  - Docs: living docs flip (`CLAUDE.md` brand/domain references, `docs/sales/*` — live collateral, mandatory today — `docs/OPERATING_PLAN.md`, `ROADMAP.md`, `GO_TO_MARKET.md`, `PROD_SETUP.md`, `BUSINESS_PLAN.md`); dated logs/findings/sprint docs stay untouched (history — annotate only where a reader would be actively misled). Docs are excluded from the brand grep (1g).

- **1e. Email-env authority rule (write it in the PR description):** code fallbacks flip to the new domain, but the env vars `RESEND_FROM` / `OUTREACH_FROM` are authoritative at runtime — the founder flips those envs **only after Resend shows `openfarewell.com` verified** (F6). If DKIM is not green by then, envs stay on the old (still-verified) Resend domain and nothing breaks; sends are dry-run anyway (`OUTREACH_LIVE` off).

- **1f. localStorage keys — decision: KEEP every key, and write the decision down.** All are opaque storage; renaming them silently wipes families' saved state (comfort mode, worksheets, vault, referral attribution). Verified inventory: run `grep -rn '"honestfuneral\.' app lib components` — at `b19983a` it returns ~50 hits across ~19 files (`ComfortModeToggle.tsx:5` + the `app/layout.tsx:74` twin, `lib/referral-codes.ts:44`, `lib/household-link.ts:23,35–38`, `lib/household-view.ts`, `lib/negotiate-wizard-state.ts:33`, `lib/plan-now.ts:60`, `lib/phase-detector.ts`, `app/family/Family.tsx`, `components/dashboard/DashboardActions.tsx`, and the per-tool STORAGE_KEY consts in `app/memorial`, `app/guidance/[scenario]/CrisisUnexpected.tsx`, `app/subscriptions`, `app/livestream`, `app/obituary`, `app/next-30-days`, `app/timeline`, `app/eulogy`, `app/notifications`, `app/vault`). EVERY key is KEEP; seed the 1g allowlist from this grep's file list, not from memory. The only non-key hit that grep also returns is `lib/analyzer-display.ts:437` (`'honestfuneral.co'` in plain-text output) — that one IS BRAND-ified. Add a one-line `// KEEP: opaque storage key — renaming orphans user state (Rename Day decision)` comment at each, allowlist them, and record the decision in the PR body.

- **1g. Brand-grep enforcement script lands with the PR.** `scripts/check-brand-literals.mjs`: scans `app lib components scripts` (NOT `docs`, NOT `supabase/migrations`) for `/honest\s?funeral|honestfuneral/i` AND `/open\s?farewell|openfarewell/i` outside `lib/brand.ts`; loads `scripts/brand-literal-allowlist.json` (entries `{ "file": "...", "reason": "..." }` — seed: the localStorage-key files from 1f, `app/layout.tsx` inline script, test files asserting legacy/redirect behavior, `scripts/*.mjs` new-brand literals); exits non-zero listing every unallowlisted hit. The script must skip itself and `scripts/brand-literal-allowlist.json` (hardcode both exclusions — don't allowlist the allowlist). Add `"check:brand": "node scripts/check-brand-literals.mjs"` to `package.json` and to the day gate. Verified: the repo has NO `.github/workflows/` at `b19983a` — the gate run IS the CI; if a workflows dir exists at execution time, also add a step there. Banning the NEW brand literal outside `lib/brand.ts` is deliberate — it keeps the "new code reads BRAND" law machine-enforced forever.

**2. Merge sequencing (interleaved with founder console steps — see Founder actions).** The PR merges at step F3, strictly AFTER F1 (new domain attached and serving) and F2 (`NEXT_PUBLIC_APP_URL` set in all Vercel envs — it is a build-time var; set after the deploy = wrong canonicals until a redeploy). Session watch: deployment via the GitHub deployments API (Vercel project "walkbeside"), then probe NEW behavior with a cache-busting query string (`?rncheck=1`) — the cached-edge-404 gotcha is documented; never declare a deploy stuck without cache-busting first.

**3. End-of-day proof battery (session — all of it, in this order):**
- **3a. Redirect sweep — ten old-domain deep links, each 308 → new-domain twin, path preserved:**
  ```bash
  for p in / /guides /prices /analyzer /methodology /fair-price-index /portal /partners/apply /tell-your-hospice /guidance/home-unexpected; do
    curl -sI "https://honestfuneral.co${p}?rncheck=1" | grep -iE "^HTTP|^location"; done
  ```
  Expect `308` + `location: https://openfarewell.com<path>?rncheck=1` (query preserved) on every line. Also `www.honestfuneral.co` on one path — a two-hop result (www → old apex → 308 to openfarewell.com) is a PASS as long as the final landing is the new-domain twin with path+query intact and no hop touches `/api/`.
- **3b. API exemption proof:** `curl -sI https://honestfuneral.co/api/inbound/email` → **NOT 308** (401/405 from the route is the pass); same for one cron path.
- **3c. Seeded inbound reply to an in-flight old-domain case:** read `app/api/inbound/email/route.ts` for the exact Postmark payload shape + Basic auth (`POSTMARK_INBOUND_USER`/`POSTMARK_INBOUND_SECRET` from `.env.local`); seed/reuse a dev negotiation (`scripts/seed-demo.mjs`); POST the crafted payload with `To: advocate+<negId>@reply.honestfuneral.co` to the OLD host; verify the thread updates and the auto-parse proposal renders on `/negotiate/<id>/status`. **This is the invariant that must not break; it is never cut.**
- **3d. Magic-link sign-in on the new domain.** Code needs no change (`app/login/page.tsx:51,93` and `app/portal/login/page.tsx:98` use `window.location.origin`), but the **Supabase dashboard allowlist is the classic rename breakage** — founder step F9 must be done first. Test: `/login` on `openfarewell.com` → email → callback lands signed in on the new domain. Known edge (note, don't fix): magic links minted pre-flip can fail cross-domain (PKCE cookie is domain-scoped); they expire in 1h — acceptable.
- **3e. The sprint §2 demo re-run** top-to-bottom on `https://openfarewell.com` (script per `docs/PRODUCT_SPRINT_2026-07-16.md` §2 / `docs/sales/DEMO_SCRIPT.md`).
- **3f. `npm run smoke:check`** — note honestly: verified at `b19983a` it checks env + Supabase data, it does NOT fetch the domain; the curl sweep + demo are the domain proof. It must exit 0 with the old-domain warnings gone from its output.
- **3g. Lighthouse spot on `/`** (`npx lighthouse https://openfarewell.com --view` or DevTools): scores within a few points of the old-domain baseline; zero redirect-chain or mixed-content findings.
- **3h. File the watch items as GitHub issues** (`gh issue create`): +2wk "Search Console impressions curve post-change-of-address", +2wk "old-host 404 log review", +6wk "DKIM deliverability check on the first partner digest send".

### Acceptance gate (all must pass before the PR is called done — the PR merges mid-day, so run the command block on the branch pre-merge AND once on deployed prod post-merge)
```bash
npm run typecheck && npm run lint && npm run build && npx vitest run && npm run check:brand
# guardrail greps (standing):
grep -rn "OUTREACH_LIVE" lib/negotiation/send.ts            # kill switch intact
grep -rniE "featured|recommended|sponsor" app components --include="*.tsx" | grep -v node_modules  # word-ban: 0 rendered hits on partner/directory/hospice surfaces
grep -rn "reply.honestfuneral.co" lib --exclude=brand.ts    # expect ZERO code hits; the only allowed survivors are prose comments in email-body.ts, and prefer rewriting those to say LEGACY.inboundReplyDomain so the output is empty
```
Plus every 3a–3g manual check green, the founder console checklist fully walked (or explicitly deferred items listed in the PR body), and the adversarial multi-lens diff review (Fan-out #2) run with findings fixed or founder-flagged. No merge of anything without founder go — today's mid-day merge at F3 is itself a founder click.

### Cut lines (in drop order — and what is never cut)
1. Lighthouse spot (3g).
2. Docs-HISTORY annotation pass (living-doc flips are NOT cut; only annotations on dated logs).
3. Stripe display name / statement descriptor (F11 — `BILLING_LIVE` is off; must land before any real billing, file an issue if deferred).
4. Postmark webhook URL update to the new host (F7b — the old URL keeps working by design; the `/api/` exemption guarantees it).
5. Search Console change-of-address (F10 — founder can run the day after; file it).
**Never cut:** the inbound-reply continuity proof (3c) · the `/api/` redirect exemption + its unit test · the 308 sweep (3a/3b) · magic-link on the new domain (3d) · `check:brand` in the gate · the reply-to staying on `reply.honestfuneral.co` · kill switches off.

### Founder actions (ordered console sequence — the session gives you ONE step at a time and runs its watch-point before the next)
- **F0.** Confirm in chat: TESS clean; Day-9 clearance all green. (Session: if not — the day slips a week; stop.)
- **F1. Vercel:** add `openfarewell.com` + `www.openfarewell.com` to project "walkbeside"; `www` → redirect-to-apex for the NEW domain only. **Do NOT set primary yet, and ensure `honestfuneral.co` stays assigned with NO Vercel-level "Redirect to" configured** — a Vercel-level redirect would also bounce `/api/` and break Postmark; `proxy.ts` owns the redirect precisely so `/api/` can be exempt. *Watch-point: `curl -sI https://openfarewell.com/?rncheck=1` → 200, serving the current (still-old-brand) site.*
- **F2. Vercel env:** `NEXT_PUBLIC_APP_URL=https://openfarewell.com` in Production + Preview + Development. Also copy into local `.env.local`. *Watch-point: founder confirms all three envs; no redeploy triggered yet.*
- **F3. Merge the rename PR** (founder clicks merge → auto-deploy). *Watch-point: session tracks the deployment, then cache-busted probes: new domain shows "Open Farewell" in the header/footer/OG; old domain 308s per 3a; `/api/` exempt per 3b.*
- **F4. Vercel:** set `openfarewell.com` as primary. *Watch-point: re-run 3a/3b — both still hold.*
- **F5. Squarespace:** 301-forward the 7 secondary domains (`openfarewell.co/.net/.org`, `open-farewell.com`, `openfairwell.*`) to `openfarewell.com`. *Watch-point: `curl -sI https://openfarewell.co` → 301 to `.com`.*
- **F6. Resend:** confirm `openfarewell.com` domain fully verified (DKIM green). If green: flip Vercel envs `RESEND_FROM="Open Farewell <hello@openfarewell.com>"` and `OUTREACH_FROM="Open Farewell <arrangements@openfarewell.com>"` (⚠ addresses per your Workspace aliases — confirm local-parts with the session) + redeploy-on-next-merge note. If NOT green: leave both envs on the old domain (still verified; code fallbacks don't fire while envs are set) and file a +24–72h follow-up. *Watch-point: session re-runs `npm run smoke:check` and reads the RESEND_FROM line.*
- **F7. Postmark:** **(a) touch NOTHING on the inbound domain/MX** — `reply.honestfuneral.co` inbound stays configured indefinitely (in-flight reply-to hashes live there; this is the thing that must not blink). (b) Optionally update the inbound webhook URL to `https://openfarewell.com/api/inbound/email` — safe either way since `/api/` never redirects. *Watch-point: the session runs the seeded inbound proof (3c) AFTER this step, whichever choice you made.*
- **F8. Google Workspace:** flip the primary domain to `openfarewell.com` when ready (aliases staged on Day 8); keep old-domain aliases receiving. *Watch-point: founder sends a test mail to `support@openfarewell.com` and confirms arrival; session confirms `BRAND.supportEmail` matches reality.*
- **F9. Supabase (bhadjv) → Authentication → URL Configuration:** Site URL → `https://openfarewell.com`; add `https://openfarewell.com/auth/callback` (+ `www` twin) to Additional Redirect URLs; **KEEP the old-domain entries** (the old domain still serves redirects). Also skim the Supabase auth email templates for the old brand name and update. *Watch-point: session runs the magic-link test (3d).*
- **F10. Search Console:** add + verify the `openfarewell.com` property (DNS TXT via Squarespace), submit change-of-address from the old property, resubmit `https://openfarewell.com/sitemap.xml`. *Watch-point: session confirms the live sitemap's `<loc>` hosts are all new-domain.*
- **F11. Stripe:** account display name + statement descriptor → Open Farewell (test mode; must precede any real billing). *Watch-point: none (console-only; `BILLING_LIVE` off).*
- **F12. Socials:** bios flipped on X/IG/LinkedIn/FB, `https://openfarewell.com` linked in each. *Watch-point: none.*
- **F13. Ops/legal (from NAMING_SPRINT §5.6, can trail into the next day):** Squarespace registrar auto-renew ON across the whole openfarewell domain stack; LLC d/b/a filing per counsel's guidance; update the live pilot-hospice conversation and any already-sent collateral (PDF one-pagers, email threads) to Open Farewell. *Watch-point: none (console/offline); file a GitHub issue if deferred.*

### Rollback (if anything structural breaks mid-day)
Vercel primary back to `honestfuneral.co` → revert the code PR (single revert commit, founder-merged) → DNS stays as-is (it is purely additive). **The old domain never stopped working — that is the design; state it in the incident note.** Postmark inbound was never touched, so no email is at risk in either direction.

### Kickoff prompt (paste to open the session)

```text
ultracode. git fetch. If the Day-9-prepared rename branch exists, rebase it onto current origin/main; otherwise branch fresh. Read CLAUDE.md, docs/NAMING_SPRINT_2026-07.md §5, and docs/SPRINT_DAYS_5-9_BUILDSHEETS.md §RENAME DAY — execute Rename Day only, exactly as specced. FIRST: walk the precondition block with me (TESS clean + Day-9 clearance green) — if anything is red, the day slips a week: say so and stop. Then ultracode fan-outs first (parallel grep-sweep classification → one merged disposition manifest, then the adversarial multi-lens review on the finished diff), mechanical sweep after. I drive every account console — feed me the founder checklist ONE step at a time and run your watch-point check before giving me the next; the code PR merges mid-day at step F3 on my click, not at end of day. Postmark inbound on reply.honestfuneral.co must never blink — the reply-to domain never moves. Full day gate + the end-of-day proof battery (308 sweep, /api/ exemption, seeded inbound reply, magic-link, §2 demo on openfarewell.com) before done; no merge of anything without my go.
```

---

## Founder actions at a glance (one row per day)

| Day | What the founder personally must do |
|---|---|
| **Day 5** | Seed the demo partner orgs before the manual gate (`DEMO_PASSWORD=<pick> DEMO_ZIP=84101 node scripts/seed-demo.mjs`, idempotent); personally drive the coordinator→family dry run (it IS the pilot-delivery runbook); keep `PARTNER_DIGEST_ENABLED`/`OUTREACH_LIVE`/`BILLING_LIVE` off; merge on go. No migration. |
| **Day 6** | Nothing blocks the start. After the PR: skim 3 state pages + 1 facility page on the preview deploy (tone — public SEO surface), delete the "TEST — founder delete" `partner_leads` row, ignore the matching support@ email; merge go. No migration. |
| **Day 7** | Nothing required before/during the build. Answer the session's Branch A/B question (has the GPL/promote data track run?). Optional: ingest Utah GPLs + promote SLC groups to unlock Branch A. Merge decision. No migration. |
| **Day 8** | Apply Migration B in the bhadjv SQL editor + run the new VERIFY block (expect 4 rows); Stripe test-mode product + pricing decision #1 (Business Plan v2.0 §7.3 — on open PR #167); put test keys + `BILLING_LIVE=true` in Vercel **Preview only** + dev `.env.local`; click the test checkout; run the Stripe CLI webhook forward with the session. ⚠ Block C (DNS pre-staging + Workspace secondary domain + chase TESS) is time-critical — do it as early as possible, independent of Day 8. |
| **Day 9** | Merge Day 5–8 stragglers (or name which stay open); QA hour (paste VERIFY.sql; eyeball Vercel prod env — all four switches unset — screenshot it; confirm Stripe keys preview-only; run the digest curl with `CRON_SECRET`); record the §2 demo (billing beat on preview); console checks for clearance + report counsel's TESS answer verbatim; decide PR #127 and approve the `/partners` CAHPS reword; merge the Day-9 PR on go; if any clearance item is red, call the rename slip (Aug 3 → Aug 10) today. |
| **Rename Day** | Walk the console sequence F0–F13 ONE step at a time as the session cues you: confirm TESS + clearance (F0), Vercel domains (F1) + envs (F2), click the mid-day merge (F3), primary flip (F4), Squarespace forwards (F5), Resend env flip if DKIM green (F6), Postmark — touch NOTHING on inbound (F7), Workspace primary flip (F8), Supabase auth URLs (F9), Search Console (F10), Stripe naming (F11), socials (F12), ops/legal — auto-renew, d/b/a, pilot collateral (F13). |

---

## Assembly reconciliations (no verifier corrections rejected)

All verifier corrections across all six days were applied. Three were lightly **amended for cross-day consistency** (the corrections came from independent verifiers and conflicted with each other):

1. **Migration B filename:** the Day-9 verifier's fixed precondition named `2026-07-23-partner-billing.sql`, while the Day-8 verifier requires the file be named for the REAL apply day (e.g. `2026-07-28-…`). Day 8's rule wins (it owns the migration); Day 9's precondition now points at §DAY 8 Task 1's naming rule instead of a hard date.
2. **Day 8 block-C urgency phrasing:** the Day-8 verifier's warning said "as of Jul 26, Rename Day is tomorrow," which contradicts the Day-9 verifier's re-dating (rename target = the Monday after Day 9 clears, Mon Aug 3). The warning's substance (do DNS pre-staging immediately, outside any session) is kept; the stale "tomorrow" is replaced with the corrected schedule.
3. **Brand-literal enforcement mechanism:** the Day-9 verifier prescribed a vitest fs-scan pin; the Rename-Day sheet (and its verifier) prescribe `scripts/check-brand-literals.mjs` + `check:brand` in the gate. Since Day 9 Task 6 prepares the very PR §RENAME DAY Task 1g governs, Day 9 now defers to 1g's script spec and notes the vitest fs-scan as an acceptable equivalent; both retain the shared substance (no `.github/workflows/` exists — the gate run IS the enforcement; never scaffold GitHub Actions).
