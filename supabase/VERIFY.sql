-- Post-BOOTSTRAP sanity check. Run in the prod Supabase SQL editor AFTER
-- pasting BOOTSTRAP.sql, and paste the output back. Read-only.
--
-- Expect 19 tables, every one with rls_enabled = true. Most have
-- policies >= 1 (planning_signups has 1 insert-only policy; funeral_homes has
-- 1 read policy + column grants; the rest are owner-scoped) — EXCEPT the
-- deny-all service-role-only tables, which correctly show policies = 0:
-- partners, partner_codes, partner_members, partner_leads, api_cost_events,
-- regional_benchmarks, hospices.

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

-- Confirm the 2026-07-13 portal-identity migration landed (expect 8 rows):
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'partner_members'    and column_name in ('invited_email','role','user_id','deactivated_at'))
    or (table_name = 'partners'        and column_name in ('brand_accent','notification_email'))
    or (table_name = 'price_list_analyses' and column_name in ('partner_id','extraction_method'))
  )
order by table_name, column_name;

-- Confirm the 2026-07-16 inbound-ai-parse migration landed (expect 5 rows):
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'negotiation_messages'
  and column_name in (
    'ai_quote_cents', 'ai_quote_items', 'ai_parse_confidence',
    'ai_parsed_at', 'ai_confirmed_at'
  )
order by column_name;

-- Confirm the 2026-07-17 data-tiers migration landed (expect 12 rows):
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'regional_benchmarks' and column_name in (
      'scope', 'scope_value', 'line_item_id', 'fair_low_cents',
      'fair_high_cents', 'tier', 'n_data_points', 'version', 'effective_at'
    ))
    or (table_name = 'funeral_homes' and column_name in ('website', 'gpl_url', 'last_verified_at'))
  )
order by table_name, column_name;

-- Confirm the 2026-07-20 hospices-consent migration landed (expect 7 rows):
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'hospices' and column_name in (
      'ccn', 'name', 'city', 'state', 'zip', 'ownership'
    ))
    or (table_name = 'price_list_analyses' and column_name = 'contributed')
  )
order by table_name, column_name;
