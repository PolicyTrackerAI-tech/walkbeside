# Branch & integration status (2026-05-21)

Snapshot to untangle the branch situation and prevent a destructive merge.

## The key finding

`origin/main` advanced **127 commits** while the v1.5/decide work was in
progress, via a **second active agent workstream** (the `claude/*` branches,
merged as PRs #30–#46). That stream already shipped a lot — and crucially, it
**independently did much of the same work**, including:

- Removing the "licensed funeral director" positioning (`e6b2b59`, `f7eeb7a`)
- Analyzer photo-upload + vision OCR, range-aware pricing (`3fe3acf`, `19737b6`)
- Obituary/eulogy variants, sister vetting tool, CAN-SPAM opt-out + denylist,
  outreach kill-switch, 87-metro SEO expansion, COLA coverage

And most of the v1.5/decide features are **already on main**: `/decide`,
`/faith`, `/worksheet`, `/veterans`, `/negotiate/[id]/compare`, the new service
types, `faith-traditions.ts` (with sub-profiles + `resolveFaithProfile`),
`faith-storage.ts`, `decide-engine.ts`.

## What this means for the branches

| Branch / group | Status | Action |
|---|---|---|
| `v1.5-session-1..6`, `decide-session-b`, `decide-session-b2` | **On main already** | Delete; nothing to merge |
| `faith-qa-review-tool` | Superseded | Its tool was re-ported onto current main (below) |
| **`prelaunch-consolidation`** | **SUPERSEDED — do NOT merge** | Based on an old main; merging would conflict heavily and revert newer main work. Cherry-picks already brought forward. Delete after confirming. |
| **`prelaunch-docs-and-safety`** | **← merge THIS** | Branched off current `origin/main`; contains only the unique, missing value |
| `margaret-1..26` | Separate UX-refactor stream; **status unclear** | Audit before merging — likely overlaps main heavily now |
| `claude/*` worktrees | The active parallel stream feeding main | Leave to that stream |

## What's on `prelaunch-docs-and-safety` (the one to merge)

Everything here is **new files or small additive edits** rebased on current
main — low conflict risk:

1. `docs/AI_STRATEGY.md`, `LAWYER_BRIEF.md`, `CLAIMS_VALIDATION.md`,
   `DATA_PLAN.md`, this file — strategy/legal/data docs (revised to match main's
   real, templated outreach).
2. `lib/admin.ts` + `app/admin/faith-qa/*` — internal faith-content QA tool.
3. Honesty/safety disclaimers on `/prices` (fixed a real overclaim), `/faith`,
   `/decide`.

Not ported: the outreach pre-send guard — main's outreach is a **deterministic
static template** (`lib/negotiation/email-body.ts`), not AI-generated, so the
guard isn't needed. It lives on `prelaunch-consolidation` if AI email generation
ever returns.

## The recurring meta-problem: release discipline

Two agent streams editing the same files in parallel is why work got duplicated
(the FD removal was done twice). Recommendation:

- **One integration branch is the source of truth.** Everything rebases on
  current `origin/main` before building, not on an old base.
- **One area, one stream at a time.** Don't run two sessions touching pricing /
  outreach / positioning simultaneously.
- **Rebase-before-build.** A session that starts from a week-old main will
  reinvent what already shipped — exactly what happened here.

## Still open (not done here)

- **Faith content expert review** — `/admin/faith-qa`. Pre-launch blocker.
- **Lawyer / licensing** — `docs/LAWYER_BRIEF.md`; founder doing in ~a week.
- **`directory.ts` scaling** — loads all rows + filters in memory; fine for
  Utah, must become an indexed/geo query before national scale
  (`docs/DATA_PLAN.md` §8). Deferred until the homes table has the geo columns.
- **`OUTREACH_LIVE`** — keep off until licensing + launch-state gating are done.
