# DC funeral-home roster (draft, from web search)

_Compiled 2026-09-24 to speed up the DC price-list harvest (hard deadline
**10/16**, [`EXECUTION_PLAN_DMV_2026-09.md`](../EXECUTION_PLAN_DMV_2026-09.md)).
It extends the five starter links in
[`GPL_WORKLIST_DMV_2026-09.md`](GPL_WORKLIST_DMV_2026-09.md). Built by web
search only: this environment's network policy blocks the homes' own sites,
so **no row has been opened or verified.** Every address, phone number and
link is a lead to confirm, not a fact._

## How to use it

1. Work top to bottom. Rows with a **direct price-list link** are one click.
2. For each home, record the **effective date printed inside the document**
   and the **establishment license number** (worklist rules 2 and 3).
   Provenance is `posted` when the list is on the home's own site.
3. Where a home has a website but no posted list, that's a gap under DC's
   posting rule. Ask politely, and don't report it (worklist, "Why DC
   first").
4. Before vetting any home, confirm its license with DLCP (Board of Funeral
   Directors; see the worklist). The DC Attorney General counted **38
   establishments** in 2017. This roster finds **21 likely operating**, so
   the DLCP list closes the gap.
5. Import-ready rows: now part of the DMV-wide file [`supabase/seed/dmv-homes.draft.csv`](../../supabase/seed/dmv-homes.draft.csv) (see [`DMV_HOMES_ROSTER_2026-09.md`](DMV_HOMES_ROSTER_2026-09.md)).
   Emails are blank on purpose (a home without an email imports but can
   never be contacted until you add a confirmed one in `/admin/vetting`).

## The roster

Legend: 🔗 direct price-list link found · 📄 site found, list not yet
located · ☎ no site found (request by phone) · ⚠ something to resolve
first.

