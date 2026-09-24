# Execution Plan: the DMV restart (2026-09-23 → first payment)

_Re-plan of [`EXECUTION_PLAN_2026-08.md`](EXECUTION_PLAN_2026-08.md) after Utah
went cold and the founder is DMV-based. The objective, the guardrails, the
weekly cadence, the seven "engineered to profit" mechanisms (§5 there), and
the out-of-scope list all carry over unchanged. What changes: the market, the
legal gate, the data lane, the target list, and the dates. Owner key as
before: **F** = founder, **C** = Claude sessions, **F+C** = founder decides,
Claude drafts._

## 0. The objective (unchanged) and the honest calendar

**One hospice paying in-product.** The August plan put first payment in
December. Restarting the market on 2026-09-23 moves the realistic date: a
60-day pilot signed around mid-November reaches its week-9 Checkout ask in
mid-January. **Operative plan: first payment by 2027-02-15. Stretch: a pilot
that converts early, in December.** The plan does not pretend otherwise.

## 1. The gate question (founder decides, in writing, this week)

§18 of the business plan says: "No pilot signed by Oct 1 **after ≥20 genuine
discovery conversations** → shift lead channel to employers/EAP brokers
within 30 days." Read literally, the pivot fires only once twenty genuine
conversations have failed to produce a pilot.

- **If Utah produced 20 or more genuine conversations and no pilot:** the
  gate has fired. The pre-authorized move is the employer/EAP channel. The
  DMV is a strong employer market (federal contractors, health systems,
  universities), so the move doesn't mean leaving the metro.
- **If Utah produced fewer than 20:** the gate hasn't fired; the channel was
  simply not tested before the market changed. Then **re-date it once, in
  writing, to the DMV restart**:
  - Gate 1 → **2026-11-13**: ≥20 genuine DMV discovery conversations and
    ≥1 pilot signed, or shift the lead channel to employers within 30 days.
  - Gate 2 → **2027-02-15**: ≥1 paid conversion, or drop to the micro-fee
    lane before declaring the channel dead.

**Recommendation:** record the Utah conversation count. If it is under 20,
take the one-time re-date. That is a written decision about a market change,
not momentum arguing with a gate. Moving the gate a second time would be.
Either way, write the decision into this section.

## 2. The five workstreams (DMV)

| # | Workstream | Objective | Owner | Deadline | Serves |
|---|---|---|---|---|---|
| A | **Sell** | 20 DMV discovery conversations; 1–2 pilots signed (Maryland/DC-heavy hospice first) | F | rolling → 11/13 | Gate 1 |
| B | **Legal** | DMV counsel retained; DC + federal memos; Virginia preneed answer; product changes approved | F+C | retained by 10/3; DC+MD answers before first signature | Gates signatures and first outreach |
| C | **Data** | DC dataset complete and benchmarks promoted by 10/16; Montgomery/PG by 11/13; NoVA collected by 12/15 | F+C | 10/16 (hard) | Pilot deliverability; the Index |
| D | **Product** (capped) | Ship the counsel-approved changes list (`docs/legal/DMV_LEGAL_OVERVIEW.md` §4) before the first home outreach | C | before `OUTREACH_LIVE` | Makes outreach legal in all three jurisdictions |
| E | **Funding** | The November checkpoint re-dated with the gates | F | per §1 | The decision |

## 3. Week-by-week

**Week of Sep 21 (now)** · _Send-ready text for every item below:
[`sales/WEEK_ONE_KIT_DMV_2026-09.md`](sales/WEEK_ONE_KIT_DMV_2026-09.md)
(gate-decision text, Tier 1 integrity screen results, three personalized
first emails, setup checklist)._
- [F] Write the §1 gate decision.
- [F] Send the counsel email to the lead-firm candidates in parallel:
  [`COUNSEL_SHORTLIST_DMV_2026-09.md`](COUNSEL_SHORTLIST_DMV_2026-09.md).
  Attach the DMV packet.
- [F, 10 min] Set `OUTREACH_POSTAL_ADDRESS` in Vercel if the West Jordan
  registered-agent address no longer receives mail (a CAN-SPAM requirement;
  [`legal/DMV_OPERATING_REGISTRATIONS_DRAFT.md`](legal/DMV_OPERATING_REGISTRATIONS_DRAFT.md) §1).
- [F, 5 min] Pull the full DMV hospice roster with the SQL in
  [`sales/TARGET_LIST_DMV_2026-09.md`](sales/TARGET_LIST_DMV_2026-09.md) §5.
  Run the integrity screen (DOJ/OIG) on the Tier 1 names.
- [F] First outreaches: **Montgomery Hospice & Prince George's Hospice**
  (new CEO), **JSSA Hospice**, **Hospice of the Chesapeake**. The sequence
  is localized: [`sales/OUTREACH_SEQUENCE.md`](sales/OUTREACH_SEQUENCE.md).
- [F evenings] Start the DC price-list harvest:
  [`data/GPL_WORKLIST_DMV_2026-09.md`](data/GPL_WORKLIST_DMV_2026-09.md). DC
  mandates online price lists, so this is fast.
- [F] Order the Virginia DHP bulk licensee file (~$100).

**Week of Sep 28**
- [F] Discovery calls 1–5. Pitch order unchanged: CAHPS reputation →
  unfunded §418.64(d) mandate → staff-hours returned → free-and-neutral
  close. Ask every "no" for one intro.
- [F] Counsel scoping calls. Retain by **10/3**.
- [F] Call FCA of Maryland & Environs and the Memorial Society of Northern
  Virginia, openly, as allies.
