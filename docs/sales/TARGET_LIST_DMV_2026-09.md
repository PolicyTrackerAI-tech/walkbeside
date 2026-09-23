# DMV hospice target list: discovery wave 1

_Researched 2026-09-23 by web search. Utah went cold. This replaces
[`TARGET_LIST_2026-08.md`](TARGET_LIST_2026-08.md) as the live list.
Companion to [`OUTREACH_SEQUENCE.md`](OUTREACH_SEQUENCE.md) and
[`DISCOVERY_SCRIPT.md`](DISCOVERY_SCRIPT.md). Names come from public pages
and go stale, so verify titles on the call. **CMS data (census/ADC, CAHPS
stars, ownership chains) could not be pulled in this pass** (data.cms.gov
was blocked by the research environment's network policy). §5 gives the
re-pull, including a one-line query against the CMS hospice table the app
already imports._

## 1. How the DMV differs from Utah (and why it's better)

- **Nonprofits dominate the core metro.** Maryland controls hospice supply
  by certificate of need, county by county (COMAR 10.24.13). Montgomery and
  Prince George's therefore have a short, stable list of established
  hospices, mostly nonprofit and mission-driven. That fits "neutral,
  conflict-free, free to families" well.
- **The roster is frozen.** CMS's nationwide temporary moratorium on new
  hospice Medicare enrollments (effective 2026-05-13, noted in the Utah
  list) holds here too. Every name is an incumbent feeling
  program-integrity pressure, the climate in which a clean bereavement
  benefit reads as a "we're the good guys" purchase.
- **The legal launch order shapes pilot order.** DC and Maryland are clean
  (with the selection redesign). Virginia families get the education layer
  and at-need support from day one, but **pre-death home outreach stays off
  in Virginia until counsel answers** (`docs/legal/DMV_LEGAL_OVERVIEW.md`).
  So pilot #1 is ideally a hospice whose families are mostly in **Maryland
  or DC**.
- **The national hospice organizations are local.** NPHI (the nonprofit
  hospice network, 70+ members) is in DC. The National Alliance for Care at
  Home (NHPCO and NAHC merged) is in Alexandria. CHAP, the accreditor, has
  a DC-area regulatory lawyer on its board (see the counsel shortlist).
  These are reach channels no Salt Lake founder had.

## 2. Tier 1: first outreaches (pilot ICP: independent or regional, mission-driven, MD/DC-heavy)

| Hospice | Base / footprint | Ownership | Named buyer (verify) | Contact (verify) | Legal lane | Angle |
|---|---|---|---|---|---|---|
| **Montgomery Hospice & Prince George's Hospice** | Rockville; Montgomery + Prince George's; Casey House inpatient | Nonprofit | **Dr. Lee-Anne West, CEO** (appointed 2026 after serving as interim from January; previously associate CMO / SVP clinical operations at Capital Caring) | montgomeryhospice.org (leadership page) | **MD only: clean** | New CEO building her program. A differentiating family benefit for year one, and her families are all in the cleanest lane. **Start here.** |
| **JSSA Hospice** (Jewish Social Service Agency) | Rockville; Montgomery + Northern Virginia | Nonprofit, 100+ yrs, CHAP | Hospice director / bereavement lead (ask) | Northern Virginia line (703) 896-7900; jssa.org/services/hospice | MD clean; VA families get education + at-need | **13-month bereavement program** with social workers and rabbis. Jewish burial happens fast, so at-need price clarity in the first 24 hours is the pain. Our faith content is ready (`docs/FAITH_REVIEW_FINDINGS.md`). |
| **Hospice of the Chesapeake** | Pasadena HQ; Prince George's office (Largo); Anne Arundel, Calvert, Charles, PG | Largest **independent** nonprofit hospice in Maryland (500+ patients/day), Joint Commission | Bereavement / grief-care lead (ask); Calvert team won a CAHPS Honor Elite award | hospicechesapeake.org | **MD only: clean** | Already runs "grief care" as a service line. Larger than the Utah ICP (enterprise-sized census, independent governance). Pitch a PG-office pilot. |
| **Holy Cross Home Care and Hospice** | Silver Spring; Montgomery, PG, Howard | Health-system owned (Holy Cross Health / Trinity Health), CHAP; the first Medicare-certified hospice in Montgomery County | Hospice administrator (ask) | holycrosshealth.org (hospice services) | **MD only: clean** | Catholic system with Catholic funeral customs. System procurement is slower, so treat as late Tier 1 / Tier 2. |
| **Goodwin Hospice** | Northern Virginia (10 regions); part of Goodwin Living (senior living, Alexandria / Falls Church) | Nonprofit, CHAP, NPHI member | **Beth Klint, Executive Director**; Nana Sarpong, Administrator | goodwinhospice.org | **VA: education + at-need only until counsel** | Senior-living parent gives a built-in family population. NPHI member (a door to the network). Pitch now, pilot after the Virginia answer, or pilot with pre-death outreach off. |

## 3. Tier 3: enterprise and chains (park; reference only)

- **Capital Caring Health**: the largest nonprofit hospice in the
  Mid-Atlantic, about 2,000 patients a day, serving DC, suburban Maryland,
  and Northern Virginia. HQ Falls Church; DC office 5225 Wisconsin Ave NW.
  Its own content marketing ranks DMV hospices on family experience, so it
  competes on exactly what we sell. **Not a first pilot** (size,
  procurement, all three jurisdictions at once). A strategic conversation
  once one pilot has proof. Montgomery Hospice's CEO is a Capital Caring
  alumna, which is useful context and a possible later intro.
- **Chains:** VITAS (Virginia and DC), Amedisys, Heartland (Fairfax), Ennoble
  Care (for-profit), and Caregivers Home Health & Hospice (Northern Virginia
  for-profit, local). Chains are an enterprise play, not a pilot.
- **Outside the DMV service market** (`lib/service-markets.ts`): Gilchrist
  (Baltimore), Frederick Health Hospice (Frederick, zip3 217), Hospice of
  the Panhandle (WV).

## 4. Channels (relationships, not deals)

| Organization | Where | Why |
|---|---|---|
| **NPHI**, National Partnership for Healthcare and Hospice Innovation | 601 Massachusetts Ave NW, Suite 520, DC | 70+ nonprofit community hospices nationwide. Mission: help nonprofits thrive "in an increasingly profit-driven landscape." Our neutrality story is their story. A member-benefit or endorsement conversation is the single biggest reach lever in the market. **Any arrangement needs the AKS review; no per-referral anything.** |
| **National Alliance for Care at Home** (the NHPCO + NAHC merger) | 1731 King St., Suite 100, Alexandria, VA | The national trade association. Conferences and publications, not a buyer. |
| **Hospice & Palliative Care Network of Maryland** | Sparks, MD (hnmd.org) | State association with a "find local care" roster. Ask every "no" for an intro here. |
| **Virginia Association for Hospices & Palliative Care** | Richmond | State association. Park until the Virginia preneed answer. |
| **CHAP** (accreditor) | — | Several Tier 1 targets are CHAP-accredited. Speak its quality language in the pitch. |
| **FCA of Maryland & Environs; Memorial Society of Northern Virginia** | Montgomery Co.; Arlington (703) 271-9270 | Mission allies on the **data** side (price surveys). Call openly, as allies, the way the plan called FCA of Utah. |

## 5. Before any outreach: the checks that aren't done yet

1. **Pull the complete DMV roster from CMS.** If Migration A and
   `npm run import:hospices` have run, one query in the Supabase SQL editor
   returns the whole market:
   ```sql
   select ccn, name, city, state, zip, ownership
   from public.hospices
   where left(zip, 3) in ('200','202','203','204','205','206','207','208','209',
                          '201','220','221','222','223')
   order by state, ownership, name;
   ```
   (The zip3 list is the DMV service market in `lib/service-markets.ts`.)
2. **Size and quality:** CMS "Medicare Post-Acute Care Utilization –
   Hospice by Provider" (ADC = total service days ÷ days in year) and CAHPS
   stars (dataset `gxki-hrr8`). Same method as the Utah list's re-pull
   section.
3. **Integrity screen (never pitch):** for every Tier 1 name, search DOJ
   (justice.gov, D. Md. / E.D. Va. / D.D.C. U.S. Attorney releases) and the
   OIG exclusion list for FCA settlements or exclusions. **This screen has
   not been run for the DMV names above.** The Utah list's "Summit Hospice"
   rule applies: a recent FCA settlement means skip.
4. **Conflicts:** give the lead law firm this list before its scoping call
   (see `docs/COUNSEL_SHORTLIST_DMV_2026-09.md`).