| # | Home | Address (as found) | Phone | Site / price list | Notes |
|---|---|---|---|---|---|
| 1 | McGuire Funeral Service, Inc. | 7400 Georgia Ave NW, 20012 | (202) 882-6600 | 🔗 mcguire-services.com/general-price-list | |
| 2 | Stewart Funeral Home | 4001 Benning Rd NE, 20019 | (202) 399-3600 | 🔗 stewartfuneralhome.com/our-services/general-price-list | |
| 3 | Henry S. Washington & Sons Co., Inc. | 4925 Nannie Helen Burroughs Ave NE, 20019 | (202) 398-6700 | 🔗 washingtonandsonsfuneralhome.com/general-price-list | |
| 4 | Robinson Funeral Home | 1313 6th St NW, 20001 | (202) 387-5984 | 🔗 robinsonfuneralhomedc.com/general-price-list | |
| 5 | John T. Rhines Funeral Home | ⚠ sources conflict: 3005 12th St NE (20017) is the most common | (202) 529-4300 (on the price list) | 🔗 **2026 price list:** s3.amazonaws.com/CFSV2/fileuploads/4502/RhinesGPL2026.pdf; also johntrhinesfuneralhome.com/release-forms | Hosted by the home's site vendor, so provenance is `posted`. |
| 6 | Joseph Gawler's Sons, LLC | 5130 Wisconsin Ave NW, 20016 | (202) 966-6400 | 🔗 Dignity Memorial download: dignitymemorial.com/dfsmedia/042808e1630c49a48950d5077d6556eb/36705-source/options/download/2216-gpl-general-price-list | SCI / Dignity Memorial. ⚠ A search snippet showed an effective date of **May 27, 2020**, so check the date inside and ask for the current list if it's stale. |
| 7 | DeVol Funeral Home | 2222 Wisconsin Ave NW, 20007 | (202) 333-6680 | 📄 dignitymemorial.com/funeral-homes/district-of-columbia/washington/devol-funeral-home/3897 | SCI / Dignity Memorial. The price-list download is on the location page. |
| 8 | Marshall-March Funeral Homes | 4217 9th St NW, 20011 | (202) 723-1250 | 📄 marshallmarchfh.com | Also has Maryland and Virginia locations. A directory quoted prices, but never use a directory's prices (rule 5). |
| 9 | Ronald Taylor II Funeral Home | 1722 N Capitol St NW, 20002 | (not captured) | 📄 taylorsfuneralhome.com | |
| 10 | W.H. Bacon Funeral Home, Inc. | 3447 (or 3451) 14th St NW, 20010 | (202) 332-3352 | 📄 whbacon.com | ⚠ baconfuneralhome.com also appeared in search; confirm which is theirs. |
| 11 | R.N. Horton's Funeral Home | 600 Kennedy St NW, 20011 | (202) 829-9000 | 📄 rnhortonco.com | |
| 12 | Pinckney-Spangler Funeral Home | 524 8th St NE, 20002 | (202) 544-7720 | 📄 pinckney-spanglerfuneralhomedc.com | |
| 13 | Pope Funeral Home (Washington Chapel) | 2617 Pennsylvania Ave SE, 20020 | (202) 583-5400 | ☎ | Also has a Maryland location. |
| 14 | D.L. McLaughlin Funeral Services | 2518 Pennsylvania Ave SE, 20020 | (202) 889-7111 | 📄 dlmclaughlinfuneralservices.com | The site says to call for the price list. |
| 15 | Snead Funeral Home and Cremation Service | 5732 Georgia Ave NW, 20011 | (202) 726-4400 | 📄 sneadfuneralhome.com | |
| 16 | Hackett's Funeral Chapel | 814 Upshur St NW, 20011 | (202) 829-0243 | 📄 hackettsfuneralchapel.com | |
| 17 | Hunt Funeral Home (Paradise Mortuary) | 908 Kennedy St NW, 20011 | (202) 636-3612 | 📄 huntfuneralhome.net | |
| 18 | Johnson & Jenkins Funeral Home | 716 Kennedy St NW, 20011 | (202) 882-8800 | 📄 johnsonandjenkinsfh.com | A directory's copy of their list is dated **Jan 5, 2014**. Get the current one. |
| 19 | Torchinsky Hebrew Funeral Home | 254 Carroll St NW, 20012 | (202) 541-1001 | 📄 torchinsky.com | Jewish funeral home. A directory says the price list is posted on their site. |
| 20 | Rollins Funeral Home, Inc. | ⚠ listings conflict: 4339 Hunt Pl NE (20019) or 5732 Georgia Ave NW (Snead's address) | (202) 399-2388 | ☎ | Confirm it still operates, and where. |
| 21 | J.B. Jenkins Funeral Home, Inc. | ⚠ BBB lists 716 Kennedy St NW (Johnson & Jenkins' address); the site now says Hyattsville, MD | (202) 882-8800 | 📄 jbjenkinsfuneralhome.com/services/pricing-and-policies | Probably the same firm as #18, now in Maryland. If so, it moves to the Prince George's list. |

**Added 2026-09-24 (second pass), all in the import file:** Capitol
Mortuary Inc. (1425 Maryland Ave NE), Kendal Wade Funeral Home and
Cremations (814 Upshur St NW, the same address as Hackett's; confirm whether
it succeeded Hackett's), Dunn & Sons Funeral Service (5635 Eads St NE), and
Whitney's Life Centers (1515 Kenilworth Ave NE). Also added, but **found
only in directory listings** (confirm with DLCP; some may be closed):
Blount (4804 Georgia Ave NW), Young (719 Kennedy St NW), Universal Mortuary
(411 Kennedy St NW), Harrison & Son (3449 14th St NW), Echelon Avant Garde
(3457 14th St NW), Watson's (3435 14th St NW), Columbia Heights
(3605 14th St NW), Tri-State (912 3rd St NW), Hall Brothers
(621 Florida Ave NW), and B.K. Henry (420 H St NE). Third pass: Genesis
Cremation & Funeral Services (5732 Georgia Ave NW, Snead's address; confirm
whether it operates from Snead's establishment). DC total: 34 of ~38.

**Probably closed or not a DC establishment (confirm with DLCP, then drop):**

- **Frazier Funeral Home**, 389 Rhode Island Ave NW. Founded 1917. Howard
  University News Service writes about it as a *former* funeral home.
- **Jarvis Funeral Home.** The Anacostia Community Museum holds its
  archives. The only address found is the museum's.
- **Bianchi Funeral Service.** Appears only as a directory entry at
  Hackett's address. Probably a listing artifact.
- **B.K. Henry Funeral Chapel** (H St NE, near Union Station). Mentioned
  once. No site or phone found.

**Not homes (rule 6: brokers are never imported):** DFS Memorials and
Legacy Cremation Services (both already on the outreach denylist). **Check
first:** Carewell Cremations, Atlantic Cremation Society and Washington
Cremation Centers all advertise DC direct cremation. Import one only if it
holds a DC establishment license itself, not if it brokers to one.

**Maryland, found along the way (for the Montgomery/Prince George's pass):**
Hodges-Edwards Funeral Home, 3910 Silver Hill Rd, Suitland 20746,
(301) 899-0687, hefuneralh.com · Snowden Funeral Home, 246 N Washington
St, Rockville 20850, (301) 762-2500, snowdencares.com.

## Sources (search results, 2026-09-24)

- DC Attorney General, [Consumer Alert: Funeral Home Prices Survey](https://oag.dc.gov/consumer-protection/shopping-funeral-services/consumer-alert-funeral-home-prices-survey)
  and the [2017 survey PDF](https://oag.dc.gov/sites/default/files/2018-02/Funeral-Home-Price-List.pdf) (roster baseline)
- DLCP, [Board of Funeral Directors](https://dlcp.dc.gov/page/board-funeral-directors) and [Funeral Establishment](https://dlcp.dc.gov/node/1618826) licensing
- Each home's own site as listed above. Addresses and phone numbers came from
  the search results' snippets of those sites and of Yelp, BBB, Legacy and
  Checkbook listings. Treat all of them as leads.
