# Site Audit 2026-07 — The Plan

**Founder directive (2026-07-27):** audit the entire site for content, functionality, use,
and value; find what needs improvement and what must change to align with our goals; run it
over as many sessions as it takes. This program is how the next few days-to-weeks run.

**Ground truth for this plan:** a 12-agent mapping pass over the full repo (main @
`c47a6a0`, 2026-07-27) + live-prod probes (sitemap, fair-price-index data endpoint). The
per-surface detail lives in [INVENTORY.md](INVENTORY.md) (143 surfaces); the judging
criteria live in [RUBRIC.md](RUBRIC.md); findings accumulate in [LEDGER.md](LEDGER.md).

---

## How to run an audit session (standing SOP)

1. **Open:** read this file's section for the day, the matching INVENTORY section(s), and
   the LEDGER (skim open items; your day may close some).
2. **Verify, don't trust:** every INVENTORY claim is a lead. Confirm against live prod
   (honestfuneral.co) and current code before recording. Degradation is designed to look
   calm — a broken prod renders politely, so probe data, not just pages.
3. **Fan out (ultracode):** each day lists a suggested workflow shape. Verification days
   use adversarial review (finder → refuter); content days use parallel readers per cluster.
4. **Record:** every finding goes in LEDGER.md with severity, criterion, disposition.
   - Severity: **P0** live safety/legal/privacy exposure · **P1** broken or dishonest
     functionality a real user can hit · **P2** misalignment/value drag · **P3** polish.
   - Disposition: **FIX-DAY** (fixed in that day's PR) · **QUEUE** (build backlog) ·
     **FOUNDER** (decision needed) · **KILL** (remove) · **PARK** (accepted, documented).
5. **Fix-now rule:** P0s are fixed (or founder-escalated) the same session. Small
   mechanical fixes bundle into one per-day PR. Anything larger is QUEUEd — the audit's
   job is the map, not a three-week yak-shave.
6. **Close:** one PR per day (`audit(aN): …`), LEDGER updated, memory pointer updated with
   "next session = A(N+1)". Verify before declaring done: `npm run typecheck`, `npm run
   lint`, `npm run build`, `npm run test`.
7. **Guardrails apply to the audit itself:** never flip `OUTREACH_LIVE` or any send flag to
   "test"; test partners/accounts use founder-owned addresses; anything that would email a
   real institution or family gets founder go first.

**Cadence:** A1–A3 are urgent (live-risk trio) — take them first and in order. After A3,
days are largely independent; run 1–2 per day as sessions allow. Sprint Day 8 (Stripe
institutional billing) is NOT paused by this audit — when the founder completes actions
A/B (migration + Stripe test product), Day 8 runs as scheduled and A5 ideally follows it.
Sprint Day 9's planned "truth pass" is subsumed by A9. Rename stays on hold; audit fixes
use `lib/brand.ts` constants but do no rename prep.

---

## The days

### A1 — Safety, guardrails & live-config probe *(urgent — do first)*
**Question:** is anything dangerous, leaky, or wide-open in prod right now?
**INVENTORY:** `adminMap`, `apiData`, `emailAi` (gates), `quality` (gap list).

- **THE opener — ADMIN_EMAILS permissive default:** `lib/admin.ts` returns admin=true for
  ANY logged-in user when `ADMIN_EMAILS` is unset, and `lib/env.ts` only enforces it when
  `OUTREACH_LIVE=true` (which is off). **Founder: confirm `ADMIN_EMAILS` is set in Vercel
  prod.** Then live-verify: a non-admin session must 404 on `/admin/outcomes` (family
  data) and 403 on `POST /api/admin/benchmarks/promote` (public-number publish) and
  `/api/admin/partners` (sends real email on approve).
- **Anon-key RLS probe suite** across all 19 tables (VERIFY.sql + scripted anon-key reads):
  owner-scoped family tables unreadable; deny-all tables (partners, hospices,
  regional_benchmarks, household_links…) at policies=0; funeral_homes column grants still
  hide vetting notes (a table recreate would silently re-expose them).
- **Kill-switch integrity:** verify all THREE home-directed send sites gate on
  `OUTREACH_LIVE` (`lib/negotiation/send.ts:31`, `notify-chosen-home.ts:93`,
  `messages/route.ts:117`) — CLAUDE.md's "single send path" claim is imprecise; decide
  whether to consolidate or add the architecture test (A10). Verify every cron checks
  `CRON_SECRET` + its enable flag; confirm all four flags are off in prod.
- **GET-with-side-effect endpoints** (mail scanners prefetch links!): `/funeral-home-opt-out`
  writes a DB opt-out on GET — could zero the vetted directory the day OUTREACH_LIVE turns
  on; `/preferences/[id]?action=unsubscribe` applies on GET — scanners silently unsubscribe
  grieving families; both need confirm-POST steps. `/api/share/create` has NO rate limit
  (100KB anon payloads); `ResumeClient` writes every payload key to sessionStorage with no
  allowlist (session-injection vector); `/api/planning/signup` POST rate limit unverified.
- **OG endpoint abuse:** `/og` renders arbitrary query text under our brand mark — anyone
  can mint an official-looking card making any claim. Decide: sign the params or allowlist.
- **Env-flag inventory:** one table of every prod flag (OUTREACH_LIVE, the four cron flags,
  UNSUBSCRIBE_SECRET — note the `"fallback-please-set"` HMAC landmine if nurture ever flips
  on without it, PARTNER_APPLICATIONS_TO, GOOGLE_SITE_VERIFICATION, ADMIN_EMAILS) with
  live-verified state. This table becomes the canonical env runbook.
- Timing-unsafe Postmark webhook compare; resend-webhook spoofing (can it mass-deactivate
  the directory?); rate limits being per-instance (the only AI spend brake) — verdict each.

**Exit gate:** prod-safety verdict memo; every P0 fixed or founder-escalated same day.
**Workflow shape:** ~6 probe agents (RLS, admin gate, kill switches, crons, GET-endpoints,
env) → adversarial verify on anything claimed safe.

### A2 — The honesty pass: what we promise vs what runs *(urgent)*
**Question:** does any live surface tell a family or institution something untrue today?
**INVENTORY:** `l2family` (notes + negotiate surfaces), `l1tools` (homepage,
how-it-works), `legacy` (present-tense claims), `l3partner` (funding claims).

This is the single worst content-vs-reality seam found in mapping: **a real family can
complete the full negotiate flow today — double consent, "we're contacting funeral homes
for you, most reply within 24 hours" — while `OUTREACH_LIVE` is off, rows record
`dry_run`, no email leaves, and the status page prints the literal string `dry_run` to the
family.** Homepage (×3), /prices (×3), analyzer bridge, /planning, /how-it-works, dashboard
task #2, and the nurture emails all promote this flow.

- Walk the funnel live as a family would; screenshot every promise the flow makes.
- **Founder decision (the day's centerpiece):** (a) gate entry to the negotiate flow with
  honest "coverage is limited / paused" messaging, (b) reword all promises to describe
  what's real, or (c) flip OUTREACH_LIVE for a bounded region with the vetted directory.
  The audit prepares the copy for (a)+(b) so a decision can ship same-day.
- Sweep every present-tense claim against reality: "funded by the institutions we partner
  with" (tell-your-hospice, /for-funeral-homes — zero institutions pay); /our-role's
  operational claims (messaging thread, meeting scheduling — never run a real case);
  /how-it-works "sent from advocate@" vs code default `arrangements@`; "reach out to N
  homes" where N is template fiction (9/14/20) vs actual vetted count; closed-page "we've
  let the home know" on the no_quote path where no notification sends; /decide "nothing is
  saved" vs sessionStorage persistence; raw `dry_run` status leak; messages "stored but
  not sent" shown as delivered.

**Exit gate:** zero knowingly-false statements live, or each carries a founder-accepted
PARK with rationale. Decision memo on the outreach posture recorded in the LEDGER.

### A3 — Numbers defensibility: the guardrail-#4 pass *(urgent)*
**Question:** can we defend every number we publish?
**INVENTORY:** `l1tools` (orphans = the contradiction list), `l1content` (claims),
`legacy` (uncited claims per page).

- **The flagship claim first:** "typical overcharge $2,000–$5,000" appears on the homepage
  (×3), /partners, /employers, and nurture email — uncited anywhere. Derive it defensibly
  (from SERVICE_TOTALS fair-vs-predatory gaps + methodology link), reword it, or cut it.
- **Cross-surface contradictions (fix all — same fact, two published values):** casket
  savings "40–70%" (city pages) vs "50–80%" (average-cost page, analyzer); price variation
  "3–10× in the same town" vs "more than 3× between zips"; death-certificate guidance
  10–15 vs 5–10 vs calculator-3; probate "10 most populous states" vs 25 actual; "1.7M
  receive hospice care" vs "1.7M die in hospice — half of US deaths" (conflation).
- **/prices mixed thresholds:** fair range is zip-adjusted but predatory numbers beside it
  are raw national — same dollar total can be rated differently by /prices and the
  analyzer. Make both adjust, and align `computeOverall`.
- **Framing honesty:** /average-funeral-cost titles say "2026 averages" over fair-price
  bands; "required minimum" phrasing on zip pages; "save more than a year of groceries."
- **Citations to verify at the source:** 42 CFR 418.64 ("13 months… unfunded"), 16 CFR
  453.3(e)/(f) paraphrases, CFA "up to 50%", Fed SHED "40% can't cover $400", "60% die
  without a will", headstone "save 30–60%", CDC "135 people per suicide", "~10% complicated
  grief" — build the claims register (claim → surface(s) → source → verdict:
  cite/reword/delete).
- Structural: hardcoded prose numbers that can drift from `LINE_ITEMS`; city `blurb`
  spot-verification (batch-1 local color is unsourced — batch 2 dropped blurbs for exactly
  this reason); `/methodology`'s promise that every catalog change is logged on
  /corrections — confirm the 2026-06-26 Wave-1 changes actually are.

**Exit gate:** claims register complete; every public number is cited, reworded, or gone;
one canonical value per fact. **Workflow shape:** parallel claim-extractors per surface
group → one deduping register → source-verification agents per claim family.

### A4 — L2 family funnel: functionality + the data moat
**Question:** does the instrumented family service work, and does it actually collect the
data that is its stated reason to exist?
**INVENTORY:** `l2family`, `apiData` (family tables, consent pipeline).

- Full live funnel walk with a test account: /where → /decide → /negotiate/start →
  status → (simulated quote via admin) → compare → choose → closed → outcome capture.
  Exercise degraded states: signed-out, no vetted homes in zip, abandoned mid-flow.
- **Outcomes capture gap (the moat's narrow mouth):** the ONLY outcome prompt lives on the
  closed page, reachable only via choose-a-home — abandoners, independent-arrangers, and
  no_homes_available families are never asked. Design the fix (post-case nudge email
  behind its own flag, or in-dashboard prompt) → QUEUE as a build item.
- **Anonymous-analyzer persistence gap:** anonymous checks (the overwhelming default — the
  tool never asks for sign-in) persist nothing; the wedge's data job depends on a sign-in
  funnel the page doesn't push. Bring options to the founder (post-result save prompt,
  consented anonymous contribution) — this is a VALUE finding, not a bug.
- Consent write-path: live-verify declined analyses never persist (Migration A is applied;
  the legacy fallback at `analyze-price-list/route.ts:341` should now be dead — confirm,
  then schedule its removal). Compare-quotes near-duplicate rows (one row per quote per
  click) vs benchmark dedupe scope.
- **Dead/broken chains:** phase-detector reads `honestfuneral.*` storage keys while the
  decide flow writes `hf-decide:*` — the decide signal can never fire, and `PhaseGating`
  has zero consumers (mounted in layout for nothing) → confirm and KILL in A9.
  `lib/negotiation/sample-homes.ts` fiction counts (feeds the A2 overclaim). /family
  SHARE_KEYS omits plan-now (and worksheet) — shared progress silently drops them.
- Hygiene: dashboard still selects `stripe_payment_intent_id`/`unlocked_at` and uses
  `isPaidUser` naming (rename → `isTestAccount`); share-link 7-day expiry DB-enforced?;
  preferences UUID-as-credential lets a leaked link set a stranger's SMS number (from A1).

**Exit gate:** funnel walk documented end-to-end; every data-capture gap in the LEDGER
with a designed fix QUEUEd; dead chains confirmed dead.

### A5 — L3 pilot-readiness dress rehearsal
**Question:** if a hospice said yes tomorrow, what breaks or embarrasses?
**INVENTORY:** `l3partner`, `adminMap` (partner desk, outcomes desk).
**Best run after sprint Day 8 lands billing, but don't block on it.**

- **Full dress rehearsal in prod with a founder-owned test org:** apply → admin approve
  (⚠ sends a real email — use own address) → referral codes → family activation via code →
  attribution stamp → portal (session) AND token views → materials print → digest dry-run
  (`?test=` branch) → pause → verify BOTH gates park it.
- **Known holes to verify:** token pages check only `active` while session portal also
  checks `status` — a status-paused partner keeps full token access; token surface has no
  /materials twin (first friction a real coordinator hits); one-email-one-org limitation;
  `codesWithClaims` vs `priceListChecks` show different numbers for the same activity
  (explain-or-align before a pilot ED sees both); approve seats `contact_email` verbatim
  with no address confirmation; `partner_leads.handled_at` has no write path (founder
  re-triages the same leads forever); `PartnersClient` hardcodes honestfuneral.co.
- **The CAHPS card on /partners** (lines ~184–203): the only live sales surface still
  pitching the retired CAHPS/Medicare-payment hook — the framing the market-research law
  banned. Replace with referral-reputation framing. Same day: re-verify word-ban greps on
  all hospice surfaces.
- Zero-visibility + n≥5 suppression live-verified on the token report with a sub-5 cohort;
  demo-org exclusion from every aggregate a partner or the founder sees (DEMO_ORG_MARKER
  is the only separator, and /admin/outcomes has no is_test exclusion — headline numbers
  can be polluted by our own tests).
- Billing: if Day 8 has landed, walk the Stripe test flow as the pilot would; if not,
  record the revenue path as the known gap and verify `lib/stripe.ts` scaffolding
  assumptions against BUSINESS_PLAN §7.3 (needs PR #167 resolution — A9).

**Exit gate:** a written "pilot-onboarding runbook" that a real hospice could run
tomorrow, with every rough edge either fixed or listed as known-issue with owner.

### A6 — Reach: SEO, discoverability & measurement
**Question:** can people find the site, and can we even measure whether they do?
**INVENTORY:** `seoTrust`, `legacy` (sitemap inversions).

- **Measurement first (founder-assisted):** confirm `GOOGLE_SITE_VERIFICATION` is set and
  GSC is live; confirm Vercel Analytics is enabled. If either is off, the weekly "did I
  grow reach?" question has no instrument — that's the day's headline finding. Then pull
  GSC: index coverage on the 87-city cluster (watch "Google chose different canonical"),
  the hospice state pages, and the glossary.
- **Sitemap fixes:** add `/analyzer` (the wedge product is absent — flagship finding of
  the mapping pass, with near-empty metadata to fix alongside: no description, no OG, no
  canonical), `/rights`, `/our-role`, `/next-30-days`, `/tell-your-hospice`, `/eulogy`,
  decide on `/for-funeral-homes` + `/where/just-happened`; remove `/briefing` (renders
  from visitor localStorage — crawlers see an empty page) and the `/after` redirect stub;
  fix `lastModified: new Date()` on every URL (freshness signal is noise).
- **Canonicals:** the 87-city ISR cluster emits none (Next.js doesn't auto-emit) — add
  self-canonicals; same for /privacy, /terms, and the guide long tail.
- **Robots contradictions:** `/api/` disallow blocks the Fair-Price Index Dataset
  DataDownload URLs the JSON-LD advertises (undermines Dataset Search ingestion — carve
  out the two endpoints); `/signup` disallow is a fossil; decide whether to disallow
  /admin + /portal as belt-and-braces over per-page noindex.
- **The zip-page decision:** `/funeral-homes/[zip]` renders for any 5-digit string —
  ~100k-page thin-content space, no canonical, no noindex, titles promising prices for a
  page that lists no homes. Founder call: noindex the cluster (the 87-city pages now serve
  the intent better) or bound + differentiate it.
- Structured data: article-schema's hardcoded `datePublished 2026-05-14` on ~23 pages;
  Dataset license field pointing at /methodology; the unescaped JSON-LD script bypass;
  OG tagline ("quiet help after a loss") vs checker-first positioning.
- Re-run the noindex grep against LIVE prod (hospice facility pages, admin, portal,
  dashboard) — the Day-6 "all 0" bug class regresses silently.

**Exit gate:** measurement confirmed live; sitemap/canonical/robots PR shipped; GSC
baseline snapshot recorded in the LEDGER (the audit's before-picture for reach).

### A7 — Content quality: the long-tail deep read
**Question:** is the content actually good — accurate, current, safe, useful?
**INVENTORY:** `l1content` (clusters + per-cluster checks).

- **Fan-out content review** (parallel reader per cluster, each armed with the rubric):
  grief cluster · end-of-life/pre-death cluster (the pages a hospice bereavement
  coordinator reads when diligencing us — clinical sloppiness here costs deals, not just
  SEO) · money & consumer-rights · after-death admin · estate/financial · planning
  trio · glossary (64 entries, spot-verify the money terms) · faith (12+6 profiles).
- **The two never-executed human-review gates — force the decision:** (1) suicide-loss,
  overdose-loss, death-of-a-child still carry "Sister to redline before final MVP
  approval" comments; the redline never happened and the sister-as-reviewer model is
  retired. Either commission a qualified external review (grief professional) or formally
  accept the AI-verified + disclaimer posture, dated, in the LEDGER. (2) Faith clergy
  sign-off (pending since 2026-05-21) — same decision structure; note /admin/faith-qa's
  access-model conflict (a clergy reviewer would need ADMIN_EMAILS access → sees family
  data) and its localStorage-only review state.
- **The planning-trio merge decision** (single highest-leverage IA cleanup): /plan-now
  (strategic, newest) vs /planning (legacy entry + email capture) vs /plan-ahead (SEO
  pillar) — three pages, one job, duplicated prepaid-trap copy already drifting, footer
  labels colliding, /where routing to the weakest one, guides hub omitting the newest.
  Recommend: one canonical surface + redirects; founder ratifies.
- Fix the cheap accuracy items the mapping pre-found (certificate counts, probate 10-vs-25,
  hospice stat — if not already fixed in A3), headstone "vetted" claim vs the data file
  that says otherwise, "call us" copy with no phone path, MAID state-list currency.
- Tag every page with its rubric verdict — this day produces the per-page keep/fix/demote
  table that A11 triages.

**Exit gate:** every content cluster has a written verdict; both human-review gates have
a dated decision; the planning-trio decision is made.

### A8 — Trust spine & legal readiness
**Question:** would the site survive a hospice compliance officer, a journalist, and a
funeral-home lawyer reading it in the same week?
**INVENTORY:** `seoTrust` (legal pages), `docsDrift` (legal set), `l3partner` (promises).

- **/privacy is the blocker-grade item:** dated April 2026, it predates the B2B2C pivot
  and contains zero mention of institutional partners, referral attribution, or the
  aggregate de-identified reporting the portal shares with paying institutions — the
  pilot's data-flow story is undisclosed in the document that governs it. Draft the
  update; route through counsel when retained (this is also the standing counsel-retention
  gate from CLAUDE.md — surface it to the founder again here).
- /terms: the arbitration-clause TODO ("do not change without legal sign-off") — package
  for counsel; sweep the body for fee-era fossils.
- Verify the promise-shaped copy a lawyer should bless: partners-page "small cohorts are
  suppressed entirely," portal "dollar figures appear once at least five families,"
  opt-out page "removed within one business day" + "every email includes one-click
  opt-out" (check against the actual template before OUTREACH_LIVE ever flips).
- LAWYER_BRIEF / PILOT_AGREEMENT / COMPLIANCE_ADDENDUM currency check; LAWYER_OUTREACH is
  four weeks stale ("send next week" from Jul 1) — reconcile with whatever counsel contact
  the naming sprint already made; the entity question (LLC vs C-corp) goes on the counsel
  list. PRIVACY_RETENTION.md omits every post-pivot data class — update or banner it.
- Anti-steering evidence refresh: re-run the choose/outreach/ranking greps
  (ANTI_STEERING_EVIDENCE.md cites line numbers that drift), confirm partner attribution
  never reaches ranking.

**Exit gate:** counsel packet assembled (privacy draft, terms question, pilot agreement,
entity question, anti-steering evidence) — ready to hand over the day counsel is retained.

### A9 — Docs truth pass & dead-code sweep
**Question:** does the repo tell the truth to the next reader (human or agent)?
**INVENTORY:** `docsDrift`, `legacy`, `adminMap` (orphans), `emailAi` (orphans).
**This absorbs sprint Day 9's planned truth pass.**

- **Docs:** banner or delete the unmarked-stale set — PLAN_OF_ATTACK, ATTACK_PLAN,
  EXECUTION_PLAN (the "dangerous trio"), ENGINEERING_BACKLOG (its #1 item shipped weeks
  ago), TRUST_SPINE ("$49 verified on main" — flatly false), MARKETING_AUTHORITY (Index
  "not built"), SCORECARD (frozen 2026-06-24), PAYMENT_DECOMMISSION (+completion stamp),
  REFUND_SOP (its own retention condition expired), seed/README (Stripe-demo copy),
  GO_TO_MARKET (re-baseline or banner), ROADMAP top half (re-baseline), FAIR_PRICE_INDEX
  + BENCHMARK_EXPANSION_SPEC (shipped-stamps; reconcile spec vs live methodology). Close
  stale PR #127. **Resolve the BUSINESS_PLAN fork** (surface PR #167 to the founder for
  merge — Day 8 pricing depends on §7.3). Fix CLAUDE.md's "single send path" phrasing to
  name all three gated sites (or consolidate them first — A1's call).
- **Dead code (confirm-then-delete, one PR):** PhaseGating chain + phase-detector stale
  keys · commercial-suppression system (lib/suppression.ts, CommercialSuppressionNotice,
  /api/suppression/clear, the false "full commercial suppression" comment) — NOTE mapper
  disagreement on whether proxy.ts sets the cookie: resolve it, then either wire the
  readers or delete the lot (founder call: the designed grief-safety feature silently
  doesn't exist) · PriceTable.tsx · lib/content.ts dead exports · sample-homes findHomes ·
  legacy-shape analyzer fallback (once Migration-A-applied is re-confirmed) ·
  partner-digest legacy-column branch · `lib/partner-auth.ts` vs `lib/partner/auth.ts`
  double-module decision.
- **Naming/comment hygiene:** isPaidUser → isTestAccount; send.ts "paid negotiation"
  alert copy; notify-chosen-home stale docstring; scenarios.ts gateUntilPaid naming;
  TODO-FD/"sister" comments (the retired narrative) scrubbed from faith-traditions,
  cemetery-vendors, probate-by-state; schema.sql "Walk Beside" header; wb_ localStorage
  prefix; outreach-preview "selects them and pays" copy; fmtCents out of lib/stripe.
  Legacy paywall columns in schema: document-don't-drop (grep-audit noise vs migration
  risk — founder call).
- Regenerate BOOTSTRAP.sql if any migration landed since; re-verify buildsheet line
  anchors or retire the sheet sections that completed.

**Exit gate:** an agent (or human) cold-reading docs/ cannot land on a false plan; grep
for the retired narratives comes back clean; dead code is gone.

### A10 — Prevention: CI + the guardrail tests that don't exist
**Question:** what stops every finding above from silently regressing?
**INVENTORY:** `quality` (verdict list), `emailAi` (eval gaps).

- **CI pipeline (there is none — no .github at all):** GitHub Actions on PR: typecheck,
  lint, build, vitest (638 tests, ~1s — there is no excuse), plus the guardrail grep suite
  (noindex greps, verbatim copy constants, raw-table literals, word-bans) promoted from
  session-gate ritual to machine enforcement.
- **The guardrail-carrying code that has no tripwire (write these tests):** single-send-
  path architecture test (no `sendEmail` to a home outside the three gated sites — or
  consolidate to one first); the vetted-gate assertion (today's fake ignores `eq()` args —
  deleting `.eq("vetted", true)` passes the suite); consent WRITE-path test (declined
  analyses must never persist — the Day-3 load-bearing rule is enforced only by review);
  `resolvePartnerToken` (the only gate on the surface a pilot sees — untested);
  `OUTREACH_NOTIFICATIONS_ENABLED` cron gate (zero coverage); per-item LINE_ITEMS
  invariant suite (fairLow<fairHigh<predatoryAt per entry — the pattern exists for
  merp/body-care, never applied to the core catalog); glossary/faith shape tests; admin
  route-conformance test (every /admin route calls its guard); noindex-metadata guard.
- **Eval coverage:** the vision extractor (`extract-price-list-image`) is the wedge's
  first impression and has ZERO fixtures — build a golden set; same for
  `inbound-quote-parse` (also: decide the redaction posture for raw FD reply bodies going
  to Claude — currently an undocumented exception). Decide which of the remaining 9
  uncovered AI features merit evals vs explicit won't-eval notes.
- Rate-limit meta-test's hand-maintained route list → generate from RATE_LIMITS keys;
  smoke-check's duplicated directory filter → import the real one.

**Exit gate:** CI green on a test PR and required for merge; the named guardrail tests
exist and fail when their invariant is broken (mutation-test each one to prove it).

### A11 — Synthesis: triage, scorecard & the next plan
**Question:** what did we learn, and what do we do in what order?

- Roll the LEDGER up into the four-criteria scorecard per surface (the founder-readable
  artifact: every route, C/F/U/V verdicts, disposition).
- **Triage:** FIX-NOW leftovers → immediate queue; QUEUE items → prioritized against the
  three weekly questions (reach / institution / data) and slotted into the post-sprint
  plan; KILL list → one removal PR with founder sign-off; PARK list → documented
  acceptances with dates.
- Re-baseline the living docs against audit reality: ROADMAP "where we are," CLAUDE.md
  operational rules (send-path phrasing, any new law the audit produced), PRODUCT_PLAN
  phase gates.
- Write the audit close-out memo: what was found (counts by severity), what was fixed,
  what's accepted, what's queued — and the before/after on the guardrail posture.
  Archive INVENTORY.md (delete or move to an archive dir with a banner).
- Schedule the recurrences the audit exposed as one-offs that will rot: DIRECTORY_AS_OF
  refresh (CMS ~quarterly), pricing-catalog review clock (PRICING_LAST_UPDATED is the
  citability date), RATE_TABLE after 2026-08-31, SCORECARD weekly ritual (or kill the doc).

**Exit gate:** the founder can answer "what state is the site in and what happens next"
from two documents: the scorecard and the close-out memo.

---

## Pre-seeded findings

The mapping pass pre-seeded [LEDGER.md](LEDGER.md) with 40+ leads (status LEAD) so audit
days verify rather than rediscover. The five the founder should know about today:

1. **ADMIN_EMAILS may be unset in prod** → any logged-in user could be admin (family case
   data, benchmark publishing, partner approval). One Vercel check settles it. (A1)
2. **The negotiate flow makes promises prod can't keep** — families can complete it today
   and wait for outreach that never sends ("dry_run" shown raw in their status page). Needs
   a founder posture decision, then same-day copy/gating. (A2)
3. **/privacy predates the business model** — no mention of partners/attribution/aggregate
   reporting; blocker-grade for hospice diligence and a real legal gap. (A8)
4. **Two GET endpoints mutate state on link-prefetch** — mail scanners can silently opt
   homes out of the directory and unsubscribe families. Cheap fixes, real consequences. (A1)
5. **No CI exists** — 638 green tests that nothing runs on merge; guardrail law is enforced
   by session ritual only. (A10)
