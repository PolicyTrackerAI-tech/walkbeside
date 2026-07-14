# Product Week — Day Build Sheets (execution depth)

Companion to [`PRODUCT_WEEK_2026-07-13.md`](PRODUCT_WEEK_2026-07-13.md) (the
frame: mission, architecture decisions D1–D8, migrations, QA, cut lines).
This file is the per-day execution spec. **Each day's session opens with:
`CLAUDE.md` + the plan + this file's matching day section, and builds ONLY
that day.**

Session kickoff prompt (paste into a fresh Claude Code session each morning,
swapping the day):

> git fetch and branch off current origin/main. Read CLAUDE.md,
> docs/PRODUCT_WEEK_2026-07-13.md, and docs/PRODUCT_WEEK_2026-07-13_BUILDSHEETS.md
> — then execute **Day N only**, exactly as specced. Run the day's acceptance
> gate before declaring done: `npm run typecheck && npm run lint && npm run
> build && npx vitest run` plus the day's manual checks and the guardrail
> grep. Open a PR; do not merge.

Gap index → day: P1 sign-in (Mon) · P2 shell/materials/CSV (Mon–Tue) ·
P3 employer (Tue) · P13 pending_payment (Mon) · P14 leads (Tue) ·
P4 analyzer bridge (Wed) · P5 analyzer attribution (Wed) · P6 paid-amount
(Wed) · P8 nav (Wed) · P7 inbound auto-parse (Thu) · P12 AI infra (Thu) ·
P9/P10/P11 data tiers + honesty (Fri).

---

## DAY 1 — Monday Jul 13 · Portal identity (P1, P13)

**Objective:** a partner can sign in. `requirePartnerMember` exists and is
tested, `/portal` renders the real report behind a session, approval sends a
sign-in invite, and the legacy `pending_payment` label is retired from new
cases.

### Pre-flight (30 min)
1. `git fetch`; branch `claude/day1-portal-identity` off `origin/main`.
2. **Worktree triage:** for each of `checker-correctness`,
   `payment-decommission` (now on `claude/fix-benefit-sweep-race`),
   `rewire-plans`, `hardcore-elgamal-0f3980`, `suspicious-visvesvaraya-d72ad7`,
   `wonderful-mccarthy-8e1fea`, `tender-margulis-8ade01`: run
   `git log --oneline origin/main..<branch>` — zero commits → `git worktree
   remove <path>` + delete branch; commits present → list them for the founder
   before touching. Leave the main checkout (`prelaunch-docs-and-safety`)
   alone — it's the founder's.

### Tasks

**1. Migration 1 — `supabase/migrations/2026-07-13-portal-identity.sql`**
Exact SQL in the plan §4 (partner_members · partners.brand_accent +
notification_email · partner_leads · price_list_analyses partner_id /
partner_code / confidence / extraction_method · api_cost_events). All tables
RLS-enabled with **zero policies** (service-role only — same posture as
`partners`). Then `node scripts/build-bootstrap-sql.mjs` and add the new
tables to `supabase/VERIFY.sql`. Header: "FOUNDER-APPLIED ONLY," idempotent
(`if not exists` / `add column if not exists`).

**2. `lib/partner/auth.ts` — the session gate (mirror `lib/admin-auth.ts`)**
`requireAdminPage` is 50 lines and the exact pattern: `getUser()` from
`@/lib/supabase/server`, redirect anonymous, `notFound()` unauthorized (never
confirm the route exists). Shape:

```ts
export interface PortalContext {
  partner: { id: string; name: string; partner_type: "hospice" | "employer" | "insurer";
             status: string; active: boolean; report_token: string;
             brand_accent: string | null; notification_email: string | null;
             contact_email: string | null };
  member: { id: string; role: "owner" | "member"; invited_email: string };
  email: string;
}
export async function requirePartnerMember(minRole?: "owner"): Promise<PortalContext>
```
Logic, in order:
1. `getUser()` → null → `redirect("/portal/login?next=" + path)`.
2. Service-role client → `partner_members` where `user_id = user.id` and
   `deactivated_at is null`, joined to `partners`.
3. Miss → **bind-on-first-login**: row where `lower(invited_email) =
   lower(user.email)` and `user_id is null` and `deactivated_at is null` →
   update `{user_id, accepted_at: now()}` → use it.
4. Still none → `notFound()`.
5. `partner.active === false` or `status === 'paused'/'archived'` → render
   the paused notice (return a discriminated state or redirect to
   `/portal/paused`; pick one, keep it simple).
6. `minRole === "owner"` and `member.role !== "owner"` → `notFound()`.
Also export `requirePartnerApi(minRole?)` returning `NextResponse | PortalContext`
(mirror `requireAdminApi`).
**Tests** (`lib/partner/__tests__/auth.test.ts`, mock the supabase clients):
anonymous → redirect; member of A never receives B (assert the query is
scoped by `user_id`, not by partner); bind-on-first-login stamps
`accepted_at`; deactivated blocked; non-owner blocked from `minRole:"owner"`.

