-- share_links lockdown: close the anon bulk-enumeration hole.
-- Audit A8 (2026-08-18). Idempotent; safe to re-run.
--
-- THE HOLE: the original policy set (2026-05-05-margaret-share-links.sql)
-- granted `select ... to anon using (expires_at > now())` with NO id
-- predicate. RLS is row-level, so that policy lets anyone holding the public
-- anon key read EVERY non-expired share payload in bulk
-- (`GET /rest/v1/share_links?select=payload`), not just the one whose UUID
-- they hold. Those payloads carry family case data: names, ZIP, target home,
-- quoted price, free-text notes, date of death, eulogy drafts
-- (lib/share-keys.ts). The table's own comment claimed "the URL token IS the
-- auth" — true of the app route (which filters .eq("id", id)), false at the
-- DB layer, where nothing required the filter.
--
-- THE FIX: mirror household_links — RLS enabled, ZERO anon/authenticated
-- policies, all access via the service-role key behind the app routes
-- (app/api/share/create + app/api/share/[id], which now use a service client
-- and read strictly by id + expiry). The unguessable UUID stays the
-- capability; it just stops being enumerable.
--
-- ORDERING: deploy the route change (service-role) BEFORE applying this
-- migration. The routes work either way; this migration is what actually
-- closes the hole. Until it is applied in prod, the anon policies remain and
-- the exposure is live for any non-expired row.

alter table public.share_links enable row level security;

drop policy if exists "anyone can create share links" on public.share_links;
drop policy if exists "anyone can read non-expired share links" on public.share_links;
drop policy if exists "anyone can update opened_at" on public.share_links;

-- Belt and braces: revoke the table privileges the anon/authenticated roles
-- received by default so a future re-added policy can't silently re-expose
-- payloads. The service role bypasses both RLS and these grants.
revoke all on public.share_links from anon;
revoke all on public.share_links from authenticated;

comment on table public.share_links is
  'Anonymous "Save for my daughter" handoff links. Service-role only (RLS on, no anon policies) after audit A8 2026-08-18 — the UUID is the capability but is no longer bulk-enumerable. Auto-expire after 7 days.';
