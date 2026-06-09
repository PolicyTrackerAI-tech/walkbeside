-- share_links: restrict anon/authenticated UPDATE to opened_at only.
-- Idempotent; safe to re-run.
--
-- The "anyone can update opened_at" RLS policy gates on expiry, but RLS is
-- row-level — it can't limit WHICH columns an UPDATE writes. So a holder of the
-- (unguessable) share UUID could overwrite the `payload` of a non-expired link,
-- not just stamp opened_at. Column-level privileges close that: drop the
-- table-wide UPDATE grant and re-grant UPDATE on opened_at alone.
--
-- Reads + inserts are unchanged; the service role bypasses these grants.

revoke update on public.share_links from anon;
revoke update on public.share_links from authenticated;

grant update (opened_at) on public.share_links to anon;
grant update (opened_at) on public.share_links to authenticated;

-- The existing RLS update policy (expiry-gated) still applies on top of this.
alter table public.share_links enable row level security;
