# Asking a funeral home for its price list (founder-sent)

_For homes whose General Price List isn't posted online
(`gpl_status` = `site_check` or `no_site_known` in
[`supabase/seed/dmv-tracker.csv`](../../supabase/seed/dmv-tracker.csv)).
A list that arrives this way has provenance `requested`._

## The rules for these requests

- **Say who you are and why. Never pose as a family.** No pretexting is
  worklist rule 1. The DC Attorney General and Consumers' Checkbook use
  secret shoppers; we don't.
- **Send it from your own address, by hand, one home at a time.** This is
  not product outreach, and it never goes through the app's send paths
  (`OUTREACH_LIVE` stays off). One request plus at most one follow-up. A
  "no" is a no.
- **Don't imply anything we don't do.** We publish area-wide ranges, only
  once at least five homes in an area are included, and we don't rate,
  rank or recommend homes.
- **Virginia homes are fine to ask.** Collecting a price list isn't
  arranging anything. Only pre-death outreach on a family's behalf waits on
  counsel.
- Log each send in the tracker's `request_sent` column (the date), and set
  `gpl_status` to `requested`.

## The email

**Subject:** Your General Price List, for Honest Funeral's fair-price data

> Hello,
>
> I'm [Your name], founder of Honest Funeral (honestfuneral.co). We're a
> free consumer resource that shows families in the Washington area what
> funeral goods and services typically cost, so they can shop with
> confidence. We take no money from funeral homes or insurers, and we don't
> rate, rank or recommend any home.
>
> Would you send me your current General Price List? A PDF or a link is
> perfect. We use price lists to build area-wide price ranges, which we
> publish only once at least five homes in an area are included. Your
> home's name isn't attached to the published ranges.
>
> If you'd rather not, no problem at all. Just reply "no thanks" and I won't
> ask again.
>
> Thank you,
> [Your name]
> Honest Funeral · [phone] · honestfuneral.co
> [Postal address]

**DC variant.** DC asks homes to post their price lists on any website they
keep, so for a DC home with a site add one line, kept gentle:

> If your price list is already on your website, a link is all I need. I
> couldn't find it.

## One follow-up (after 7 days, only if there's no reply)

> Hello again. A quick follow-up on my note about your General Price List
> for Honest Funeral's area price ranges. If it's easier, a link or a photo
> of the printed list works too. If you'd rather not, I won't write again.

## By phone (for homes with no site or email)

> "Hi, this is [Your name] from Honest Funeral. We're a free consumer site
> that publishes funeral price ranges for the Washington area. We take no
> money from funeral homes. Could you email me your current General Price
> List? My address is [email]. Thank you."

Whatever a home says about its prices on the phone is **not** a price list.
Only record a list you actually receive.

## When a list comes back

1. Save the file. Note its **printed effective date** and the
   **establishment license number** on it.
2. Hand it to Claude (or review it yourself) to become a
   `supabase/seed/gpl/dmv/<home>-<year>.json` record, reviewed line by line
   like Rhines' ([`DMV_HOMES_ROSTER_2026-09.md`](DMV_HOMES_ROSTER_2026-09.md),
   "Adding more price lists").
3. `npm run ingest:gpl -- supabase/seed/gpl/dmv --apply`, then mark the
   tracker row `reviewed` / `gpl_loaded`.