**3. `/portal/login` — magic link**
`app/portal/login/page.tsx` (client): email field →
`sb.auth.signInWithOtp({ email, options: { emailRedirectTo:
`${origin}/auth/callback?next=/portal` } })` → "Check your email" state.
Secondary line: "Prefer a password? Sign in here" → `/login?next=/portal`
(the existing family login at `app/login/page.tsx` is password+Google — it
works for portal members too since the gate only checks the session).
**Verify `app/auth/callback` honors the `next` param for the OTP code
exchange** — it exists for Google OAuth; if it hardcodes a redirect, add
`next` passthrough (allowlist internal paths only).

**4. `/portal` shell + overview**
- First **extract the report assembly** out of
  `app/partner/r/[token]/page.tsx` (all 190 lines of data fetching:
  negotiations by partner_id, outreach joins, tool-engagement joins, digest)
  into `lib/partner/report-data.ts` → `buildPartnerReportData(partnerId)`.
  The token page becomes: resolve token → call it → render. Zero behavior
  change — protect with a before/after look at the token page.
- `app/portal/layout.tsx`: `requirePartnerMember()`, `robots: noindex`, left
  nav (Overview · Referral links · Quote check · Team · Materials ·
  Settings), org name + partner-type chip, sign-out posting to the existing
  `/auth/signout`.
- `app/portal/page.tsx`: `buildPartnerReportData(partner.id)` →
  `<ProofSheet live ...>` + digest — identical content to the token report.
  When `stats.familiesHelped === 0` and no `partner_codes` exist → the
  **first-run checklist** instead: ① Create your first referral link →
  `/portal/links` ② Where to hand it out (one paragraph + link to Materials)
  ③ "What appears here once families use it" (mini explainer of the metrics).

**5. Approval → invite email**
`app/api/admin/partners/route.ts` (PATCH, on activate): after stamping
`approved_at`, (a) upsert the owner seat — insert `partner_members
{partner_id, invited_email: contact_email, role: 'owner'}` on conflict do
nothing; (b) swap the email body: lead with "Sign in to your portal →
`/portal/login`", keep the `/partner/r/<token>` quick link as the secondary
"no-account link for line staff." Email goes through `lib/email.ts
sendEmail` like today.

**6. Token-route upgrade banner**
One-line banner in `app/partner/r/[token]/page.tsx` (and /links, /check via
the shared nav component): "This link works forever. Want a team dashboard
with sign-in? → /portal/login". Keep it calm, one sentence.

**7. Retire `pending_payment` from new writes (P13)**
Verified current machine: `app/api/negotiate/start/route.ts:104` inserts
`status:"pending_payment"` → same request calls `sendOutreachForNegotiation`
→ `lib/negotiation/send.ts:88-90` advances to `"contacting"` with
`.eq("status","pending_payment")` as the idempotency guard. The label is
transient but leaks into `choose/route.ts:39-44`, which bounces to the dead
`/preview` redirect if send ever failed mid-request. Change set:
- `start/route.ts:104` → `status: "preparing"`.
- `send.ts:88-90` → `.in("status", ["preparing", "pending_payment"])` (keeps
  the guard working for any legacy in-flight rows).
- `choose/route.ts:39-44` → if status is `preparing`/`pending_payment`,
  redirect to `/negotiate/{id}/status` (not `/preview`).
- `components/negotiate/CaseStepper.tsx:37-48` → legacy map treats
  `preparing` like `pending_payment` (stage 1).
- `grep -rn "pending_payment" app lib` → update every remaining branch +
  `lib/negotiation/__tests__/send.test.ts`'s case.

### Acceptance gate
Mechanical suite green. Manual in dev: apply Migration 1 locally → seed one
partner + owner member row by hand → magic-link sign-in lands on `/portal` →
overview renders the first-run checklist → token URL still renders identically
→ second browser signed in as a non-member gets 404 on `/portal` → start a
negotiation, confirm the row is `preparing`→`contacting` and choose never
touches `/preview`.

### Founder actions today
1. **Apply Migration 1** in the Supabase SQL editor this evening (paste from
   `BOOTSTRAP.sql` diff or the migration file).
2. **Supabase dashboard check** (5 min): Authentication → Providers → Email —
   confirm magic-link/OTP sign-in is enabled and the Magic Link email
   template looks sane. (Default Supabase auth email has hourly rate limits —
   fine for the pilot; custom SMTP is a next-week nicety.)
3. Click the acceptance gate yourself: sign in via magic link on the deployed
   preview.

### Watch-outs
- `partner_members` lookups are service-role; never add RLS policies for it.
- Don't rename `/partner/[code]` (demo script depends on
  `/partner/sample-hospice`).
- `ADMIN_EMAILS` must be set in prod before portal invites go out (the admin
  gate is permissive-by-default until set — `lib/admin-auth.ts:16-18`).

### If the day runs long (cut inside Monday)
First-run checklist → plain empty state. Token banner → tomorrow.
`pending_payment` retirement is small and permanent — don't cut it.

---

## DAY 2 — Tuesday Jul 14 · Portal complete + employer (P2, P3, P14)

