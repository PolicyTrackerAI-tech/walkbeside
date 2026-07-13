# Product Week — Mon Jul 13 → Fri Jul 17, 2026 (+ weekend data buffer)

**Mission:** by EOD Friday, Honest Funeral is a genuinely two-sided product. A
hospice or employer **signs in** to a real portal (accounts, team, dashboard,
materials, settings — not a bearer-token URL), distributes the product to the
families it serves, and watches documented impact accumulate. A family arriving
through a partner gets a **smoother, fully-connected** free experience where
the flagship checker feeds the advocacy flow instead of dead-ending. Every
price a user sees carries an **honest data tier** (verified / community /
modeled) covering **all 50 states**, and the AI layer gains the missing
infrastructure (cost tagging, caching, redaction) plus two new high-value,
fully-grounded features. Product work only — no legal, no sales-process tasks.

This plan was written 2026-07-12 from a five-way audit of current
`origin/main` (HEAD `dffc0b2`). Every task references real files. It follows
`CLAUDE.md` as law and deliberately does **not** re-plan anything already
shipped (partner attribution, outcomes columns, AI digest, trust pages, $0
family flow — all live).

---

## 1. Verified baseline (what the audit found, Jul 12)

### Build on these — they are solid and reusable
- **Partner data spine:** `partners` + `partner_codes` tables with deny-all
  RLS, `negotiations.partner_id/partner_code` attribution written at
  `app/api/negotiate/start/route.ts:116-137`, and comments in
  `supabase/migrations/2026-06-27-partners.sql:48-53` explicitly reserving
  `partner_members` + branding as "additive later, zero repaint."
- **The metrics engine:** `lib/partner-report.ts` `aggregateCohort()` — 
  aggregate-only, with type-level small-n suppression (`SMALL_SAMPLE_THRESHOLD
  = 5` forces every dollar/satisfaction field to `null` below n=5). The
  sellable numbers already computed: families helped, overcharge caught, avg
  satisfaction, median resolution days, tool engagement, pilot metrics.
- **`<ProofSheet>`** (`components/partner/ProofSheet.tsx`, 345 lines): the
  report artifact with empty/small-sample/full states, print support, and the
  AI outcomes digest (`lib/partner-report-digest.ts`, Claude + deterministic
  fallback).
- **The analyzer pipeline:** vision OCR → extraction → deterministic
  classify/FTC-rules → grounded advocacy summary, every AI step with a
  deterministic fallback, totals reconciled (`lib/analyzer-totals.ts`).
- **The 50-state modeled substrate:** `lib/zip-regions.ts` — 914 zip3 entries
  covering all 50 states + DC + PR/VI with cost multipliers. The national
  expansion is mostly a labeling + override problem, not a data-creation one.
- **Crowd pipeline:** `lib/benchmark-pipeline.ts` aggregates
  `price_list_analyses` with dedup, per-unit carve-outs, percentiles, n≥5
  gating — currently surfacing only on `/admin/benchmarks`.

### The true gaps this week closes
| # | Gap | Evidence |
|---|---|---|
| P1 | **No partner sign-in.** The entire "portal" is possession of `report_token` in a URL (`lib/partner-auth.ts`, 37 lines). No accounts, no team/seats, no settings, no sign-out. Token sits in browser history and gets forwarded. | partner audit §D |
| P2 | **No dashboard shell.** Portal = 3 tabs (`components/partner/PartnerPortalNav.tsx`) over marketing-site chrome. No home, no materials/collateral, no CSV export, no first-run onboarding. | partner audit §D |
| P3 | **Employer support is a dropdown value.** Zero behavioral branching on `partner_type` anywhere; all copy hard-codes hospice framing (42 CFR 418.64, CAHPS). An employer would get a compliance report that doesn't apply to them. | partner audit §E |
| P4 | **The flagship analyzer dead-ends.** After "$X above fair," no bridge to `/negotiate/start` (`app/analyzer/Analyzer.tsx:589-605`). Highest-intent families hit a wall. | family audit gap #1 |
| P5 | **Analyzer drops partner attribution.** `price_list_analyses` has no partner columns; a referred family who only checks a quote is invisible to their hospice's report. | family audit gap #2 |
| P6 | **Families are never asked what they paid.** `amount_paid_cents` is admin-entry-only; the ROI number the portal sells can't self-populate. `/api/negotiate/[id]/outcome` already accepts it — no UI sends it. | family audit gap #3 |
| P7 | **"We contact homes for you" but the family types quotes in by hand** (`app/negotiate/[id]/status/page.tsx:359-458`). `summarizeQuoteSystem()` is written and has zero callers. | family audit #4, AI audit §B |
| P8 | **Navigation hides the product.** `/analyzer`, `/prices`, `/negotiate/start`, `/dashboard`, `/plan-now` are reachable from zero nav/footer links (`components/SiteHeader.tsx:31-37`, `components/Brand.tsx:131-174`). Referral memory only mounts on 2 routes. | family audit #5, #10 |
| P9 | **`dataSourceForZip()` is a constant.** Returns `"national-adjusted"` for every zip (`lib/pricing-data.ts:687-689`); the `validated`/`metro-average` labels are unreachable; `/methodology` + `/prices` promise per-metro sharpening that can never display. No per-region benchmark store exists. | data audit §E/F |
| P10 | **Real quote data is collected and never used.** `negotiation_outreach.quote_items` (itemized, real, from live cases) is aggregated nowhere. | data audit §C |
| P11 | **Unsourced numbers.** `lib/funeral-homes-pricing.ts:62-68` constants power `/funeral-homes/[zip]` price cards but appear in no catalog/methodology; city pages present unvalidated multipliers with 2-decimal authority. Guardrail #4 exposure. | data audit §F |
| P12 | **AI infra 0-for-5** on `AI_STRATEGY.md` §3.3: no cost tagging, no prompt caching, no eval harness, no PII redaction pre-AI/pre-storage, no extraction-confidence persistence. Plus `/api/analyze-price-list/draft-letter` is the one unthrottled Claude endpoint. | AI audit §C |
| P13 | **Legacy `pending_payment` cruft.** New cases still write `status:"pending_payment"` (`app/api/negotiate/start/route.ts:104`); `choose/route.ts:39-44` can bounce families to the dead `/preview` redirect. | family audit #7 |
| P14 | **Demo-request leads vanish** — `/api/partner/demo-request` emails only, writes no row; nothing appears in `/admin/partners`. | partner audit §E |

