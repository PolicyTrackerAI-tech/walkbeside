# Staged demo price list — paste-ready for the analyzer / coordinator quote check

**Entirely fictional.** "Larkspur Hill Memorial Chapel" does not exist (checked
2026-09-23: no funeral business by that name). Never use a real funeral home's
name in a demo; a "likely overcharge" flag shown against a real business in a
sales call is a defamation risk (guardrail #4). The numbers are the retired
Salt Lake demo's scaled to the DC cost index (`lib/zip-regions.ts` 1.20 vs.
0.95), so the analyzer flags the same planted problems at DC prices. (The Utah
version is in git history; Utah went cold 2026-09-23.)

**How to use:** copy everything inside the block below to your clipboard before
the call (the demo checklist step). Paste into `/analyzer` (Beat 2) or the
coordinator quote check at `/partner/r/[token]/check` (Beat 2b), with a DC zip
(20001).

**Verified result (2026-09-23, local build, zip 20001, fallback extraction,
not Claude):** quoted **$23,685** against a fair estimate of **≈$10,594**, so
**≈$13,091 flagged as potential overcharge**. 11 line items land in the
predatory range. Eight checks fire, led by one likely FTC violation: the
outside casket handling fee, flagged on its own row and first in the
family's "what we'd do" list. The other seven: basic services fee above
market, the protective-sealer pitch, embalming-authorization disclosure,
cash-advance disclosure, buy-the-casket-elsewhere right, dressing and
embalming both billed, and the predatory-range summary. 14 of 18 lines are
benchmarked. The sealer upgrade and the handling fee are left unpriced on
purpose, because neither is a casket, along with the utility vehicle and
death-certificate handling. (Re-verified 2026-09-23 after the matcher fix.
Before it, both casket add-ons were judged against a casket's price range
and read "good.") **Re-run once through production (Claude extraction)
before the first demo.** Do not add a "total" line to the paste; the parser
reads it as an extra item and double-counts the quote.

(This run also surfaced and fixed a real analyzer bug. The FTC's standard
wording "Basic services of funeral director and staff" did not match the
basic-services benchmark, so the one fee no family can decline was left out
of the savings total on every price list that uses the standard wording.
Fixed in `lib/negotiation/price-list-parse.ts`, 2026-09-23.)

---

```
Larkspur Hill Memorial Chapel — General Price List
Washington, DC — prices effective January 2026

Basic services of funeral director and staff ........ $4,395
Embalming ........................................... $1,750
Other preparation of the body (cosmetology, dressing) $750
Refrigeration / sheltering of remains (per day) ..... $625
Use of facilities and staff for viewing ............. $1,125
Use of facilities and staff for funeral ceremony .... $1,395
Transfer of remains to funeral home ................. $750
Hearse .............................................. $665
Utility vehicle ..................................... $375
Casket — "Homestead" solid oak ...................... $5,995
Protective sealer casket upgrade .................... $995
Outside casket handling fee (casket bought elsewhere) $625
Burial vault — "Guardian" protective ................ $2,995
Register book ....................................... $150
Acknowledgement cards (box of 25) ................... $120
Memorial folders / programs (100) ................... $495
Obituary placement service .......................... $425
Death certificate handling (per certified copy) ..... $55
```

---

## What the analyzer should catch (talk track)

| Planted problem | Why it flags | What to say |
|---|---|---|
| Basic services fee $4,395 | Fair range ≈ $1,800–$3,000 (DC-adjusted) | "The one fee no one can decline, and it's well over a thousand dollars above the local range." |
| Embalming $1,750 | Fair ≈ $840–$1,080; also often not required at all | "No state here requires embalming for a prompt burial, and the DC Attorney General's own 2017 survey of every District home found embalming averaged $750." |
| Refrigeration $625/day | Fair ≈ $35–$85 | "Seven to eighteen times the going rate, per day." |
| **Outside casket handling fee $625** | The FTC Funeral Rule prohibits fees for using a casket bought elsewhere (16 CFR §453.4(b)(1)(ii)); the analyzer flags this row as a likely FTC violation and hands the family a script to get it removed. It is not priced against a casket range | "Federal law says they can't charge you for bringing your own casket — and here it is on the list anyway." |
| Protective sealer upgrade $995 | Classic decline item — sealing does nothing the family is told it does | "The FTC requires homes to say no casket preserves a body. This is the upsell in its natural habitat." |
| "Guardian" vault $2,995 | Fair ≈ $840–$1,440 (DC-adjusted); liner often sufficient | "Cemeteries usually require a liner, not this." |

Fair-range items are planted too (transfer, hearse, cards run high-normal) so
the result reads as an honest mixed report, not a hit piece — the analyzer
under-claims by design ("suspicious" not "violation" when unprovable), and
that restraint is itself a selling point with a compliance-minded ED.

**Total effect (verified locally 2026-09-23; re-run in production before the
first demo):** quoted $23,685 against a fair estimate of ≈$10,594. That is a
visceral, defensible gap, and the analyzer's deliberate under-claiming
("suspicious," not "violation," when unprovable) does the credibility work in
front of a compliance-minded ED.
