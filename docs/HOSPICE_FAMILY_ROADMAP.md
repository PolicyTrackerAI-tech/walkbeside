# Hospice-Referred Family Feature Roadmap

**Status: the live build checklist.** Produced 2026-07-01 by a research +
adversarial-vet workflow: a current-app audit (so nothing below duplicates a
shipped feature), sourced research (Medicare hospice bereavement requirements
under 42 CFR 418.64, post-death admin burden, caregiver/anticipatory-grief best
practices, accessibility needs of an older population), feature generation
across six themes, and a guardrail vet that revised or killed anything touching
the six non-negotiables in `CLAUDE.md`.

**How to use this:** items are checkboxes. Work top-to-bottom within a phase;
phases are ordered by how directly they serve a hospice-referred family first
and the business second (per the L1→L3 build order). Check an item only when
it's live, gated (typecheck/tests/build), and verified on production. Effort:
**S** = hours, **M** = a day-ish, **L** = multi-day.

**Who these families are (design target):** elderly spouses or adult-child
caregivers exhausted by a long terminal illness — grief started *before* the
death (anticipatory), tech comfort varies widely, several relatives coordinate
remotely, and they're entitled to ~13 months of bereavement support their
hospice is required to offer (42 CFR 418.64) but is usually under-resourced to
deliver. That gap is our opportunity and our obligation.

