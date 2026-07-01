# CLAUDE.md — how to work in this repo

This is the operating contract for anyone (human or agent) working on Honest
Funeral. Read it first. The full strategy is [`docs/OPERATING_PLAN.md`](docs/OPERATING_PLAN.md)
(the bible); the execution plan is [`docs/ROADMAP.md`](docs/ROADMAP.md).

## What this company is (the one-paragraph thesis)

Honest Funeral is the **free, neutral source of truth for funeral pricing** for
grieving families. Families pay **nothing**. Revenue comes from the
**institutions that serve the dying** — hospices first, then employers (B2B2C).
Insurers may distribute our tools or acquire us later, but **never pay us**. The moat is a **proprietary outcomes dataset + conflict-free
trust**, and the exit is a premium acquisition. We **never take a dollar from
funeral homes or insurers**, and we **never charge the grieving family**.

## The six guardrails — non-negotiable law

Any change that violates one of these is wrong, no matter how good it looks:

1. **Never take money from funeral homes or from an insurer as our payer.**
2. **Never charge the grieving family as the growth engine.** Free to them.
3. **Never steer a family to a specific home.** Present neutral options; the
   family chooses. (Also a legal requirement — anti-steering law.)
4. **Never publish a number we can't defend.** Require n>5 + significance before
   any home-level public claim; cite a methodology.
5. **Never own the funeral or its capital risk.** We are an advice + data layer.
6. **Never rent the whole flywheel from one platform.** Diversify reach.

## The three layers (use this to judge what to build)

- **L1 — Free source of truth:** price tools, the "is this fair?" checker,
  pillar guides, glossary, city pages, the Fair-Price Index. Reach + data.
  *Mostly built — extend it.*
- **L2 — Instrumented family service:** the at-need negotiate flow. Its real job
  is **data** (the outcomes layer). Kept free to families.
- **L3 — Institutional (the sellable product):** partner portal + reporting
  dashboard for hospices/employers. *Not built yet — this is the revenue.*

**Build priority order:** (1) outcomes instrumentation → (2) free price tool +
3 pillar guides + trust spine → (3) partner portal + reporting dashboard for a
hospice pilot → (4) Fair-Price Index + programmatic pages. Everything else
waits. If a task doesn't grow reach, advance an institutional deal, or deepen
the data, it's probably a distraction.

## Operational safety rules (do not break)

- **No live emails to funeral homes without explicit founder go.** The single
  send path is `lib/negotiation/send.ts` `sendOutreachForNegotiation`, which
  **only sends when `OUTREACH_LIVE === "true"`** (otherwise it records `dry_run`
  rows). Keep `OUTREACH_LIVE` **unset/false**. Never add a raw email-to-a-home
  send anywhere else — route everything through that function so the kill switch
  always applies. `OUTREACH_NOTIFICATIONS_ENABLED` is the matching switch for
  family quote notifications; keep it off too.
- **Only vetted homes are ever contacted.** `lib/negotiation/directory.ts`
  requires `active = true AND vetted = true`. Don't loosen it.
- **Family data is private.** `negotiations` / `negotiation_outreach` are
  owner-scoped by RLS (`auth.uid()`). New columns inherit it; never add a public
  read of family case data. Admin tools read via the service-role key behind the
  session-based admin gate (`lib/admin-auth.ts` `requireAdminPage` /
  `requireAdminApi` + the `ADMIN_EMAILS` allowlist) — mirror `/admin/vetting`.
- **The consumer payment is fully decommissioned** (guardrail #2, shipped
  2026-06-26). There is no family charge anywhere; never build one.

## Channel-survival rules (from the July 2026 market research — treat as law)

The hospice channel was burned once (Grace used hospices as lead-gen and died);
these rules are what make us admissible. Full analysis + citations:
`Honest_Funeral_Market_Research.pdf` and `docs/LAWYER_BRIEF.md` §5.L.

- **Family-initiated activation only.** The hospice hands the family a
  link/packet; the family activates. The platform NEVER cold-contacts a next of
  kin (at-need solicitation is banned in FL, TX, ME, NE — and it's the Grace
  failure mode). Opt-in follow-ups to a family who activated are fine.
- **Delivered post-admission only.** The benefit must never appear in a
  hospice's pre-admission marketing or be usable to induce hospice selection —
  that is the Anti-Kickback danger vector (the funeral itself isn't federally
  payable; inducing HOSPICE selection is). Frame institutional contracts as
  bereavement/psychosocial-support procurement.
- **The hospice transmits nothing.** Design every partner flow so no
  patient/family data flows hospice → platform (self-serve family activation).
  That keeps us out of HIPAA business-associate territory by construction
  (decedent PHI is protected for 50 years); if a flow ever requires hospice-
  transmitted data, it needs a BAA first.
- **Navigation and education, never "arranging."** Broad state definitions of
  unlicensed funeral directing (TX, SC) mean we inform, compare, and document —
  the family makes every arrangement and signs everything directly.
- **No per-referral revenue from the supply side, ever** (already guardrail #1
  — but note it is also a license-revocation offense for homes in NY/VA, so it
  poisons both sides).

## Release discipline (this repo moves fast on `origin/main`)

- **`origin/main` is the source of truth and moves fast** (multiple work
  streams). **Always `git fetch` and base new work on current `origin/main`** —
  a branch started from a stale base reinvents shipped work.
- Branch per change; open a PR; don't merge to `main` without the founder's go.
- Verify before declaring done: `npm run typecheck`, `npm run lint` (eslint),
  `npm run build`, and the test suite (vitest — tests live in `__tests__/`
  dirs and `*.test.ts`).

## Stack

Next.js (App Router) on Vercel · Supabase (Postgres + RLS + auth) · Stripe
(payment processor — being repurposed from consumer fee to institutional
billing) · Resend (send) + Postmark Inbound (receive) for email · Anthropic
Claude for the AI features (`lib/claude.ts`). Pricing data: `lib/pricing-data.ts`
+ `lib/zip-regions.ts`.

## How to think each session

Three questions, every week: **did I grow reach, move an institution toward
paying, and deepen the data?** Build toward the 90-day goal: **one hospice
paying.** When in doubt, re-read the bible.
