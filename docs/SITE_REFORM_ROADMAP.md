# Site Reform Roadmap — one site, two zones, staged

**Date:** 2026-07-04
**Trigger:** founder request — reform the landing experience for hospice/employer
buyers and the family/consumer side, without losing existing content, and
answer the "should these be two entirely different sites?" question directly.
**Inputs:** the full consumer-route inventory (~110 family-facing routes) and
the full B2B/institutional-route inventory (marketing funnel, token-gated
partner portal, founder admin tools), both taken from the current codebase;
[`docs/B2B2C_UX_RESEARCH_SYNTHESIS.md`](B2B2C_UX_RESEARCH_SYNTHESIS.md) (the
report the founder is referring to); [`docs/ENGINEERING_BACKLOG.md`](ENGINEERING_BACKLOG.md)
(current active backlog, checked to avoid duplicating in-flight work).
**Purpose:** a reference doc to plan against, not a one-sitting build. Stages
are sequenced so each is shippable and useful on its own.

---

## 1. The two-sites question — direct recommendation

**Recommendation: no domain split. Keep one Next.js app on one domain
(`honestfuneral.co`), but harden the family side and the buyer side into two
deliberately distinct *experience zones* within it.** Do not stand up
`partners.honestfuneral.co` or a second repo/app. This is a "no" to the literal
question, but the founder's underlying worry — that the two audiences
currently bleed into each other — is correct and worth fixing structurally,
just not by splitting infrastructure.

**Why not full separation:**

- **The content doesn't justify it yet.** The B2B side today is five real
  surfaces: `/partners`, `/partners/apply`, `/admin/partners`,
  `/partner/r/[token]` (+ `links`, `check`), and `/partner/[code]` (sample). The
  consumer side is ~110 routes across pricing tools, guidance content,
  negotiation flow, and account areas. A second site is infrastructure sized
  for a buyer-side product that doesn't exist yet — five pages don't need
  their own deploy pipeline, DNS, auth boundary, and design system to
  maintain in parallel.
- **The research doc says this directly, about a narrower version of the same
  question.** `docs/B2B2C_UX_RESEARCH_SYNTHESIS.md` §4 item 7 flags
  per-partner branded subdomains (e.g., a Lyra-style `<partner>.honestfuneral.co`
  for each hospice) as premature infrastructure "suited to a company with many
  established enterprise contracts" — and Honest Funeral's 90-day goal is
  *one* hospice. That is a different question from "should the buyer
  marketing/portal zone and the family zone be two sites" — but it's the same
  underlying judgment: don't build infrastructure ahead of the audience that
  needs it. One hospice-facing marketing page, one apply form, one admin
  list, and one token-gated report do not amount to a second product.
- **A split creates real maintenance cost for no current benefit.** Two Next.js
  apps means two deploys, two dependency trees, two places to keep the trust
  copy (guardrails, pricing methodology, "we take no commissions") consistent,
  and — critically — two places to keep `OUTREACH_LIVE`/`ADMIN_EMAILS`/RLS
  safety rules correctly wired. CLAUDE.md's operational safety rules (kill
  switches, vetting gate, admin allowlist) are easiest to keep correct in one
  codebase where a reviewer can see the whole picture in one PR.
- **Nothing in the actual traffic pattern demands it.** Buyers (hospice EDs,
  coordinators) and families never share a session — a coordinator gets a
  bearer-token URL by email, a family gets a referral link at admission. There
  is no scenario where the same visitor needs both zones open at once in a way
  that a shared nav would confuse. The audiences are already segregated by
  *entry point*, which is the thing that actually matters for a B2B2C split
  (per the research doc's report 4 comparators — Lyra/Spring/Calm/Teladoc all
  solve this with a URL-level or subdomain-level entry distinction, not two
  separate marketing companies).