**Objective:** the portal is a complete product: team, materials, settings,
CSV, leads captured, and an employer sees employer framing everywhere.

### Tasks

**1. `/portal/team` (owner-only)**
`requirePartnerMember("owner")`. Table of members (email, role, status:
invited/active/deactivated, dates). Actions via `POST /api/portal/team`
(guard: `requirePartnerApi("owner")`):
- `invite` → validate email, insert `partner_members {invited_email, role:
  'member'}` (unique constraint dedupes) + `sendEmail` invite ("You've been
  added to {partner.name}'s Honest Funeral portal — sign in with this email:
  /portal/login"). Cap 20 seats/org (sanity constant).
- `deactivate` / `reactivate` → set/clear `deactivated_at`. Owners can't
  deactivate themselves (leave-one-owner rule: block deactivating the last
  active owner).

**2. `/portal/links` + `/portal/check` — session-auth reuse**
The existing `LinksClient.tsx` and `CoordinatorCheck.tsx` pass
`report_token` in POST bodies. Add a session branch to
`app/api/partner/links/route.ts`: accept EITHER `{ token }` (current) OR an
authenticated member session (`requirePartnerApi()`), resolving to the same
`partner_id`. Then `LinksClient` gets a `mode: "token" | "session"` prop
(omit token from body in session mode). `CoordinatorCheck` needs no auth
change (it calls the public analyzer endpoints) — just wrap both in portal
pages: `app/portal/links/page.tsx`, `app/portal/check/page.tsx`.

**3. `/portal/materials`**
Server page, print-CSS (reuse the `PrintButton` / `print:hidden` pattern from
`components/partner/ProofSheet.tsx:296`):
- **One-pager** (co-branded: partner name + accent chip): what Honest Funeral
  is, what the family gets, the QR/link, and the **verbatim neutrality
  pledge** — reuse the existing constant from
  `components/ReferralCoBrand.tsx:36-43`; do not write a new variant
  (COMPLIANCE_ADDENDUM §2.4 requires identical wording everywhere).
- **QR poster** per active referral link (the `qrcode` lib is already a
  dependency via `LinksClient`).
- **Two copy-paste snippets** with copy buttons: the coordinator hand-off
  script (3 sentences, calm) and a family-facing email paragraph.
Hospice/employer copy branches on `partner.partner_type` (see task 5).

**4. `/portal/settings` (owner-only)**
Form → `POST /api/portal/settings`: `notification_email` (digest recipient —
the cron reads `contact_email` today; write both or point the cron at
`notification_email ?? contact_email`), `contact_name`, `brand_accent`
(validate `#hex`). Separate danger-zone card: **"Rotate quick link"** →
`POST /api/portal/settings/rotate-token` → `update partners set report_token
= encode(gen_random_bytes(24),'hex')` → confirm dialog ("every old quick
link stops working immediately; your sign-in is unaffected"). This closes
the shared-token revocation gap — today rotation is a founder SQL edit.

**5. Employer variant (P3)**
- `ProofSheet.tsx` gains `partnerType` prop (default `'hospice'`, threaded
  from both `/portal` and the token page):
  - hospice → unchanged (42 CFR 418.64 card, bereavement-reminded %, CAHPS
    proxy labeling).
  - employer → headline "Employees supported through a loss"; hide the
    Medicare-mandate and bereavement-reminded cards; keep families-helped,
    savings, satisfaction, tool engagement; footnote swaps compliance framing
    for "documented benefit utilization."
- `lib/partner-report-digest.ts`: `buildOutcomesDigest` +
  `fallbackOutcomesDigest` take `partnerType`; the Claude prompt's grounding
  JSON gains it plus one audience line ("employer HR/benefits leader — never
  mention Medicare, CAHPS, or hospice compliance"). Grounding cap (600 chars)
  and stats-are-ground-truth rule unchanged.
- `app/employers/page.tsx` (public, indexed): mirror of `/partners` with
  EAP/benefits framing — the loss-at-work problem, zero-PHI design, "free to
  your people, never funded by funeral homes." Reuse `DemoRequestForm` and
  link `/partners/apply` with `?type=employer` preselecting the existing
  Type select in `ApplyForm.tsx`. Cross-link from `/partners`. Add to
  `app/sitemap.ts`.
- `lib/partner-digest.ts` (the cron email text): same `partnerType` branch —
  it reads `partners` anyway; pass the column through.

**6. Leads stop vanishing (P14)**
`app/api/partner/demo-request/route.ts`: keep the founder email, add a
best-effort service-role insert into `partner_leads`. `/admin/partners`
(`PartnersClient.tsx`): a "Leads" strip above pending applications — name,
org, email, note, date. Read-only list is enough this week.

**7. CSV export**
Button on `/portal` overview: client-side CSV from the aggregate stats object
(metric, value, period). Suppressed values export as `"collecting data"` —
never a number below n=5 (the type system already forces `null`).

**8. Demo seed**
Extend `scripts/seed-demo.mjs` (idempotent, service-role, same env contract)
with `ensureDemoPartners()`:
- "Demo Hospice" (type hospice, active, status pilot) + "Demo Employer" —
  look up by name before inserting.
- 2 members each: owner = `demo-hospice-owner@honestfuneral.co` etc. (create
  auth users with `DEMO_PASSWORD` so sign-in works without email delivery).
- 3 referral codes across labels; **6+ closed negotiations with real outcome
  columns filled** (spread `outcome_recorded_at` over 2 months, satisfaction
  4–5, savings $700–$2,400, one hidden-fee case) tagged `partner_id` — n≥6
  clears the suppression so the dashboard demos real aggregates.
- Fictional and obviously so ("Demo" prefix); the founder can rename for the
  sales recording via env (`DEMO_PARTNER_NAME`).

### Acceptance gate
Demo §2 steps 1–4 + 7 in dev: approve → invite → owner signs in → invites
member → member signs in → links + QR → materials print → settings save →
token rotation kills old link → employer account shows employer framing (no
Medicare/CAHPS words anywhere — grep the rendered HTML) → CSV downloads with
suppression respected → demo-request writes a lead row.

### Founder actions today
1. **Names decision:** keep "Demo Hospice"/"Demo Employer" or give me two
   real-sounding fictional names for the sales recording.
2. Run the extended seed against prod once Day 2 deploys
   (`DEMO_PASSWORD=… DEMO_ZIP=84101 node scripts/seed-demo.mjs`).
3. Optional (unblocks a backlog item): pick Calendly vs cal.com for
   `/partners` + `/employers` scheduling embed.

### Watch-outs
- Materials + co-brand must use the one existing pledge constant.
- No partner surface may name a funeral home or per-home counts (aggregate
  framing only — "we sent N families to Home X" is banned).
- `/employers` is indexed; `/portal/*` stays noindexed.

### Cut inside Tuesday
Logo upload was already cut (accent only). CSV → print-only. Employer
`/employers` page → employer ProofSheet branching only (page Wednesday AM).

---

## DAY 3 — Wednesday Jul 15 · Family flow + attribution (P4, P5, P6, P8)

**Objective:** the family journey is connected — the checker feeds advocacy,
every referred touch is attributed, families report what they paid, and the
product is findable from the nav.

### Tasks

**1. Referral memory everywhere (P8/attr)**
Move `<RememberReferral />` (17-line client component) from per-page mounts
(`/plan-now`, `/analyzer`, `Wizard`) into `app/layout.tsx`. Implementation
note: it reads `?ref=` — in the root layout wrap in `<Suspense>` (Next
requires it for `useSearchParams` in a layout). Remove the now-duplicate
per-page mounts. `ReferralCoBrand` stays page-level (it's visible UI).

**2. Analyzer attribution (P5)**
`app/api/analyze-price-list/route.ts:200-217` (the logged-in insert): accept
`referralCode` in the POST body (the client sends `readReferral()?.code` from
`lib/referral-codes.ts`); server-side resolve **exactly** like
`app/api/negotiate/start/route.ts:116-137` (service role, active code check,
try/catch, never blocks) → stamp `partner_id` + `partner_code`. Then
`lib/partner/report-data.ts`: checker-engagement counts read directly-
attributed rows (`price_list_analyses.partner_id = X`) **plus** the legacy
user-join fallback for pre-migration rows.

**3. Analyzer → negotiate bridge (P4)**
- `Analyzer.tsx` results actions (`:589-605`): add the **primary** CTA card —
  "Want us to get you comparison quotes? Free, from vetted homes near you." →
  navigates to `/negotiate/start?zip={zip}&svc={serviceTypeHint}` and writes
  `sessionStorage["hf-analyzer:handoff"] = {zip, serviceType, totalCents,
  homeName}` (same pattern as the existing `hf-decide:recommendedServiceType`
  handoff the analyzer already reads at `:162`). Existing actions (draft
  letter / copy / print) become secondary.
- Add the optional **"Which funeral home is this from?"** text input next to
  the zip field (`:453-465` vicinity) — free text, no autocomplete dep;
  feeds the handoff only this week.
- `app/negotiate/start/Wizard.tsx`: on mount, initialize from
  `searchParams.zip/svc` + the handoff blob — prefill step 1 (zip), step 2
  (service), and step 4 (hasQuote=yes, `targetHomeName`, `targetEstimate` in
  dollars) with a small "from your quote check ✓" note. All prefills
  editable; nothing skipped silently.

**4. Ask what they paid (P6)**
`components/negotiate/CaseSatisfaction.tsx` (posts to
`/api/negotiate/[id]/outcome`, whose zod already accepts `amountPaidCents` —
`route.ts:18-23`): after the 1–5 tap, two optional fields — "What did you
end up paying, all-in?" (dollars → cents) and "Any fees that surprised you?"
(free text → `notes` if the route accepts it; if not, append to the
satisfaction POST body and extend the route's zod with an optional
`surpriseFees` string persisted to the existing notes-ish column — check
`negotiations` for the right column; add nothing new to schema). One combined
submit; thank-you state acknowledges the number ("recorded — this helps the
next family").

**5. Navigation (P8)**
- `components/SiteHeader.tsx:31-37`: add "Check a quote" → `/analyzer`,
  "Fair prices" → `/prices` (5→7 links; verify mobile menu handles it).
- `components/Brand.tsx:131-174` footer: a Tools column — Analyzer · Fair
  prices · Have us contact homes (`/negotiate/start`) · Plan ahead
  (`/plan-now`) · Dashboard.
- `app/where/page.tsx:18-45`: add the fifth path card — "Someone handed me a
  price list — check if it's fair" → `/analyzer`.

**6. CTA verb system**
One canonical phrase per action, applied at: `app/negotiate/start/page.tsx:255`,
`app/dashboard/page.tsx:172`, `app/prices/page.tsx:41-43`,
`app/decide/DecideFlow.tsx:378-390`, homepage cards (`app/page.tsx:188-264`).
Canon: **"Check a quote"** (analyzer) · **"See fair prices"** (prices) ·
**"Have us contact funeral homes — free"** (negotiate) · **"Start here"**
(triage). Grep for the old variants ("call funeral homes", "compare funeral
homes for you", "Get started — it's free") and unify.

**7. Dashboard focus + status hygiene**
- `app/dashboard/page.tsx`: anonymous view leads with the 3 canonical CTAs;
  signed-in collapses the 15-tile grid behind a "All tools" disclosure so the
  "three tasks" promise (`:131-133`) holds visually.
- `app/negotiate/[id]/status/page.tsx:70`: poll 6s for the first 5 minutes,
  then 30s; pause entirely when `document.hidden`; stop on terminal states
  (already stops on `no_homes_available`).

### Acceptance gate
Dev walkthrough as a referred family: open `/analyzer?ref=DEMOCODE` → analyze
→ analysis row carries `partner_id` → bridge CTA → wizard arrives prefilled →
complete → close case → paid-amount lands in `amount_paid_cents` → the Demo
Hospice portal shows the checker engagement + the savings movement. Nav/footer
click-test on mobile width. Guardrail grep: attribution columns still never
read by `lib/negotiation/directory.ts`, `choose`, or any ranking path.

### Founder actions today
None infrastructural. Evening: run the referred-family walkthrough yourself
on the preview deploy — on your phone — and note any copy that feels off;
Wednesday's changes are the ones families feel.

### Cut inside Wednesday
Dashboard focus + polling → next week. CTA verb pass → keep (it's an hour).
Never cut: attribution, bridge, paid-amount.

---

## DAY 4 — Thursday Jul 16 · AI infrastructure + two features (P7, P12)

**Objective:** every Claude call is cost-tagged and cached where stable; the
one unthrottled endpoint is limited; inbound replies auto-parse into
human-confirmed quotes; findings gain a grounded "why?".

### Tasks

**1. Cost-tagged wrapper (P12)**
`lib/claude.ts` today is 29 lines: `MODEL = "claude-sonnet-4-6"`, `client()`,
`claudeAvailable`, `textOf`. Add (keep all current exports):

```ts
interface CallOpts { feature: string; system: string; user: string;
  maxTokens?: number; negotiationId?: string; cacheSystem?: boolean }
export async function callClaude(o: CallOpts): Promise<string> // textOf'd
export function recordUsage(feature: string, msg: Anthropic.Message,
  negotiationId?: string): void   // for call sites with custom content blocks
```
- `callClaude` → `client().messages.create({ model: MODEL, max_tokens,
  system: o.cacheSystem ? [{ type: "text", text: o.system, cache_control:
  { type: "ephemeral" } }] : o.system, messages: [{ role: "user", content:
  o.user }] })` → `recordUsage` → `textOf`.
- `recordUsage`: read `msg.usage.input_tokens/output_tokens` (+
  `cache_read_input_tokens` when present) → best-effort service-role insert
  into `api_cost_events` (never throw) + one `lib/observability.ts` log line.
- Migrate the 9 call sites (the AI-audit table is the checklist). The two
  with non-plain content (vision extraction `extract-price-list-image`, and
  any multi-block prompt) keep calling `client()` directly and add
  `recordUsage(...)` — don't force them through the string-only wrapper.
- `cacheSystem: true` on the stable long prompts: `priceListAnalysisSystem`
  (reused by analyzer + compare-bill ×2), `priceListAdvocacySummarySystem`,
  `obituarySystem`, `eulogySystem`.
- While in the file: the model ID is hardcoded (`claude-sonnet-4-6`,
  `lib/claude.ts:8`). Check the current model list at build time (claude-api
  docs) — Sonnet 5 / Haiku 4.5 exist as candidates; if upgrading, run the
  analyzer fixture tests before and after. Tiering (Haiku for
  subscription-finder classification) is next week — note it, don't do it.
- Optional (cut first): `/admin/ai-costs` — tiny table, feature × day ×
  tokens from `api_cost_events`, behind `requireAdminPage`.

**2. Close the rate-limit gap (P12)**
`lib/rate-limit.ts:20-30`: add `"/api/analyze-price-list/draft-letter"`
(match the existing analyzer entries' shape, e.g. 8/min). It's enforced by
`proxy.ts` per-path on POST — one line plus a test in the existing
rate-limit test file.

**3. Migration 2 — `2026-07-16-inbound-ai-parse.sql`** (plan §4: five `ai_*`
columns on `negotiation_messages`). Regenerate BOOTSTRAP, update VERIFY.

**4. Inbound auto-parse, human-confirmed (P7)**
- `lib/negotiation/parse-reply.ts`:
  `parseInboundQuote(body: string): Promise<{ cents: number; items: {name:
  string; cents: number}[]; confidence: number } | null>` — calls
  `callClaude({ feature: "inbound-quote-parse", system:
  summarizeQuoteSystem(), user: body.slice(0, 6000) })` (the orphaned prompt
  at `lib/negotiation/prompts.ts:11-18` returns `{ items:[{name,cents}],
  total_cents, currency }`, JSON-only). Guarded `JSON.parse`; sanity-check
  the stated total against the item sum with
  `reconcileTotalQuoted` (`lib/analyzer-totals.ts`) — same defense the
  analyzer uses; confidence heuristic: items found + total consistency
  (0–1). Return null on anything questionable — silence is fine, wrong is
  not.
- Hook in `app/api/inbound/email/route.ts` **after** the message insert +
  before `notifyFamilyOfReply`: `if (claudeAvailable && (payload.TextBody ??
  "").length > 40)` → try/catch → update the just-inserted message row's
  `ai_quote_cents / ai_quote_items / ai_parse_confidence / ai_parsed_at`.
  Parse failure changes nothing (the webhook's 200-to-Postmark contract is
  untouchable).
- **Confirm UI** on `app/negotiate/[id]/status/page.tsx` `OutreachRow`
  (`:359-458`): messages are per-negotiation (MailboxHash = negotiationId);
  match message → outreach by `fromAddress === outreach.home_email`. When a
  matched message has `ai_quote_cents` and no `ai_confirmed_at` and the
  outreach row has no `quote_cents`: banner — "We read their reply:
  **$X,XXX** (N items) · Use this / Edit first". "Use this" POSTs the
  existing `/api/negotiate/[id]/quote` route (zod `quoteCents` — extend the
  body with optional `confirmMessageId`; after the quote write, service-role
  stamp `ai_confirmed_at` on that message). "Edit first" prefills the
  existing manual fields. The AI columns are never ground truth — the
  confirmed quote flows through the same path a hand-typed one does.
- Surface the same proposal in `/admin/outcomes` for founder-run cases.

**5. "Explain this line item" (backlog #2)**
- `POST /api/analyze-price-list/explain`: body `{ ruleId?, itemName, cents,
  evidence }` → look up the rule in `lib/bundling-detection/rules.ts` (each
  rule has a 16 CFR §453 citation + a "what to say" script) and/or the
  `LINE_ITEMS` entry → `callClaude({ feature: "line-item-explain", system:
  a grounded-only prompt ("You may use ONLY the finding, the cited rule, and
  the catalog range provided. If asked beyond them, say the tool can't say."),
  user: JSON })` → ≤90 words. Fallback: the rule's existing script verbatim.
  Add to `RATE_LIMITS`.
- UI: `components/analyzer/ViolationsPanel.tsx` (props `{ violations }`) —
  a "why?" button per finding, inline expand, loading shimmer, fallback text
  on error. The family analyzer and `/portal/check` + `/partner/r/[token]/check`
  inherit automatically since they render the same panel.

**6. Redaction + provenance (P12)**
- `lib/redact.ts`: `redactContact(text)` — email, US phone, SSN-pattern,
  16-digit card/account patterns → `[redacted]`. Unit test with a seeded
  PII-laden fixture. Apply: `analyze-price-list/route.ts` before the
  `raw_text` insert; `subscription-finder/route.ts` before the statement
  reaches Claude. (Names stay — obituary/eulogy need them; GPLs don't carry
  them.)
- Provenance: the analyzer insert sets `extraction_method:
  "claude" | "naive"` (it knows which path ran — `route.ts:91-94`) and
  `confidence` (naive → 0.3 fixed; claude → item-count/total-consistency
  heuristic shared with parse-reply).

### Acceptance gate
Every AI feature exercised once in dev logs a row in `api_cost_events` with
the right feature tag. Seeded inbound webhook POST (curl with Basic auth +
a fixture Postmark payload containing a priced reply) → message row gains
`ai_*` → status page shows the banner → "Use this" → outreach
`quote_cents` set via the existing route → `ai_confirmed_at` stamped.
Explain button answers from the citation and declines an off-finding
question. Redaction fixture passes. Draft-letter returns 429 on the 9th call
in a minute.

### Founder actions today
1. **Apply Migration 2** in the SQL editor.
2. Fire the test inbound: the session will leave you a ready
   `curl` command (fixture payload against the deployed webhook with the
   Postmark basic-auth envs) — run it, then click Confirm on the status page
   yourself. That's the full P7 loop verified by a human.

### Watch-outs
- The inbound webhook must keep returning 200 fast — the parse is
  best-effort and never blocks or errors the response.
- No AI write becomes ground truth without the human click (D6).
- `OUTREACH_LIVE` untouched; nothing new emails a funeral home.

### Cut inside Thursday
`/admin/ai-costs` view → ledger only. Explain feature → Friday AM or next
week. Never cut: wrapper + rate-limit + auto-parse loop.

---

## DAY 5 — Friday Jul 17 · Data tiers, honesty, QA, ship (P9, P10, P11)

**Objective:** every number on the site carries an honest tier; the verified
tier has real machinery; the unsourced numbers are gone; QA passes; the demo
runs on production.

### Tasks

**1. Migration 3 — `2026-07-17-regional-benchmarks.sql`** (plan §4:
`regional_benchmarks` + `funeral_homes.website/gpl_url/last_verified_at`).
BOOTSTRAP + VERIFY.

**2. `lib/benchmarks-store.ts`**
`benchmarkFor(zip, lineItemId)` → derive `zip3 = zip.slice(0,3)`, metro +
state via `regionForZip` (`lib/zip-regions.ts:1022-1025`) → one service-role
query for active rows matching any of the three scopes for that item → pick
narrowest (zip3 > metro > state) → `{ fairLowCents, fairHighCents,
predatoryAtCents?, tier, n, version } | null`. Wrap in React `cache()` per
request. Also `tierForZip(zip)` → cheapest summary for badge rendering.

**3. Tier-aware classification + labels**
- `lib/pricing-data.ts`: extend `PriceDataSource` with
  `"modeled" | "verified" | "community"` (keep `"national-adjusted"` as a
  deprecated alias mapping to modeled); `DATA_SOURCE_LABEL` gains honest
  strings ("Modeled estimate — national benchmarks × a regional cost index",
  "Verified — aggregated from N real price lists in this area", "Community —
  reported by families in this area"). `dataSourceForZip` stays sync for
  client callers (returns `"modeled"`), and a new **async server-side**
  `dataSourceForZipLive(zip)` consults the store.
- **Server surfaces** (do these first, they're straightforward):
  `app/api/analyze-price-list/route.ts:119-129` — for each matched item,
  `benchmarkFor()` override → classify against the override range instead of
  `adjustedRange`; **overrides apply to non-per-unit items only** this week
  (the per-unit/state-fee carve-outs at `:124-134` are checker-correctness
  law — don't touch). Verdict payload gains `{tier, n}` per the narrowest
  data used; `Analyzer.tsx` renders the badge on the verdict.
  `app/funeral-homes/[zip]/page.tsx:97` and
  `app/funeral-costs/[city]/page.tsx` swap the hardcoded label for
  `dataSourceForZipLive`.
- **Client surface**: `app/prices/PriceCalculator.tsx:198` — fetch
  `GET /api/benchmarks/tier?zip=` (tiny new route wrapping `tierForZip`,
  rate-limited, cache-control public 1h) on zip change; default chip
  "Modeled" while loading.
- `components/DataTierBadge.tsx`: `tier`, `n?`, `lastUpdated?` → small chip +
  link to `/methodology`.

**4. Honesty fixes (P11 — guardrail #4)**
- `lib/funeral-homes-pricing.ts:41-68`: the phantom ids
  (`casket-basic`/`vault-basic`) and the six unsourced constants — map each
  to a real `LINE_ITEMS` entry (e.g. casket-basic → `casket-metal` fairLow,
  vault-basic → `vault` fairLow, urn/rental/cremation → their catalog
  siblings) so `totalsForService()` derives from the audited catalog; delete
  the constants. Diff the rendered `/funeral-homes/[zip]` cards before/after
  — small movements are expected and correct (they now trace to sources).
- `app/funeral-costs/[city]/page.tsx:154-160`: "adjusted by a regional
  cost-of-living multiplier of {x}×" → "adjusted by an estimated regional
  cost index (modeled)" + badge; drop the two-decimal precision display.
- `/methodology` (`app/methodology/page.tsx`): rewrite around the three
  tiers — how modeled is computed (NFDA/CFA/FCA + GPL sample → national
  ranges × regional index), what promotes a metro to verified (n≥5 real
  price lists, founder-reviewed), what community means, known limitations,
  correction policy → link `/corrections`. **Re-verify the NFDA/CFA figures
  against their current published studies while editing — cite only what the
  sources say.**
- `/prices` (`app/prices/page.tsx:78-81`) + `/methodology`: replace the
  "will sharpen per-metro" promise with the true mechanism ("metros upgrade
  to Verified as real price lists accumulate — the badge tells you which
  you're seeing").

**5. Verified-tier machinery (P10)**
- `lib/benchmark-pipeline.ts`: new `aggregateOutreachQuotes(rows)` — fold
  `negotiation_outreach.quote_items` (`[{lineItemId, name, cents}]`,
  real itemized quotes, currently aggregated nowhere) into the same
  `GroupStats` shape (dedup key: outreach id + item), merged with the
  analyses aggregation in `app/admin/benchmarks/page.tsx` (label the source
  mix: "N from checker uploads · M from real quotes").
- **Promote to verified**: on `/admin/benchmarks`, per metro×item group with
  `n ≥ 5`: a form (scope, scope_value, low/high prefilled from p25/p75,
  sources note) → `POST /api/admin/benchmarks/promote`
  (`requireAdminApi`) → insert `regional_benchmarks` row
  (`tier: 'verified'`, version `2026-07-v1`, `n_data_points`). Server-side
  guard `n >= 5`, **no override parameter exists** (the publish gate). Same
  form allows `tier: 'community'` for crowd-only groups — public surfacing
  of community rows can wait; verified is the week's point.

**6. Full QA + ship (plan §7, run every line)**
Mechanical → authz proofs → guardrail grep → PHI/privacy → data honesty
(n=4 suppressed / n=6 shown; badge on all five surfaces; every dollar traces)
→ copy pass → Lighthouse + sitemap (`/employers` in; `/portal` + `/partner/r`
noindex) → deploy → **run the §2 demo top-to-bottom on production and record
it** → update `docs/sales/DEMO_SCRIPT.md` where the product got better
(sign-in replaces copy-the-URL; auto-parse replaces type-the-quote; tier
badge strengthens the analyzer beat).

### Founder actions today
1. **Apply Migration 3** (morning, not evening — the afternoon needs it).
2. The QA hour is yours + the session together: you click, it fixes.
3. Record the demo run — that recording is the sales asset.

### Cut inside Friday
Community-tier promotion → verified-only. `/api/benchmarks/tier` client chip
→ server surfaces only (PriceCalculator keeps "Modeled" static). Never cut:
tier labels on server surfaces, the honesty fixes, `/methodology`, QA, the
prod demo.

---

## WEEKEND — Sat 18 / Sun 19 · Data volume (founder-paced)

**Objective:** the verified tier stops being empty — Utah first.

1. **`/admin/ingest-gpl`** (small admin page, not a CLI — a Node script can't
   reuse the TS prompt/classify libs cleanly, and the admin gate + service
   role already exist): paste GPL text (or upload photo → the existing
   extract endpoint) + zip + home name + optional source URL → runs the
   analyzer pipeline server-side → founder eyeballs the parsed items →
   "Save" writes a `price_list_analyses` row (`extraction_method:
   'founder_ingest'`, the founder's user id) and, when a URL was given,
   stamps `funeral_homes.gpl_url/last_verified_at` on the matched home.
   Each ingest immediately feeds `/admin/benchmarks`.
2. **Utah homes:** fill the gitignored `supabase/seed/utah-homes.csv` (30–60
   SLC/Provo homes per `docs/UTAH_HOMES_SOURCING.md` — DOPL roster + Google) →
   `node scripts/import-funeral-homes.mjs --state=UT` (idempotent; lands
   `vetted=false`) → vet the demo-relevant ones in `/admin/vetting`.
3. **Utah GPLs:** collect every published Utah GPL you can (homes' own sites)
   + any already received in outreach replies → ingest each via
   `/admin/ingest-gpl` → when a metro×item group crosses n≥5, **promote Salt
   Lake City / Provo items to verified** on `/admin/benchmarks`. Honest
   expectation: only the common items (basic services fee, direct cremation,
   embalming, transfer) will cross n≥5 first — that's fine; the rest of the
   metro stays modeled and the badge says so.
4. **California start** (time permitting): CA requires online GPL posting
   (SB 658) — LA/SF/San Diego/Sacramento homes' own sites are the highest-
   yield legal source. Ingest with source URLs; FCA affiliate surveys as
   cross-checks in `sources`, never silent inputs.
5. **Optional:** `scripts/import-hospices.mjs` + a small `hospices` reference
   table (CMS Provider Data Catalog CSV, ~5–6k rows) for apply-form
   autocomplete + next week's programmatic pages. Needs its own tiny
   migration — only if the weekend has room.

**Gate:** ≥2 Utah metro×item verified groups live with visible n; every
verified row carries sources; no regressions (`npx vitest run`).

---

## The founder's week at a glance (your personal checklist)

| Day | Your actions |
|---|---|
| Mon | Apply Migration 1 (evening) · Supabase dashboard: confirm magic-link email enabled · test-drive sign-in on the preview |
| Tue | Demo org names decision · run the seed against prod · click demo steps 1–4/7 · (optional) pick Calendly/cal.com |
| Wed | Phone walkthrough of the referred-family journey on the preview; flag copy |
| Thu | Apply Migration 2 · run the provided inbound-test curl · click Confirm on the parsed quote yourself |
| Fri | Apply Migration 3 (morning) · QA hour together · record the prod demo |
| Sat–Sun | Collect Utah GPLs + homes CSV (human work only you can do) · ingest via `/admin/ingest-gpl` · promote UT metros · vet homes |

Standing rules all week: merge nothing without your go (PR per day) ·
`OUTREACH_LIVE` and `PARTNER_DIGEST_ENABLED` stay off · every day ends with
the mechanical suite + guardrail grep.
