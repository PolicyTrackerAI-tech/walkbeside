# Site Audit 2026-07 — Close-Out Memo (A11, 2026-08-25)

Eleven audit days, run 2026-07-27 → 2026-08-25 across ~10 working sessions.
The founder can answer "what state is the site in and what happens next" from
this memo + [A11-SCORECARD.md](A11-SCORECARD.md). Evidence trail:
[LEDGER.md](LEDGER.md) (64 findings rows + per-day close-outs),
[A3-CLAIMS-REGISTER.md](A3-CLAIMS-REGISTER.md),
[A7-CONTENT-REGISTER.md](A7-CONTENT-REGISTER.md), [A1-VERDICT.md](A1-VERDICT.md).

## What was found, by the numbers

**64 ledger findings**: 5 P0 · 25 P1 · 25 P2 · 9 P3 — plus ~120 register-level
content findings in A7 (71 applied same-day, the P3 remainder preserved below).

**Dispositions:** 42 FIXED (incl. partial-FIXED combinations) · 1 KILLED (dead
phase chain) · 2 DECIDED (the human-review gates; the planning trio) ·
12 QUEUE · 3 PARK (dated acceptances) · the rest founder-action or scheduled.
**Zero guardrail breaches were found anywhere** — the failures were honesty
drift, dead machinery, missing instrumentation, and stale paper, not the six
laws.

## The five findings that mattered most

1. **A2-01 (P0):** a real family could complete the whole negotiate flow and
   see raw `dry_run` strings while nothing sent. → Honest-mode default: every
   in-case surface derives its language from actual send state, tested.
2. **A8-03 (P0):** `share_links` was bulk-enumerable with the public anon key
   (latent — zero rows at probe time). → Service-role reads + lockdown
   migration (**prod apply still on the founder**).
3. **A1-01 (P0):** unset `ADMIN_EMAILS` made every logged-in user an admin.
   → Fails closed now (**founder must set the env or /admin is locked**).
4. **A7's content read:** a placeholder phone rendered sitewide to grieving
   readers; move-money-before-notifying-the-bank advice; verifier notes
   rendered as state law; a fabricated vendor directory. → All fixed, with
   the register as the audit trail.
5. **The moat had one mouth (A4-01):** outcomes were only captured on a page
   no real family had ever reached. → Every exit path asks now; the
   ≥$1,500-median kill gate can actually accumulate evidence.

## Guardrail posture: before → after

| | Before | After |
|---|---|---|
| Enforcement | Session ritual + review memory | **CI on every PR** + mutation-tested tripwires: consent write path (structural — no legacy insert path exists), vetted gate, 17-site send-path architecture, notifications-cron gate, CAHPS word-ban, raw-benchmark-table allowlist, BOOTSTRAP concat pin, billing factory scan, copy-law verbatim pins |
| Numbers | Flagship claims uncited; thresholds inconsistent | One canonical value per fact; `displayThresholds()` the single display rule; claims register; projection framing cited |
| Honesty | Promises described intent | Language derives from actual state (sends, saves, persistence, parked partners) |
| Docs | 14+ stale plans readable as current | Bannered/deleted; CLAUDE.md pointers true; INVENTORY archived |

## The open queue, prioritized by the three weekly questions

