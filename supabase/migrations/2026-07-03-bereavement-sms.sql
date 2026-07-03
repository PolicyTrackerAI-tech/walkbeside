-- SMS opt-in channel for the bereavement touchpoints (roadmap Phase 3).
-- Same content arc as the email cadence, opt-IN only, cost absorbed by
-- Honest Funeral, never the family. This population skews older — SMS
-- outperforms email here.
--
-- FOUNDER-APPLIED ONLY — run with the other pending migrations. Code
-- degrades gracefully until applied AND Twilio env vars are set AND
-- BEREAVEMENT_SMS_ENABLED=true (three independent gates).

alter table public.profiles
  add column if not exists bereavement_sms_phone text,
  add column if not exists bereavement_sms_opt_in boolean not null default false,
  add column if not exists anniversary_sms_sent text[] not null default '{}';

comment on column public.profiles.bereavement_sms_phone is
  'E.164 phone for opt-in bereavement check-in texts. Never used for anything else.';
