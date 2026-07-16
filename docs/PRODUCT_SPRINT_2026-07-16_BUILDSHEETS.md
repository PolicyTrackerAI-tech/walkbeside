# Product Sprint — Day Build Sheets (execution depth, Jul 16–27)

Companion to [`PRODUCT_SPRINT_2026-07-16.md`](PRODUCT_SPRINT_2026-07-16.md)
(the frame: mission, D1–D12, migrations, QA, cut lines) and
[`PRODUCT_PLAN_2026-Q3.md`](PRODUCT_PLAN_2026-Q3.md) (the 13-week master).
**Each day's session opens with: `CLAUDE.md` + the sprint doc + this file's
matching day section, and builds ONLY that day.** Line numbers below were
verified against `origin/main` @ `ff05d5d` on 2026-07-15 — trust them as
starting points, re-verify before editing.

Session kickoff prompt (paste each morning, swap the day):

> git fetch and branch off current origin/main. Read CLAUDE.md,
> docs/PRODUCT_SPRINT_2026-07-16.md, and
> docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md — then execute **Day N
> only**, exactly as specced. Run the day's acceptance gate before declaring
> done: `npm run typecheck && npm run lint && npm run build && npx vitest
> run` plus the day's manual checks and the guardrail grep. Open a PR; do
> not merge until I say go.

Standing rules, every day: new code reads `lib/brand.ts`, never the literal
brand string · one migration only on its scheduled day, founder-applied in
the **bhadjv** SQL editor · `OUTREACH_LIVE` / `PARTNER_DIGEST_ENABLED` /
`BILLING_LIVE` stay off · badge-honesty rule (verified/community labels only
next to numbers that consulted the store) · nothing ever cold-contacts a
family · fresh worktrees don't get `.env.local` — copy from
`/Users/ryancurrie/FH/.env.local` first.

---

## DAY 1 — Thu Jul 16 · Eval harness, then the model behind it (D3)

*(Order swapped with the ingest day 2026-07-15, founder call: run the evals
first so the extraction chain is measured — and on its verified model
config — before the weekend trusts it with real GPL volume. This is also
the sprint's designated ultracode day; the ingest day runs as a normal
session on Friday.)*

**Objective:** extraction quality becomes measurable, the measurement gates
every future model/prompt change, and the sonnet-5/Haiku re-baseline ships
only if the numbers say so.

### Pre-flight (30 min)
1. `git worktree list` — remove stale sprint worktrees under
   `.claude/worktrees/` (the old day-2 worktree still holds the `main` ref
   and blocks local merges; `git worktree remove <path>` after checking
   `git log --oneline origin/main..<branch>` is empty). Leave the founder's
   main checkout alone.
2. **`lib/brand.ts`** — `export const BRAND = { name: "Honest Funeral",
   domain: "honestfuneral.co", url: PUBLIC.appUrl, supportEmail:
   "support@honestfuneral.co" } as const` (shapes final; values flip on
   Rename Day). Today: import it in everything NEW; do NOT sweep existing
   strings (that's Rename Day's grep, one atomic pass).

### Tasks
**1. Fixtures** — `test/evals/gpl/` : 12–15 fictional-but-realistic GPLs as
`.txt` with paired `.expected.json`. Must cover: a clean itemized GPL; a
bundled/package quote; selection ranges (caskets $995–$4,500); per-unit
death certs with qty ("Death certificates (10) ... $250"); the embalming
disclosure phrasings the rules suite pins (`lib/bundling-detection/__tests__/
rules.test.ts` — reuse its scenarios so eval and unit fixtures agree); OCR
noise (broken columns, `$ 1 , 2 9 5`); a stated total that contradicts the
item sum; `docs/SAMPLE_GPL_DEMO.md`'s list (the demo must never regress).
`expected.json` shape: `{ items: [{ match: "substring", matchedItemId?,
cents?, qty?, isRange? }], statedTotalCents?, mustFlagRuleIds?: [],
mustNotFlagRuleIds?: [] }`.

**2. `scripts/eval-analyzer.mjs`** — plain Node, hits the REAL endpoint
(`EVAL_BASE_URL ?? http://localhost:3000` + `/api/analyze-price-list`) so it
scores the production pipeline end-to-end (a Node script can't import the TS
libs — same constraint that made ingest an admin page). Sequential with a
~6s delay (the route is rate-limited 12/min, `lib/rate-limit.ts`). Scores
per fixture: item recall + precision on (matchedItemId, cents) pairs, qty
detection, range detection, stated-total reconciliation, rule must/mustNot
hits. Output: per-fixture table + aggregate, exit non-zero under a
threshold flag (`--min-recall=0.9`). `npm run eval:analyzer` script in
package.json. Run it; commit the output as `test/evals/BASELINE.md`
(sonnet-4-6). Note in the README block: runs cost real API cents and appear
in `/admin/ai-costs` under the analyzer features; not part of vitest/CI.

