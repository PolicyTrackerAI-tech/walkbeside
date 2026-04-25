# Walk Beside

A consumer-first guide for families through the death of a loved one — from the
first phone call to the last account closed. Built by a brother–sister
founding team. The sister is a licensed funeral director.

This is **Version 1**: the first 72 hours and the arrangement meeting.

---

## What's in here (Version 1)

| Screen | Path | What it does |
|---|---|---|
| 1. Crisis entry | `/` | One message, one button. Nothing else. |
| 2. Where did they pass? | `/where` | Routes to scenario-specific guidance. |
| 3. Immediate guidance | `/guidance/[scenario]` | Next 2 hours by scenario. |
| 4. Fair price lookup | `/prices` | Free tier. Adjusts by zip. Deal rating. |
| 5. Account (soft gate) | `/login` | Email + password. Only required for AI negotiation. |
| 6. AI negotiation start | `/negotiate/start` | Family details + outreach kickoff. |
| 7. Negotiation status / results | `/negotiate/[id]/status`, `…/results` | Track replies, pick a home. |
| 8. Dashboard | `/dashboard` | Always exactly 3 tasks. |
| 9. Arrangement prep kit | `/prep` | Printable cheat sheet, scripts. |
| 10. Price list analyzer | `/analyzer` | Paste GPL → flagged overcharges. |
| 11. Death certificate calc | `/certificates` | Inputs → exact number to order. |
| 12. Obituary helper | `/obituary` | Question-driven AI draft. |

Phase 2 features (notifications hub, benefits checker, document vault, family
collaboration, estate settlement) are intentionally **not** built. They show
as "coming soon" on the dashboard.

---

## Stack

- **Next.js 16** (app router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres + auth + storage)
- **Anthropic Claude** (`claude-sonnet-4-6`) for negotiation, price-list
  parsing, obituary drafting
- **Stripe** for the advocate fee (flat $49, only on family selecting a home we presented)
- **Resend** for outbound funeral-home email

---

## Local dev

You need Node 20+ and npm.

```bash
npm install
cp .env.example .env.local   # fill in values — see "Setup checklist" below
npm run dev                  # http://localhost:3000
```

The free tier (price lookup, prep kit, certificates calc, obituary helper) works
**without any environment variables set**. The dashboard, AI negotiation,
analyzer, and Stripe flows turn on as you add keys.

A development banner on the dashboard tells you exactly which keys are missing.

### Useful scripts

```bash
npm run dev         # next dev (Turbopack)
npm run build       # production build
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run seed:demo   # seed the demo account (see supabase/seed/README.md)
```

---

## Setup checklist (before launch)

1. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Project Settings → API: copy the URL + `anon` key into `.env.local`,
     and the `service_role` key (for the Stripe webhook).
   - SQL Editor → paste `supabase/schema.sql` → Run.
   - Storage → create a private bucket called `price-lists` (used in the
     next iteration of the analyzer for photo upload).

