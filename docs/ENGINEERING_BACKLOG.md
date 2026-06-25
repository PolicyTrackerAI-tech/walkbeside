# Engineering Backlog — plans to code

Turns [`ROADMAP.md`](ROADMAP.md) P1–P4 into sequenced, sized tickets. Every claim
below was **verified against current `main`** (not assumed). Specs own the
detail; this owns the ordering, sizing, and dependencies.

## Guardrail banner (applies to every outreach-touching ticket)

`OUTREACH_LIVE` stays **OFF**. The only path that emails a funeral home is
`lib/negotiation/send.ts` `sendOutreachForNegotiation`, which records `dry_run`
and sends nothing unless `OUTREACH_LIVE === "true"`. Never add another
home-email path. The order below is chosen so **no step can start live emails**.

## Verified ground truth (current `main`, 2026-06-24)

- `lib/stripe.ts`: **`FLAT_FEE_CENTS = 49_00`** ($49 upfront pay-to-send).
- `app/api/negotiate/start/route.ts`: inserts `status:'pending_payment'` + stores
  outreach rows `status:'pending'`; **sends nothing inline.**
- `app/negotiate/[id]/preview/page.tsx`: **exists** — a blurred-name pay-to-send
  teaser that POSTs to `/api/stripe/checkout` (the $49 charge).
- `sendOutreachForNegotiation` is the **sole send path**, self-gated on
  `OUTREACH_LIVE`, called from `stripe/checkout` (×2 bypass paths),
  `stripe/webhook`, and the `GET /api/negotiate/[id]` reconciliation. The
  single-send-path invariant is **already true** — no work needed there.
- Stripe routes present: **`checkout`, `webhook` only** (no `checkout-account`,
  no `unlock`). `app/paywall/` = `page.tsx` only (no `success/`).
- `lib/negotiation/directory.ts` requires `active = true AND vetted = true`.
- **Vitest is already set up** (`vitest.config.ts` + `package.json` `test` /
  `test:watch` + 9 `__tests__` files). Extend it — do **not** add a harness.
- The **outcomes instrumentation** (migration `2026-06-22-negotiation-outcomes.sql`,
  `/admin/outcomes`, `/api/negotiate/[id]/outcome`, `components/negotiate/`) is
  built but **NOT on `main`** — it's on a separate branch pending its own PR.

---

## P1 — Land the outcomes layer (the moat)

| # | Ticket | Files / area | Acceptance | Size | Deps |
|---|---|---|---|---|---|
| P1.1 | Merge the outcomes PR + apply its migration to prod | the outcomes branch; `supabase/migrations/2026-06-22-…` | migration applied; `/admin/outcomes` loads; family satisfaction + admin recording persist; RLS verified owner-scoped | M | founder review of the outcomes PR |

---

## P2 — Free the family + trust spine (per [`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md) + [`TRUST_SPINE.md`](TRUST_SPINE.md))

| # | Ticket | Files / area | Acceptance | Size | Deps |
|---|---|---|---|---|---|
| P2.1 | **Stage 1 — decouple the send trigger from payment.** Fire `sendOutreachForNegotiation` from `/negotiate/start` (or a status transition) instead of the Stripe path; drop `pending_payment`. | `app/api/negotiate/start`, `app/api/stripe/{checkout,webhook}`, `lib/negotiation/send.ts` | with `OUTREACH_LIVE` off, a new case creates **`dry_run`** rows and sends **0** emails; `send.test.ts` dry-run case green; new test: start → `dry_run`, 0 sends | M | P1 (status model) — **most dangerous step; neutralized by the self-gate** |
| P2.2 | **Stage 2 — remove the $49 charge.** Short-circuit `app/api/stripe/checkout`; remove the `/negotiate/[id]/preview` teaser + blurred names (redirect to status/results); neutralize the webhook family branch. (No `checkout-account`/`unlock` exist.) | `app/api/stripe/checkout`, `app/negotiate/[id]/preview/page.tsx`, `app/api/stripe/webhook` | no family checkout; choosing a home is free; tests updated | M | P2.1 |
| P2.3 | **Stage 3 — scrub family-fee copy.** Remove `$49` / "refundable" / "pay-to-send" family copy sitewide, **incl. `app/for-funeral-homes/page.tsx` (lines ~46, 118)**, homepage, `how-it-works`, `faq`, `our-role`, `about`, dashboard, emails. Reframe to free-to-families. | many `app/*` + email templates | `grep` for `$49`/`FLAT_FEE`/"refundable" returns no family-facing copy | M | P2.2 |
| P2.4 | **Trust spine pages** `/promise`, `/methodology`, `/corrections`, `/team`; add a **named author/reviewer** to the Article schema (the biggest E-E-A-T gap — today author is `Organization`). | new `app/{promise,methodology,corrections,team}`; `lib/article-schema.ts` | 4 pages live; schema carries a named reviewer with credentials | L | P2.3 (so `/promise` can truthfully say "free") |

---

## P3 — Partner portal MVP (per [`PARTNER_PORTAL_SPEC.md`](PARTNER_PORTAL_SPEC.md))

| # | Ticket | Files / area | Acceptance | Size | Deps |
|---|---|---|---|---|---|
| P3.1 | Migration: `institutions`, `partner_users`, `partner_referrals` + `negotiations.institution_id` | new `supabase/migrations/…-partner-portal.sql` | tables + RLS; **no partner policy on `negotiations`** (family RLS intact) | M | P1 |
| P3.2 | Neutral intake: a claim code on `/negotiate/start?ref=CODE` ties a self-started case to an institution (anti-steering safe; no PHI) | `app/negotiate/start/*`, new intake API | code claims link case→institution; no PHI stored | M | P3.1 |
| P3.3 | Reporting dashboard: partner-scoped read of outcomes (families served, satisfaction, savings, time-to-resolution); small-n suppression | new `app/partner/*`, service-role read | a partner sees only their cohort's aggregates; small-n cells suppressed | L | P1, P3.1 |

---

## P4 — Fair-Price Index (per [`FAIR_PRICE_INDEX.md`](FAIR_PRICE_INDEX.md))

| # | Ticket | Files / area | Acceptance | Size | Deps |
|---|---|---|---|---|---|
| P4.1 | `/fair-price-index` page + `/methodology` (canonical in TRUST_SPINE) + `Dataset` JSON-LD; lead pages with the Index headline stat; enforce **n>5 + significance** before any home-level claim | new `app/fair-price-index`, `lib/pricing-data.ts`, schema | public page live; methodology published; no home-level claim under n=5 | L | outcomes data volume |
| P4.2 | Expand the line-item taxonomy **21 → ~24** | `lib/pricing-data.ts` | taxonomy at ~24; existing pages/tests still green | S | — |

---

## Cross-cutting

| # | Ticket | Acceptance | Size |
|---|---|---|---|
| X.1 | Reach analytics for the [`SCORECARD.md`](SCORECARD.md) metrics (privacy-respecting: visitors, tool uses, email subs) | dashboard rows populate | M |
| X.2 | Extend the **existing** vitest suite alongside each ticket (harness already exists — don't re-create it) | new logic covered by tests | S (ongoing) |

## Safe order summary

P1.1 → P2.1 → P2.2 → P2.3 → P2.4 → P3.1 → P3.2 → P3.3 → P4.1 → P4.2, with X.1/X.2
threaded in. The genuinely hard plumbing (single send path, vitest) is **already
done**, so net scope is smaller than it looks. Nothing in this order flips
`OUTREACH_LIVE`; going live with real outreach remains a separate, explicit
founder decision and is **out of scope for the entire backlog.**