**3. The re-baseline, behind the harness** — read `lib/claude.ts:9-21`
first: it documents exactly why the string can't just be swapped (sonnet-5
adaptive thinking spends inside `max_tokens`; tokenizer counts ~30% more).
Consult the claude-api skill for current model ids/params. Changes:
`CallOpts` gains `model?: string`; sonnet-5 config gets an explicit thinking
setting + re-baselined `max_tokens` for the extraction features; Haiku 4.5
on `app/api/subscription-finder/route.ts:61-63` (classification-shaped).
Run the eval before/after on a branch; **ship only if ≥ baseline on every
aggregate metric; otherwise revert to sonnet-4-6 and the harness alone is
the day's deliverable — say so plainly in the PR.** Either way the PR body
carries both eval outputs.

### Acceptance gate
`npm run eval:analyzer` reproducible against a dev server; BASELINE.md
committed; `lib/brand.ts` exists (pre-flight); if the model changed, before/after tables in the PR and
checker-pipeline + rules suites green; `/admin/ai-costs` shows the eval
run's tokens.

### Founder actions
Commission the **TESS knockout** if not already done (gates Jul 27).
Optional: skim BASELINE.md — the per-fixture failures are the honest map of
what the checker still misses.

### Cut inside Day 1
Model re-baseline → next week (harness is the deliverable). Never cut the
harness.

---

## DAY 2 — Fri Jul 17 · `/admin/ingest-gpl` + rename-ready foundations (D2, D12)

**⚠ Weekend-critical, zero slack:** Saturday's data collection depends on
this tool existing by tonight. If the day runs long, the cut lines below
are the pressure valve — cut scope, never the date.

