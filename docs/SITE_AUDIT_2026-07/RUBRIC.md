# Site Audit 2026-07 — Rubric

Every surface is judged on the founder's four criteria. A surface passes the audit only
when all four have a verdict recorded in [LEDGER.md](LEDGER.md).

| Criterion | The question | Fails when |
|---|---|---|
| **CONTENT** | Is every claim accurate, defensible (guardrail #4), and current? | Uncited numbers, stale copy, claims that contradict another page or reality |
| **FUNCTIONALITY** | Does it work live, degrade safely, and have a regression tripwire? | Broken paths, silent failure modes, untested guardrail code |
| **USE** | Does it serve a clear user job, and can that user actually find it? | Orphaned pages, dead-end funnels, duplicate routes competing for one job |
| **VALUE** | Does it grow reach, advance an institution, or deepen the data? | Fails all three of the weekly questions → distraction; demote, merge, or kill |

## The 15 alignment tests

Concrete yes/no questions to ask of any page or feature. Sources cited so a dispute goes
back to the doc, not to memory.

1. **PAYER PURITY** — Does this surface state, imply, or create any revenue path from funeral homes or insurers (referral fees, featured placement, lead-gen, sponsorship)? Must be NO. *(CLAUDE.md guardrail #1; OPERATING_PLAN Part 14; THE_WEDGE "the one rule")*
2. **FAMILY-FREE** — Does it charge a family, gate help behind payment, or carry leftover $49/$199/checkout copy? Must be NO — the consumer payment is fully decommissioned. *(guardrail #2; ROADMAP P2; GO_TO_MARKET gates 0.2/0.3)*
3. **ANTI-STEERING** — Does it rank, recommend, badge, or nudge toward a specific funeral home — or imply the hospice steers — instead of presenting neutral options the family chooses from? Must be NO (legal requirement in several states). *(guardrail #3; OPERATING_PLAN Part 8)*
4. **NUMBER DEFENSIBILITY** — Is every price, savings figure, and statistic traceable to a published methodology, with n>5 + significance behind any home-level claim, badge-honest where data is thin? *(guardrail #4; OPERATING_PLAN Parts 4+7; PRODUCT_PLAN thesis 2 + M4)*
5. **CLAIMS SUBSTANTIATION** — Is every savings/fair-price/market claim backed by real data or explicitly disclaimed as hypothesis (FTC §5), with no scrubbed-stat regressions? *(OPERATING_PLAN Part 8; BUSINESS_PLAN "note on figures")*
6. **DATA-MOAT FEED** — Does it capture or deepen the proprietary dataset (consented contributions, outcomes, GPL ingest) — or at least not bypass the instrumentation? *(OPERATING_PLAN Parts 2–4; THE_WEDGE; ROADMAP P1)*
7. **FUNNEL ROLE** — Does it play a named role in reach, the hospice funnel (lead → onboarding → referral → family activation → cockpit/report → billing), or data depth? If none, it is a distraction by the docs' own rule. *(CLAUDE.md three questions; OPERATING_PLAN Part 11)*
8. **FAMILY-INITIATED ONLY** — Can any flow here result in the platform cold-contacting a next of kin, or a hospice transmitting patient/family data to us? Must be NO (TX Occ. Code §651.001 reaches "any other entity" contacting a person near death or their family; NJ 45:7-65.3 reaches any person soliciting in care facilities; FL/ME/NE bans are licensee-scoped but the rule is house law everywhere — statutory map corrected 2026-08-19; HIPAA-by-construction). *(channel-survival rules)*
9. **POST-ADMISSION FRAMING** — Could it be read as pre-admission hospice marketing or an inducement to choose a hospice (the Anti-Kickback vector)? Institutional framing must be bereavement/psychosocial-support procurement. *(channel-survival rules)*
10. **NAVIGATION NOT ARRANGING** — Does copy or flow position us as arranging the funeral (unlicensed-funeral-directing exposure, TX/SC) rather than informing, comparing, documenting — family signs everything directly? *(channel-survival rules; guardrail #5)*
11. **ONE-SITTING LOOP** — Can the core family job complete in one sitting (median hospice stay 19 days), and does the product do the comparing (54.7% of families never contact a second home)? *(THE_WEDGE two design laws)*
12. **NARROW WEDGE** — Does it stay on funeral price + a light practical wrapper, or creep toward the broad grief/estate platform ("Empathy's ocean we drown in")? *(THE_WEDGE "what we do NOT do")*
13. **KILL-SWITCH + SAFE DEGRADATION** — Do all send/charge paths route through the sanctioned choke points (`sendOutreachForNegotiation` behind `OUTREACH_LIVE`; vetted-only directory; RLS-private family data), and does the surface degrade gracefully when a migration or data is absent? *(CLAUDE.md operational safety rules)*
14. **TRUST-SPINE CONSISTENCY** — Where it makes a claim or asks for trust, does it carry or link the no-funeral-home-money pledge and methodology, with zero legacy copy contradicting the free/neutral story? *(OPERATING_PLAN Part 7)*
15. **CITABILITY + CHANNEL DIVERSITY** — Does it lead with an original defensible stat, carry schema/answer-first structure for AI/press citation, avoid single-platform dependence — and use `lib/brand.ts` rather than hardcoding the brand (rename on hold)? *(OPERATING_PLAN Part 6; guardrail #6)*

## The scoreboard the audit serves

**The one milestone: one hospice paying (or about to) within 90 days** — met the day the
Stripe webhook fires with a real subscription. The Oct-16 scoreboard behind it
(PRODUCT_PLAN_2026-Q3): verified tier real in ≥2 states · proof loop closed on product
rails with n≥5 suppression intact · reach compounding and citable · AI layer governed ·
**zero guardrail breaches**. ROADMAP's validation gate: paid LOIs AND pilot families saved
a median ≥$1,500-equivalent. North star: families meaningfully helped per month.

**Kill criteria** (pre-committed; note: they live in BUSINESS_PLAN v2 §13.9 on **open PR
#167** — the in-tree v1 has none): no pilot by Oct 1 after ≥20 real conversations → shift
lead channel to employers/EAP within 30 days · pilot won't convert to paid by Dec 31 →
drop to per-family micro-fee or grant tier · median savings < $1,500-equivalent across
10+ cases → reweight pitch to time-saved + compliance-proof · **any guardrail breach →
stop, fix, document publicly; no milestone outranks the guardrails.**

## Audit weighting (what the strategy docs say matters most, in order)

1. Guardrail + legal-survival compliance on every surface — a breach is "the one unrecoverable mistake."
2. Defensibility of every published number — "one exposed exaggeration undoes the brand."
3. End-to-end functionality of the L3 institutional funnel — it is the revenue and has run zero real cases.
4. Outcomes/data instrumentation intact on every family surface — the moat.
5. Use + value of the L1 reach surfaces — one-sitting job, citable, honest at current data density.
6. Staleness/drift purge — legacy copy, contradicting docs, hardcoded brand strings.
7. Distraction pruning — anything failing all three weekly questions gets demoted, not polished.

## Known contradictions BETWEEN the strategy docs (found during mapping — resolve in A9)

- **BUSINESS_PLAN fork:** in-tree v1 (no kill criteria, pre-pilot framing) vs canonical v2 on open PR #167 (§7.3 price list the Day-8 Stripe decision depends on). Merge order matters.
- **ROADMAP.md top half never re-baselined:** says "L3 does not exist," outcomes "not applied," $49 "scheduled for removal" — all false; its own lower sections say otherwise.
- **GO_TO_MARKET.md** still treats the $49 fee as live and calls the Fair-Price Index "deferred" (it shipped Day 7) — yet memory designates it a "what's left" source.
- **CAHPS drift:** OPERATING_PLAN §5's memorized pitch and HOSPICE_GTM §0 lead with CAHPS; the market-research law says NEVER pitch CAHPS repair; PR #167 resolves it (referral-reputation canonical) but that resolution isn't on main. **The live /partners page still carries the CAHPS card** (→ A5).
- **Rename:** PRODUCT_PLAN scoreboard item 6 still commits to "Open Farewell by Oct 16" beneath its own ON-HOLD banner — inert but contradictory on the page.
- **Pricing numbers disagree** across OPERATING_PLAN / ROADMAP / BUSINESS_PLAN v1 / PR #167 §7.3 — any surface quoting a price must trace to §7.3 once merged, or say "hypothesis."
- **Timeline tension:** "paying in 90 days" (CLAUDE.md/ROADMAP) vs "signed free pilot in ~90 days, paid in 4–6 months" (BUSINESS_PLAN) — don't treat marketing-surface "paying by Oct" claims as settled fact.
- **Entity drift:** Delaware C-corp (OPERATING_PLAN §8, MARKET_READINESS) vs LLC (LAWYER_BRIEF) — unresolved counsel item.