**Re-baselined 2026-07-01 against `Honest_Funeral_Market_Research.pdf`:** the
research ranks the opportunities (1) pre-death admission-week navigation, (2)
the verified price layer, (3) staff relief/compliance as the sales wedge, (4)
benefit recovery, (5) the bereavement companion — *later, not first*. Phase 0
below is new; Phase 3 stays but deliberately behind Phases 0–2 and 4. The
timing constraint that governs everything: **median hospice stay is 19 days; a
quarter of patients die within 5 days of enrollment** — the core loop must
complete in one sitting, and the product does the comparing (single-home
shopping is rising; grieving people don't become bargain hunters).

---

## Phase 0 — The admission-week flow (the research's #1 opportunity) *(new)*

*Goal: break the "first-call default" — the funeral home that removes the body
wins by default — by reaching the family pre-death, through the hospice, with a
one-sitting flow. Every dollar of family value concentrates before the first
call.*

- [x] **[L] The one-sitting plan (`/plan-now` or evolved `/decide`).** A single
  guided pass, completable in ~20 minutes on a phone, that ends in a
  **documented family plan**: understand the options (burial/cremation types,
  plain language) → see fair local prices for the chosen path → capture the
  family's wishes and the deceased-to-be's preferences → surface likely
  benefits (VA, SSA, county) → name the point person and the plan. Printable +
  shareable. Framed for the hospice-admission moment ("your hospice gave you
  this so you can decide calmly, before the phone call"). Pre-death framing
  throughout — never assumes the death has happened.
  *Shipped 2026-07-02 as `/plan-now`: 5-step wizard (path w/ plain-language
  notes and a "not sure" branch showing the two common paths → zip-adjusted
  fair range from SERVICE_TOTALS → wishes/faith → 5-question benefit sweep →
  point person) → printable plan. All state in localStorage — no account, no
  server write, nothing transmitted (channel rule). `?ref=` hospice co-brand
  supported. CTA'd from /final-days as the primary action.*
- [x] **[M] The "first call" script + plan card.** The single highest-leverage
  artifact: a one-page, printable "when the time comes" card — who to call
  (the family's *chosen* home, from their plan), what to say, what NOT to
  authorize on the phone (nothing beyond transport), and the reminder that
  choosing who removes the body is choosing the funeral home. Generated from
  the family plan; works on paper for the 80-year-old spouse.
  *Shipped 2026-07-02 as the lead card of the `/plan-now` plan output: call
  the hospice first (nurse confirms, no 911) → call YOUR chosen home /
  transport-only → decide nothing else on that call → ask for the GPL (FTC
  right) → check any quote at /analyzer — with the named point person.
  Print letterhead + footer per house convention.*
- [x] **[M] Pre-death mode across existing tools.** The checker, worksheet, and
  decide flow currently assume at-need. Add a "planning ahead on hospice"
  entry state: same tools, tense-shifted copy, no death-date required, and the
  outputs feed the family plan. (The `/plan-ahead` page exists but is generic
  pre-need — this is the hospice-specific, days-not-years version.)
  *Shipped 2026-07-02: `?mode=ahead` on /analyzer, /worksheet, /decide via a
  shared `PlanningAheadBanner`; the decide veteran question tense-shifts
  ("Have they served" / "they're a veteran") and its result CTA swaps outreach
  for "Take this into your family plan"; the analyzer drops the final-bill
  cross-link pre-death and explains the ask-for-the-GPL right; /plan-now links
  out to all three in ahead mode and they link back. None of the tools ever
  required a death date (verified) — copy + routing only, no data changes.*
- [x] **[M] Benefit-recovery sweep in one pass.** One short questionnaire
  (veteran? Medicaid? employed? life insurance?) that outputs the family's
  likely benefits with dollar figures and exact next steps — VA burial
  benefits (unused by >75% of eligible veteran families), the SSA $255 lump
  sum, county indigent programs, employer/union benefits, the NAIC life-policy
  locator. Extends the existing `/veterans` + next-30-days content into a
  unified, instrumentable pass; record "benefit dollars identified" per case
  (aggregate-only) for the partner report.
  *Shipped 2026-07-02 as `lib/plan-now.ts` `benefitSweep()` (pure, 6 tests —
  incl. a guard that no invented dollar promise can appear; the only $ figure
  permitted is the statutory $255), rendered as step 4 + the benefits card of
  `/plan-now`. "Unsure" answers still surface the item — finding out is the
  action. Remaining for later: the per-case "benefit dollars recovered" metric
  (part of the five-metrics instrumentation item in Phase 4, needs the
  outcomes layer live).*

## Phase 1 — Deepen the core wedge (the fair-price checker)

*Goal: make the analyzer's verdicts more precise, more provable, and
self-improving — without ever letting a published number get ahead of its
sourcing.*

- [x] **[M] Final-bill-vs-original-quote drift checker.** New analyzer mode:
  upload the original quote AND the final signed bill; diff the line items and
  flag new/increased charges. Every claim derives from the family's own two
  documents — provable, not a benchmark guess. Same under-claim discipline as
  the existing engine.
  *Shipped 2026-07-01 as `/bill-check` (+ `POST /api/compare-bill`): pure
  document arithmetic (`lib/bill-drift.ts`), conservative pairing (benchmark id
  or exact normalized name; unpaired = confirm wording, never a silent merge),
  quote ranges treated as selections not drift, honest both directions
  (decreases/removals reported as savings), print letterhead, rate-limited.*
- [x] **[S] Self-collected multi-home price comparison.** A family who
  gathered their own quotes runs each through the analyzer and sees them side
  by side with the same neutral good/fair/high/predatory rating. No ranking,
  no recommendation — parallel facts only (guardrail 3).
  *Shipped 2026-07-01 as `/compare-quotes`: 2–3 quotes (photo or text each,
  family's own labels), each run through the existing analyze API, rendered in
  entry order with identical metrics per column — neutrality structural, no
  sort/winner/recommendation. Shared `DocInput` extracted for bill-check +
  this page.*
- [x] **[S] Cemetery/monument price-list scope detection.** Detect when an
  uploaded document is a cemetery/monument list (NOT governed by the FTC
  Funeral Rule) and suppress/relabel FTC flags accordingly — prevents citing a
  violation the Rule doesn't cover.
  *Shipped 2026-07-02: `detectDocScope` (lib/bundling-detection/doc-scope.ts)
  gates `runRules` — cemetery concepts present + zero funeral-home signals →
  all FTC flags replaced by one honest info card (Rule doesn't cover
  cemeteries/monument dealers; compare + negotiate still applies). Ties keep
  full checking (combos ARE covered by the Rule); adjectival "casket burial"/
  "cremation niche" don't count as funeral signals. 9 tests.*
- [x] **[M] Cash-advance receipt markup verification.** Upload the third-party
  receipt (florist, newspaper) next to the funeral home's charge for the same
  item → compute the exact dollar markup instead of a benchmark-based
  "suspicious" flag. Turns a fuzzy flag into a proven number.
  *Shipped 2026-07-02 as `/cash-advance-check`: manual side-by-side entry
  (billed vs the vendor's own receipt — no OCR of heterogeneous receipts, no
  server write, on-device only), pure `markupSummary`/`markupLetter` in
  lib/cash-advance.ts (refunds never offset markups; letter asks about
  disclosure, never claims illegality — the Rule regulates disclosure, not
  the markup). Cross-linked from /bill-check + the analyzer's cash-advance
  flag. 6 tests.*
- [x] **[M] State-specific legal-claim layer for `/rights`.** Replace blanket
  national embalming/vault statements with a per-state table, every row gated
  behind an explicit citation to that state's statute (closes the file's
  existing TODO; guardrail 4).
  *Shipped 2026-07-02: all 51 jurisdictions in `lib/state-body-care.ts`, each
  row statute-cited and DOUBLE-verified (research pass + adversarial verify,
  then a second hostile refutation pass on the 15 riskiest rows, which caught
  4 wrong-as-worded rows incl. Delaware's rule amended eff. 2026-02-11 and
  Michigan's 48h transport rule with no refrigeration alternative). State
  picker on /rights; unverified fallback = national baseline (structurally
  can't guess). Full audit trail in docs/STATE_BODY_CARE_FINDINGS.md —
  queued for counsel review, "laws change" disclaimer live on every row.*
- [x] **[L] Crowdsourced benchmark refinement pipeline.** Admin-only pipeline
  aggregating de-identified `price_list_analyses` to refine the fair-price
  ranges. Every change gated behind a minimum sample size per region/item
  (reuse `SMALL_SAMPLE_THRESHOLD`), logged to `/corrections` (old range → new
  range, n, date), disclosed on `/methodology` (survey-baseline vs
  crowd-refined). **This is the proprietary-data moat** — defensible only if
  the provenance rigor never slips.
  *Shipped 2026-07-02: `lib/benchmark-pipeline.ts` (pure, 9 tests — dedupe,
  min-N gate, per-unit never COLA'd, range items excluded, national
  normalization) + `/admin/benchmarks` (PROPOSES only — no apply button
  exists; emits the founder-PR spec text) + `/methodology` disclosure +
  `/corrections` append-only BENCHMARK_CHANGES log (empty state live).
  **Founder action: run `supabase/migrations/2026-07-02-benchmark-zip.sql`**
  (adds the zip column; until then the API falls back to the legacy insert
  and aggregation is national-only).*

## Phase 2 — Family coordination & the after-funeral admin gap

*Goal: close named, sourced gaps in the ~420-hour post-death admin slog that
this population (older, Medicaid/reverse-mortgage-exposed, multiple remote
adult children) hits with no help today.*

- [x] **[L] Medicaid Estate Recovery (MERP) navigator.** State-by-state guide:
  when a state can claim against a deceased Medicaid recipient's estate
  (usually the house), the Notice-of-Intent response window, and hardship-
  waiver categories (surviving spouse, disabled child, caregiver child). No
  state row ships without a citation to that state's Medicaid manual/statute
  (mirror `lib/probate-by-state.ts` discipline) + a "confirm with a local
  elder-law attorney" disclaimer. Hospice decedents skew Medicaid/dual-
  eligible; families are blindsided by this. Zero coverage in the app today.
  *Shipped 2026-07-03 as `/medicaid-estate-recovery`: all 51 jurisdictions in
  `lib/merp-by-state.ts` (scope probate-only vs expanded, notice windows only
  where codified, hardship criteria, agency, statute cite per row),
  DOUBLE-verified — research → adversarial verify → second hostile pass on
  the 30 riskiest rows, which caught Nevada's false "no pre-death lien" claim
  (NRS 422.29306(1)(b)) and Missouri's scope framing. Federal-floor card
  (42 U.S.C. §1396p(b)) leads; "before you pay or sign anything" steps;
  elder-law-attorney disclaimer everywhere; audit trail in
  docs/MERP_FINDINGS.md, queued for counsel review. Cross-linked from
  /estate + the plan-now benefit sweep.*
- [x] **[S] Surviving spouse's Medicare Part B deadline alert.** New
  context-aware task + short guide: 8-month Special Enrollment Period after
  losing coverage under the deceased's employer plan; COBRA does NOT extend
  it; missing it = permanent premium penalty. Single well-established federal
  rule, severe if missed, squarely this population.
  *Shipped 2026-07-03: task `w2-partb-sep` in /next-30-days with an expander
  guide — the 8-month SEP, the COBRA trap named explicitly, CMS-40B +
  CMS-L564 forms, the under-65 branch.*
- [x] **[M] Reverse mortgage heir timeline guide.** HECM-scoped: loan due at
  death, 30-day response to the due-and-payable notice, up to 6 months + two
  90-day extensions, the 95%-of-appraised-value payoff option, non-recourse
  protection. Note that proprietary (non-FHA) loans differ — confirm loan type
  with the servicer.
  *Shipped 2026-07-03 as `/reverse-mortgage`: leads with the two
  protections (95% payoff, non-recourse), the 5-step timeline, the
  what-to-send-this-week list (incl. taxes/insurance lapse warning +
  HUD-counselor free help), non-borrowing-spouse deferral flagged, proprietary
  loans flagged top and bottom. Month-2 task `m2-reverse-mortgage` links it.*
- [x] **[S] Bereavement-leave HR prompt.** One line added to the existing
  employer-notification task: ask HR what happens to your own PTO/leave if you
  were on caregiver leave at the time of death (~6 states mandate any
  bereavement leave).
  *Shipped 2026-07-03 on the funeral-week "Tell the deceased's employer" task.*
- [x] **[S] Point-person designation for negotiation.** Family designates one
  member as the authorized contact on a negotiation thread; only that person's
  info is shared with homes. Lightweight consent confirmation.
  *Shipped 2026-07-03: the wizard's name step reframed as "Who is the
  family's point person?" with the exact-truth privacy note (homes see "the
  Miller family"/"Sarah's family" + the shared reply address, nothing else)
  and a required consent checkbox; API enforces `pointPersonConsent` server-
  side (defaults false — hand-rolled requests can't skip it). Consent is
  validated, not yet persisted — add a column in the next migration batch.*
- [x] **[L] Live shared household link.** Upgrade `/share` from a one-time
  snapshot to a durable, unguessable-slug live view of Vault/Notifications/
  Next-30-Days/negotiation state for multiple family members — with link
  expiry/rotation (sensitive data).
  *Shipped 2026-07-03: owner-republished design (the tools are localStorage-
  by-design, so "live" = the point person's device re-publishes on every tool
  save, debounced). `household_links` table is service-role-ONLY (RLS with no
  policies — unlike share_links' anon-select, which would leak the secret);
  owner_secret returned once, gates update/rotate/revoke; 30-day rolling
  expiry; rotation kills the old slug. Read-only viewer at /household/[id]
  (checklist/contacts/documents; hostile-payload-safe parser, 6 tests) —
  never hydrates the viewer's browser. /family gains the live-link card.
  **Founder action: run `supabase/migrations/2026-07-03-household-links.sql`**
  (until then the card reports unavailable; nothing else breaks). Negotiation
  state deliberately NOT in v1 payload (owner-scoped RLS; needs its own
  design).*
- [x] **[S] Assignee field on Vault, Notifications, Next-30-Days.** Free-text
  "assigned to" + filter by assignee. Sibling division-of-labor is a real,
  named pain point; trivial addition to already-free tools.
  *Shipped 2026-07-03: shared `lib/assignees.ts` (case-insensitive names +
  filter, incl. Unassigned) + `AssigneeFilter` pills (hidden until someone is
  named). Vault/Notifications: per-row input + filter; Notifications print
  hand-off gains a "Who" column. Next-30-Days: assignee map
  (`next30.assignees.v1`) with the input on the current-task card and badges
  on upcoming/completed rows. Assignees flow into the live family view
  ("Mike is on it") via the household payload.*
- [x] **[M] Consolidated print/export "family briefing" one-pager.** One print
  view rolling up the family's own Vault, Notifications, Next-30-Days, and
  certificate-count data — legible at a glance for an out-of-town relative or
  a physical folder.
  *Shipped 2026-07-03 as `/briefing`: reuses `snapshotHousehold()` +
  `parseHouseholdView()` (hostile-safe) + `readPlan()` — plan/point person/
  wishes, open checklist items with "X is on it", still-to-reach contacts,
  missing documents (on-hand as a one-line rollup). Print letterhead/footer
  per house convention; on-device only; cross-linked from /family with the
  live-link alternative noted. Cert-count rides the vault's death-certificate
  entry rather than the logged-in tracker (device-local coherence).*
- [x] **[M] Per-family-member task digest (email now, SMS later).** Read-only
  digest to a delegated relative listing just their assigned tasks, no login
  required.
  *Shipped 2026-07-03: the /family "email someone just their part of the
  list" card + `POST /api/family/digest`. Privacy shape: the CLIENT filters
  the on-device data to the one person's open items before anything reaches
  the server — the rest of the plan never leaves the device; server formats,
  sends via Resend (dry-run without a key), stores nothing, rate-limited
  5/hr/IP. Quiet-friend tone with tests guarding it (no marketing phrases,
  no FD tagline, "nothing else is expected of you"). SMS = later, as noted.*

## Phase 3 — Grief & bereavement support (legally owed, chronically under-delivered)

*Goal: fix a confirmed dead cron, then build the evidence-based bereavement
touchpoints this population is entitled to under 42 CFR 418.64. Content and
cadence only — never an operated counseling service.*

*Research note (2026-07-01): the bereavement companion is opportunity **#5 —
"do later, not first"** (Help Texts/Empathy already crowd it, and it isn't the
money moment). The cron fix below was a live bug and stays; hold the rest of
this phase behind Phases 0, 1, and 4. Also: never pitch this to hospices as
CAHPS-score repair — emotional support is already their highest score (91%).*

- [x] **[M] ⚠️ FIX FIRST: death-date capture + re-anchored bereavement email
  cadence.** The anniversary cron (`app/api/cron/anniversary/route.ts`,
  `lib/anniversary-emails.ts`) still keys milestones off the decommissioned
  `paid_at` field — **it currently matches zero users and sends nothing.**
  Add a real `date_of_death` at intake, re-anchor milestones to it, and extend
  the cadence across the 13-month bereavement window. This is a live bug
  sitting directly on the regulatory bereavement clock.
  *Code shipped 2026-07-01: optional date-of-passing intake field (explicit
  only — no proxy anchor), cadence extended to 1mo/3mo/6mo/1yr/13mo (3mo
  carries the hospice bereavement-benefit entitlement; 13mo closes the arc),
  and a latent out-of-order-send bug fixed + regression-tested. To go live:
  founder applies `supabase/migrations/2026-07-01-bereavement-cadence.sql`
  and sets `ANNIVERSARY_EMAILS_ENABLED=true`.*
- [x] **[M] "Have you used your free bereavement benefit?" nudge + partner
  metric.** Recurring plain-worded reminder pointing the family back to their
  hospice's own Medicare-required bereavement counseling ("here's the number;
  you're entitled to this"), plus a new aggregate, small-sample-gated
  partner-report field ("% of referred families reminded/engaged"). Research:
  fewer than half of eligible families ever use the benefit they're owed. We
  drive utilization of the hospice's own service — we never provide counseling.
  *Shipped 2026-07-03: the entitlement reminder recurs across the cadence —
  3mo (full paragraph), 6mo (new reminder line + the fewer-than-half fact),
  13mo (closing line) — test-pinned to recur AND to never promise counseling
  from us. Partner metric: `bereavementRemindedPct` in `pilotMetrics` (same
  suppression gate), counted from profiles.anniversary_emails_sent —
  "reminded" only; "engaged" would require click-tracking grieving families,
  which we won't add.*
- [x] **[M] Optional PG-13 grief self-check with escalation routing.**
  Clearly non-diagnostic self-check on `/grief` built on the validated PG-13
  (Prolonged Grief) instrument, offered around the 6- and 12-month
  touchpoints; plain-language result + prominent human escalation paths
  (hospice bereavement counselor, 988, ADEC/Psychology Today directories).
  *Shipped 2026-07-03 — with a defensibility judgment call: the PG-13 itself
  is a COPYRIGHTED validated instrument (Prigerson & Maciejewski); shipping
  it verbatim on a commercial site needs the authors' permission. v1 is
  therefore a clearly-non-diagnostic self-reflection (`/grief#self-check`)
  built on the public-domain DSM-5-TR PGD themes in plain words — no score,
  nothing stored, duration-gated so early grief can NEVER produce an
  alarming read (test-pinned), every path ending at a human (hospice
  bereavement line / 988 / therapist directories). The 6mo and 1yr check-in
  emails point to it. **Founder action: request PG-13 permission from the
  Prigerson lab if the scored instrument is wanted later.** 5 tests.*
- [x] **[M] SMS opt-in channel for bereavement touchpoints.** Same content as
  the email touchpoints via Twilio opt-in; cost absorbed by Honest Funeral,
  never the family. This population skews older — SMS outperforms email here.
  *Shipped 2026-07-03: `smsFor` short bodies (≤2 segments, STOP notice, our
  domain only — test-pinned), sent by the same anniversary cron for the same
  milestone with independent tracking (anniversary_sms_sent; an SMS failure
  never affects the email path). Opt-in on the /preferences page (phone +
  explicit start; number used for check-ins and nothing else; STOP always
  works). lib/sms.ts = Twilio REST via fetch, dry-run without creds. THREE
  independent gates before a text ever sends: the migration, Twilio env
  vars, and BEREAVEMENT_SMS_ENABLED=true. **Founder actions: run
  `supabase/migrations/2026-07-03-bereavement-sms.sql`; create the Twilio
  account + set TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM; flip the switch.***
- [x] **[S] Decisional-regret normalization content.** Short, sourced addition
  to `/after-hospice` and `/final-days` normalizing lingering doubt over
  end-of-life decisions (hospice timing, DNR, stopping treatment) as a common,
  non-pathological caregiver experience — pointing to existing escalation
  resources.
  *Shipped 2026-07-03 on both pages ("If you keep replaying the decisions,
  you're in good company"): names the exact doubts (hospice timing, one more
  treatment, the DNR), frames replaying as sense-making not evidence of a
  wrong choice, soft-sourced ("research... consistently finds" — no invented
  stat, per guardrail 4), and routes to the hospice bereavement counselor +
  the /grief self-check when the loop gets heavier instead of lighter.*
- [ ] **[L] Spanish translation of the core intake + grief arc.**
  Human-reviewed (not machine-only): `/where`, `/guidance/[scenario]`,
  `/decide`, `/worksheet`, `/grief`, `/after-hospice` — carrying every
  disclaimer verbatim in meaning, and flagging faith content as
  pending-clergy-review exactly as English does. Zero non-English content
  exists today; language is the top named barrier for Hispanic hospice
  families.

## Phase 4 — Hospice-facing infrastructure

*Goal: the self-serve referral, attribution, and reporting infrastructure the
B2B2C model runs on — every institutional money relationship stays behind a
human approval gate; every family-level data point stays aggregate-only.*

- [x] **[L] Self-serve neutral referral code + claim-link system.** A hospice
  coordinator generates their own referral link (no engineer, no SQL) that
  attributes a family's case to the institution for aggregate reporting only.
  Coordinator has zero visibility into which homes any family sees.
  *Shipped 2026-07-03: the founder-issued report_token doubles as the
  institution's credential — /partner/r/[token]/links creates/copies/revokes
  codes (HF-XXXXXX, unambiguous alphabet) with aggregate claim counts ONLY.
  Family side: ?ref=<code> on /plan-now or /analyzer is remembered on-device
  30 days (`lib/referral-codes.ts`, cosmetic name-refs unaffected); the
  negotiate wizard submits it; the API resolves ACTIVE codes → sets
  partner_id + partner_code, best-effort (attribution never fails a family's
  case), reporting-only (anti-steering untouched by construction).
  **Founder action: run `supabase/migrations/2026-07-03-partner-codes.sql`**
  (needs 2026-06-27-partners.sql first). 5 tests.*
- [x] **[M] Co-branded referral landing on `/negotiate/start`.** Hospice
  name/logo alongside a persistent, non-overridable Honest Funeral neutrality
  pledge — visible at the exact moment of trust-transfer.
  *Shipped 2026-07-03: `ReferralCoBrand` resolves the visit's (or the
  remembered) code to the institution's REAL name via public
  `GET /api/partner/resolve` (active codes only, rate-limited, 404 otherwise)
  and renders it fused to the pledge — a partner name can never appear
  without "no money from funeral homes or insurers / your choices are never
  shared / they see only anonymous totals." Live on /negotiate/start,
  /plan-now, /analyzer; code refs suppress the old titleized cosmetic banner
  so "Hf 7kq2md" never renders as a name.*
- [x] **[M] Aggregate-only "tool engagement" signal in the partner report.**
  Usage counts (% who opened next-30-days, reached Month 2, used /estate) in
  the same small-sample-suppression path as the existing metrics — not a
  separate export that could bypass it.
  *Shipped 2026-07-03: `toolEngagement` computed INSIDE `aggregateCohort` (no
  bypass path exists by construction; null under SMALL_SAMPLE_THRESHOLD, 2
  tests) from existence-joins on the family's own server artifacts — checker
  analyses, cert tracker, obituary. Judgment call: next-30-days//estate opens
  are deliberately NOT server-knowable (the tools are on-device by privacy
  design and we won't add tracking to them), so the report frames these as
  floors ("server-recorded artifacts only... floors, not totals").*
- [x] **[M] Printable partner outcomes summary.** Print-optimized export of
  the existing aggregate metrics with the methodology footnote and neutrality
  line. Explicitly NOT framed as a "CAHPS" or "compliance" artifact (no
  implied CMS certification).
  *Shipped 2026-07-03 on the ProofSheet itself (sample + live token report):
  house print letterhead, a print-VISIBLE methodology footnote (own-quote
  savings basis, family-reported satisfaction, small-sample suppression,
  engagement = server floors, /methodology pointer) and the explicit "what
  this is not" paragraph — not a CMS/CAHPS instrument, not a compliance
  certification, no implied endorsement.*
- [x] **[M] Self-serve hospice partner onboarding.** Signup form → pending
  state → **manual founder approval** before any referral code goes live.
  Removes engineer-in-the-loop friction; preserves human review of every new
  institutional money relationship.
  *Shipped 2026-07-03: `/partners/apply` (two commitments stated before the
  form — structural neutrality + zero family visibility) → pending row with
  `active=false`, inert by construction (report, links, and resolution all
  require active) → founder approves on `/admin/partners` (stamps
  approved_at); a courtesy email pings the founder mailbox per application.
  **Founder action: run `supabase/migrations/2026-07-03-partner-onboarding.sql`.***
- [x] **[S] Unclaimed-referral follow-up safety net.** Internal-only admin
  count of codes issued vs claimed — surfaced to the founder, never the
  hospice — to prompt a human check-in with the coordinator.
  *Shipped 2026-07-03 on `/admin/partners`: per-partner codes-issued vs
  claims, with a founder-only nudge line when active codes sit at zero
  claims ("worth a friendly check-in with the coordinator").*
- [x] **[S] Automated aggregate-only partner activity digest email.** Periodic
  email to each partner with strictly aggregate counts. No names, no
  individual choices, no price data.
  *Shipped 2026-07-03: monthly cron (/api/cron/partner-digest, 1st @ 15:00
  UTC) building from CohortStats so the small-sample gate travels with the
  numbers by construction; zero-activity partners get no email; per-partner
  failures never block the rest. Kill-switch: PARTNER_DIGEST_ENABLED
  (default off — founder flips it in Vercel env with CRON_SECRET already
  set). 3 tests.*
- [x] **[M] The five pilot metrics, instrumented end to end.** The research's
  day-one measurement set, wired through the outcomes layer and the partner
  report: median $ saved **vs the metro median price** (not just vs the
  family's own quote) · quotes per family (countable from outreach rows) ·
  benefit dollars recovered (new per-case field, admin-entered for the pilot) ·
  staff minutes saved (a one-question coordinator survey, ops-side) · family
  NPS (extend the existing 1–5 satisfaction capture). A pilot that publishes
  first-of-kind outcome data owns the category's evidence base — no RCT links
  funeral pre-arrangement to grief outcomes yet.
  *Shipped 2026-07-03: (1) median saved vs the METRO median — `metroMedianCents`
  (mid of the zip-adjusted fair band, same benchmarks as the checker) minus
  amount actually paid, negatives kept honestly; (2) quotes/family counted
  from outreach rows with a real quote; (3) benefit dollars recovered —
  admin-entered per case on /admin/outcomes (counts as a real outcome field
  for the stamp gate); (4) satisfaction 1–5 avg + promoter share (% rating
  4–5) — deliberately NOT labeled NPS (true NPS needs 0–10; we won't fake
  the number); (5) staff minutes saved = the ops-side one-question
  coordinator survey, not app data (documented, not coded). All inside
  `pilotMetrics` in `aggregateCohort` — same suppression gate, no bypass
  path. Renders on the proof sheet with the basis stated. **Founder action:
  run `supabase/migrations/2026-07-03-pilot-metrics.sql`.** 6 tests.*

## Phase 5 — Reach & accessibility

*Goal: widen who can actually use everything above — older, lower-tech-comfort
users and language needs the site currently has zero support for.*

- [ ] **[M] Site-wide low-vision / low-tech display mode.** Persistent toggle:
  larger base font, higher contrast, simplified single-column layout —
  site-wide, not one page. Primary users are frequently 65–85+; today there is
  a fixed 17px base font and no control at all.
- [ ] **[S] Public `/accessibility` statement + language-assistance notice.**
  States a conformance *target* (not a claim of achieved compliance), known
  limitations, and how to request accommodation. Also de-risks a hospice's own
  Section 1557 concern about referring patients to a vendor tool.
- [ ] **[M] Readability lint gate on family-facing copy.** CI check scoring
  the family-facing content files against a Flesch-Kincaid grade 6–8 ceiling
  (citations/disclaimers excluded from scoring), failing any change that
  lowers the score by stripping the hedges that make a claim defensible.
  Acute grief measurably impairs reading comprehension.

---

## Killed in the guardrail vet (do not resurrect without new evidence)

- **AI grief-companion chatbot / conversational "griefbot"** — rejected
  outright, not revised. Published safety research documents that chatbots
  cannot assess imminent crisis risk (suicidality, dissociation), including a
  case preceding a user's death by suicide. All crisis/escalation paths stay
  static and human-staffed (988, the hospice bereavement line, professional
  directories) — matching the one-shot (not conversational) pattern already
  used safely for obituary/eulogy generation.

## Standing rules for everything above

Every item, before it ships: passes the six guardrails in `CLAUDE.md`; free to
the family with no exceptions; any number or legal claim carries a citation
(guardrail 4 — the discipline that has already caught real errors twice);
typecheck + tests + build green; verified on production after deploy.
