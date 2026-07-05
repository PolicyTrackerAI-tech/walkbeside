# Engineering Backlog — what's next to build

Replaces the 2026-07-05 "fully superseded" version of this file (all its P1–P4
tickets shipped; that history is in git log if ever needed). This is a fresh
backlog assembled from a strategy review (sales-process, AI-feature-gap,
delivery-timing, and rollout-feasibility research) plus a fresh audit of
[`ROADMAP.md`](ROADMAP.md), [`AI_STRATEGY.md`](AI_STRATEGY.md),
[`GO_TO_MARKET.md`](GO_TO_MARKET.md), and
[`PARTNER_PORTAL_SPEC.md`](PARTNER_PORTAL_SPEC.md) against current `main`.

**Note on those four docs:** `GO_TO_MARKET.md`'s Phase 4 and
`PARTNER_PORTAL_SPEC.md`'s §1.2/§5.1 both describe "build the portal only
after a hospice signs" and a 4-new-table schema — neither matches what
actually shipped. The founder built the portal, `/partners` marketing page,
demo-request capture, and a coordinator AI tool *ahead* of a signed pilot,
using a simpler schema (one `partners` table + `partner_codes`, not
`institutions`/`partner_users`/`partner_referrals`). Both docs now carry a
short correction note pointing back here — trust this file and
`git log`/the code over those two for current state.

## Shipped this cycle (2026-07-05, verified against `main`)

- `lib/negotiation/directory.ts` no longer silently substitutes fake
  `.example` funeral homes when a region has zero vetted ones —
  `no_homes_available` status + an honest message instead (PR #123).
- Coordinator token-delivery email on partner approval + QR-code download
  button on the referral-links page (PR #123).
- Coordinator-facing AI quote-check tool at `/partner/r/[token]/check`,
  reusing the existing public `/api/analyze-price-list` pipeline — the first
  AI feature that reduces hospice-side burden instead of only helping
  families (PR #124).
- `partners.status` pipeline (pilot/active/paused/archived) surfaced as an
  editable dropdown in `/admin/partners`, and `docs/sales/DEMO_SCRIPT.md` +
  `docs/sales/README.md` fixed to stop telling presenters to fake the demo's
  payoff moment — `/admin/outcomes` has been live for weeks (PR #125).

## Next up, in priority order

### 1. AI-generated plain-English partner digest — agreed, build next

**Why:** the reporting dashboard (`/admin/outcomes`, `/partner/r/[token]`)
shows raw numbers. A coordinator or ED reading it has to do the "so what"
work themselves. An AI-generated digest ("this month: 12 families used the
checker, average overcharge caught $X, satisfaction Y/5") turns the report
into something that argues for renewal on its own — directly addresses the
founder's "repeat contracts" concern, since a report nobody reads doesn't
protect anything.

**Where it plugs in:** `app/partner/r/[token]/page.tsx` (the existing
aggregate report, already computing `aggregateCohort()` via
`lib/partner-report.ts`) or `app/admin/outcomes/page.tsx` (the founder's
view). Reuses the existing `lib/claude.ts` client + `claudeAvailable()`
fallback-gate pattern used by every other AI feature in this repo — needs a
deterministic fallback summary (a plain template built from the aggregate
numbers) for when Claude is down or unconfigured, matching the convention in
`app/api/analyze-price-list/route.ts`'s `buildAdvocacySummary`.

**Open design questions for a plan pass:** generate on every page load
(cheap, since `aggregateCohort()` output is small) or cache per-partner with
a TTL/invalidate-on-new-case (cheaper, avoids a Claude call on every
coordinator visit)? Does it need a **prompt-injection guard** — nothing in
the aggregate data is free text from an external party today, so likely low
risk, but confirm before shipping.

### 2. "Explain this line item" Q&A — coordinator-facing, small scope

**Why:** deflects the single most common question a coordinator fields
("why does this cost so much") without building the riskier full concierge
chat. Smaller, safer version of `AI_STRATEGY.md`'s "negotiation coach"
concept — scoped to explaining an already-computed line-item verdict, not
open-ended chat.

**Where it plugs in:** natural extension of the just-shipped
`/partner/r/[token]/check` tool — add a "why?" affordance next to each
`ViolationsPanel` finding that calls Claude with the specific finding as
grounding context (no new claims, same "grounded only in findings already
computed" discipline as the existing pushback-letter drafter).

### 3. Verify (don't necessarily build) — printable proof-sheet export

`PARTNER_PORTAL_SPEC.md` §3.3/§5.1 spec a "printable summary / PDF export."
Check whether `components/partner/ProofSheet.tsx`'s existing `print:hidden`
CSS classes already make browser print-to-PDF good enough before writing
any new export code — this may already be a non-issue.

### 4. Sales-ops, lower engineering priority (some blocked on founder decisions)

- **Calendar embed for demo scheduling** — replace the "we'll email you"
  `DemoRequestForm` with a real scheduling link. Blocked on the founder
  actually picking and setting up a Calendly/cal.com account first; this is
  a decision, not a build, until that account exists.
- **"What paid looks like" pricing sheet** — a one-pager derived from
  `docs/sales/ROI_RESULTS_TEMPLATE.md`'s pricing menu, usable at
  `PILOT_AGREEMENT.md` signing time instead of only after a 60-day pilot.
  Mostly a copywriting task needing the founder's input on actual pricing
  tiers, not pure code.
- **A sales pipeline tracker** — `docs/SCORECARD.md`'s own "Instrumentation
  gaps" section already flags this ("even a spreadsheet"). Founder-side
  process, not an engineering ticket, unless/until the founder wants it
  turned into code.

### 5. Longer-tail AI roadmap (from `AI_STRATEGY.md`, still valid post-B2B2C-pivot)

Lower priority than 1–2 above because these either need real pilot data to
be worth building (there are zero recorded outcomes yet) or are meaningfully
bigger scope:

- Negotiation-coach panel on `/worksheet` (real-time, not just a static
  pushback letter).
- Predatory line-item detection / home-level pricing reputation profiles —
  needs real outreach data to have signal; currently `OUTREACH_LIVE` is off
  and zero real cases exist.
- Automated inbound funeral-home email parsing/classification — reduces
  manual founder/coordinator work recording quotes from replies.
- Confidence-weighted, per-metro Fair-Price Index API
  (`/api/public/fair-price-index/[metro]`) — the current `/fair-price-index`
  page is a simpler, already-shipped version; this would be a deeper,
  API-backed iteration.

### Explicitly not next (documented risk, don't build without a founder call)

- **Grief-support companion / crisis-chat concierge.** Flagged by this
  session's own AI research as the highest-risk item in the whole roadmap —
  crisis-escalation safety, HIPAA/BAA boundary — and it doesn't touch the
  stated hospice-burden-reduction goal the way a coordinator-facing tool
  does. If this ever gets prioritized, it needs its own dedicated safety
  review first, not a slot in a general backlog.