**Why the "two zones" framing is still the right read of the founder's
worry:** Right now the buyer-facing pages (`/partners`, `/partners/apply`,
`/admin/partners`) and the family-facing pages share exactly one piece of
chrome — `components/SiteHeader.tsx` — and that header's nav
(`Home / How it works / Guides / About / FAQ`) is 100% family-oriented. A
hospice ED landing on `/partners` currently sees a nav bar built for a
grieving family, and a family on `/plan-now` never sees anything
buyer-shaped, which is correct — but the *shared* header means neither zone
gets navigation that fits its own visitor. That's a real, fixable problem
without a domain split — it's Stage 2 below (a buyer-appropriate header
variant, scoped to the `/partners*` and `/admin/partners*` route tree, still
in the same app).

**Revisit condition:** if the founder signs multiple hospice/employer
contracts and the buyer side grows past marketing + apply + portal into
something with its own login, its own multi-page admin console, or
segmented hospice-vs-employer marketing (research doc Gap 5, deliberately
deferred), reopen this question. At that point a subdomain (not a second
codebase) is the more likely right call — same recommendation the research
doc gives for per-partner branding: lighter infrastructure now, heavier only
when the audience and proof exist to justify it.

---

## 2. Preserve-everything checklist

Any reform work below must not break or orphan any of the following. Treat
this as a regression checklist, not a task list.

**Consumer-side — must keep working and linked:**
- [ ] All crisis-triage entry points (`/`, `/where`, `/where/just-happened`,
      `/decide`, `/plan-now`) still route correctly into pricing, guidance,
      and negotiation flows.
- [ ] `/analyzer`, `/bill-check`, `/compare-quotes` (quote-checking tools) stay
      reachable from guides and pricing pages.
