# Security posture

What's enforced today, and the known upgrade paths. Lives next to the code so
it stays honest.

## HTTP security headers (`next.config.ts`)
Applied to every response via `headers()`:
- **Strict-Transport-Security** `max-age=31536000; includeSubDomains; preload` — force HTTPS.
- **X-Frame-Options DENY** + CSP `frame-ancestors 'none'` — no clickjacking.
- **X-Content-Type-Options nosniff**, **Referrer-Policy** `strict-origin-when-cross-origin`.
- **Permissions-Policy** — camera/mic/geolocation/payment all denied.
- **Content-Security-Policy-Report-Only** — a conservative policy (`default-src 'self'`, etc.)
  sent in **report-only** first. It does NOT block yet — it surfaces violations in
  the browser console so we can tighten `script-src` (Next injects inline hydration
  scripts) before flipping to an enforced `Content-Security-Policy`. **Launch follow-up:**
  watch report-only for ~1–2 weeks, then enforce (may require script nonces).

## Rate limiting (`lib/rate-limit.ts`, wired in `proxy.ts`)
Best-effort token-bucket on the hottest POST endpoints (negotiate/start,
stripe/checkout, share/create, planning/signup, the AI routes). Keyed by client
IP, returns **429 + Retry-After**.

⚠️ **Per-instance, not a hard global quota.** State is an in-process Map, so on
Vercel serverless/edge it resets per instance and a distributed flood can exceed
the limit. It stops a single hammering client; it is not abuse-proof.

**Production upgrade:** swap the store for Upstash Redis behind the same
interface — `npm i @upstash/ratelimit @upstash/redis`, set `UPSTASH_REDIS_REST_URL`
+ `UPSTASH_REDIS_REST_TOKEN`, and back `rateLimit()` with `Ratelimit.slidingWindow`.
No call-site changes needed.

## Request body limits (`lib/http-guards.ts`)
`readLimitedJson` / `readLimitedText` read the body **once** with a per-route KB
cap (Content-Length pre-check + actual-length check), returning **413** when
exceeded. Applied to every public/unauthenticated and webhook POST route so a
giant payload can't exhaust memory. Field-level bounds remain enforced by Zod.

## CSRF (`validateOrigin` in `lib/http-guards.ts`)
Defense-in-depth on state-changing POSTs (stripe/checkout, negotiate/choose,
auth/signout): the request's Origin/Referer must match our own origin or
`NEXT_PUBLIC_APP_URL`, else **403**. Missing both headers is allowed (some legit
same-origin clients omit them); the Supabase session + RLS remain the primary
gate. Supabase auth cookies are `SameSite=Lax`, which is the first line.

## PII in logs (`lib/observability.ts`)
Never log raw PII. Use `maskEmail()` (`j***@gmail.com`) and `hashId()` (stable
short hash for correlation) — applied across the pay→send + inbound/bounce paths.
Email bodies and raw webhook payloads are not logged.

## Admin access
`/admin/*` requires a logged-in Supabase session on the `ADMIN_EMAILS` allowlist
(`lib/admin-auth.ts`). No URL-secret. The env validator hard-requires
`ADMIN_EMAILS` when `OUTREACH_LIVE=true`.

## Session policy
Supabase defaults (`@supabase/ssr`): **access token (JWT) = 1 hour**, auto-refreshed
on each request by the `proxy.ts` → `updateSession()` middleware; **session cookie
maxAge = 400 days**, renewed on refresh. Cookies are `SameSite=Lax`, `path=/`.
Families stay signed in across visits; tokens rotate hourly. To force shorter
sessions, lower the JWT expiry in the Supabase dashboard (Auth → Settings).

## RLS
Every user table has RLS enabled with owner-scoped policies; writes to the
shared `funeral_homes` directory + `negotiation_messages` are deny-by-default
(service-role only). Internal `funeral_homes` columns (`notes`, `vetted_by`,
`vetted_at`) are revoked from the public API roles — see
`supabase/migrations/2026-06-09-rls-hardening.sql`.
