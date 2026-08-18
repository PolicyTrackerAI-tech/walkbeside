# A1 — Safety, guardrails & live-config probe — VERDICT

**Run:** 2026-07-27 · main @ `c47a6a0` · branch `claude/audit-a1-safety`
**Method:** live anon-key RLS probe against prod (`bhadjvukoyvfbzbcqunp.supabase.co`),
direct code review of every gate, code fixes for the safe items, `typecheck`/`lint`/
`build`/`test` green (639 tests), browser render check of the two rewritten pages.

## Headline

The two biggest structural fears are **disproven live**: RLS is airtight and the
outreach kill-switch holds at all three home-directed send sites. The real exposure was
**config that fails open, not code that leaks** — the admin gate. Five safe fixes shipped
this session; **three items need you** (all Vercel-dashboard, ~5 minutes total).

## What I verified CLEAN (no action)

- **RLS / anon-key exposure — CLEAN.** Probed the public anon key against all 19 tables.
  Every owner-scoped and deny-all table returned **0 rows** — including `hospices` (~6,852
  rows) and `regional_benchmarks`, which proves *denial*, not emptiness. `funeral_homes`
  public read works (active rows) but selecting non-granted columns (`notes`, `vetted_by`,
  `gpl_url`) returns **401 permission denied** — the vetting-notes column grants hold.
  Anon `INSERT` into `negotiations` → **401 RLS violation**. `share_links` and
  `planning_signups` blanket anon select → 0 rows. *The privacy story is structurally sound.*
- **Outreach kill-switch — CLEAN.** All three home-directed `sendEmail` sites gate on
  `OUTREACH_LIVE` (`send.ts:31`, `notify-chosen-home.ts:93`, `messages/route.ts:117`). I
  enumerated all 18 `sendEmail` call sites; the only other one that could have been a home
  send (`notify-family-of-reply.ts`) is family-directed (`to: familyEmail`, `hello@`) and
  correctly ungated. *No ungated path to a funeral home exists today.* (The "single send
  path" phrasing in CLAUDE.md is still imprecise — 3 sites, not 1 — so a *future* 4th site
  could forget the gate. That's the A10 architecture-test item, not a live hole.)

## What I FIXED this session (in this PR)

| ID | Sev | Fix |
|---|---|---|
| A1-01 | P0 | **Admin gate fails closed in production.** `isAdminEmail` returned `true` for everyone when `ADMIN_EMAILS` was unset. Now: permissive in dev only; in production an unset allowlist denies everyone. Added a boot warning and a test pinning both branches. ⚠️ **See "Needs you" #1 — set `ADMIN_EMAILS` before merging or the team loses `/admin` access.** |
| A1-02 | P0 | **`/funeral-home-opt-out` no longer mutates on GET.** Was `update({active:false})` during page render — a mail-scanner prefetch of the tokenized link would deactivate a home before a human clicked. Now a confirm-button POST (server action); the GET only validates the token and renders. Safe to change now (OUTREACH_LIVE never on → no live links). |
| A1-03 | P1 | **`/preferences/[id]` unsubscribe no longer mutates on GET.** Converted the (un/re)subscribe link to a POST server action. *(Downgraded from P0: the anniversary email embeds the bare `/preferences/[id]` URL, not `?action=unsubscribe`, so the email link itself never silently unsubscribed — but the GET-mutation anti-pattern was real and is now closed.)* |
| A1-04 | P1 | **`/api/share/create` rate-limited** (5/hr/IP) + **resume hydration allowlisted.** The anon endpoint had no limit (100KB payloads); `ResumeClient` wrote *every* payload key to sessionStorage. Extracted the one `SHARE_KEYS` allowlist to `lib/share-keys.ts` (it had already drifted between two copies), and `/resume/[id]` now hydrates only allowlisted keys — closing the session-injection vector. |
| A1-06 | P1 | **Guessable unsubscribe secret removed.** All four token sites used `UNSUBSCRIBE_SECRET ?? "fallback-please-set"` (a literal in the source → forgeable tokens). New `lib/unsubscribe-secret.ts` prefers the env var, else derives a high-entropy secret from the service-role key (always present in prod); the plain literal is dev-only. Unforgeable in prod even before you set the dedicated var. |

## Needs you (Vercel dashboard — I cannot read or set prod env)

1. **⚠️ Set `ADMIN_EMAILS` in Vercel prod BEFORE merging this PR.** The fix makes an unset
   allowlist *lock the team out* of `/admin` in production (a safe failure) instead of
   admitting everyone (the hole). If it's already set, nothing changes for you and the hole
   was already closed — this is defense-in-depth. If it's unset, set it now:
   `ADMIN_EMAILS=ryan@honestfuneral.co` (comma-separate any others). Confirm you can still
   reach `/admin/outcomes` after deploy.
2. **Confirm `UNSUBSCRIBE_SECRET` is set in prod** (recommended). The code now derives a
   safe fallback, but a dedicated secret is cleaner and keeps tokens stable across any
   future service-role-key rotation.
3. **Confirm the four cron flags + `CRON_SECRET` in prod.** `CRON_SECRET` gates all four
   crons (verified in code); the enable flags (`ANNIVERSARY_EMAILS_ENABLED`,
   `NURTURE_ENABLED`, `OUTREACH_NOTIFICATIONS_ENABLED`, `PARTNER_DIGEST_ENABLED`) should
   all be off/unset. One glance at the Vercel env list settles items 1–3 together.

## QUEUED (not fixed — needs a decision or larger change)

- **A1-05 — `/og` brand-abuse (P2).** The endpoint renders arbitrary query text under the
  Honest Funeral brand mark; anyone can mint an official-looking card. The real fix is to
  **sign OG URLs** (HMAC via a `ogImageUrl()` helper) and reject unsigned requests — that
  touches every page's metadata, so it needs your nod on the approach. Alternatives:
  allowlist known titles (brittle) or accept it (it's brand-abuse, not a data breach).
  Recommend signing; slot into A6 (SEO/metadata day) since it touches all OG call sites.
- **A1-08 — webhook hardening (P3).** Postmark inbound uses a non-timing-safe Basic-Auth
  compare; the Resend webhook doesn't check timestamp freshness (replay re-deactivates an
  already-inactive home — negligible). Both low-severity; batch into A10.
- **Rate limits are per-instance** (in-process Map, resets on deploy, multiplies by
  serverless instance count). Documented and accepted; the Upstash upgrade path is in
  `docs/SECURITY.md`. The only real spend brake on anonymous AI endpoints — revisit if
  traffic grows (A10).

## Files touched

`lib/admin.ts` · `lib/env.ts` · `lib/__tests__/admin.test.ts` · `lib/share-keys.ts` (new)
· `lib/unsubscribe-secret.ts` (new) · `lib/nurture-email.ts` · `lib/negotiation/email-body.ts`
· `app/api/share/create/route.ts` · `app/resume/[id]/ResumeClient.tsx` · `app/family/Family.tsx`
· `components/dashboard/DashboardActions.tsx` · `app/funeral-home-opt-out/page.tsx`
· `app/preferences/[id]/page.tsx`
