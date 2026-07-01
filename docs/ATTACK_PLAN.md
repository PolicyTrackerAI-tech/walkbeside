# Honest Funeral — The Attack Plan (PRODUCT-FIRST)

_North star: [`THE_WEDGE.md`](THE_WEDGE.md). The one thing we build: the **"is this
quote fair?" checker** — snap a photo → **overcharge $ + FTC-violation flags + "$X
above fair."** Build it to a sellable demo FAST, then sell to hospices/employers. The
heavy GTM/legal campaign (the old version of this doc) is now **Wave 5 — background**.
Grounded in the real code as of 2026-06-25; line refs are live._

## The demo we're building toward

A hospice bereavement director sets her phone on the table, opens the link we gave her,
and snaps a photo of a real funeral home's price list. In seconds the screen reads
**"You're paying $2,345 above fair"** in big type, then line-by-line — _Casket +$1,200
(buy third-party), Basic services +$400 (negotiable), Embalming +$750 — and this one's a
possible FTC violation, they can't require it_ — each with a one-tap "what to say." She
taps **share**, it emails the family a clean summary. Then we flip to her view: **"Your
families: 14 helped · $1,900 avg overcharge caught · 4 hidden fees flagged."** That
sequence — _photo → instant dollar truth → FTC flags → her cohort's proof_ — is the close.

## What already exists (don't rebuild it)

The checker is functionally built: `/analyzer` (photo → client downscale → Claude vision
OCR → analysis), `lib/pricing-data.ts` (30+ line items w/ fair ranges + regional
multiplier), the **FTC rules engine** `lib/bundling-detection/rules.ts` (10–12 Funeral-Rule
rules, already emit `ruleId` + `matchedItemId`), and `price_list_analyses` already exists
in `schema.sql` with RLS. We are **sharpening and wrapping**, not building from zero.

## ⚠️ The one landmine (read this first)

**The "$X above fair" number is not yet defensible.** `dataSourceForZip()` returns
`national-adjusted` for **every** zip — the figure is a national benchmark × a COLA
*estimate*, with **zero local GPL validation**. Demo it in a metro where the buyer knows
real prices and it can be confidently **wrong** — both a demo-killer and a guardrail
breach ("never publish a number we can't defend"). **Mitigation is on the critical path,
not optional:** (a) label honestly until validated, (b) get real GPLs for your 1–3 demo
metros so the number is locally true there. See Wave 0 + Wave 3.

## Build on a clean base

Branch off **current `main`** (the checker code is current there; fee is $49). Do **not**
build on the stale `hardcore-elgamal` worktree (61 behind). The verdict/range fix lives in
a `git stash` on that old worktree — **port the logic** onto your fresh branch; don't build
on the stale base. The uncommitted outcomes work also lives there — leave it for Wave 4.

---

## WAVE 0 — Pre-flight (½ day): clean base + demo safety