### Explicitly NOT this week
No grief-chat/concierge (backlog marks it highest-risk, needs its own safety
review). No metro "reputation profiles" or home-level public claims (no data
density — would fabricate; guardrail #4). No AI-generated outreach email (the
grounding guard doesn't exist; outreach stays the deterministic template,
`OUTREACH_LIVE` stays off). No PHI intake of any kind (families self-enroll;
the hospice transmits nothing). No resurrection of the old 4-table portal spec
schema — everything is additive on `partners` + `partner_codes`. No consumer
charge of any kind, ever.

---

## 2. The end-state demo (what "done Friday" means)

Runs clean on production with the seeded demo partner:

1. **Founder** approves a pending application at `/admin/partners` → the
   contact gets an email invite: *"Your Honest Funeral portal is ready — sign
   in."* (The quick-link token URL still works and is included as the
   no-account fallback for line staff.)
2. **Hospice owner signs in** at `/portal` (magic link, no password) → lands
   on a real dashboard: impact numbers (or a warm first-run checklist at zero
   cases), team, referral links, quote check, materials, settings.
3. Owner **invites a bereavement coordinator** from `/portal/team` → the
   coordinator signs in with her own email.
4. Coordinator opens `/portal/links` → creates a labeled referral link + QR in
   under 30 seconds → hands the card to a family. She also pastes a family's
   quote into `/portal/check` and taps **"why?"** on a flagged line item to
   get a plain-English, citation-grounded explanation she can repeat.