**DATA (the moat — highest leverage now):**
1. FOUNDER: `ADMIN_EMAILS` → ingest the SLC harvest (`~/FH/gpl-harvest/README.md`),
   vet SLC homes, promote first verified benchmarks (unlocks Index verified
   tier + real at-need cases + A3-08's per-item source table).
2. A4-01 email nudge — designed, built on founder flag-go.
3. A4-02 anonymous consented contribution — schema decision (founder).
4. ~~A4-04 analysis-row dedupe~~ (shipped 2026-08-25, post-closeout — `input_hash` migration must be applied in prod before deploy).
5. A10-03 eval fixtures — vision extractor golden set, seedable from the
   harvest's image GPLs (code, next session).

**INSTITUTION (revenue):**
6. FOUNDER: prod dress rehearsal per `docs/PILOT_ONBOARDING_RUNBOOK.md`
   (+ Stripe test walk §7); counsel packet send; **selling calendar — the
   audited product is no longer the bottleneck; conversations are.**
7. A8-06 inbound-attachment cap vs "PDF is fine" copy — before OUTREACH_LIVE.
8. A2-P1 PARK: go-live copy revisit (CTA descriptions) when the flag flips.

**REACH:**
9. FOUNDER: `GOOGLE_SITE_VERIFICATION` (reach is UNMEASURED until this) +
   Vercel Analytics dashboard confirm → then the GSC baseline snapshot (A6-C3).
10. ~~A1-05 /og signing~~ (shipped 2026-08-25, post-closeout — inert until `OG_SIGNING_SECRET` is set in Vercel) · A6-05 OG-tagline voice call (founder).

**Hygiene queue (batch into any session):** A1-07 anonymous-email endpoint
limits verify · A1-08 webhook timing-safety (pre-OUTREACH_LIVE) · A8-05
expired-link purge cron · A8-07 salt ip_hash · A8-08 raw-payload retention ·
A7 P3 backlog (register) · A9 legacy paywall columns (document-don't-drop
stands; droppable at leisure).

## PARK list (dated, accepted)

- **A2-P1** (2026-08-18): ~15 L1 CTA "we contact homes" service descriptions
  stand while the wizard disclosizes the pause at entry. Revisit at go-live.
- **A5-04d** (2026-08-24): `contact_email` seated verbatim at approval —
  founder double-checks at click; runbook documents it.
- **A7-01** (2026-08-25): AI-verified + disclaimer posture for sensitive-grief
  and faith content; paid professional review committed post-first-revenue.

## Recurrence schedule (the clocks that will rot)

| Clock | Cadence | Next | Where |
|---|---|---|---|
| `DIRECTORY_AS_OF` (lib/hospice-directory.ts) | CMS refresh ~quarterly | ~Oct 2026 re-import | with the DOPL/vetting pass |
| `PRICING_LAST_UPDATED` (lib/pricing-data.ts) | On catalog review; at latest when SLC GPLs promote | at first promotion | benchmark desk |
| Headstone-vendor click-test | ~Semiannual (last full: 2026-08-25) | ~Feb 2027 | A7 register method |
| MAID state list (end-of-life page) | Legislative sessions | check ~Jan 2027 | compassionandchoices.org (pinned in-code) |
| Perishable stats (A3-09 register) | Annual | ~2027-08 | A3 register |
| RATE_TABLE (state fee table) | After 2026-08-31 | Sep 2026 | per its own note |
| The audit itself | Re-run the A1 probe suite + A6 live greps quarterly | ~Nov 2026 | LEDGER methods |

The old weekly-ritual `docs/SCORECARD.md` is retired (deleted this PR): the
three questions stay the weekly habit; this scorecard is re-cut at milestones.

## Standing founder actions (the complete list, one place)

1. Set `ADMIN_EMAILS` in Vercel (P0-class: /admin locked until then).
2. Apply `supabase/migrations/2026-08-18-share-links-lockdown.sql` in prod.
3. Set `GOOGLE_SITE_VERIFICATION` (or confirm DNS) + confirm Vercel Analytics.
4. GitHub branch protection: require the `verify` check on main.
5. Ingest the GPL harvest → vet SLC homes → promote first benchmarks.
6. Dress rehearsal per PILOT_ONBOARDING_RUNBOOK (+ optional help-line decision:
   staff a number + set `NEXT_PUBLIC_HELP_PHONE`, or keep the email-only default).
7. Counsel: send the packet; Clerky finish (~Sep 17 d/b/a clock); Squarespace 301.
8. Selling: the ≥20-conversations Oct-1 kill gate. Everything else above serves this.
