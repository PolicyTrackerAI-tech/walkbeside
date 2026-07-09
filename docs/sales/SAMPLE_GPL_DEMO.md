# Staged demo price list — paste-ready for the analyzer / coordinator quote check

**Entirely fictional.** "Canyon Rim Memorial Chapel" does not exist — never use a
real funeral home's name in a demo; a "likely overcharge" flag shown against a
real business in a sales call is a defamation risk (guardrail #4). The numbers
below are calibrated against `lib/pricing-data.ts` fair ranges (Salt Lake City
multiplier 0.95) so the analyzer reliably flags the planted problems in front
of a prospect.

**How to use:** copy everything inside the block below to your clipboard before
the call (the demo checklist step). Paste into `/analyzer` (Beat 2) or the
coordinator quote check at `/partner/r/[token]/check` (Beat 2b).

**Verified result** (run through the real analyzer, zip 84101): quoted
**$18,975** against a fair estimate of **≈$10,000** — **≈$8,970 flagged as
potential overcharge**, 10 line items in the predatory range, the
protective-sealer pitch flagged, embalming-authorization and cash-advance
disclosure checks raised, and the buy-the-casket-elsewhere right surfaced.
Do not add a "total" line to the paste — the parser reads it as a 19th item
and double-counts the quote.

---

```
Canyon Rim Memorial Chapel — General Price List
Salt Lake City, UT — prices effective January 2026

Basic services of funeral director and staff ........ $3,495
Embalming ........................................... $1,395
Other preparation of the body (cosmetology, dressing) $595
Refrigeration / sheltering of remains (per day) ..... $495
Use of facilities and staff for viewing ............. $895
Use of facilities and staff for funeral ceremony .... $1,095
Transfer of remains to funeral home ................. $595
Hearse .............................................. $525
Utility vehicle ..................................... $295
Casket — "Homestead" solid oak ...................... $4,895
Protective sealer casket upgrade .................... $795
Outside casket handling fee (caskets not purchased
  from Canyon Rim Memorial Chapel) .................. $495
Burial vault — "Guardian" protective ................ $2,395
Register book ....................................... $125
Acknowledgement cards (box of 25) ................... $95
Memorial folders / programs (100) ................... $395
Obituary placement service .......................... $350
Death certificate handling (per certified copy) ..... $45
```

---

## What the analyzer should catch (talk track)

| Planted problem | Why it flags | What to say |
|---|---|---|
| Basic services fee $3,495 | Fair range ≈ $1,425–$2,375 (SLC-adjusted) | "The one fee no one can decline — and it's a thousand dollars above the local range." |
| Embalming $1,395 | Fair ≈ $665–$855; also often not required at all | "Utah doesn't require embalming for a prompt burial — this is $1,400 for something they may not need." |
| Refrigeration $495/day | Fair ≈ $33–$81 | "Six to ten times the going rate, per day." |
| **Outside casket handling fee $495** | The FTC Funeral Rule prohibits fees for using a casket bought elsewhere; the analyzer surfaces the family's buy-elsewhere right and prices the line as predatory | "Federal law says they can't charge you for bringing your own casket — and here it is on the list anyway." |
| Protective sealer upgrade $795 | Classic decline item — sealing does nothing the family is told it does | "The FTC requires homes to say no casket preserves a body. This is the upsell in its natural habitat." |
| "Guardian" vault $2,395 | Fair ≈ $665–$1,900; liner often sufficient | "Cemeteries usually require a liner, not this." |

Fair-range items are planted too (transfer, hearse, cards run high-normal) so
the result reads as an honest mixed report, not a hit piece — the analyzer
under-claims by design ("suspicious" not "violation" when unprovable), and
that restraint is itself a selling point with a compliance-minded ED.

**Total effect (verified through the live analyzer):** quoted $18,975 against
a fair estimate of ≈$10,000 — a visceral, defensible gap, with the analyzer's
deliberate under-claiming ("suspicious," not "violation," when unprovable)
doing the credibility work in front of a compliance-minded ED.