5. **Family** opens the link → co-brand banner ("Provided free by Demo
   Hospice" + the neutrality pledge) → runs the **analyzer** → verdict carries
   a **data-tier label** ("Modeled estimate — methodology ↗" or "Verified —
   based on N local price lists") → one tap continues into **"have us contact
   homes near you"** with zip/service/quote pre-filled — no re-typing, no
   payment UI anywhere.
6. A funeral home replies by email → the reply is **AI-pre-parsed** into a
   proposed quote → family sees "We read this reply: $X,XXX — confirm?" →
   one click records it. Family compares neutrally, chooses; the closed page
   asks satisfaction **and what they actually paid**.
7. **Back in `/portal`**, the dashboard now shows the aggregates (n≥5
   suppression respected), the AI monthly digest narrates them, and the owner
   downloads the CSV + prints the proof sheet. An **employer** demo account
   shows the same portal with employer framing — no CAHPS/Medicare language.
8. **Any US zip** entered anywhere returns a fair range labeled with its tier
   and linked to `/methodology`, which now describes exactly how each tier is
   computed.

If a step can't run, the week isn't done. This is also the sales demo,
upgraded from today's script (which this plan must never break — see §7).

---

## 3. Architecture decisions (locked now so build days don't stall)

**D1 — Portal auth = Supabase magic-link + `partner_members`, additive.**
New `partner_members` table (the exact shape reserved in
`2026-06-27-partners.sql:48-53`). `lib/partner/auth.ts` gets
`requirePartnerMember(minRole?)` mirroring `lib/admin-auth.ts`
`requireAdminPage` exactly: Supabase session → service-role lookup by
`user_id` (or bind-on-first-login by `invited_email`) → return `{partner,
member}` or redirect to `/portal/login`. RLS on `partner_members` stays
**deny-all** (service-role only) — same posture as `partners`/`partner_codes`;
no new client-readable surface. Two roles: `owner`, `member`. Passwordless
magic link (coordinators won't manage passwords).

**D2 — New authenticated surface at `/portal`; token links keep working.**
`/portal/(overview|links|check|team|materials|settings)` is the sign-in
portal. The existing `/partner/r/[token]/*` routes stay live rendering the
same shared components (they're the zero-friction path for line staff and the
demo fallback), gaining a banner: "Create your team's account →". The
approval email leads with the sign-in invite, includes the quick link second.
`/partner/[code]` (the public **sample** proof sheet the demo script depends
on) is untouched except clearer "Sample data" labeling — do not rename it,
`docs/sales/DEMO_SCRIPT.md` references `/partner/sample-hospice`.

**D3 — Employer = same portal, branched framing, no fork.**
Branch on the existing `partners.partner_type` (`'hospice'|'employer'`) in
copy and metric selection only: employer surfaces say "employees supported,"
drop the 42 CFR 418.64 / CAHPS / bereavement-mandate cards, keep savings +
satisfaction + tool engagement. One new public page `/employers` mirroring
`/partners` with employer copy (EAP/benefits framing). The digest prompt gets
`partner_type` in its grounding JSON. `insurer` stays schema-only (guardrail:
insurers never pay us — no UI invites them).

**D4 — Partners see aggregates, never rows — unchanged and enforced.**
Sign-in changes *who* can see the dashboard, never *what* it shows. All
portal reads go through the existing service-role aggregate path
(`aggregateCohort`). No RLS policy will grant partner members SELECT on
`negotiations`, `profiles`, `price_list_analyses`, or `negotiation_messages`.
Referral-link rows expose label/status/date/claim-counts only. n≥5
suppression stays type-enforced.

**D5 — Data honesty = three tiers, one lookup, DB overrides.**
New `regional_benchmarks` table holds per-region **overrides** (tier
`verified` or `community`, versioned, n-counted, sourced). The hardcoded
`LINE_ITEMS × regionMultiplier` remains the universal **modeled** fallback —
so all 50 states are covered on day one and nothing regresses if the table is
empty. `dataSourceForZip()` becomes a real function; every user-facing price
renders its tier + last-updated + a `/methodology` link. Verified rows are
**promoted by a human** on `/admin/benchmarks` (no auto-apply — preserves the
pipeline's "proposes, never applies" invariant and the publish gate: n≥5, no
override switch).

**D6 — AI stays grounded-or-silent; new writes are human-confirmed.**
Every new AI feature follows the proven pattern: deterministic ground truth →
Claude narrates/extracts → deterministic fallback → human confirms anything
that persists or sends. Inbound quote parsing renders as a *proposal* the
family/admin confirms; the line-item explainer is display-only and grounded in
the already-computed finding + rule citation. All call sites move onto the
cost-tagged wrapper. No AI output ever writes price data or sends email
without a click.

**D7 — One migration per build day, founder-applied.**
Same discipline as every shipped migration: idempotent SQL in
`supabase/migrations/2026-07-1X-*.sql`, headed "FOUNDER-APPLIED ONLY,"
regenerate `BOOTSTRAP.sql` (`scripts/build-bootstrap-sql.mjs`), update
`VERIFY.sql`, code degrades gracefully until applied. Three migrations total
(Mon, Thu, Fri). **Founder action each evening: run the day's migration in
the Supabase SQL editor.**

**D8 — Worktree hygiene first.** Six stale worktrees under
`.claude/worktrees/` (`checker-correctness`, `payment-decommission` (now on an
unrelated branch), `rewire-plans`, + 3 unnamed) get triaged Monday morning:
merge nothing blindly — verify each against `origin/main`, harvest anything
unshipped, `git worktree remove` the rest. Ship week = one worktree per day,
merged same-day.

---

## 4. Schema changes (three migrations, final shapes)

### Migration 1 — `2026-07-13-portal-identity.sql` (Monday)
```sql
-- Partner sign-in seats (shape reserved in 2026-06-27-partners.sql L48-53)
create table if not exists public.partner_members (
  id             uuid primary key default gen_random_uuid(),
  partner_id     uuid not null references public.partners(id) on delete cascade,
  invited_email  text not null,
  role           text not null default 'member' check (role in ('owner','member')),
  user_id        uuid references auth.users(id) on delete set null,
  invited_at     timestamptz not null default now(),
  accepted_at    timestamptz,
  deactivated_at timestamptz,
  created_at     timestamptz not null default now(),
  unique (partner_id, invited_email)
);
-- RLS: ENABLED, zero policies (service-role only) — same posture as partners.

-- Portal settings (additive; logo upload is a cut-line item, accent ships)
alter table public.partners
  add column if not exists brand_accent text,
  add column if not exists notification_email text;

-- Demo-request leads stop vanishing (P14)
create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  name text, org text, email text not null, note text,
  source text not null default 'demo_request',
  created_at timestamptz not null default now()
);  -- RLS: enabled, zero policies; service-role insert/read.

-- Analyzer attribution + extraction provenance (P5, P12/#3)
alter table public.price_list_analyses
  add column if not exists partner_id uuid references public.partners(id) on delete set null,
  add column if not exists partner_code text references public.partner_codes(code) on delete set null,
  add column if not exists confidence numeric,
  add column if not exists extraction_method text;  -- 'claude' | 'naive'

-- AI cost ledger (AI_STRATEGY §3.3 #1)
create table if not exists public.api_cost_events (
  id uuid primary key default gen_random_uuid(),
  feature text not null, model text not null,
  input_tokens int not null default 0, output_tokens int not null default 0,
  negotiation_id uuid, created_at timestamptz not null default now()
);  -- RLS: enabled, zero policies; service-role write, /admin read.
```

### Migration 2 — `2026-07-16-inbound-ai-parse.sql` (Thursday)
```sql
-- Proposed (unconfirmed) AI parse of an inbound funeral-home reply (P7)
alter table public.negotiation_messages
  add column if not exists ai_quote_cents int,
  add column if not exists ai_quote_items jsonb,
  add column if not exists ai_parse_confidence numeric,
  add column if not exists ai_parsed_at timestamptz,
  add column if not exists ai_confirmed_at timestamptz;
-- Rides existing RLS. Confirm writes still flow through the existing
-- /api/negotiate/[id]/quote path — the AI columns are never the ground truth.
```

### Migration 3 — `2026-07-17-regional-benchmarks.sql` (Friday)
```sql
-- Per-region benchmark overrides — the verified/community tier store (P9/P10)
create table if not exists public.regional_benchmarks (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('zip3','metro','state')),
  scope_value text not null,          -- e.g. '841', 'Salt Lake City', 'UT'
  line_item_id text not null,         -- joins lib/pricing-data LINE_ITEMS ids
  fair_low_cents int not null,
  fair_high_cents int not null,
  predatory_at_cents int,
  tier text not null check (tier in ('verified','community')),
  n_data_points int not null default 0,
  sources jsonb,                      -- [{name, url?, kind, accessed}]
  version text not null,              -- e.g. '2026-07-v1'
  active boolean not null default true,
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (scope, scope_value, line_item_id, version)
);  -- RLS: enabled, zero policies; read via server components/service role.
    -- Modeled tier needs NO rows — it's the code fallback (zip-regions × catalog).

-- funeral_homes: the two DATA_PLAN columns the week actually needs
alter table public.funeral_homes
  add column if not exists website text,
  add column if not exists gpl_url text,
  add column if not exists last_verified_at timestamptz;
```

---

## 5. Workstreams

### WS-1 · Partner portal with real sign-in (Mon–Tue) — P1, P2, P3, P14

**Monday — identity + shell.**
1. **Worktree triage** (D8), then Migration 1.
2. `lib/partner/auth.ts`: `requirePartnerMember(minRole?)` — session via the
   existing Supabase server client, service-role lookup in `partner_members`,
   bind-on-first-login (`invited_email` match → set `user_id`,
   `accepted_at`), redirect to `/portal/login` when absent. Unit-test the
   role/bind/deactivated matrix (pattern: `lib/admin-auth.ts` tests).
3. `/portal/login`: email → magic link (Supabase OTP). Calm copy, no
   marketing chrome.
4. `app/portal/layout.tsx`: the dashboard shell — org name, partner-type
   badge, left nav (Overview · Referral links · Quote check · Team ·
   Materials · Settings), sign-out. `robots: noindex`.
5. `/portal` (overview): reuse `<ProofSheet live>` + the AI digest exactly as
   `/partner/r/[token]/page.tsx:1-190` builds them (extract that page's data
   assembly into `lib/partner/report-data.ts` so both routes share it). At
   zero cases: a **first-run checklist** (create your first link → where to
   hand it out → what appears here once families use it) instead of the bare
   empty state.
6. Approval flow: `PATCH /api/admin/partners/route.ts` additionally creates
   the owner `partner_members` row from `contact_email` and sends the
   sign-in invite (Resend, pattern: `lib/welcome-email.ts`); keep the token
   quick-link in the email as the secondary path.
7. Token-route banner: `/partner/r/[token]/*` gains one line — "This link
   works forever. Want a team dashboard? Create your account →".
8. Retire `pending_payment` from new writes (P13): `start/route.ts:104`
   writes the post-consent initial status; `choose/route.ts:39-44` stops
   redirecting to the dead `/preview`; `CaseStepper.tsx:37-48` keeps mapping
   legacy rows. (One-hour fix, permanent trust win.)

**Tuesday — team, materials, settings, employer, leads.**
1. `/portal/team` (owner-only): list members, invite by email (creates row +
   sends magic-link invite), deactivate (`deactivated_at`). ≤2 fields.
2. `/portal/links` + `/portal/check`: wrap the existing `LinksClient` and
   `CoordinatorCheck` components in the shell (they already work; the token
   variants keep using them too).
3. `/portal/materials`: print-CSS one-pager (co-branded: partner name +
   accent + the verbatim neutrality constant from
   `COMPLIANCE_ADDENDUM.md` §2.4), QR poster per referral link, and two
   copy-paste snippets (coordinator hand-off script; family email). "Print /
   Save as PDF" via the existing `PrintButton` pattern.
4. `/portal/settings` (owner-only): org name (read-only), contact +
   notification email, brand accent color, **rotate quick-link token**
   (self-serve revoke — closes the shared-token security gap), digest opt-in
   status. Logo upload is a cut-line item (§8).
5. **Employer variant** (P3): `partnerType` prop through `ProofSheet` —
   hospice keeps the 42 CFR/bereavement cards; employer swaps headline
   framing ("employees supported through a loss"), drops CAHPS/Medicare
   language everywhere; `lib/partner-report-digest.ts` grounding JSON gains
   `partner_type` so the digest speaks the right language. New `/employers`
   public page (mirror `/partners`, EAP/benefits framing, same apply form
   with type preselected). Nav on `/partners` cross-links.
6. **Leads fix** (P14): `/api/partner/demo-request` also inserts
   `partner_leads`; `/admin/partners` shows a "Leads" strip above pending
   applications.
7. CSV export on `/portal` overview: client-side from the aggregate JSON
   (respects D4 — aggregates only leave the server).
8. Extend `scripts/seed-demo.mjs`: "Demo Hospice" (n≥6 closed cases with
   outcomes so suppression clears) + "Demo Employer," 2 members each,
   referral links across statuses — clearly-fictional data, labeled in-app.

*Acceptance:* §2 demo steps 1–4 + 7 run in dev; member of org A sees nothing
of org B (test `requirePartnerMember` isolation); no portal payload contains
family PII (inspect JSON); token routes unbroken; typecheck/lint/build/vitest
green.

### WS-2 · Family flow + attribution overhaul (Wednesday) — P4, P5, P6, P8

1. **Attribution everywhere** (P5, P8-referral): mount `RememberReferral` in
   `app/layout.tsx` (it's a 17-line invisible client component — today only
   `/plan-now` + `/analyzer` mount it); analyzer write path
   (`app/api/analyze-price-list/route.ts:200-217`) resolves the remembered
   code exactly like `negotiate/start/route.ts:116-133` and stamps the new
   `partner_id`/`partner_code` columns (best-effort, never blocks); partner
   report (`lib/partner/report-data.ts`) counts checker-only families via
   direct attribution instead of the user-join back-derivation.
2. **Analyzer → negotiate bridge** (P4): results panel gains the primary CTA
   "Get quotes from homes near you — free" → `/negotiate/start` with a
   sessionStorage handoff (`zip`, `serviceTypeHint`, detected total, optional
   home name — the wizard prefills steps 1/2/4 and says "from your quote
   check"). Add the optional "Which funeral home is this from?" text field to
   the analyzer form (feeds the handoff; no autocomplete dependency this
   week). Secondary CTAs (draft letter / copy / print) remain.
3. **Ask what they paid** (P6): `CaseSatisfaction.tsx` on
   `/negotiate/[id]/closed` grows two optional fields — "What did you end up
   paying, all-in?" and "Any fees that surprised you?" — posting
   `amountPaidCents` (+ notes) to the existing `/api/negotiate/[id]/outcome`
   route (`outcome/route.ts:20,62-64` already accepts it). Aggregates flow to
   the portal with zero new server code.
4. **Navigation exposes the product** (P8): `SiteHeader.tsx:31-37` gains
   "Check a quote" (`/analyzer`) and "Fair prices" (`/prices`); the footer
   Tools column adds Analyzer · Fair prices · Have us contact homes ·
   Dashboard · Plan ahead. `/where` (`app/where/page.tsx:18-45`) adds the
   missing fifth path: "I already have a quote — check if it's fair."
5. **CTA verb system** (family audit #8): one pass fixing the four names for
   `/negotiate/start` to a single verb phrase ("Have us contact funeral homes
   — free") across `app/negotiate/start/page.tsx:255`,
   `app/dashboard/page.tsx:172`, `app/prices/page.tsx:42`,
   `app/decide/DecideFlow.tsx:383`, homepage cards.
6. **Dashboard focus pass** (family audit #15): anonymous dashboard leads
   with 3 CTAs (check a quote / see fair prices / have us contact homes);
   signed-in keeps the 3-task promise by collapsing the 15-tile grid behind
   "All tools."
7. **Status-page hygiene** (family audit #13): polling backs off (6s → 30s
   after 5 min) and pauses on `document.hidden`.

*Acceptance:* referred family's analyzer run appears in the partner report
without a negotiation; analyzer → wizard carries zip/service/quote with no
re-typing; closed page captures paid amount into `amount_paid_cents`; every
core tool reachable from nav/footer; guardrail grep clean (attribution stays
reporting-only — never touches `directory.ts` selection or ranking).

### WS-3 · AI deepening (Thursday) — P7, P12 + backlog #2

1. **Cost-tagged wrapper** (P12): `lib/claude.ts` gains
   `callClaude({feature, system, messages, maxTokens, negotiationId?})` —
   wraps `messages.create`, reads `msg.usage`, best-effort inserts
   `api_cost_events`, logs through `lib/observability.ts`, adds
   `cache_control: {type:"ephemeral"}` on the stable system prompts (the
   analyzer system prompt is reused by 3 surfaces — pure cost win). Migrate
   all 9 call sites (audit §A table is the checklist); keep `textOf`/
   `claudeAvailable` exports. Tiny `/admin/ai-costs` table (feature ×
   day × tokens) reading the ledger.
2. **Rate-limit the letter drafter** (P12): add
   `/api/analyze-price-list/draft-letter` to `RATE_LIMITS`
   (`lib/rate-limit.ts:20-30`) — the one unthrottled Claude endpoint,
   reachable from the public coordinator tool.
3. **Inbound quote auto-parse, human-confirmed** (P7): Migration 2. New
   `lib/negotiation/parse-reply.ts` calling the orphaned
   `summarizeQuoteSystem()` through the wrapper; hook at the end of
   `app/api/inbound/email/route.ts` (best-effort — parse failure changes
   nothing); store the proposal on the message row. `status/page.tsx`
   `OutreachRow` renders "We read this reply: **$X,XXX** (N items) —
   Confirm / Edit" → confirm posts the existing
   `/api/negotiate/[id]/quote` route and stamps `ai_confirmed_at`. The same
   proposal appears in `/admin/outcomes` for founder-run cases. Kills the
   type-it-in-yourself step while keeping ground truth human-confirmed.
4. **"Explain this line item"** (the one unbuilt backlog next-up): a "why?"
   affordance on each finding in `components/analyzer/ViolationsPanel.tsx`
   (family analyzer + `/portal/check` inherit it) → new
   `/api/analyze-price-list/explain` grounded ONLY in the computed finding +
   the `LINE_ITEMS` entry + the FTC rule citation from
   `lib/bundling-detection/rules.ts`; display-only, rate-limited,
   deterministic fallback (the rule's existing "what to say" script).
5. **Extraction provenance** (P12/#3): analyzer route persists `confidence` +
   `extraction_method` ('claude'|'naive') on `price_list_analyses` — seeds
   every future benchmark-quality decision.
6. **Redaction pass** (P12/#5, scoped honestly): `lib/redact.ts` — emails,
   phones, SSN-like and account-number patterns — applied to
   `price_list_analyses.raw_text` before insert and to the
   subscription-finder statement text before it reaches Claude. (Names stay:
   obituary/eulogy require them; GPLs don't contain them.) Unit tests with a
   PII-laden fixture.

*Acceptance:* every Claude call logs feature + tokens; a seeded inbound reply
→ proposal → confirm → outreach row updated via the existing quote path; the
explainer answers from the finding + citation only (spot-check: it refuses
when asked beyond the finding); no unthrottled AI endpoint remains.

### WS-4 · Data tiers: Utah → all 50 states (Friday + weekend) — P9, P10, P11

**Friday — the tier system ships.**
1. Migration 3, then `lib/benchmarks-store.ts`: `benchmarkFor(zip, itemId)` →
   narrowest active `regional_benchmarks` row (zip3 → metro → state) or null;
   in-memory per-request cache. `dataSourceForZip()`
   (`lib/pricing-data.ts:687-689`) becomes real: `verified` / `community`
   when an override matched, else `modeled` (the honest new name for
   national-adjusted; keep the old string as an alias so nothing breaks).
   `adjustedRange()` callers and the analyzer classify step
   (`app/api/analyze-price-list/route.ts:119-129`) consult the store first —
   per-unit/state-fee carve-outs unchanged (the checker-correctness
   invariants stay law).
2. **Tier labels everywhere a number renders:** `/prices`
   (`PriceCalculator.tsx:198`), `/funeral-homes/[zip]` (`page.tsx:97`),
   `/funeral-costs/[city]`, analyzer verdict, `/fair-price-index` — a small
   `<DataTierBadge tier n lastUpdated>` linking `/methodology`.
3. **Honesty fixes** (P11, guardrail #4): fold the
   `lib/funeral-homes-pricing.ts:62-68` constants into the audited catalog
   (map to existing `LINE_ITEMS` entries or add sourced entries;
   `TYPICAL_OPTIONAL_BY_SERVICE` ids `casket-basic`/`vault-basic` resolve to
   real catalog ids); soften city-page multiplier copy
   (`app/funeral-costs/[city]/page.tsx:154-160`) to "estimated cost index";
   `/methodology` rewritten around the three tiers (definitions, sources with
   access dates, known limitations, correction policy — verify the NFDA/CFA
   figures against their published studies during the build); `/prices` +
   `/methodology` stop promising per-metro validation that can't display —
   now it can, so say when it will.
4. **Verified-tier machinery:** extend `lib/benchmark-pipeline.ts` to also
   aggregate `negotiation_outreach.quote_items` (real itemized quotes — the
   richest data we hold, currently aggregated nowhere) alongside analyses;
   `/admin/benchmarks` gains **"Promote to verified"** — writes a
   `regional_benchmarks` row (tier, scope, n, sources, version) only when
   n≥5; no override path (the publish gate). Community tier: metro groups
   with n≥5 can be promoted `tier='community'` the same way — surfacing on
   public pages stays gated behind founder promotion.
5. Full QA + guardrail pass (§7) + deploy + run the §2 demo on prod.

**Sat–Sun — data volume (buffer, founder-paced).**
- `scripts/ingest-gpl.mjs`: input = GPL text/photo + zip + home name → runs
  the existing extract chain (through the cost-tagged wrapper) → terminal
  spot-check prompt → writes a tagged `price_list_analyses` row (+
  `funeral_homes.gpl_url/last_verified_at` when sourced from a home's site).
- **Utah first:** finish the real `supabase/seed/utah-homes.csv` import
  (30–60 SLC/Provo homes per `docs/UTAH_HOMES_SOURCING.md`), ingest every
  Utah GPL we can collect (homes that publish + any received via replies) →
  promote **Salt Lake City + Provo to verified** on `/admin/benchmarks`.
- **California metros next** (LA, SF Bay, San Diego, Sacramento): CA law
  (SB 658) requires funeral establishments to post GPL pricing online — the
  highest-yield legal collection ground; store `gpl_url` + capture date;
  fetch only what homes themselves publish. FCA affiliate price surveys as
  cross-checks, attributed in `sources`.
- `scripts/import-hospices.mjs`: CMS Provider Data Catalog hospice CSV
  (~5–6k providers) into a `hospices` reference table (part of a weekend
  migration if pursued) — powers apply-form autocomplete + next week's
  programmatic hospice pages. Weekend-optional; not on Friday's critical
  path.

*Acceptance:* any US zip returns a tiered, labeled, methodology-linked range;
zero regressions in `lib/__tests__/checker-pipeline.test.ts` + the rules
suite; no user-facing dollar figure without provenance (grep + manual pass);
weekend goal: UT×2 verified metros with visible n, CA collection started.

### WS-5 · Sellability polish (woven through, verified Friday)

Materials + CSV + first-run checklist (Tue), demo seed clearing n≥5 (Tue),
tier-labeled verdicts that make the demo's "is this fair?" beat *more*
credible (Fri), the coordinator "why?" explainer (Thu) — each maps to a beat
in `docs/sales/DEMO_SCRIPT.md`. Friday's QA includes running the demo script
top to bottom on prod and updating it where the product got better (sign-in
portal replaces "copy the URL" in setup; auto-parse replaces "type the
quote").

---

## 6. Day-by-day schedule

| Day | AM | PM | Gate before stopping |
|---|---|---|---|
| **Mon 13** | Worktree triage · Migration 1 · `requirePartnerMember` + tests · `/portal/login` | `/portal` shell + overview (shared report-data) · approval→invite email · token-route banner · `pending_payment` retirement | Sign-in works in dev; org isolation test passes; WS-1 Mon acceptance |
| **Tue 14** | `/portal/team` · settings + token rotation · materials | Employer branching + `/employers` · leads fix · CSV · seed demo orgs | §2 steps 1–4, 7 run in dev on seeded data |
| **Wed 15** | Attribution everywhere + analyzer partner columns · analyzer→negotiate bridge | Paid-amount capture · nav/footer + `/where` path · CTA verb pass · dashboard focus · polling backoff | WS-2 acceptance; guardrail grep clean |
| **Thu 16** | Cost wrapper + caching + rate-limit fix + migrate 9 call sites | Migration 2 · inbound auto-parse + confirm UI · "explain this line item" · redaction + provenance columns | WS-3 acceptance; every AI call logged |
| **Fri 17** | Migration 3 · benchmarks store + real `dataSourceForZip` + tier badges | Honesty fixes + `/methodology` rewrite · promote-to-verified admin · **full QA §7** · deploy · run the §2 demo on prod | The demo, clean, on production |
| **Sat–Sun** | Utah GPL ingestion + homes import → promote UT metros | CA metro collection · (optional) CMS hospice import | ≥2 verified metros live; no regressions |

Mechanics: one Claude Code session per day, opening context = `CLAUDE.md` +
this file; fresh worktree per day, merged same day. Every day ends with
`npm run typecheck && npm run lint && npm run build && npx vitest run` + the
guardrail grep. **Founder's daily 10 minutes:** apply that day's migration in
the Supabase SQL editor (Mon/Thu/Fri) and click through the day's gate.

---

## 7. Friday QA — the non-negotiable verification pass

1. **Mechanical:** typecheck, lint, `next build`, full vitest,
   `supabase/VERIFY.sql` on prod post-migration.
2. **Authz proofs, not vibes:** member of org A cannot load org B's portal
   (route test on `requirePartnerMember`); deactivated member bounced;
   deny-all RLS intact on `partners`/`partner_members`/`partner_codes`/
   `partner_leads`/`regional_benchmarks`/`api_cost_events` (anon + authed
   SELECT fail); family owner-scoping regression on `negotiations`/
   `price_list_analyses`.
3. **Guardrail grep + manual:** no partner surface names a funeral home or
   per-home count (`"we sent N families to Home X"` framing is banned);
   search `featured|recommended|sponsor` in partner + directory surfaces = 0;
   attribution columns never read by `lib/negotiation/directory.ts` or
   choose/ranking paths; zero payment UI in any family flow; neutrality
   constant present on `/portal/materials`, co-brand banner, `/employers`.
4. **PHI/privacy:** portal JSON payloads carry aggregates + link labels only;
   redaction unit fixture passes; no clinical fields anywhere; family
   `user_id` absent from every partner-visible payload.
5. **Data honesty:** every user-facing dollar traces to the catalog, a
   `regional_benchmarks` row with sources, or is labeled illustrative;
   n≥5 suppression verified at n=4 and n=6; tier badge renders on all five
   surfaces; `/methodology` matches what the code actually does.
6. **Copy pass:** new portal/employer/family surfaces read calm, plain,
   non-salesy, never morbid; hospice copy keeps unfunded-mandate framing and
   **never** pitches CAHPS repair.
7. **Perf/SEO smoke:** Lighthouse on `/`, `/analyzer`, `/partners`,
   `/employers`, `/portal` (noindex verified); sitemap gains `/employers`;
   `/portal/*` + `/partner/r/*` stay noindexed.
8. **The demo** (§2) end-to-end on production, recorded once as the sales
   asset.

---

## 8. Cut lines (drop in this order if Friday is at risk)

1. Partner logo upload → accent color + name only (already the default).
2. `/admin/ai-costs` dashboard → ledger writes only, dashboard next week.
3. "Explain this line item" → next week (it's backlog #2, not demo-critical).
4. Dashboard focus pass + polling backoff → next week.
5. CSV export → print-only (print already works).
6. Community-tier promotion UI → verified-only this week.
7. Weekend CA collection → Utah only.

**Never cut:** portal sign-in loop (Mon–Tue) · analyzer bridge + attribution
+ paid-amount capture (Wed) · cost tagging + inbound auto-parse (Thu) · tier
labels + honesty fixes + `/methodology` (Fri) · the §2 demo running on prod.

---

## 9. Decisions I need from the founder (before or during the week)

1. **Apply each migration** the evening it lands (Mon, Thu, Fri — SQL editor,
   same as the nine you applied 2026-07-09).
2. **Portal route name:** `/portal` (this plan's default) — say so if you
   want `/partner/home` or similar instead.
3. **Demo partner names** for the seed ("Demo Hospice" / "Demo Employer" or
   real-sounding fictional names for the sales recording).
4. Optional: pick a scheduling tool (Calendly/cal.com) and I'll embed it on
   `/partners` + `/employers` — the backlog's sales-ops item is blocked only
   on that choice.

## 10. What this sets up next week (not now)

Programmatic metro/Fair-Price-Index pages reading `regional_benchmarks` ·
public community-tier surfacing once n is meaningful · partner monthly report
email upgraded with the AI digest · employer enrollment polish + institutional
billing in-product (Stripe reawakens for partners, never families) · eval
harness for the extraction prompts (`scripts/eval-analyzer.mjs` + fixtures) ·
`followUpSystem()` wiring behind admin review · CMS hospice programmatic pages
+ claim-your-hospice · transparency score on the directory (`docs/DATA_PLAN.md`
§7) · BAA-gated staff-assisted referral variant.
