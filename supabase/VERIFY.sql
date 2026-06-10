-- Post-BOOTSTRAP sanity check. Run in the prod Supabase SQL editor AFTER
-- pasting BOOTSTRAP.sql, and paste the output back. Read-only.
--
-- Expect ~11 tables, every one with rls_enabled = true and policies >= 1
-- (planning_signups has 1 insert-only policy; funeral_homes has 1 read policy
-- + column grants; the rest are owner-scoped).

select
  c.relname                                                            as table_name,
  c.relrowsecurity                                                     as rls_enabled,
  (select count(*) from pg_policies p
     where p.schemaname = 'public' and p.tablename = c.relname)        as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- Confirm the funeral_homes vetting + internal columns exist:
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'funeral_homes'
  and column_name in ('vetted','vetted_at','vetted_by','notes','email','active')
order by column_name;
