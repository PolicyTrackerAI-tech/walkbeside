-- Adds itemized quote storage on outreach rows so the side-by-side
-- /negotiate/[id]/compare page can show line-item-level comparisons
-- (and color-code each cell vs the fair-price range) instead of only
-- the all-in total quote_cents the V2 schema captures today.
--
-- Until we build a quote-entry form, sister enters this manually in the
-- Supabase Table Editor as JSON of the form:
--
--   [
--     { "lineItemId": "basic-services", "name": "Basic services fee", "cents": 240000 },
--     { "lineItemId": "casket-wood",    "name": "Casket — wood",      "cents": 180000 },
--     ...
--   ]
--
-- `lineItemId` should match an `id` from lib/pricing-data.ts when possible —
-- the comparison view uses that to classify each cell as good / fair / high /
-- predatory. Items that don't match a known id still display, just without
-- a fair-range badge.

alter table public.negotiation_outreach
  add column if not exists quote_items jsonb;

comment on column public.negotiation_outreach.quote_items is
  'Optional itemized quote, shape: [{lineItemId, name, cents}]. Powers /negotiate/[id]/compare cell-level fair-price ratings.';
