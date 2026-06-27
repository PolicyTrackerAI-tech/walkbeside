# P3 — the hospice partner layer (L3 revenue) — decision + build

**Status: code shipped (migration-deferred); awaiting founder go on the open
questions + the migration.** Output of a judge-panel design pass (2026-06-27)
across four architectures (zero-infra by-hand, referral-code cookie capture,
magic-link portal, employer-grade). This is the roadmap's P3 — "the most
important thing to build after outcomes data exists."

## Recommended architecture (built)

**Approach A's operating model + Approach D's naming.** The leanest thing that
produces the conversion artifact — a live, branded, credible aggregate proof
report — for a single hand-run pilot, while leaving the employer end-state one
*additive* migration away (never a repaint).

- **Tenant table `partners`** (`partner_type` CHECK `hospice|employer|insurer`,
  `status`, high-entropy `report_token`, `active`). RLS on, no policies →
  service-role only, exactly like `/admin/outcomes` + `/admin/vetting`.
- **Attribution = `negotiations.partner_id`** (nullable FK, `ON DELETE SET NULL`),
  tagged by the founder in `/admin/outcomes` **after** the family has chosen a
  home. It is a reporting label only — never read by `/api/negotiate/choose`,
  outreach, or home ranking, so **anti-steering is structural**.
- **Real report at `/partner/r/[token]`** (noindex): resolve token → partner via
  service-role, pull `negotiations WHERE partner_id = id AND outcome_recorded_at
  IS NOT NULL`, map each row → `CohortRecord` (overcharge = `GREATEST(savings_vs_
  listed_cents,0)`; satisfaction; resolution from `created_at → outcome_recorded_at`;
  ftcIssues = hidden-fee findings on the case's outreach rows), feed the
  **unchanged** `aggregateCohort()`, render the **shared `<ProofSheet>`**.
- **One overcharge definition** — the case's own `savings_vs_listed_cents`. We do
  NOT also sum `price_list_analyses` by user_id (it double-counts repeat checker
  runs and is indefensible if a hospice asks "how is this computed?").
- **`<ProofSheet live>`** suppresses the dollar/satisfaction figures below
  `SMALL_SAMPLE_THRESHOLD` (5) — showing the family count + "building…" — so a
  lone referred family can't be re-identified; calm empty state at n=0.
- **`/partner/[code]`** stays the **sample** sales-deck (`<ProofSheet live={false}>`).

A leaked `report_token` exposes only headline aggregates (no PII) and is revoked
instantly by rotating the column.

## What shipped in this PR (additive, reversible, migration-deferred)

- `supabase/migrations/2026-06-27-partners.sql` (NOT applied to prod).
- `lib/partner-report.ts`: `rowToCohortRecord` + `OutcomeRow` (pure, tested).
- `components/partner/ProofSheet.tsx` (shared) + `PrintButton.tsx` (relocated).
- `app/partner/r/[token]/page.tsx` (real report, degrades gracefully pre-migration).
- `/partner/[code]` rewritten to the shared sample sheet.
- `/api/admin/outcomes` PATCH accepts `partnerId` → writes `negotiations.partner_id`.

## To go live (founder)

1. Apply both migrations in the Supabase SQL editor: the outcomes one
   (`2026-06-22-…`) **and** `2026-06-27-partners.sql`.
2. `INSERT` the pilot hospice into `partners`; copy its `report_token`.
3. Run pilot cases by hand, record outcomes in `/admin/outcomes`, and tag each to
   the partner (`partnerId` via the API/SQL for now). Don't share the live
   `/partner/r/<token>` URL until ≥5 recorded cases — show `/partner/[code]`
   (the sample) until then.

## Open questions (yours to confirm — built on these defaults)

1. **Overcharge headline** = sum of `GREATEST(savings_vs_listed_cents,0)` per
   tagged case. Defer the checker-run contribution (avoids double-counting). OK?
2. **Threshold to share a live token** = 5 recorded cases; sample deck until then.
3. **`report_token` = shareable aggregate** (bearer link, no PII, revocable by
   rotation), not authenticated/confidential. Comfortable for pilot #1?
4. **FTC-issue source** = hidden-fee findings on outreach rows (vs. a hand-entered
   per-case count). Aggregator tolerates 0 either way.
5. **Anti-steering optics**: `?ref=` banner stays cosmetic (attribution is your
   hand-tagging); defer `?ref=` persistence to wave 2.

## Deferred (additive later, FK onto `partners.id`, zero repaint)

Per-case partner `<select>` in `/admin/outcomes` (next; tag via API/SQL for now) ·
`partner_codes` (N referral codes/tenant + `?ref=` cookie attribution) ·
`partner_members` (seats + magic-link/SSO for employers) · per-tenant branding ·
billing.