**Objective:** the founder can turn a GPL into a benchmark-feeding analysis
row in 90 seconds, and promotions refresh public pages without a deploy.
(`lib/brand.ts` + worktree cleanup shipped with Day 1's pre-flight.)

### Tasks
**1. `/admin/ingest-gpl` (the day's centerpiece).**
- `app/admin/ingest-gpl/page.tsx` — `requireAdminPage("/admin/ingest-gpl")`
  (pattern: `app/admin/benchmarks/page.tsx:28`), `robots: {index:false}`,
  renders a client `IngestClient.tsx`.
- Form: GPL text (textarea, 20–20000 chars) **or** photo → POST the existing
  `/api/extract-price-list-image` (public, rate-limited 12/min — fine for
  founder use) to get text; zip (5-digit); home name; optional source URL.
- `app/api/admin/ingest-gpl/route.ts` — `requireAdminApi()` first (idiom:
  `app/api/admin/outcomes/route.ts`), two actions:
  - `parse`: `claudeAvailable()` → `callClaude({ feature: "founder-ingest",
    system: priceListAnalysisSystem(), user: text, maxTokens: 1500,
    cacheSystem: true })` → `JSON.parse(stripCodeFence(...))`, fallback
    `naiveExtract(text)` (all from `lib/negotiation/price-list-parse` +
    `lib/negotiation/prompts` — the analyzer's own chain,
    `app/api/analyze-price-list/route.ts:90-106` is the reference). Map raw
    items → `{ name: cleanItemName(raw.name), cents, matchedItemId:
    matchLineItem(name)?.id, qty?, isRange?, centsLow?, centsHigh? }`.
    **Do NOT extract/refactor the analyzer route's mapping — duplicate the
    minimal founder-tool variant here** (no classification needed; the
    benchmark pipeline consumes `matchedItemId`/`cents`/`qty`/`isRange`
    only — see `AnalysisRecord`, `lib/benchmark-pipeline.ts:33-44`).
    Mid-sprint refactors of checker-correctness law are how regressions
    happen.
  - `save`: body = reviewed items + zip + homeName + sourceUrl. Service-role
    insert into `price_list_analyses`: `{ user_id: <founder session user>,
    raw_text: redactContact(text).slice(0,5000), items, zip,
    total_quoted_cents: sum, total_fair_cents: 0, potential_savings_cents:
    0, extraction_method: "founder_ingest", confidence:
    extractionConfidence({...}) }`. When `sourceUrl` present: match
    `funeral_homes` by `ilike` name + zip → update `{ gpl_url: sourceUrl,
    last_verified_at: now }` (columns live since Migration 3, applied);
    no match → save analysis anyway + return a "home not matched" warning.
- Review UI between parse and save: editable table (name, dollars input →
  cents, matched-item `<select>` over `LINE_ITEMS` ids + "unmatched", remove
  row). Founder eyeballs — that's the human gate.
- **Watch-out:** `lib/benchmark-sources.ts` excludes analyses from active
  `partner_members` — the founder's real account is not a partner member,
  but if you ever ingest while signed in as a demo-org owner, those rows
  vanish from the pipeline. Note this in the page's help text.

**2. Promote-form metro dropdown** (`app/admin/benchmarks/PromoteForm.tsx`):
replace the free-text `scope_value` with a `<select>` of unique metro labels
derived from `ZIP_REGIONS` (import from `lib/zip-regions` — isomorphic data;
build the unique sorted list once, module-level). Kills the typo'd-label
silent-miss (`benchmarksForZip` matches metro strings exactly). Keep the
route's server-side validation unchanged.

**3. Post-promote revalidation** (`app/api/admin/benchmarks/promote/route.ts`,
after the successful insert + retire): `revalidatePath` for every
`CITIES` entry whose `regionForZip(zipExample)?.metro === scope_value`
(`lib/city-pages.ts` exports `CITIES`), plus `/fair-price-index`.
`/funeral-homes/[zip]` is dynamic and the tier API is 1h-cached — no action.
Best-effort try/catch; a revalidate failure must not fail the promotion.

### Acceptance gate
Mechanical suite green. Dev walkthrough: paste a sample GPL → parsed items
render → edit one, unmatch one → Save → row visible in `/admin/benchmarks`
groups with `founder_ingest` provenance → promote a group (n≥5 via repeated
distinct ingests or the seeded data) → the matching city page updates after
revalidate.

### Founder actions today
Evening: run one real Utah GPL through the tool on the preview deploy;
confirm the review-table workflow feels fast enough for weekend volume
(tomorrow depends on it).

### Cut inside Day 1
Photo path → paste-only (the extract endpoint keeps working standalone).
Metro dropdown → keep free text + a red warning banner. Never cut: the
ingest save path (the weekend is tomorrow).

---

## WEEKEND — Sat Jul 18 / Sun Jul 19 · Founder data days

Product is on-call only (fix-forward anything the ingest tool hits at
volume). Founder checklist:
1. Fill `supabase/seed/utah-homes.csv` (30–60 SLC/Provo homes,
   `docs/UTAH_HOMES_SOURCING.md`) → `npm run import:homes` → vet the
   demo-relevant homes in `/admin/vetting`.
2. Ingest every collectable published Utah GPL via `/admin/ingest-gpl`
   (source URL when it came from the home's site — it stamps `gpl_url`).
3. `/admin/benchmarks`: when a Salt Lake City / Provo metro×item group
   shows `n ≥ 5`, promote (tier verified, sources note = where the lists
   came from). Verify the badge lands on `/funeral-costs/salt-lake-city`
   and the analyzer verdict at an 841xx zip.
4. Time permitting: start CA (SB 658 requires homes to post GPLs online —
   LA/SF/San Diego/Sacramento highest-yield).

**Gate:** ≥2 verified metro×item groups live with visible n; every verified
row carries sources; `npx vitest run` still green Sunday night.

---

## DAY 3 — Mon Jul 20 · Migration A: hospices + consent (D5-data, D8)

**Objective:** the CMS hospice reference layer exists (Wednesday's finder
and Friday's pages depend on it), and checker data has explicit
contribute-consent.

### Tasks
**1. Migration A — `supabase/migrations/2026-07-20-hospices-consent.sql`**
(conventions: header boilerplate + idempotency + section bars, copy
`2026-07-17-regional-benchmarks.sql`):
```sql
create table if not exists public.hospices (
  id         uuid primary key default gen_random_uuid(),
  ccn        text not null unique,      -- CMS certification number
  name       text not null,
  city       text, state text, zip text,
  ownership  text,                      -- CMS ownership category, verbatim
  created_at timestamptz not null default now()
);
-- RLS: enabled, ZERO policies (deny-all; service-role only).

alter table public.price_list_analyses
  add column if not exists contributed boolean;
-- NULL = legacy row (pre-consent era, grandfathered into aggregation under
-- the existing de-identified-accumulation disclosure); true/false = the
-- family's explicit checkbox from 2026-07-20 on.
```
`node scripts/build-bootstrap-sql.mjs`; VERIFY.sql: add `hospices` to the
deny-all comment list + a new expect-N block (hospices columns +
`contributed`).

**2. `scripts/import-hospices.mjs`** — `--file=<path>` (founder downloads
the CMS Provider Data Catalog hospice CSV from data.cms.gov), idempotent
upsert on `ccn`, service-role env contract identical to
`scripts/import-funeral-homes.mjs` (read that file first and mirror its
arg/env/dedupe conventions). `npm run import:hospices`.

**3. `GET /api/hospices/search?q=`** — public, in-route token bucket
(pattern: `app/api/benchmarks/tier/route.ts` — the proxy is POST-only),
`q` 2–80 chars, service-role `ilike` on name, top 10 `{ ccn, name, city,
state }`, `Cache-Control: public, max-age=3600`. Feeds Wednesday's homepage
finder + today's apply-form autocomplete (`app/partners/apply` —
`ApplyForm.tsx` org field gains suggestions; typing free text stays fine).

**4. Consent checkbox (D8)** — `app/analyzer/Analyzer.tsx`: unchecked-by-
default checkbox near submit, calm copy ("Add my de-identified prices to
the public fair-price data — optional"); POST body gains
`contributed: boolean`; `app/api/analyze-price-list/route.ts` zod +
first-attempt insert only (`route.ts:241-250` — the legacy fallback insert
stays shapeless, landing NULL = grandfathered… but a NEW submission that
hit the fallback would land NULL despite an unchecked box — acceptable
only because the fallback exists solely for pre-migration schemas; note
it). `lib/benchmark-sources.ts`: filter analyses to `contributed !== false`
(include true + null) — one comment explaining the NULL semantics. Extend
`lib/__tests__/benchmark-sources.test.ts` with the three-state pin.

### Acceptance gate
Founder applies Migration A → import runs (~5–6k rows) → search API returns
real hospices; analyzer with box unchecked → row `contributed=false` and
excluded from `/admin/benchmarks` counts; checked → included; legacy NULL
rows still counted. Suite green.

### Founder actions
Apply Migration A (morning — the day needs it); download the CMS CSV; run
the import against prod.

---

## DAY 4 — Tue Jul 21 · Programmatic reach (D4)

**Objective:** founder promotions surface on SEO pages within the hour, and
the index becomes citable.

### Tasks
1. **`app/funeral-costs/[city]/page.tsx`** — add
   `export const revalidate = 3600`; fetch `benchmarksForZip(city.zipExample)`;
   new "Verified local prices" section listing ONLY overridden items
   (override range + `<DataTierBadge tier n lastUpdated/>` + one line "X of
   the {ITEM_COUNT} benchmarked items in this metro come from real price
   lists; the rest are modeled"). The whole-service table stays
   `SERVICE_TOTALS × multiplier` and stays labeled modeled (its note at
   ~:168 — badge-honesty). Zero overrides → page renders exactly as today.
2. **`app/fair-price-index/page.tsx`** — `revalidate = 3600`; a "Verified
   metros" section driven by distinct active `regional_benchmarks` metro
   rows (service-role read, degrade-to-absent) showing metro · items
   covered · min n · latest version, each linking its city page when a
   `CITIES` slug matches; disclaimer card gains one sentence pointing at it.
3. **Public dataset:** `app/api/fair-price-index/data/route.ts` — GET,
   1h public cache, JSON (and `?format=csv`) of the national LINE_ITEMS
   ranges + active verified/community rows (scope, value, item, range, n,
   version — **sources included, no raw observations**). "Cite this" block
   on the index page (title, url via `BRAND.url`, date = PRICING_LAST_UPDATED
   / latest version) + JSON-LD `distribution` entry for the data URL.
4. Sitemap check (`app/sitemap.ts`) — city + index pages already present;
   nothing new to add today.

### Acceptance gate
With the weekend's SLC promotion live in prod data: dev against prod DB
shows the verified section on `/funeral-costs/salt-lake-city` and the metro
listed on `/fair-price-index`; a fresh promotion in dev appears on the city
page after `revalidatePath` (Day-1 hook) without rebuild; data endpoint
returns valid JSON + CSV; badge-honesty grep clean; suite green.

### Cut inside Day 4
CSV format → JSON only. Verified-metros section → keep (it's the payoff
surface). Never cut the ISR revalidate.

---

## DAY 5 — Wed Jul 22 · Audience re-architecture + the four loops (D11) — biggest day

**Objective:** both new personas find their door in one click, and every
loop has a product surface. Copy law all day: **referral = attribution +
sponsorship, never access; everything is free without one; we never email a
family; nominate contacts a hospice only via the user's own email client or
a consented founder intro.**

### Tasks
1. **Header** (`components/SiteHeader.tsx`): add "For hospices" →
   `/partners` (verify the mobile menu — it went 5→7 links on Day 3 of
   product week; this makes 8).
2. **Homepage** (`app/page.tsx`): (a) an institutional section —
   "Offer this to every family you serve — free to them, documented impact
   for you" → `/partners` + `/employers`; (b) the **hospice-finder module**
   (client component): autocomplete over `GET /api/hospices/search`; on
   select show BOTH paths, always: "Already offered by your hospice? Ask
   your bereavement coordinator for their link — or start free right now"
   (→ `/analyzer`) and "Want them to offer it? →" (nominate). **Do not
   attempt partner-name matching against the CMS list** — name matching
   across the two datasets is a rabbit hole; the two-path copy is honest
   without it.
3. **Nominate flow** — `app/tell-your-hospice/page.tsx` (linked from the
   finder + footer): shows the prefilled intro (subject + 4-sentence body:
   what it is, free to families, bereavement-support framing, `/partners`
   link — built from `BRAND` constants) with **mailto: and copy buttons**
   (the user sends it — loop #1's default); below, the optional consented
   form: hospice name (finder-prefilled) + city/state + optional "anything
   we should know" + optional submitter email with an explicit "OK to
   contact me about this" checkbox → `POST /api/partner/nominate` →
   `partner_leads` insert `{ source: 'family_nomination', org, note,
   email? }` + founder notification via `sendEmail` (internal, to
   `BRAND.supportEmail` — NOT to the hospice). Add
   `"/api/partner/nominate": { limit: 5, windowMs: 60_000 }` to
   `RATE_LIMITS` (`lib/rate-limit.ts:20-32` — public POST, proxy enforces).
4. **Share affordances (loop #3):** on the analyzer result actions and the
   three pillar guides — "Send this to someone arranging a funeral":
   copy-link + mailto, plain URLs, **no ref codes, no UTM theater**. Small
   shared component.
5. **Sponsorship legibility (loop #2):** one added line in
   `components/ReferralCoBrand.tsx` ("Your hospice provides this free to
   every family it serves."). The `NeutralityPledge` constant is untouched.
6. **Buyer-path footer (loop #4):** `components/partner/ProofSheet.tsx`
   print-visible footer line: partner-type-aware ("[Partner] offers this
   through {BRAND.name} · hospices and employers: {BRAND.url}/partners").
7. **Loop analytics:** `lib/analytics.ts` `ToolEvent` union
   (`lib/analytics.ts:8-14`) gains `nominate_submitted`,
   `hospice_intro_copied`, `share_clicked`, `partner_cta_clicked`; fire at
   the four surfaces (client-side, sanitized like existing events).
8. **Copy pass:** grep family-facing surfaces for referral language that
   implies gating ("get a referral link to start" style) — align to
   "sponsored by your hospice / free for everyone, always."

### Acceptance gate
From `/` on mobile width: hospice buyer reaches `/partners` in one click;
finder → both paths render for a real CMS hospice; nominate writes a
`family_nomination` lead visible in `/admin/partners` + founder email
received (dev inbox); mailto/copy intro carries the right body; share
buttons fire events; **channel-survival grep**: no code path emails a
hospice or family from nominate; word-ban clean on new surfaces; suite
green; rate-limit coverage test still passes (nominate isn't Claude —
no registry-test change).

### Cut inside Day 5
Guide-page share → analyzer-only. ProofSheet footer + co-brand line → keep
(one-liners). Never cut: homepage lanes, finder, nominate.

---

## DAY 6 — Thu Jul 23 · Migration B + institutional billing (D1)

**Objective:** a hospice can subscribe in-product, in test mode,
end-to-end — with families structurally unable to ever see it.

### Tasks
**1. Migration B — `2026-07-23-partner-billing.sql`:**
```sql
alter table public.partners
  add column if not exists stripe_customer_id text,
  add column if not exists billing_status text not null default 'none'
    check (billing_status in ('none','active','past_due','canceled')),
  add column if not exists billing_plan text,
  add column if not exists billing_started_at timestamptz;
```
BOOTSTRAP + VERIFY (expect-N block). Comments state: institutional billing
only; family charges are guardrail #2 and never ride these columns.

**2. Env contract** (`lib/env.ts` + README-of-day): `STRIPE_SECRET_KEY`
(exists as scaffold check, `lib/env.ts:31`), NEW `STRIPE_WEBHOOK_SECRET`,
`STRIPE_PRICE_PILOT`, `BILLING_LIVE`. All absent → the Billing card renders
the "invoicing by arrangement" copy; nothing throws.

**3. Routes (`app/api/stripe/`):**
- `checkout/route.ts` — POST, `requirePartnerApi("owner")`
  (`lib/partner/auth.ts`), reject `partner_type === 'insurer'` with 403
  (guardrail #1 — pin with a test), `BILLING_LIVE !== "true"` → 409;
  get-or-create Stripe customer (store `stripe_customer_id` via service
  role), `checkout.sessions.create({ mode: "subscription", line_items:
  [{ price: requireServer("STRIPE_PRICE_PILOT"), quantity: 1 }],
  success_url/cancel_url → /portal/settings, metadata: { partner_id },
  client_reference_id: partner_id })` → `{ url }`.
- `webhook/route.ts` — POST, **raw body** (`await req.text()` +
  `stripe.webhooks.constructEvent(body, sig, secret)`; do NOT use
  `readLimitedJson`), handle `checkout.session.completed`,
  `customer.subscription.updated`, `customer.subscription.deleted` →
  service-role update of the partner's `billing_status/plan/started_at`
  (resolve partner by metadata partner_id, fallback customer id). Return
  200 fast; unknown events → 200 ignore. **No `RATE_LIMITS` entry** —
  throttling Stripe's own retries would drop events (note the comment).
  The webhook writes ONLY the four billing columns — never family data.
- `portal-link/route.ts` — POST, owner-gated,
  `billingPortal.sessions.create` → `{ url }` (self-serve card/cancel).

**4. UI:** `/portal/settings` Billing card (owner-only): three states —
flag off → arrangement copy; no subscription → "Start the pilot
subscription" → checkout redirect; active → status chip + "Manage billing"
(portal link). `/admin/partners` (`PartnersClient`) gains a billing-status
column.

**5. Guardrail pins (new `lib/__tests__/billing-guardrails.test.ts`):**
(a) fs-scan: `stripe()` (the client factory, `lib/stripe.ts:5-10`) is
invoked ONLY under `app/api/stripe/` — `fmtCents` imports elsewhere are
fine and expected; (b) insurer 403 route test; (c) `BILLING_LIVE` unset →
checkout 409 (mock envs per the house queue-fake pattern,
`lib/partner/__tests__/auth.test.ts`).

### Acceptance gate
Founder applies Migration B; with test-mode keys in dev: checkout →
Stripe-hosted page → test card → webhook (Stripe CLI forward) →
`billing_status='active'` on the partner → portal card shows Active →
admin shows it; insurer + flag-off pins green; grep: zero `stripe()` calls
outside `app/api/stripe/`; suite green.

### Founder actions
Apply Migration B (morning). In Stripe **test mode**: create the Pilot
product + monthly price at your chosen number (decision #1 — needed today),
put `STRIPE_PRICE_PILOT` + keys + webhook secret in Vercel env (preview
first). Click the test checkout yourself on the preview deploy.

### Cut inside Day 6
Customer-portal link → next sprint (checkout + webhook are the spine).
Never cut: webhook signature verification, insurer exclusion, flag gate.

---

## DAY 7 — Fri Jul 24 · Hospice pages + claim + digest email (D5, D6)

**Objective:** the partner pipeline gets a product-side top of funnel, and
the monthly email reads like the web report.

### Tasks
1. **`/hospices/[state]/page.tsx`** — `generateStaticParams` over the 50
   states + DC, `revalidate = 86400`, service-role read of `hospices`
   (degrade to empty). Content: count + ownership mix, the hospice list
   (name, city, link to facility page), a family-facing block ("what to ask
   any hospice about after-death support" — education, never solicitation),
   and the claim CTA. Indexed; added to `app/sitemap.ts`.
2. **`/hospices/[state]/[ccn]/page.tsx`** — `robots: {index:false}` (thin
   content discipline; lift in Phase 3), CMS facts verbatim, neutral tone,
   "Is this your organization? Offer {BRAND.name} to your families — free
   to them" → `/partners/apply?org=<name>` (prefill via searchParams into
   `ApplyForm`) + a one-click "claim this page" POST →
   `/api/partner/claim` → `partner_leads { source: 'hospice_claim', org,
   note: ccn/state }` + founder email. Rate-limit entry (public POST,
   5/min).
3. **Medicare-words nuance (write it into the page comments):** these are
   hospice-directory surfaces — CMS facts (certification, ownership) are
   factual and fine here. The word-ban applies to EMPLOYER surfaces; the
   never-pitch-CAHPS rule applies everywhere; no pre-admission benefit
   framing anywhere ("families they serve," never "choose this hospice").
4. **Homepage finder** (Day 5's module): result rows link their facility
   page.
5. **Digest email upgrade** (`app/api/cron/partner-digest/route.ts`): build
   the email with the deterministic stats (`lib/partner-digest.ts:36-81`)
   PLUS `buildOutcomesDigest(stats, partnerType)`
   (`lib/partner-report-digest.ts:69` — it already has the deterministic
   fallback + suppression awareness); flag stays off (`route.ts:31`).
   Admin dry-run: `GET /api/cron/partner-digest?test=<partnerId>` gated by
   `requireAdminApi` (NOT the cron bearer) returning the rendered text for
   that partner without sending.
6. **DNS pre-staging note for the founder (Rename-Day dependency):** see
   founder actions — records propagate over 24–72h, so they go in TODAY.

### Acceptance gate
50 state pages build with real counts; a facility page renders CMS facts +
noindex meta verified; claim writes a `hospice_claim` lead + email; apply
form arrives prefilled; digest test-render returns AI paragraph + stats
with suppression respected for a small-n partner; cron with flag off still
returns `{disabled:true}`; word-ban grep on employer surfaces clean; suite
green.

### Founder actions today — **Rename-Day pre-staging (do not skip):**
1. In Squarespace DNS for `openfarewell.com`: add the **Google Workspace
   MX records** and the **Resend DKIM/SPF records** (start verification in
   Resend), and add the domain in **Vercel** (it will show the A/CNAME
   values to set). None of this changes anything user-visible — it makes
   Monday's flip instant instead of blocked on propagation.
2. In Google Workspace: add `openfarewell.com` as a secondary domain;
   recreate the alias set.
3. Confirm TESS result status with counsel (gates Monday).

### Cut inside Day 7
Facility pages → state pages only (keep the claim CTA on state pages).
Digest AI paragraph → deterministic email keeps shipping. Never cut: the
DNS pre-staging (it's on the founder, not the session — but the session
reminds).

---

## DAY 8 — Sat Jul 25 · QA + docs truth + rename confirm

**Objective:** the sprint's §5 QA passes on prod, the strategy docs stop
lying, and Monday is fully cleared.

### Tasks
1. **Full §5 QA** (sprint doc — run every line): mechanical + VERIFY on
   prod · money guardrails (stripe-scope grep + pins, insurer, flag) ·
   anti-steering + word bans · badge honesty + consent-filter proof ·
   kill switches (`OUTREACH_LIVE` dry-run proof, digest `{disabled:true}`,
   billing arrangement-copy) · privacy/RLS (hospices deny-all; webhook
   column scope) · SEO smoke (sitemap, noindex list, Lighthouse on `/`,
   `/funeral-costs/salt-lake-city`, `/hospices/utah`, `/portal`).
2. **Docs truth pass (D10)** — flip the stale claims the Jul-15 audit
   found: ROADMAP L1 (methodology + index pages EXIST), backlog #1/#2
   (digest + explain SHIPPED), inbound-parse shipped, GO_TO_MARKET 0.2
   (decommission complete; tombstone redirects intentional), AI_STRATEGY
   §3.3 foundations table (all five done as of this sprint — eval harness
   Day 2), and mark this sprint's own shipped items.
3. **DEMO_SCRIPT.md additions:** the ingest beat (90-second GPL), the
   billing beat (test-mode subscribe on `/portal/settings`), the nominate
   beat (finder → intro), tier badges already in from last week.
4. **§2 demo top-to-bottom on prod**, recorded.
5. **Rename-day clearance checklist:** TESS back clean · Vercel shows the
   new domain verified · Workspace + Resend records green · the Monday code
   PR is prepared on a branch (see Rename Day §1) · rollback note written
   (repoint Vercel primary back; DNS untouched).

### Acceptance gate
Every §5 line has a ✓ or a filed fix; the demo recording exists; the
clearance checklist is all-green or Monday slips (the plan says the rename
slips a week before anything else does — say it out loud if so).

---

## RENAME DAY — Mon Jul 27 · Honest Funeral → Open Farewell, everywhere

**Precondition:** Sat's clearance checklist green. Split of labor: the
session drives code + verification; the founder drives every account
console. Old-domain inbound email is the one thing that must not blink.

### 1. The code PR (session — prepared Saturday, merged first thing)
- `lib/brand.ts` values flip: name "Open Farewell", domain
  "openfarewell.com", url from env, support address per founder's
  Workspace setup.
- `NEXT_PUBLIC_APP_URL` → `https://openfarewell.com` (Vercel env, all
  environments).
- The grep sweep: `grep -rn "Honest Funeral\|honestfuneral" app lib
  components docs scripts supabase --include="*.ts*" --include="*.md"` —
  every hit either reads `BRAND`, is the old-domain 301/inbound config
  (keep), or is a docs/history reference (annotate, don't rewrite
  history). Known hotspots from the audit: `lib/og.ts` images, print
  letterheads (analyzer + ProofSheet), `app/sitemap.ts` host,
  JSON-LD blocks (fair-price-index, methodology), email templates
  (`lib/email.ts`, welcome/nurture/anniversary/digest bodies),
  `docs/sales/*`, `scripts/seed-demo.mjs` demo copy.
- Host-based redirect: keep `honestfuneral.co` attached to the Vercel
  project; in `proxy.ts`, host === old domain → 308 to
  `https://openfarewell.com` + same path — **EXCEPT paths under `/api/`**
  (Postmark webhooks, cron, inbound must not bounce through redirects).
- Tests: brand-grep script lands in CI (fails on stray literals outside
  the allowlist); suite green.

### 2. The account consoles (founder, with the session watching)
In order: Vercel — add/verify `openfarewell.com` + `www`, set as primary ·
Squarespace — A/CNAME per Vercel; 301-forward the 7 secondary domains ·
Resend — confirm domain verified, flip from-addresses env · **Postmark —
inbound stays configured on the old domain** (reply-to hashes on in-flight
cases live there; new cases mint new-domain reply-tos only when the inbound
domain migration is deliberately done, later); update the webhook URL to
the new host · Google Workspace — flip primary when ready (aliases already
staged Friday) · Search Console — add property, submit change-of-address,
resubmit sitemap · Stripe — account display name + statement descriptor
(before any real billing) · socials — bios live, link in each.

### 3. End-of-day proof (session)
- The sprint §2 demo re-run on `https://openfarewell.com`.
- Ten old-domain deep links (guide, city page, portal, analyzer, partner
  sample) → each lands on its new-domain twin, 308, path preserved.
- A seeded inbound reply to an in-flight old-domain case → thread updates,
  auto-parse proposal renders (the invariant that must not break).
- Magic-link sign-in on the new domain (`/auth/callback` origin allowlist —
  verify, this is the classic rename breakage).
- `npm run smoke:check` against the new domain; Lighthouse spot on `/`.
- Post-rename watch items filed for +2wk/+6wk: Search Console impressions
  curve, 404 log on the old host, DKIM deliverability on the first digest.

**Rollback (if anything structural breaks mid-day):** Vercel primary back
to `honestfuneral.co`, revert the code PR, DNS stays (it's additive). The
old domain never stopped working — that's the design.

---

## The founder's 11 days at a glance

| Day | Your actions |
|---|---|
| Thu 16 | Commission TESS (if not done) · optional: read BASELINE.md |
| Fri 17 | Evening: ingest one real GPL on preview (the weekend depends on the tool) |
| Sat–Sun | Utah CSV → import → vet · ingest GPLs · promote SLC/Provo · start CA |
| Mon 20 | **Apply Migration A** (morning) · download CMS hospice CSV · run import |
| Tue 21 | Click the verified section on the SLC city page once it's live |
| Wed 22 | Phone-walk the homepage lanes + nominate flow; flag copy |
| Thu 23 | **Apply Migration B** · Stripe test-mode product + price (**pricing decision due**) · env keys · click test checkout |
| Fri 24 | **Rename pre-staging: Squarespace DNS records (Workspace MX, Resend DKIM, Vercel), Workspace secondary domain** · chase TESS |
| Sat 25 | QA hour together · record the demo · clear the rename checklist |
| Mon 27 | **Rename Day**: the console flips (§2 above), with the session driving verification |

Standing all 11 days: merge nothing without your go (PR per day) ·
`OUTREACH_LIVE`, `PARTNER_DIGEST_ENABLED`, `BILLING_LIVE` stay off ·
every day ends with the mechanical suite + guardrail grep.
