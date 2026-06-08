# Functional integrity audit (2026-05-21)

Static audit of all 83 routes and every internal link, run because the
product will be tested **live, self-serve, with no human hand-holding** — a
404 or dead-end in front of a grieving family is the failure mode that matters
most at launch. Build passing only proves it compiles; this catches link rot.

## ✅ Fixed: broken internal links

**`/preferences` → `/worksheet`** (4 CTAs). The pages `/plan-ahead`,
`/after-hospice`, and `/end-of-life` linked "Open the preferences worksheet →"
to `/preferences`, but the only route there is `/preferences/[id]` — the
**email-unsubscribe page** (keyed by user UUID, reached from anniversary
emails). The CTAs meant the pre-meeting **preferences worksheet** at
`/worksheet`. Fixed all four; those links were 404ing.

## ⚠ Duplication to resolve (needs an IA decision — not done here)

**`/planning` vs `/plan-ahead`** — both are pre-need planning pages.
`/plan-ahead` ("Plan ahead — pre-need funeral and estate planning") is the
active one (internally linked, has the worksheet CTAs). `/planning` ("Planning
a funeral in advance") is **orphaned** — nothing links to it — and looks
superseded. Two near-duplicate pages cannibalize SEO and confuse users.
Recommend: redirect `/planning` → `/plan-ahead` (or consolidate). Left for
whoever owns the pre-need IA to avoid colliding with in-flight work.

## Orphan routes (nothing links to them)

**Intentional — no action (reached by redirect, email, or direct entry):**
`/admin/*` (internal tools), `/paywall/success`, `/resume/[id]`,
`/unsubscribe`, `/negotiate/[id]/closed`, `/funeral-home-opt-out`
(funeral-home email link), `/where/just-happened` (entry sub-route).

**Discoverability gap — content pages reachable only via search/sitemap:**
`/average-funeral-cost` (SEO head-term — fine as a landing page),
`/death-of-a-child`, `/end-of-life`, `/funeral-etiquette`,
`/out-of-state-death`, `/pet-loss`. These are sensitive/long-tail content
pages; if they're meant to rank via search, orphan status hurts SEO (no
internal links) but isn't a crash. Consider linking them from a guides/topics
hub.

## Not done here (deeper QA, if wanted)

This was a **static** link/route audit. A **live click-through** of the core
flows (crisis entry → guidance → prices → account → outreach → results →
dashboard) using a real browser would catch runtime errors, broken form
submits, and UX dead-ends that static analysis can't. That's the recommended
next step before live launch.