- [F] Ask for an NPHI intro (DC-based nonprofit hospice network). This is a
  relationship, not a deal; any arrangement needs the AKS review.
- [C] Once counsel picks the authorization/agency language: draft the
  product-change PR (selection redesign, outreach wording, footer, copy
  audit). It does **not** ship before counsel approves it.

**Week of Oct 5**
- [F] Calls 6–10.
- [F evenings] DC ingest ≥50%. Vet DC homes into the directory
  (`active AND vetted`).
- [F+C] DC + federal counsel deliverables in progress. Send the Virginia
  preneed question to Virginia licensing counsel.

**Week of Oct 12**
- [F] Calls 11–15. **Tripwire: fewer than 10 DMV discoveries by 10/16 →
  escalate cadence** (Hospice & Palliative Care Network of Maryland intros,
  NPHI, CHAP-accredited lists).
- [F] **DC dataset complete; promote DC benchmarks** at `metro` =
  "Washington DC" (n≥5). DC becomes the first verified market.
  (All five DC zip3s share the label, so no code is needed.)

**Weeks of Oct 19 – Nov 9**
- [F] Calls 16–20. Chase the first pilot signature (a Maryland/DC-heavy
  hospice). **Bind E&O + cyber at the first signature**, with territory
  covering DC, Maryland, and Virginia.
- [C] Product changes shipped once counsel approves (overview §4 #1–#7),
  before any home outreach.
- [F evenings] Montgomery/PG ingest. Promote per `zip-regions` label as each
  reaches n≥5.
- **2026-11-13: Gate 1** (if re-dated per §1).

**Nov 16 – Dec 31**
- [F] Run every pilot family case by hand and instrument all of them. The
  ≥$1,500-median gate needs 10+ cases.
- [F] Week-2 cockpit conversation with the pilot ED; week-6 mid-pilot review
  in late December.
- [F evenings] Collect NoVA price lists. Virginia home outreach stays gated
  until counsel answers the preneed question.
- [F+C] **Fair-Price Index prep.** It needs ≥2 verified metros. "Washington
  DC" plus one Maryland label (for example "Bethesda/Rockville") would
  qualify **inside one market**, which Utah could not do without
  Sacramento.

**January – mid-February 2027**
- [F] Week-9 proof sheet and the monthly-Checkout ask ("the smallest yes").
- **2027-02-15: Gate 2** (if re-dated per §1).

## 4. Scoreboard (DMV reset)

| Metric | Now (9/23) | 11/13 bar | 2/15 bar |
|---|---|---|---|
| DMV outreaches sent | 0 | 30+ | — |
| DMV discovery conversations | 0 | **20** | — |
| Pilots signed | 0 | **1–2** | — |
| Paying hospices | 0 | 0 | **1+** |
| Instrumented family cases | 0 | first cases | **10+** |
| DC price lists ingested | 0 | **~38 (all)** | — |
| Verified metros | 0 | **1 (DC)** | **2+** (Index out) |
| Counsel deliverables | 0 | DC + federal + product changes approved | Virginia preneed answer |
| MRR | $0 | $0 | **$400–800+** |

## 5. What shipped for the DMV on 2026-09-23 (so the plan starts from truth)

- **Matching:** families are matched only to homes in their own market. The
  DC metro is one market across all three jurisdictions, and there is a fair
  draw when a family's area has more homes than the cap. (Before this, a DC
  family could be matched to Salt Lake City homes.)
- **Importer:** defaults to `DC,MD,VA`. A DMV CSV template is in place.
- **Pricing pages:** DMV zip labels corrected on `/funeral-homes/[zip]`
  (Hyattsville no longer shows "Bethesda/Silver Spring").
- **Outreach denylist:** now blocks directory, marketplace, and broker
  domains (it had been empty despite docs saying otherwise).
- **Analyzer:** now benchmarks the FTC's standard "Basic services of funeral
  director and staff" line. That fee had been missing from the savings total
  on every standard price list.
- **Legal package:** clearance drafts for DC, MD, and VA; the DMV overview;
  registrations/tax; the counsel packet; the counsel shortlist.
- **Sales:** DMV target list, DC demo price list (verified), localized
  sequence.
- **Data:** the DMV price-list worklist.

**Added 2026-09-24:**

- **Virginia pre-death gate, in code.** Before a death, a Virginia
  family's case contacts no home, and no family's case contacts a Virginia
  home (`lib/negotiation/pre-death-gate.ts`, tripwire-tested).
- **Pre-launch fixes.** A funeral home's reply with a PDF now lands (A8-06).
  The anonymous email endpoints are hardened (A1-07), the sign-up IP hash
  is keyed (A8-07), and expired sharing links are purged daily (A8-05).
- **Legal.** The counsel redline for every wording change, and the DC
  CPPA claims re-audit, which narrowed five overbroad claims. Both are in
  the counsel packet.
- **Data.** A 133-home DMV roster (34 DC, 61 MD, 38 VA) and the first
  reviewed DC price list, loadable in two commands
  (`docs/data/DMV_HOMES_ROSTER_2026-09.md`); a per-home tracker
  (`supabase/seed/dmv-tracker.csv`); the founder's price-list request
  email (`docs/data/GPL_REQUEST_EMAIL.md`); and a decision to make by
  ~11/1 on pooling thin areas like Arlington, with the code built and off
  (`docs/data/BENCHMARK_AREA_POOLING_DECISION.md`).
- **Sales.** The week-one kit.
