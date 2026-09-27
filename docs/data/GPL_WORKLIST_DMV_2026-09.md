# GPL Collection Worklist: DC first, then Montgomery / Prince George's, then Northern Virginia

_Compiled 2026-09-23 by web search, replacing the Utah worklist
([`GPL_WORKLIST_2026-08.md`](GPL_WORKLIST_2026-08.md), parked when Utah went
cold). This is the operating document for the data lane: get real price
lists and a vetted directory for the DC-metro service market
(`lib/service-markets.ts`) before the first pilot family activates._

## The rules (unchanged law for this lane)

1. **No pretexting, ever.** Collect openly and identify yourself. Consumers'
   Checkbook and the DC Attorney General used undercover shoppers. We don't,
   and we never ingest data gathered that way.
2. **Key every record to the establishment license number** on the price
   list, not the URL. Chains (SCI/Dignity, for example) publish one page for
   several licensed locations.
3. **Rank by the effective date printed inside the document**, never by
   search rank. For example, a Manassas home's posted list sits under a
   `/2022/10/` upload path, so check the date inside.
4. **Record provenance** per price list: `posted` (the home's own site),
   `fca_hosted` (an FCA survey copy; note the survey date), `requested`
   (sent to us on an open request), or `family_consented` (uploaded through
   the product).
5. **Never trust third-party directory prices.** Parting, Funeralocity,
   Ever Loved, and us-funerals are reference only. Their domains are now in
   the outreach domain denylist (`lib/negotiation/denylist.ts`).
6. **Brokers are not homes.** DFS Memorials and Legacy Cremation Services
   sell through partner homes. Never import one as a funeral home. Virginia
   treats unlicensed third parties "seeking to contract for funeral services"
   as a Board concern (`docs/legal/VA_CLEARANCE_DRAFT.md` §4.3).

## Why DC first (collection math)

| Area | Establishments (verify via roster) | Online price lists | Notes |
|---|---|---|---|
| **DC** | **~38** (the DC Attorney General surveyed "the 38 funeral homes in the District" in 2017; a 2026 directory lists 37) | **Mandatory.** DC's Consumer Bill of Rights for Funeral Home Establishments requires every home to post all its price lists on any website it maintains | The fastest verified dataset in the market. Where a home has a website but no posted list, that is a gap under DC rules: ask politely, don't report. |
| **Montgomery + Prince George's** | ~40–60 *(estimate; verify)* | Voluntary; some post | FCAME's 2023 survey covers Maryland and DC for direct cremation and immediate burial |
| **Northern Virginia core** (Arlington, Alexandria, Fairfax, Loudoun, Prince William) | ~50–70 *(estimate; verify)* | Voluntary; some post | Home **outreach** for Virginia waits on counsel's preneed answer. **Collecting** price lists does not. |

**DC's benchmark path needs no code.** All five DC zip3s (200, 202–205)
share one `zip-regions` metro label, "Washington DC". A `metro`-scope
promotion on `/admin/benchmarks` at n≥5 therefore covers the whole
District. The suburbs are split across several labels ("Prince George's
County", "Bethesda/Rockville", "Silver Spring/Takoma Park", "Fairfax County",
"Arlington", and so on). **Decision deferred on purpose:** promote them per
label as n≥5 is reached. If pooling the suburbs into one "DC metro"
benchmark is ever wanted, that is a methodology decision (a `market` scope
means a migration plus a pipeline change), not a default.

## Start here (day one, DC)

1. **Harvest the DC price-list pages found so far** (provenance `posted`;
   capture effective dates):

   | Home | Price list |
   |---|---|
   | McGuire Funeral Service | https://www.mcguire-services.com/general-price-list |
   | Henry S. Washington & Sons | https://www.washingtonandsonsfuneralhome.com/general-price-list |
   | Robinson Funeral Home | https://www.robinsonfuneralhomedc.com/general-price-list |
   | John T. Rhines Funeral Home | https://www.johntrhinesfuneralhome.com/release-forms (price list + release forms) |
   | Stewart Funeral Home | https://www.stewartfuneralhome.com/our-services/general-price-list |

2. **Build the DC roster.** _Started 2026-09-24: 21 likely-operating DC homes with addresses, phones, sites, and five more direct price-list links (incl. Rhines' 2026 list) are in [`DC_ROSTER_2026-09.md`](DC_ROSTER_2026-09.md), with import-ready rows in `supabase/seed/dmv-homes.draft.csv` (100 DMV homes, [`DMV_HOMES_ROSTER_2026-09.md`](DMV_HOMES_ROSTER_2026-09.md)). All unverified web-search leads; DLCP closes the gap to ~38._ Start from the DC Attorney General's 2017
   survey (https://oag.dc.gov/sites/default/files/2018-02/Funeral-Home-Price-List.pdf).
   Use it as a **roster and historical baseline only**: its prices are 2017
   aggregates, never current benchmarks. Reconcile against DLCP license
   verification (dlcp.dc.gov, Board of Funeral Directors). Every DC home
   with a website should have its lists posted, so go down the roster
   site by site.
3. **Pull the FCAME 2023 Mortuary Price Survey**
   (https://mdfunerals.org/wp-content/uploads/2024/01/Price-Survey-2023-final-1.2.24.pdf).
   It covers Maryland, Delaware, and DC establishments for the least
   expensive options (direct cremation, immediate burial), gathered from
   price lists or by phone. Ingest as `fca_hosted` with the survey date.
   It is the cheapest-options anchor, not a full price list.
4. **Founder call (relationship, not scrape):** Funeral Consumers Alliance
   of Maryland & Environs (mdfunerals.org) and the Memorial Society of
   Northern Virginia (Arlington, (703) 271-9270). Introduce the company
   openly, as allies. They may hold fuller price-list copies and invite
   corrections, as FCA of Utah did.

## Montgomery / Prince George's (week two)

| Home | Area | What we found |
|---|---|---|
| Francis J. Collins Funeral Home | Silver Spring | Pricing page: https://www.collinsfuneralhome.com/service-options/service-pricing |
| Robert A. Pumphrey Funeral Home | Bethesda / Rockville | Site pumphreyfuneralhome.com; online price list not confirmed |
| Buchanan Funeral Services | Clinton / Upper Marlboro | buchananfunerals.com; price list not confirmed |
| Hedgman Funeral Service | Clinton | hedgmanfuneralservice.com; price list not confirmed |

**Roster:** Maryland Board license verification
(mdbnc.health.maryland.gov/mortverification) for spot checks. Ask the Board,
(410) 764-4792, for an establishment list (it was renamed the Board of
Morticians, Funeral Directors, and Crematories on 2026-07-01).

## Northern Virginia (collect now; outreach waits for counsel)

| Home | Area | What we found |
|---|---|---|
| Fairfax Memorial Funeral Home | Fairfax | https://www.fairfaxmemorialfuneralhome.com/funeral/general-price-list (plus an older PDF, `FMGPL81522.pdf`; rank by the date inside) |
| Baker-Post Funeral Home | Manassas | https://www.bakerpostfh.com/funeral-pricing |
| Manassas / Olde Towne Funeral Home | Manassas | https://manassasfuneralhome.com/wp-content/uploads/2022/10/General-Pricelist.pdf (**likely stale; check the date**) |
| Murphy Funeral Homes (SCI / Dignity Memorial) | Arlington | Costs page on dignitymemorial.com (location 1143). One chain page may cover several licenses. |
| Demaine (Alexandria / Springfield), Everly-Wheatley (Alexandria), Money & King (Vienna), Cunningham Turch (Annandale), Adams Green (Herndon), Pierce (Manassas), Miller and Mountcastle (Woodbridge) | — | Price-list status unknown; check each site, then send an open request |

**Roster: order the Virginia DHP bulk licensee download** (DHP Subscriber
Services: $100 for the first file plus $20 per additional 1,000 records; CSV
or Excel). Filter the Funeral Board's establishment records (main and branch)
to the Northern Virginia zip3s (201, 220–223). This is the analog of the
Utah DOPL roster order, and the authoritative vetting source.

## Importing and vetting (the pipeline, now DMV-aware)

1. Fill `supabase/seed/dmv-homes.template.csv`. One file carries all three
   jurisdictions: the importer now defaults to `--state=DC,MD,VA`.
2. `npm run import:homes -- supabase/seed/<file>.csv --dry-run`, then run it
   for real. Every row lands `vetted=false`.
3. Vet each home in `/admin/vetting`, using the checklist in
   [`../UTAH_HOMES_SOURCING.md`](../UTAH_HOMES_SOURCING.md) (still valid):
   licensed, current role email, in-market zip, not a duplicate, not a
   broker or aggregator.
4. Matching now stays inside the family's market. A Silver Spring family is
   matched across DC, Maryland, and Virginia homes in the DC metro, never to
   Baltimore or Richmond, and never to Salt Lake. Within each tier the pick
   is a fair shuffled draw (`lib/negotiation/directory.ts`).
5. Ingest each harvested price list through `/admin/ingest-gpl` with its
   provenance. Promote benchmarks at n≥5 on `/admin/benchmarks`, starting
   with DC at `metro` = "Washington DC".