2. **Anthropic**
   - Create a key at [console.anthropic.com](https://console.anthropic.com/).
   - Set `ANTHROPIC_API_KEY` in `.env.local`.

3. **Resend**
   - Create an account at [resend.com](https://resend.com).
   - Verify the sending domain you'll use (e.g. `walkbeside.com`).
   - Set `RESEND_API_KEY` and (optionally) `RESEND_FROM`.
   - Until set, outbound emails log to the console — useful in dev.

4. **Stripe**
   - Use **Test mode** until you're ready to charge real cards.
   - Set `STRIPE_SECRET_KEY`.
   - After deploying, create a webhook endpoint pointed at
     `/api/stripe/webhook` listening for `checkout.session.completed` and
     paste its signing secret into `STRIPE_WEBHOOK_SECRET`.
   - Without Stripe set, the negotiation flow still completes — just
     skips the charge (a "dev mode" notice appears at the close screen).

5. **Domain**
   - Pick a `.com`. Set `NEXT_PUBLIC_APP_URL` to its HTTPS URL in production.

---

## Deploying to Vercel

1. Push this repo to GitHub:
   ```bash
   git add .
   git commit -m "initial Walk Beside build"
   gh repo create walkbeside --private --source=. --remote=origin --push
   ```
   (Or create the repo manually on github.com and `git push -u origin main`.)
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add every variable from `.env.example` in Project → Settings →
   Environment Variables.
4. Deploy. Vercel auto-detects Next.js — no extra config needed.
5. Update Supabase Auth → URL Configuration → Site URL to your Vercel
   production URL, and add it to **Redirect URLs**.

---

## Project layout

```
app/
  page.tsx                        # Screen 1
  where/page.tsx                  # Screen 2
  guidance/[scenario]/page.tsx    # Screen 3
  prices/page.tsx                 # Screen 4
  login/page.tsx                  # Screen 5
  auth/callback/route.ts          # Supabase email-confirm redirect
  auth/signout/route.ts
  negotiate/
    start/page.tsx                # Screen 6
    [id]/status/page.tsx          # Screen 7 (in-progress)
    [id]/results/page.tsx         # Screen 7 (results)
    [id]/closed/page.tsx          # Post-deal close
  dashboard/page.tsx              # Screen 8
  prep/page.tsx                   # Screen 9
  analyzer/page.tsx               # Screen 10
  certificates/page.tsx           # Screen 11
  obituary/page.tsx               # Screen 12
  api/
    negotiate/start/route.ts
    negotiate/[id]/route.ts
    negotiate/[id]/quote/route.ts
    analyze-price-list/route.ts
    obituary/route.ts
    stripe/checkout/route.ts
    stripe/webhook/route.ts
components/
  Brand.tsx, Cheatsheet.tsx, PriceTable.tsx,
  ProgressBar.tsx, SetupBanner.tsx, ui/*
lib/
  pricing-data.ts        # Brief Section 4: line items + service totals
  scenarios.ts           # Scenario routing + 5 questions + decline scripts
  content.ts             # Sister's voice; obituary prompts; cert calculator
  dashboard.ts           # Three-tasks-at-a-time logic
  claude.ts              # Anthropic SDK wrapper
  email.ts               # Resend (or dryrun in dev)
  stripe.ts              # Flat $49 advocate fee (success-only)
  env.ts                 # Centralised env access + feature flags
  negotiation/
    prompts.ts           # System/user prompts for each Claude task
    sample-homes.ts      # Placeholder funeral-home directory
  supabase/
    client.ts, server.ts, middleware.ts
middleware.ts            # Refreshes Supabase session
supabase/schema.sql      # Postgres schema (tables + RLS)
```

---

## What I deliberately didn't build (yet)

These are listed in the brief as Phase 2+ and are intentionally absent:

- Notifications hub (AI handles account notifications)
- Benefits checker (Social Security, Veterans, pension, unclaimed property)
- Document vault (secure file storage)
- Family collaboration (shared tasks across users)
- Estate settlement / probate guide
- A separate mobile app (the web is mobile-first)
- Inbound email parsing for negotiation replies — for V1, the family
  records what each home quotes them on the status page

---

## Notes for the founding team

- The pricing database (`lib/pricing-data.ts`) ships **US national
  averages**. Sarah's per-city refinements layer on top via `regionMultiplier`
  in the same file. The schema in `supabase/schema.sql` doesn't yet store
  per-city overrides — add that table when you have your second city.
- All sister-authored content lives in `lib/scenarios.ts` and `lib/content.ts`.
  These are the files she should review and refine.
- The dashboard's "three tasks at a time" rule is enforced in
  `lib/dashboard.ts`. Don't relax it.
- The "voice" rules from the brief (Section 10) are encoded in `lib/content.ts`
  and the system prompts in `lib/negotiation/prompts.ts`. Tweak them there,
  not in individual screens.

— end —
