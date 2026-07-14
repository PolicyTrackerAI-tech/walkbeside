# Analytics & Search Console

How we measure the free-layer flywheel (metro cost pages, glossary, guides)
and the tool funnel — privacy-first, no PII, no ad trackers. This matches the
promise in [`/privacy`](../app/privacy/page.tsx): *"privacy-respecting
analytics … store city-level geography only, discarding full IP addresses."*

## What's instrumented

| Layer | Tool | Where |
| --- | --- | --- |
| Page views (all routes, incl. every metro page) | Vercel Web Analytics | `components/analytics/AnalyticsBeacon.tsx`, mounted in `app/layout.tsx` |
| Named tool events | `trackTool()` | `lib/analytics.ts` (`analyzer_completed`, `negotiate_started`, …) |
| Search ownership + sitemap | Google Search Console | `verification.google` in `app/layout.tsx` metadata; sitemap at `app/sitemap.ts` |

### Page views — the privacy guard

`<AnalyticsBeacon />` wraps Vercel's `<Analytics>` with a `beforeSend`
sanitizer (`sanitizeAnalyticsUrl` in `lib/analytics.ts`, unit-tested):

1. **All query strings are stripped** — `?ref=` referral codes, unsubscribe
   `?token=`, auth-callback `?code=`/`?next=` never reach analytics.
2. **UUID path segments collapse to `[id]`** — `/negotiate/<uuid>` groups as
   `/negotiate/[id]` instead of logging one identifying URL per case.
3. **Bearer-token path segments collapse to `[token]`** — a partner's
   `/partner/r/<report_token>` link can never be read back out of analytics.
4. A URL that can't be parsed **drops the event** rather than send raw.

Vercel Web Analytics is cookieless and discards full IPs by default; the
sanitizer is the belt-and-suspenders layer on top. Never mount the bare
`<Analytics />` again — always the beacon.

Because every route is a page view, the page-to-page funnel is read directly
from the Pages view (`/` → `/prices` → `/analyzer` → `/negotiate/start`), and
each `/funeral-costs/<metro>` page has its own row — the key SEO signal.

### Named tool events

`trackTool()` in `lib/analytics.ts` records completion-style events
(`analyzer_completed`, `decide_recommended`, `negotiate_started`, …) from
client components. Properties must be flat and non-identifying — never an
email, name, zip, or free text.

## Operating steps (founder, one-time)

1. **Vercel Web Analytics** — Vercel project → **Analytics → Enable**. That's
   the whole setup; the beacon no-ops in local dev and off-Vercel.
2. **Google Search Console** — Add property → URL prefix
   `https://honestfuneral.co` → "HTML tag" method → copy the `content` value →
   set it as `GOOGLE_SITE_VERIFICATION` in Vercel env → redeploy → click
   Verify → **Sitemaps → submit `sitemap.xml`**. Impressions/clicks/queries
   per metro page appear within a few days.

## What we deliberately do NOT do

- No Google Analytics / Meta pixel / ad trackers of any kind.
- No cookies for analytics; no cross-site identifiers.
- No per-user funnels or session replay — aggregate routes and named events
  only. A grieving family's path through this site is not a product.