0a. **Branch off `main`; confirm the toolchain.** Done: fresh branch; `next build` green;
    confirm whether Vitest is configured (task #33) — add it if not.
0b. **Purge every family-charge surface a buyer/family can see.** The checker is free, but
    scrub the `$49` paywall + "fee" copy from the negotiate flow, `nurture-email`,
    `anniversary-emails`, `dashboard`. Done: `grep -ri "fee\|\$49\|FLAT_FEE_CENTS"` shows
    nothing a hospice or referred family would see; the conflict-free pitch holds.
0c. **Soften FTC flags from verdicts to prompts.** "_Possible FTC issue — ask them about
    this_" + the statute as context, not "they can't require this." Cuts false-positive /
    defamation exposure on OCR-mangled text. Done: copy reworded across `rules.ts` outputs.

---

## WAVE 1 — Make the spear CORRECT + VISCERAL (the demo core, ~2–3 days)

_The number must be RIGHT and FELT. Nothing else matters until then._

1. **Verdict/range fix + parser extraction — together (THE unblocker).** The result can show
   "fair range $980–$1,260" yet stamp the item "high": display uses zip-adjusted
   `adjustedRange()` (`route.ts:96`) while `classifyPrice()` uses **national** thresholds
   (`route.ts:101`). The stash fixes it — **but it imports `lib/negotiation/price-list-parse.ts`
   which the stash doesn't create**, so applying it alone breaks the build. Do the parser
   **extraction** (`matchLineItem`/`naiveExtract`/`RawItem` → that module) *with* the
   classification fix as one unit. Done: classification + displayed range use the same
   zip-adjusted thresholds; `next build` green; **verified by hand on 2–3 real GPLs.**
2. **Per-line overcharge $ in the table.** Today rows show adjectives ("High"); show
   **"+$1,200 above fair"** per line (`cents − fairMid`, red when >0). _This is the magic —
   money, not verdicts, closes._ Done: every fixed-price row shows its dollar gap.
3. **FTC violation → table-row tie-in.** Rules already carry `ruleId`/`matchedItemId` — no
   parser dependency. Anchor violating rows (red border + "possible FTC issue") cross-linked
   to the panel, so the family sees the casket is _both overpriced and possibly illegal_.
   Done: violating rows visually flagged. _(Can ship right after #1.)_
4. **Disaggregate savings by lever.** The floating "$2,345" feels fake, and caskets/vaults/
   urns are excluded from the math (`route.ts:111`) so the biggest lever is invisible. Break
   it into **third-party / negotiate / decline**. Done: summary shows each lever's $; selection
   items show "save ~$X buying third-party."
5. **Result screen that lands + methodology label — shipped together.** Mobile-first: big
   **"$X above fair"** hero → line-by-line → what-to-do; stat grid collapses to 1-col <640px.
   **AND** a one-tap "how we computed fair" note that honestly labels `national-adjusted` vs.
   `metro-validated`, softening to a *labeled range* where not locally validated. Done: hero +
   mobile usable + every result links its methodology; no undefended red number ships.
6. **Deterministic fallback for BOTH Claude calls.** Extraction falls back to `naiveExtract`
   and `buildAdvocacySummary()` returns `undefined` on any hiccup — two chances for a blank/
   degraded screen on hotel wifi. Done: on failure, a deterministic summary from top
   violations + biggest overcharges; a quiet "used basic parser / low confidence" note.
7. **Share / email / PDF the family result.** The bereavement director's whole job is
   forwarding the finding to the family — without a handoff artifact the demo ends at "nice,
   now what?" Done: a clean shareable/exportable summary.

---

## WAVE 2 — The cohort proof sheet (the close, seeded for demo) (~½ day)

8. **Partner results VIEW with believable numbers (seeded).** "14 families helped · $1,900
   avg overcharge caught · 4 hidden fees flagged." _This is what the hospice buys._ For the
   **demo it does not need live capture or referral plumbing** — render the view from seeded/
   founder-entered numbers, with n<5 cell suppression and never home-level data. Done: a
   per-institution view that closes the demo. _(Live data is Wave 4.)_

**↑ The demo is everything above this line.** Waves 1–2 + Wave 0 + locally-true benchmarks
(below) = a sellable demo in ~2–4 days.

---

## WAVE 3 — Make the number locally TRUE for your demo metros (critical, parallel)

9. **Real GPLs for the 1–3 demo metros → flip those zips to `metro-validated`.** A scoped
   slice of the full benchmark program — only the cities you'll actually demo in — so the
   headline number is _true_ for the home the director photographs. Done: per-item medians
   from real GPLs in the DB for the demo metros; `dataSourceForZip()` returns `metro-validated`
   there and the UI says so. _This is the difference between a credible demo and self-immolation._

---

## WAVE 4 — Productionize (AFTER the first hospice yes)

10. **Full parser/pricing Vitest suite** (reconcile tasks #33–35) — regex edge cases,
    `matchLineItem` synonyms, the verdict/range regression test.
11. **Ingestion hardening** — multi-page PDF, messy/multi-column GPLs, paste; extraction
    **confidence signal** (matched/unmatched counts) surfaced in the UI.
12. **Live, consented, institution-attributed capture** — write each check to
    `price_list_analyses` incl. anonymous (consented), stamped with the referral code; the
    dataset moat starts compounding.
13. **Per-partner distribution** — `institutions` + `partner_referrals` tables, `?ref=CODE`
    on `/analyzer` (+ `/negotiate/start`) stamping `institution_id`, founder mints codes +
    QR by hand for pilot #1. _(This is also the anti-steering attribution firewall.)_
14. **Full per-metro benchmark program** — expand #9 nationally; methodology + freshness dates.
15. **Analytics + final polish** — funnel (photo → result → share → enroll), copy, QA.

---

## WAVE 5 — GTM + legal (background cannon, starts now, never blocks the build)

The full institutional campaign — counsel (anti-steering + BAA-free + PHI firewall +
de-identification), the Utah hospice target list, the sales kit, trust spine, the pilot
agreement — runs in parallel from today but does **not** gate building or *demoing*. A real
pilot with real bereaved families needs legal cleared; a *demo* to a hospice does not. The
ordered GTM detail lives in `GO_TO_MARKET.md` / `HOSPICE_GTM.md` / `EXECUTION_PLAN.md`.

---

## The fastest path (what "aggressive" means here)

`Wave 0 (clean base + safety)` → `Wave 1 (#1 build-green correctness → #2–#7 visceral
result)` → `Wave 2 (seeded proof sheet)` → `Wave 3 (real GPLs for demo metros)` = **a
sellable demo in ~2–4 days.** Everything in Waves 4–5 is post-first-yes or parallel
background. Cut the test suite, ingestion hardening, live capture, and referral plumbing
out of the demo — pre-test your 2–3 sample GPLs by hand instead.

## Guardrails (never break — they are the moat and the legal shield)

1. **Never charge the grieving family** — the checker stays free; purge the $49 surfaces.
2. **Never take funeral-home or insurer money.**
3. **The "$X above fair" number stays defensible** — label honestly until metro-validated; n>5
   before any public/cohort number; FTC flags are "possible issue," not verdicts.
4. **Never steer** — neutral options; family chooses. Only vetted homes if any outreach.
5. **`OUTREACH_LIVE` stays OFF** — no live funeral-home emails (hospice *sales* outreach is
   a separate, allowed thing under Wave 5).

## If you only build one thing first

**Wave 1 #1 — the verdict/range fix + parser extraction, build-green, verified on a real
GPL.** A self-contradicting result (range says "fair," verdict says "high") poisons the
entire "is this fair?" hook on contact. Every visceral feature is built on a *correct*
classification. Fix the truth of the number first; make it beautiful second.
