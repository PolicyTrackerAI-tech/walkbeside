# Sourcing the launch funeral homes (gate 5 — the #1 data gate)

Until real, vetted Utah homes exist in `funeral_homes`, the outreach flow falls
back to placeholders and nothing real can be contacted. This is how to build the
list. The importer + vetting tooling is already done — you're producing the CSV.

## Scope for launch

- **Start with one metro**, not the whole state: **Salt Lake County + Utah
  County** (Provo/Orem) is the densest, highest-volume wedge.
- Target **~30–60 homes** for that area. Enough that most families get 3–4 real
  options; small enough to vet by hand.
- Expand to Davis/Weber and then statewide *after* the first real deals work.

## Where to pull from (in priority order)

1. **Utah DOPL** (Division of Occupational & Professional Licensing) — the
   authoritative list of **licensed funeral establishments**. Use it to confirm
   a home is a real, currently-licensed business (not a lead-gen front). License
   lookup: dopl.utah.gov.
2. **Google Maps / Google Business** — for `phone`, `address`, `google_rating`,
   `google_review_count`, and to find the firm's website.
3. **The home's own website** — for the best **contact email**. Prefer a
   role/office address (`office@`, `arrangements@`, `info@`) over a named
   person's inbox. This is the field that makes or breaks outreach.
4. **NFDA member directory** (nfda.org) — cross-reference / fill gaps.

> Only collect **public business contact info**. No personal/consumer data, no
> scraping of anything behind a login. Skip generic SaaS/aggregator domains
> (consolidatedfuneralservices.com, runcfs.com, etc.) — those are also guarded
> by the code denylist (`lib/negotiation/denylist.ts`).

## What goes in each column

Fill `supabase/seed/utah-homes.template.csv` (header already matches the
importer). Columns:

| Column | Notes |
|--------|-------|
| `name` | Official business name |
| `email` | **Role address preferred.** Blank is OK — it imports but can't be contacted until you add one in vetting |
| `phone` | Any format; the importer normalizes to 10 digits |
| `address`, `city` | Street + city |
| `state` | `UT` (the importer rejects non-UT unless you pass `--state=ALL`) |
| `zip` | 5 digits (required) |
| `google_rating` | 0.0–5.0 (optional) |
| `google_review_count` | integer (optional) |
| `notes` | Internal: independent vs SCI/corporate, "pushy on caskets," duplicate-of, anything the reviewer should know |

## What to verify BEFORE approving a home (vetting)

A home is only contacted when it's **vetted=true AND active=true AND has an
email**. Before you approve one in `/admin/vetting`:

1. **It's a real, currently-operating, licensed establishment** (cross-check DOPL).
2. **The email is current and correct** — ideally confirmed on their website.
   A wrong email = a wasted send + a deliverability ding.
3. **It's in the launch area** (right zip).
4. **It's not a duplicate** (chains list multiple "locations" of one firm) and
   not an aggregator/lead-gen listing.
5. Note **independent vs corporate (SCI/Dignity)** — useful context for what to
   expect on price.

## The two-stage flow (already built)

1. **Import** — everything lands `active=true, vetted=false`; nothing is
   contactable yet:
   ```bash
   npm run import:homes -- ./supabase/seed/utah-homes.csv --dry-run   # check first
   npm run import:homes -- ./supabase/seed/utah-homes.csv             # apply
   ```
   Idempotent: dedupes by email then name+zip, so you can re-run as you add rows.
   Never sets `vetted` — that's always a human step.
2. **Vet** — `/admin/vetting` (signed in as an `ADMIN_EMAILS` admin): approve the
   real ones, fix/add emails, reject duplicates and wrong listings.
3. **Verify** — `npm run smoke:check -- --zip=84101` shows exactly which homes a
   given zip would contact, in directory order.

## Don't commit the real CSV

Save your working file as `supabase/seed/utah-homes.csv` (gitignored-by-intent —
keep real contact data + any notes out of git; the committed `.template.csv` and
`.example.csv` are enough). Treat it like the data asset it is.