- [ ] `/prices`, `/average-funeral-cost`, `/funeral-costs/[city]`,
      `/fair-price-index`, `/funeral-homes/[zip]` (pricing + geo cluster) keep
      their current internal-link web — this is the SEO cluster from the
      most recent city-cluster/glossary-expansion work (see recent commits:
      "expand glossary 37→63," "complete COLA coverage," "national head-term
      page," "internal-link city cluster").
- [ ] `/glossary` and all 63+ `/glossary/[slug]` entries remain linked from
      `/analyzer`, `/prices`, `/how-it-works`.
- [ ] Every scenario/grief guide under `/guides` (17 pages: `/sudden-loss`,
      `/talking-to-kids`, `/overdose-loss`, `/suicide-loss`,
      `/death-of-a-child`, `/body-donation`, `/home-funeral`, `/pet-loss`,
      `/reverse-mortgage`, `/medicaid-estate-recovery`,
      `/disenfranchised-grief`, `/end-of-life`, `/grief`, `/digital-legacy`,
      `/memorial`, `/after-hospice`, `/out-of-state-death`) stays reachable
      from `/guides` and cross-linked as today. `/talking-to-kids` is the
      most-linked page in the inventory (17 inbound) — do not let a nav
      change orphan it.
- [ ] The after-death admin cluster (`/after` + its three sub-pages, `/estate`
      + `/estate/[state]` for all 50 states, `/survivor-benefits`,
      `/veterans`, `/certificates`, `/rights`) stays intact.
- [ ] The full negotiation flow (`/negotiate/start` →
      `/negotiate/[id]/preview` → `/status` → `/results` → `/compare` →
      `/closed`) and its resumability (`/resume/[id]`) are unaffected.
- [ ] The logged-in account area (`/login`, `/dashboard`, `/account`,
      `/household/[id]`, `/vault`, `/preferences/[id]`, `/subscriptions`,
      `/notifications`, `/briefing`, `/plan-ahead`, `/planning`) keeps working
      exactly as today — none of this is in scope for reform work below.
- [ ] Trust/legal pages (`/how-it-works`, `/our-role`, `/methodology`,
      `/corrections`, `/faq`, `/about`, `/privacy`, `/terms`,
      `/accessibility`) keep their current cross-links; `/methodology` in
      particular is the thing Stage 2's "how we calculated this" work must
      link *to*, not replace.
- [ ] `components/HelpFooter.tsx` ("Stuck or just need to hear a human
      voice?") keeps appearing on family spine screens — it's the crisis
      escape hatch, unrelated to nav/header reform.
- [ ] `/unsubscribe` (HMAC-signed, no-login) keeps working untouched — it's
      linked from email footers, not site nav.
- [ ] `/faith/[tradition]`, `/family`, `/funeral-etiquette`,
      `/funeral-home-opt-out`, and `/funeral-home-tactics` — five real,
      shipped routes the automated inventory agents missed (confirmed by a
      direct `ls app/` pass during review). `/faith/[tradition]` is the
      clergy-adjacent faith-tradition content (`lib/faith-traditions.ts`,
      still pending human sign-off per project memory — do not treat as
      fully authoritative). `/family` holds `DigestCard.tsx`/`Family.tsx`/
      `HouseholdLinkCard.tsx`, likely feeding the household/shared-decision
      surface — verify its actual entry point before any nav change.
      `/funeral-home-opt-out` is a compliance mechanism (a funeral home
      removing itself from outreach) and must never become harder to find
      as a side effect of buyer-nav work in Stage 2.

**Buyer-side — must keep working and linked:**
- [ ] `/partners` keeps every current section (hero, stat cards with
      methodology link, live-computed demo card via
      `lib/partner-report.ts`'s `aggregateCohort()`/`sampleCohort()`,
      numbered "How it works for you," problem/what-we-do/trust blocks,
      `DemoRequestForm`, apply CTA) — Stage 2 work adds sections, it doesn't
      remove any of these.
- [ ] `/partners/apply` still submits to PENDING status for founder review;
      unaffected by any header/nav change.
- [ ] `/partner/sample-hospice` (via `/partner/[code]`) keeps rendering the
      public illustrative sample report referenced from `/partners` and from
      `docs/sales/DEMO_SCRIPT.md`/`docs/sales/README.md` as the pre-signed-pilot
      fallback.
- [ ] `/partner/r/[token]`, `/partner/r/[token]/links`,
      `/partner/r/[token]/check` — the bearer-token partner portal, its QR
      download, and the coordinator AI quote-check tool — are untouched by
      any marketing-page reform.
- [ ] `/admin/partners` (approval pipeline, status dropdown, codes-issued vs.
      claims-made safety net) and `/admin/outcomes`, `/admin/vetting`,
      `/admin/benchmarks`, `/admin/faith-qa`, `/admin/messages`,
      `/admin/outreach-preview` keep working under `requireAdminPage`/
      `requireAdminApi` + `ADMIN_EMAILS` — none of this is public-facing and
      none of it should become reachable without the session gate as a side
      effect of nav changes.
- [ ] `docs/sales/*` (DEMO_SCRIPT, README, PILOT_AGREEMENT, HOSPICE_ONEPAGER,
      OUTREACH_SEQUENCE, DISCOVERY_SCRIPT, ROI_RESULTS_TEMPLATE) keep their
      route references accurate — any URL/section renamed in Stage 2+ must be
      updated in these docs in the same PR.
- [ ] `/for-funeral-homes` — a third, lighter-weight stakeholder surface
      (funeral homes themselves, not hospice/employer buyers), confirmed to
      exist but missed by the initial inventory pass. It's one page, not a
      portal, so it doesn't change §1's recommendation — but any buyer-nav
      work in Stage 2.2 should decide explicitly whether this page lives in
      the new buyer-zone nav or stays under the family-zone nav (it's
      currently reachable from `/our-role` and `/how-it-works`, i.e. the
      family/trust side, not from `/partners`).

**Cross-cutting — must never regress:**
- [ ] `OUTREACH_LIVE` and `OUTREACH_NOTIFICATIONS_ENABLED` stay unset/false;
      no reform task touches `lib/negotiation/send.ts`.
- [ ] `lib/negotiation/directory.ts`'s `active = true AND vetted = true` gate
      is untouched.
- [ ] No new public read of `negotiations`/`negotiation_outreach` case-level
      data is introduced by an admin-aggregate or trust-page task.
- [ ] Guardrail #4 (n>5 + significance before any home-level public claim)
      continues to gate every stat shown on `/partners` and in the partner
      digest.

---

## 3. Staged task list

Four stages: quick wins that touch copy/small components with no IA change,
then buyer-side reform, then consumer-side reform, then the structural
"two zones" changes that make the split real. Effort sizes are honest — some
of these are multi-day, not quick.

### Stage 1 — Quick wins (no restructuring, low risk)

**1.1 Add "how we calculated this" disclosures to the `/partners` stat cards**
- **File(s):** `app/partners/page.tsx`
- **What it does:** The "Typical overcharge" ($2,000–$5,000) and "Bereavement
  mandate" (~13 months) cards currently state numbers with only a
  `/methodology` link under one of them. Add a one-line "see the math" inline
  disclosure under *each* stat (baseline, sample size or citation, what's
  excluded), not just a link out.
- **Addresses:** `B2B2C_UX_RESEARCH_SYNTHESIS.md` Gap 2 exactly — "every stat
  should link or expand to a one-paragraph 'how we calculated this'... not
  buried in a separate methodology page." Also directly serves guardrail #4.
- **Size:** Small (half a day) — copy + a small disclosure component, no data
  model change. The $2,000–$5,000 and 42 CFR 418.64 citations already exist;
  this is presentation, not new research.
- **Backlog cross-reference:** Not in `ENGINEERING_BACKLOG.md` — net new,
  sourced directly from the research doc's Gap 2 / summary-table action #2.

**1.2 Rephrase privacy/trust claims as falsifiable mechanism statements**
- **File(s):** `app/partners/page.tsx` (the "Why you can trust this" grid)
- **What it does:** Change "No PHI ever reaches us. Families self-enroll;
  your systems transmit nothing." into the specific, catch-us-in-a-lie
  register the research doc prescribes — e.g., naming exactly what API call
  fires and what it returns (an aggregate count, not a name/MRN/admission
  date).
- **Addresses:** Gap 4 — "phrase the no-PHI and no-steering guarantees as
  falsifiable mechanism statements rather than value statements." The
  research doc gives the exact target phrasing; this task is applying it to
  the specific cards, not a doc.
- **Size:** Small (a few hours) — copy-only change, no engineering.
- **Backlog cross-reference:** None; this is the research doc's own
  "free — no new engineering" item (summary table action #4).

**1.3 Add an aggregate summary strip to `/admin/partners`**
- **File(s):** `app/admin/partners/page.tsx`, `app/admin/partners/PartnersClient.tsx`
- **What it does:** A small strip above the existing pending/active list —
  counts by status (pending/pilot/active/paused/archived), and a
  days-in-pipeline figure per pending application — so the founder sees
  portfolio health at a glance instead of reading the whole list every time.
- **Addresses:** Gap 3 — "add a simple aggregate table/summary at the top of
  `app/admin/partners/` (counts by status, days-in-pipeline, last-activity)
  before it's needed for more than a handful of partners." Explicitly
  low-urgency pre-first-deal per the research doc, but cheap.
- **Size:** Small–medium (about a day) — the `partners` table already has
  `status` and `created_at`; this is a derived summary computed from data
  already fetched in `page.tsx`, plus a small UI block in `PartnersClient.tsx`.
  No migration needed.
- **Backlog cross-reference:** Not in `ENGINEERING_BACKLOG.md`. Complementary
  to (not overlapping with) `ENGINEERING_BACKLOG.md` item 1, the AI-generated
  partner digest — that item is partner-facing (`/partner/r/[token]`), this
  one is founder-facing (`/admin/partners`).

**1.4 Surface sample-size/confidence in the AI partner digest UI copy**
- **File(s):** `app/partner/r/[token]/page.tsx` (and wherever the digest
  prompt/template lives per `ENGINEERING_BACKLOG.md` item 1 — `lib/claude.ts`
  + the fallback template pattern from `buildAdvocacySummary` in
  `app/api/analyze-price-list/route.ts`)
- **What it does:** If the digest's server-side logic already enforces
  guardrail #4's significance floor (per `ENGINEERING_BACKLOG.md` item 1,
  this was just built), confirm it, then make sure the rendered digest text
  always states its own `n` (e.g., "based on 14 families this quarter")
  instead of a bare claim.
- **Addresses:** Gap 6 — "ensure the digest always states its own n... if
  this is already enforced server-side, surface it in the UI copy itself."
- **Size:** Small (verification + copy tweak, half a day) — this is a
  check-and-adjust task on work that likely just shipped
  (`ENGINEERING_BACKLOG.md` "Shipped this cycle" lists the AI digest
  feature as recently built via PR-scale work), not new engineering.
- **Backlog cross-reference:** Directly follows on from
  `ENGINEERING_BACKLOG.md` item 1 (AI-generated plain-English partner
  digest) — this task is the research doc's Gap 6 refinement of that
  already-shipped feature, not a duplicate.

### Stage 2 — Buyer-side reform

**2.1 Build a `/trust` page (or `#trust` section) with the no-PHI data-flow
demonstration**
- **File(s):** New `app/trust/page.tsx`, or a new section appended to
  `app/partners/page.tsx`; link it from both `/partners` and (per Preserve
  checklist) update `docs/sales/DEMO_SCRIPT.md` / `docs/sales/README.md` if
  either references a stable set of `/partners` anchors.
- **What it does:** The single highest-leverage gap per the research doc —
  a real trust surface: the no-PHI mechanism stated concretely ("the hospice
  hands out a code; Honest Funeral never receives a name, MRN, or admission
  date"), a literal small data-flow diagram or numbered list (family →
  activation → aggregate-only report back, nothing hospice → platform), and
  an FAQ block answering "do you ever see which family used this?" and "what
  exactly does the hospice see?" directly rather than deflecting.
- **Addresses:** Gap 1, the research doc's top-ranked item — "the near-
  universal trust-page anatomy... Honest Funeral's single strongest, most
  defensible trust claim... isn't structurally presented the way report 3
  prescribes."
- **Size:** Medium (2-3 days) — new page/route, a small diagram (SVG or a
  simple numbered-steps component, not an illustration commission), FAQ
  content drafted from claims that already exist in CLAUDE.md and
  `docs/LAWYER_BRIEF.md` §5.L (no new legal claims to invent). Explicitly do
  **not** add compliance badges (SOC 2/HIPAA seal/ISO) — research doc §4
  item 2 is unambiguous that Honest Funeral hasn't earned those and a badge
  would misrepresent a structural design choice as a certification.
- **Backlog cross-reference:** Not in `ENGINEERING_BACKLOG.md` — net new,
  this is the research doc's #1-ranked, unaddressed gap.

**2.2 Buyer-appropriate header/nav variant scoped to the partner route tree**
- **File(s):** `components/SiteHeader.tsx` (add an optional nav-variant prop
  or a new sibling component, e.g. `components/PartnerSiteHeader.tsx`),
  applied in `app/partners/page.tsx`, `app/partners/apply/page.tsx`, and
  `app/admin/partners/page.tsx`.
- **What it does:** This is the concrete fix for the founder's actual worry
  (buyer and family experiences currently share one nav). Give the
  `/partners*` and `/admin/partners*` tree a nav appropriate to a hospice
  ED/coordinator — e.g., `Partners / How it works / Trust & security /
  Apply` — instead of the family nav (`Home / How it works / Guides / About
  / FAQ`) currently rendered by the shared `SiteHeader`. Keep the same
  visual system (same design tokens, same typography) — this is a content/IA
  change to the nav, not a new brand.
- **Addresses:** The founder's literal "two sites" worry, resolved as a
  same-codebase "two zones" fix per §1's recommendation above. Not a named
  item in the research doc (which didn't examine header/nav sharing
  directly), but a direct, low-risk implementation of its report-2-derived
  principle: "conditional rendering by permission/segment... same app," which
  is exactly what report 2 recommends over full separation.
- **Size:** Medium (1-2 days) — `SiteHeader` is a single shared client
  component (235 lines); adding a variant prop and a second `NAV_LINKS` array
  is straightforward, but every buyer-facing page needs its usage updated and
  visually checked (desktop + mobile menu).
- **Backlog cross-reference:** None — new, and it's the one task in this
  roadmap that most directly operationalizes the recommendation in §1.

**2.3 Hospice/employer segmentation on `/partners`** — explicitly deferred
- **File(s):** `app/partners/page.tsx` (future: split into segment variants)
- **What it does / why deferred:** Do **not** build this now. Flagged here
  only so it isn't forgotten.
- **Addresses:** Gap 5, which the research doc itself marks "deliberately low
  priority, sequenced correctly... do not build this now... Flag it as the
  natural next step once the first hospice deal closes and employer GTM
  starts."
- **Size:** N/A — deferred until a second real buyer segment exists.
- **Backlog cross-reference:** Matches `ENGINEERING_BACKLOG.md`'s own posture
  of sequencing segment-specific work behind a signed pilot; no conflict.

### Stage 3 — Consumer-side reform

The consumer side's core flows (triage → tools → guidance → negotiate →
account) are extensive and, per both inventories, already well cross-linked.
The research doc does not flag consumer-side IA problems directly — its scope
was the B2B2C hand-off and buyer marketing — so this stage is deliberately
lighter and more conservative than Stage 2, focused on the one seam the
inventories jointly surface: the point where a family-referred-by-a-partner
session and an organic family session diverge.

**3.1 Audit and document the referral hand-off surface once buyer-side nav
changes exist**
- **File(s):** `components/ReferralCoBrand.tsx`, `app/plan-now/PlanNow.tsx`
- **What it does:** No code change recommended by the research doc here —
  it explicitly says "no changes recommended to `components/ReferralCoBrand.tsx`
  or the referral-code activation flow itself — it already matches or
  exceeds every B2B2C comparator pattern found." This task is a verification
  pass: once Stage 2.2 ships a buyer-appropriate nav, confirm the family-side
  entry point (`/plan-now?ref=CODE`) still renders the existing
  `ReferralCoBrand` banner correctly and that nothing in Stage 2 accidentally
  pulls buyer-nav styling into the family flow.
- **Addresses:** Preserve-everything checklist item (buyer-side): the
  hand-off mechanism must not regress. Traces to research doc §3's finding
  that this mechanism is already best-in-class — the task is regression
  verification, not new design.
- **Size:** Small (half a day) — manual + automated check, referencing the
  existing test coverage if any exists for `ReferralCoBrand`.
- **Backlog cross-reference:** None; net-new verification step tied to
  Stage 2.2.

**3.2 Consumer homepage/nav consistency check against the new buyer nav**
- **File(s):** `components/SiteHeader.tsx`, `app/page.tsx`
- **What it does:** After 2.2 introduces a second nav variant, do a full
  pass confirming the *default* (family) `SiteHeader` usage across all ~110
  consumer routes is unaffected — i.e., that adding a variant prop didn't
  change default behavior anywhere it's invoked without the new prop. This is
  mechanical regression-proofing given how many pages import `SiteHeader`.
- **Addresses:** Preserve-everything checklist (consumer-side) — protecting
  the existing nav across the full route inventory from an unintended side
  effect of the Stage 2 header change.
- **Size:** Small–medium (a day) — mostly grep + spot-check rendering on a
  representative sample (`/`, `/where`, `/guides`, `/dashboard`, `/after`),
  since exhaustively clicking all ~110 routes isn't practical.
- **Backlog cross-reference:** None; direct dependency of 2.2, not
  independently valuable.

**3.3 Defer: deeper consumer-side IA rework**
- **What it does / why deferred:** The consumer inventory shows a large,
  already-cross-linked content graph (hub pages like `/guides`, `/after`,
  `/how-it-works` already exist and function as the IA backbone). Neither
  inventory nor the research doc identifies a specific consumer-side
  navigation defect — the founder's stated worry was about the *buyer*
  landing experience specifically ("the place where the hospice buyers will
  land"). Rather than inventing consumer-side problems to solve, this
  roadmap defers consumer IA rework until a specific gap is identified (e.g.,
  from analytics on the recently-added `<Analytics />` instrumentation, or
  from direct user feedback) — consistent with the research doc's general
  discipline of only building against a real, cited gap.
- **Size:** N/A — intentionally not scoped until a concrete finding exists.
- **Backlog cross-reference:** None.

### Stage 4 — Structural / IA changes (only if the two-zones recommendation needs to go further)

These are **not recommended now**. They're listed so the roadmap has an
answer ready if the revisit condition in §1 is triggered (multiple signed
hospice/employer contracts, buyer side outgrows marketing + apply + portal).

**4.1 Move buyer-zone routes under a single path prefix (e.g. `/partners/*`
absorbing `/admin/partners` conceptually via clearer internal linking, or a
route-group in the Next.js App Router: `app/(buyer)/...`)**
- **What it does:** Use Next.js route groups to formalize "two zones, one
  app" at the file-structure level — a `(buyer)` group wrapping
  `partners`, `partners/apply`, and a shared buyer layout (the Stage 2.2
  header variant becomes a real `layout.tsx` instead of a prop), and a
  `(family)` group for the rest. This is an internal refactor with no URL
  changes (route groups don't affect paths), so it's safe relative to the
  Preserve checklist.
- **Addresses:** Makes the "two zones" recommendation from §1 durable in the
  codebase rather than ad hoc — future contributors get a structural
  reminder of which zone a new page belongs to.
- **Size:** Large (multiple days) — touches the app directory structure;
  needs careful verification that no route paths change and all imports
  still resolve.
- **Backlog cross-reference:** None. Explicitly gated on the revisit
  condition in §1 — do not start this speculatively.

**4.2 Subdomain split (`partners.honestfuneral.co`) — only if buyer product
scope genuinely grows**
- **What it does:** The actual "two sites" the founder asked about, done
  properly if it's ever warranted: separate deploy target, shared design
  tokens via a package or copy-paste (small enough surface that a shared
  library is probably overkill even then), same Supabase backend.
- **Addresses:** The founder's original question, answered "yes, eventually,
  if" rather than "no, never." Mirrors the research doc's own logic on
  per-partner subdomains (§4 item 7) — premature now, reasonable once the
  audience and proof exist.
- **Size:** Large (a multi-week infrastructure project, not a feature) —
  DNS, deploy pipeline, auth boundary decisions, design-system extraction.
- **Backlog cross-reference:** None. Do not schedule this without a specific
  trigger (e.g., 3+ signed institutional contracts, or a buyer-side feature
  that genuinely needs its own login system distinct from the token-URL
  model).

---

## Summary table

| Stage | Task | File(s) | Size | Traces to |
|---|---|---|---|---|
| 1.1 | "How we calculated this" on `/partners` stats | `app/partners/page.tsx` | Small | Gap 2 |
| 1.2 | Falsifiable-mechanism copy rewrite | `app/partners/page.tsx` | Small | Gap 4 |
| 1.3 | Admin partner-list summary strip | `app/admin/partners/page.tsx`, `PartnersClient.tsx` | Small–medium | Gap 3 |
| 1.4 | Digest sample-size/confidence in UI | `app/partner/r/[token]/page.tsx` | Small | Gap 6; follows Backlog #1 |
| 2.1 | `/trust` page + data-flow FAQ | New `app/trust/page.tsx` | Medium | Gap 1 (top-ranked) |
| 2.2 | Buyer-appropriate header/nav variant | `components/SiteHeader.tsx` + buyer pages | Medium | §1 recommendation, report-2 principle |
| 2.3 | Hospice/employer segmentation | `app/partners/page.tsx` | Deferred | Gap 5 (deliberately deferred) |
| 3.1 | Referral hand-off regression check | `ReferralCoBrand.tsx`, `PlanNow.tsx` | Small | §3 finding (already best-in-class) |
| 3.2 | Family-nav regression check | `SiteHeader.tsx`, `app/page.tsx` | Small–medium | Preserve checklist |
| 3.3 | Deeper consumer IA rework | — | Deferred | No specific gap identified yet |
| 4.1 | Route groups for buyer/family zones | `app/(buyer)/...`, `app/(family)/...` | Large | Formalizes §1 |
| 4.2 | Subdomain split | New infra | Large | §1 revisit condition only |

**What not to do, restated from the research doc's §4 (applies across every
stage above):** no fabricated logos/customer counts, no premature compliance
badges, no analyst-citation claims, no mega-menu/app-switcher navigation, no
institutional third-person brand voice, no per-partner branded subdomains.
