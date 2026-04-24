-- Funerose demo account seed — fictional Johnson-family case.
-- For founders who prefer to run seeds from the Supabase SQL editor
-- rather than the Node script (scripts/seed-demo.mjs). Both produce
-- the same final state; either is fine.
--
-- Usage:
--   1. Create the auth user first — this SQL file does NOT touch
--      auth.users because the Supabase SQL editor doesn't run with
--      the password-hashing helpers that the admin API uses.
--      Easiest path: run `node scripts/seed-demo.mjs` instead, which
--      handles the auth user for you.
--   2. If you must use SQL only, create the user in the Supabase
--      Auth Users UI (email demo@funerose.com, password of your
--      choice, confirm email manually), then copy the resulting
--      UUID into :demo_user_id below.
--   3. Set your launch-metro ZIP into :demo_zip below.
--
-- Then run the whole file with psql variables:
--   psql "postgresql://..." \
--     -v demo_user_id="'00000000-0000-0000-0000-000000000000'" \
--     -v demo_zip="'94110'" \
--     -f supabase/seed/demo-account.sql

\set demo_user_id '00000000-0000-0000-0000-000000000000'  -- EDIT ME
\set demo_zip '94110'                                      -- EDIT ME to launch metro

begin;

-- Idempotent: wipe prior demo data for this user first.
delete from public.negotiation_outreach
  where negotiation_id in (
    select id from public.negotiations where user_id = :demo_user_id
  );
delete from public.negotiations      where user_id = :demo_user_id;
delete from public.obituaries        where user_id = :demo_user_id;
delete from public.cert_trackers     where user_id = :demo_user_id;
delete from public.price_list_analyses where user_id = :demo_user_id;
delete from public.tasks             where user_id = :demo_user_id;

-- Profile
insert into public.profiles (id, display_name, zip, scenario, deceased_name)
values (:demo_user_id, 'Sarah Johnson', :demo_zip, 'hospital', 'Robert Johnson')
on conflict (id) do update
  set display_name   = excluded.display_name,
      zip            = excluded.zip,
      scenario       = excluded.scenario,
      deceased_name  = excluded.deceased_name,
      updated_at     = now();

-- Negotiation (3 homes contacted, 2 replied, 1 pending)
with n as (
  insert into public.negotiations (
    user_id, zip, service_type, target_home_name,
    target_home_estimate_cents, status, best_quote_cents, savings_cents
  ) values (
    :demo_user_id, :demo_zip, 'traditional-burial', 'Johnson Memorial',
    750000, 'received', 580000, 170000
  )
  returning id
)
insert into public.negotiation_outreach (
  negotiation_id, home_name, home_email, quote_cents, status, notes
)
select n.id, x.home_name, x.home_email, x.quote_cents, x.status, x.notes
from n, (values
  ('Johnson Memorial',
   'arrangements@johnsonmemorial.example',
   750000, 'replied',
   'Basic services $2,400. Casket $3,800. Viewing $900. Limo $400.'),
  ('Oakview Funeral Services',
   'info@oakview.example',
   580000, 'replied',
   'Basic services $1,950. Casket $2,600. Viewing $750. No limo. Most transparent breakdown received.'),
  ('Memorial Gardens',
   'contact@memorialgardens.example',
   null, 'sent',
   'Initial outreach sent — awaiting reply.')
) as x(home_name, home_email, quote_cents, status, notes);

-- Obituary draft (partial, with [TO VERIFY] tokens so reviewers see the safety rails)
insert into public.obituaries (user_id, inputs, draft)
values (
  :demo_user_id,
  jsonb_build_object(
    'full_name', 'Robert Johnson',
    'dates', '[TO VERIFY]',
    'spouse', 'Sarah Johnson',
    'children', '[TO VERIFY]',
    'occupation', '[TO VERIFY]',
    'service_details', '[TO VERIFY]'
  ),
  'Robert Johnson passed away on [TO VERIFY]. He was a devoted husband to Sarah, and a lifelong [TO VERIFY]. Services will be held at [TO VERIFY].'
);

-- Tasks: 3 completed, 2 open
insert into public.tasks (user_id, phase, title, status, position, completed_at)
values
  (:demo_user_id, 'first-steps', 'Look up fair funeral prices for your zip code',          'done', 0, now()),
  (:demo_user_id, 'first-steps', 'Call hospice and get pronouncement paperwork started',   'done', 1, now()),
  (:demo_user_id, 'funeral',     'Authorize Funerose to contact funeral homes on our behalf', 'done', 2, now());

insert into public.tasks (user_id, phase, title, href, status, position)
values
  (:demo_user_id, 'funeral', 'Review quotes and pick a home', null, 'open', 3),
  (:demo_user_id, 'service', 'Finish the obituary draft',     '/obituary', 'open', 4);

commit;
