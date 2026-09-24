# DMV funeral-home roster and first price list: ready to load

_Compiled 2026-09-24. The founder's data lane in
[`GPL_WORKLIST_DMV_2026-09.md`](GPL_WORKLIST_DMV_2026-09.md) starts from
this. The DC detail, with price-list links and conflicts, is in
[`DC_ROSTER_2026-09.md`](DC_ROSTER_2026-09.md)._

## What's here

| File | What | Count |
|---|---|---|
| [`supabase/seed/dmv-homes.draft.csv`](../../supabase/seed/dmv-homes.draft.csv) | Funeral homes across the DC-metro service market (`lib/service-markets.ts`), in the importer's format | **112 homes**: 33 DC, 49 MD, 30 VA |
| [`supabase/seed/gpl/dmv/john-t-rhines-2026.json`](../../supabase/seed/gpl/dmv/john-t-rhines-2026.json) | John T. Rhines Funeral Home (DC), GPL effective 2026-02-01, reviewed line by line | 34 lines, **15 benchmark observations** |
| [`supabase/seed/dmv-tracker.csv`](../../supabase/seed/dmv-tracker.csv) | The scoreboard: one row per home, with its benchmark area, price-list status and vetting checkboxes | 112 rows: 1 reviewed, 12 with a list link, 60 with a site to check, 39 with no site known |
| [`GPL_REQUEST_EMAIL.md`](GPL_REQUEST_EMAIL.md) | The founder-sent request (email, one follow-up, phone) for homes that don't post their list | |

By area: DC 33 (of the ~38 the DC Attorney General counted) · Prince George's and Calvert 25 · Montgomery 16 · Loudoun,
Prince William and Fauquier 11 · Fairfax 10 · Southern Maryland (Charles,
St. Mary's) 8 · Alexandria 6 · Arlington 3. Chains are marked in each row's
notes (13 SCI / Dignity Memorial, 2 Carriage Services). Ten DC rows
were found only in directory listings and say so; confirm those with DLCP
first, since some may be closed or may share a building with another home.

**What this is not.** Every home row is a **web-search lead**, not a
verified record. This environment could not open the homes' own sites, so
no address, phone or website has been checked at the source. Emails are
blank on purpose: a home without an email imports but can never be
contacted until you add a confirmed one in `/admin/vetting`. 27 rows carry a
specific "confirm" flag in their notes (shared addresses, conflicting
listings, or a second location).

## Load it (two commands, about five minutes)

From a checkout with `.env.local` holding `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`:

```bash
# 1. Homes: check first, then import. Every row lands active and vetted=false,
#    so nothing is contactable until you approve it in /admin/vetting.
npm run import:homes -- supabase/seed/dmv-homes.draft.csv --dry-run
npm run import:homes -- supabase/seed/dmv-homes.draft.csv

# 2. Price lists: dry run by default; --apply writes. Rows are attributed to
#    the first ADMIN_EMAILS address (or pass --user-email=...).
npm run ingest:gpl -- supabase/seed/gpl/dmv
npm run ingest:gpl -- supabase/seed/gpl/dmv --apply
```

Run the homes import first: the price-list step stamps `gpl_url` on the
matching home row (Rhines at 20017), and skips the stamp with a warning if
the home isn't there yet.

**Re-running either command is safe.** The homes import only fills in what
the file knows: a blank cell never overwrites (an email you add during
vetting survives the next import), and it never re-activates a home the
bounce/complaint webhook turned off. The price-list step skips a document
it already saved.

**Nothing publishes.** Benchmarks reach the public site only after you
promote a metro at n≥5 on `/admin/benchmarks` (guardrail #4). With one DC
price list loaded, DC is at n=1.

## Then vet (the only step that makes a home contactable)

For each home in `/admin/vetting`, the checklist
([`../UTAH_HOMES_SOURCING.md`](../UTAH_HOMES_SOURCING.md), still valid):

1. **Licensed and operating.** DC: DLCP (Board of Funeral Directors).
   Maryland: State Board of Morticians & Funeral Directors. Virginia: the DHP
   licensee file (ordered in week one).
2. **A current role email**, confirmed on the home's own site. It goes in
   during vetting.
3. **In the market.** Every zip in this file is already inside the DC-metro
   service market (the build checks it).
4. **Not a duplicate, not a broker.** Chains list several locations; each
   licensed location is its own row.
5. **Resolve the row's "confirm" note**, if it has one.

Virginia homes can be vetted now. Before a death, outreach to them stays
held by the pre-death gate (`lib/negotiation/pre-death-gate.ts`) until
counsel clears it.

## How the Rhines price list was reviewed

The source is the home's own posted GPL (hosted by its website vendor and
linked from its site). Its effective date, February 1, 2026, is the one
printed inside the document. The review notes in the file record every
judgment call. The main ones:

- **One observation per benchmark.** The pipeline counts every matched
  line, so a home with two direct-cremation lines would count twice. The
  FTC-comparable line (with alternative container) carries it; the others
  stay unmatched.
- **Packages stay out of single-item benchmarks.** For example, "Immediate
  Burial/Graveside Service" is a package, not a graveside fee.
- **The reviewed mapping must agree with the product's own matcher**
  (`scripts/__tests__/gpl-batch.test.ts`), except where a reviewer overrides
  it in writing (`matcherOverride`). This review turned up seven matcher
  bugs on real DC wording, now fixed in `lib/negotiation/price-list-parse.ts`.

## Adding more price lists

1. Get the GPL text (PDF → text), with its printed effective date and
   source URL.
2. Write `supabase/seed/gpl/dmv/<home>-<year>.json` in the Rhines file's
   shape: provenance `posted` / `fca_hosted` / `requested` /
   `family_consented`, and one benchmark per line, at most once per
   document.
3. `npx vitest run scripts/__tests__/gpl-batch.test.ts` shows any line where
   your mapping and the matcher disagree. Fix one or the other, or override
   in writing.
4. `npm run ingest:gpl -- supabase/seed/gpl/dmv --apply`.

The one-at-a-time alternative, `/admin/ingest-gpl`, writes exactly the same
rows.

## The tracker

[`supabase/seed/dmv-tracker.csv`](../../supabase/seed/dmv-tracker.csv) is
the working scoreboard. Open it in any spreadsheet. `gpl_status` moves
`no_site_known` / `site_check` → `link_found` or `requested` → `reviewed`
(or `none_available` after a "no"). `benchmark_area` is the label the
benchmark pipeline groups by, so counting `reviewed` rows per area shows
how close each area is to the n≥5 promotion bar. CI keeps the tracker in
step with the roster (one row per home) and with the committed price lists
(each one marked `reviewed` with its printed effective date).
