-- RLS / privilege hardening (2026-06-09). Idempotent; safe to re-run.
--
-- Findings from a pre-launch security pass on funeral_homes and
-- negotiation_messages:
--
-- 1. funeral_homes is publicly readable (RLS policy "funeral_homes_public_read"
--    = `for select using (active = true)`) so the directory works. But RLS is
--    ROW-level — it cannot hide COLUMNS. The public API roles (anon,
--    authenticated) hold a table-wide SELECT grant, so internal-only fields
--    (notes — sister/vetting commentary; vetted_by; vetted_at) were readable by
--    anyone holding the public anon key, not just the app.
--
--    Fix: drop the table-wide SELECT grant and re-grant SELECT only on the
--    non-internal columns. The directory read (lib/negotiation/directory.ts)
--    needs only name/email/zip; admin tools read the full row via the
--    service-role key, which BYPASSES these grants and RLS entirely. So nothing
--    the app does breaks, but a raw anon/authenticated query can no longer read
--    notes/vetted_by/vetted_at.
--
-- 2. funeral_homes and negotiation_messages intentionally have NO delete (and
--    no public write) policy. Under RLS, "no policy" = DENY — which is the
--    correct, safe default here:
--      - funeral_homes is a service-role/admin-managed directory (imports,
--        vetting, opt-out, bounce handling all run with the service-role key).
--      - negotiation_messages is a shared family<->home conversation/audit log;
--        neither side should be able to delete from the other's thread.
--    We deliberately DO NOT add permissive DELETE policies — that would be a
--    regression. This file documents the decision and re-asserts the intended
--    policies idempotently.

-- ---------------------------------------------------------------------------
-- 1. funeral_homes: column-level read hardening
-- ---------------------------------------------------------------------------
revoke select on public.funeral_homes from anon;
revoke select on public.funeral_homes from authenticated;

grant select (
  id, name, email, phone, address, city, state, zip,
  lat, lng, google_rating, google_review_count,
  active, vetted, created_at, updated_at
) on public.funeral_homes to anon;

grant select (
  id, name, email, phone, address, city, state, zip,
  lat, lng, google_rating, google_review_count,
  active, vetted, created_at, updated_at
) on public.funeral_homes to authenticated;

-- Re-assert the row policy (idempotent). Still no insert/update/delete policy
-- → those commands are denied for anon + authenticated; service role bypasses.
alter table public.funeral_homes enable row level security;
drop policy if exists "funeral_homes_public_read" on public.funeral_homes;
create policy "funeral_homes_public_read" on public.funeral_homes
  for select using (active = true);

-- ---------------------------------------------------------------------------
-- 2. negotiation_messages: confirm deny-by-default for update/delete
-- ---------------------------------------------------------------------------
-- The owner read + owner-send (insert) policies live in
-- 2026-05-21-coordinator-messages.sql. We intentionally add no update/delete
-- policy: the thread is an audit log. Re-assert RLS is on (idempotent).
alter table public.negotiation_messages enable row level security;
