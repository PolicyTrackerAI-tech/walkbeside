# Site Audit — The Scorecard (A11, 2026-08-25)

The founder-readable answer to "what state is every surface in?" — one row per
surface group, judged on the four criteria (**C**ontent · **F**unctionality ·
**U**se · **V**alue), with the audit day that verified it and what remains.
✅ passes · 🟡 passes-with-noted-gaps · 🔴 fails/blocked · — not applicable.
Companion: [CLOSEOUT.md](CLOSEOUT.md) (what happens next). Evidence:
[LEDGER.md](LEDGER.md), [A7-CONTENT-REGISTER.md](A7-CONTENT-REGISTER.md).

## L1 — the free source of truth (reach + data intake)

| Surface group | C | F | U | V | Verified | State / what remains |
|---|---|---|---|---|---|---|
| Analyzer (THE wedge) | ✅ | ✅ | ✅ | ✅ | A2·A3·A4·A6 | Honest tiers/coverage, consent structural, save prompt, in sitemap w/ real metadata, parser-provenance disclosed. Remains: eval fixtures (A10-03). |
| /prices + calculators (bill-check, cash-advance, compare) | ✅ | ✅ | ✅ | ✅ | A3·A4 | `displayThresholds()` is THE display rule (test-pinned); compare names failed slots. Per-click row dedupe shipped 2026-08-25 (input_hash, post-closeout). |
| Fair-Price Index + dataset endpoint | ✅ | ✅ | ✅ | 🟡 | A3·A6 | Citable, CC-BY-4.0 licensed, robots carve-out, escaped JSON-LD. 🟡V: verified tier EMPTY until SLC GPLs are promoted — the ingest is the unlock. |
| 87-city cluster + /funeral-costs | ✅ | ✅ | ✅ | ✅ | A3·A6 | Self-canonicals added; honest lastModified; badge honesty holds with zero overrides. |
| /funeral-homes/[zip] | ✅ | ✅ | 🟡 | 🟡 | A6 | noindex,follow (unbounded thin space; founder may flip when bounded). Directory itself ~empty pending vetting. |
| Guides long tail (~45 pages: grief, EOL, money, after, estate, faith, glossary) | ✅ | ✅ | ✅ | ✅ | A7 | Deep-read with 71 verified fixes; both human-review gates decided (dated); safe-messaging held. Remains: P3 polish backlog in the register. |
| Planning surfaces | ✅ | ✅ | ✅ | ✅ | A7 | Trio → two pages: /plan-ahead canonical (+cheat-sheet form), /plan-now the pre-death product (partner URLs pinned), /planning 301s. |
| Homepage + how-it-works + FAQ | ✅ | ✅ | ✅ | ✅ | A2·A3·A7 | Honest-mode language; no fabricated stats; FTC scope stated correctly. PARK A2-P1: ~15 CTA "we contact homes" descriptions stand (wizard disclosizes at entry) — revisit at go-live. |
| Trust spine (/methodology, /corrections, /rights, /our-role, privacy, terms) | ✅ | ✅ | ✅ | ✅ | A3·A8·A9 | Privacy rewritten for B2B2C; terms' false LLC removed; corrections honest; full-name brand. Remains: counsel blessing (retained-engagement item). |
| SEO/measurement plumbing | ✅ | ✅ | 🔴 | 🟡 | A6 | Sitemap/robots/canonicals/schema fixed. 🔴 GSC: no verification on prod — **reach is unmeasured until the founder sets `GOOGLE_SITE_VERIFICATION`**; Vercel Analytics mounted, dashboard confirm pending. |

## L2 — the instrumented family service (the data moat)

| Surface group | C | F | U | V | Verified | State / what remains |
|---|---|---|---|---|---|---|
| Negotiate flow (wizard → status → results → choose → closed) | ✅ | ✅ | ✅ | 🟡 | A2·A4 | Honest-mode derives from real send state; raw enums can never reach a family (tested). 🟡V: zero real cases until the directory is vetted; dry-run re-run endpoint ready for go-live. |
| Outcomes capture | ✅ | ✅ | ✅ | ✅ | A4 | Every exit path asks (closed/no_homes/open/abandon); cohort mechanics verified; email nudge designed (queued behind founder flag). |
| Consent pipeline | ✅ | ✅ | ✅ | ✅ | A4·A9·A10 | Declined-never-persists is STRUCTURAL (no legacy path exists) + write-path test, mutation-proven. |
| On-device tools (worksheet, briefing, next-30-days, vault, notifications, eulogy) | ✅ | ✅ | ✅ | 🟡 | A4·A7 | Share/resume hydration fixed (key→store map, tested); tasks.ts liability advice fixed. 🟡V by design: on-device = no server data. |
| Share/household/resume + digests | ✅ | ✅ | ✅ | ✅ | A1·A4·A8 | Allowlists both directions; rate limits; anon-enumeration hole closed (code; **prod migration = founder**). |
| Comms prefs / unsubscribe / nurture | ✅ | ✅ | ✅ | — | A1·A3·A7 | POST-only mutations; honest cadence promises; UUID-as-capability decision queued (founder). |

## L3 — the sellable product (revenue)

| Surface group | C | F | U | V | Verified | State / what remains |
|---|---|---|---|---|---|---|
| /partners + /employers (sales surfaces) | ✅ | ✅ | ✅ | ✅ | A5·A7 | CAHPS pitch dead (word-ban gate enforces); durable claims; projection framing cited. |
| Partner portal (session) + token surfaces | ✅ | ✅ | ✅ | 🟡 | A5 | One parked rule both sides (tested); materials printable from the quick link; small-cell banding server-side (#191). 🟡: prod dress rehearsal = founder, per PILOT_ONBOARDING_RUNBOOK. |
| Admin desk (8 tools + index) | ✅ | ✅ | ✅ | ✅ | A5·A9 | /admin index new; leads triage-able; demo-org cases excluded from headline totals. Gate FAILS CLOSED — `ADMIN_EMAILS` must be set in prod. |
| Billing (Day 8, BILLING_LIVE) | ✅ | 🟡 | — | 🟡 | A5 | Guardrail pins green; inert until envs. 🟡: live Stripe test walk = founder (runbook §7). |
| Reporting/digest pipeline | ✅ | ✅ | ✅ | ✅ | A5·#191 | n≥5 + banding everywhere partner-visible; legacy branch removed. |

## Cross-cutting

| Concern | State | Verified |
|---|---|---|
| Guardrails #1–#6 | **Zero breaches found across the whole audit.** #1/#2 structurally pinned (billing eligibility allowlist, stripe-factory scan, no family charge exists); #3 anti-steering structural + re-greped; #4 displayThresholds + n≥5 + banding + claims register; #5 navigation-not-arranging language verified per surface; #6 channel diversity = the open queue (GSC!). | A1–A10 |
| Kill switch + send paths | Three gated sites, denylist re-checks, architecture-tested; notifications cron gated + tested; re-run endpoint cannot leak mail. | A1·#196 |
| RLS / privacy | 19-table anon probe airtight (A8 corrected the one latent hole — **prod migration still on the founder**); column grants hold. | A1·A8 |
| CI + tripwires | CI on every PR (first in repo history); consent write-path, vetted gate, send-path architecture, cron gate, word-ban + raw-table greps — ALL mutation-tested. | #195·#196 |
| Docs truth | 22 docs verdicted; 14 bannered, 4 deleted; CLAUDE.md pointers correct; INVENTORY archived. | A9·A11 |
