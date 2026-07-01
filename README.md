# Honest Funeral

The free, neutral source of truth for funeral pricing. Families pay nothing,
ever. Revenue comes from the institutions that serve the dying — hospices
first, then employers. We never take money from funeral homes or insurers, and
we never charge the grieving family.

**Start here:** [`CLAUDE.md`](CLAUDE.md) is the operating contract for anyone
(human or agent) working in this repo — the six non-negotiable guardrails, the
three product layers, and the build-priority order. The full strategy lives in
[`docs/OPERATING_PLAN.md`](docs/OPERATING_PLAN.md) (the bible) and the live
execution plan in [`docs/ROADMAP.md`](docs/ROADMAP.md).

The tip of the spear is the price-list checker at `/analyzer` — snap a photo of
a funeral home's price list, get flagged overcharges and likely FTC Funeral
Rule issues in seconds, sourced and documented at `/methodology`.

---

## Stack

- **Next.js** (app router) + **React** + **TypeScript**
- **Tailwind CSS**
- **Supabase** (Postgres + auth + storage, row-level security)
- **Anthropic Claude** for price-list OCR/parsing, obituary/eulogy drafting,
  and advocacy summaries
- **Resend** for outbound email
- **Stripe** — kept as scaffolding for future *institutional* billing only.
  There is no family-facing charge anywhere in this app.

---

## Local dev

You need Node 20+ and npm.

```bash
npm install
cp .env.example .env.local   # fill in values as needed
npm run dev                  # http://localhost:3000
```

The free tier (price lookup, prep kit, the checker's deterministic fallback
parser, etc.) works without any environment variables set. AI features
(Claude-backed OCR, drafting, summaries) turn on once `ANTHROPIC_API_KEY` is
set; Supabase-backed features (accounts, dashboard, outcomes) once the
Supabase vars are set. A development banner surfaces exactly which keys are
missing — it never renders in production.

### Useful scripts

```bash
npm run dev         # next dev
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm test             # vitest run
npm run lint        # eslint
```

---

## Deploying

Vercel auto-deploys on push to `main`. `OUTREACH_LIVE` is the kill-switch that
gates whether outreach emails actually reach funeral homes (off = dry-run,
recorded but not sent) — see `lib/env.ts` for the full required-var list and
`docs/LAUNCH_CHECKLIST.md` for the launch sequence.

---

## Project layout (high level)

```
app/            # routes — the checker (/analyzer), trust pages (/methodology,
                # /corrections, /fair-price-index), the at-need /negotiate
                # flow, /admin/* internal tools, /partner/* hospice reports,
                # guides/glossary/SEO pages
lib/            # pricing-data.ts (fair-price benchmarks), bundling-detection/
                # (FTC rules engine), negotiation/ (parsing + outreach),
                # partner-report.ts, env.ts, admin-auth.ts
components/     # shared UI
supabase/migrations/  # applied by hand in the Supabase SQL editor — see
                      # each migration's header comment for status
```

For anything deeper — which routes exist, what's built vs. planned, current
data-layer status — read `docs/ROADMAP.md`, not this file. It moves fast; this
file is deliberately a stub so it can't go stale the way a detailed one would.

— end —
