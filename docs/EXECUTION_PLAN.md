# Execution plan — the launch sequence, week by week

The day-to-day "what we actually do" plan. It turns the strategy + the
[`MARKET_READINESS.md`](MARKET_READINESS.md) checklist into a dated sequence.

**Two tracks run in parallel:**
- **[YOU]** — founder-only actions: legal, entity, expert recruiting, the actual
  cold outreach + calls, the by-hand pilot cases.
- **[BUILD]** — engineering (agent-assisted): apply outcomes, decommission the
  fee, ship trust pages, wire analytics, the partner portal (later).

**Targets:** first cold email ~**week 3**, first signed pilot ~**week 8**, first
paying hospice (or about to) ~**week 12**. The outreach kill switch
(`OUTREACH_LIVE`) stays **off** the entire time — going live is a separate,
explicit decision.

---

## Week 0 — Start the long-lead items (today)

- [ ] **[YOU] Engage a startup attorney** (healthcare + consumer-protection). Hand
      over the [`COMPLIANCE_ADDENDUM.md`](COMPLIANCE_ADDENDUM.md) counsel
      checklist: **Utah anti-steering**, **HIPAA/BAA via family self-enrollment**,
      and **pilot-agreement / MSA / data-use-grant templates**. *Longest lead time
      — this is why it's first.*
- [ ] **[YOU] Form the entity** — Delaware C-corp (Stripe Atlas / Clerky); EIN,
      business bank, bookkeeping.
- [ ] **[BUILD] Land the outcomes PR + apply its migration** (P1) — verify the
      family + admin recording paths. *This is the moat's data engine and the #1
      engineering blocker.*
- [ ] **[BUILD] Payment decommission Stage 1** — decouple the send trigger from
      payment ([`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md)); emails stay
      off (`OUTREACH_LIVE`).

## Weeks 1–2 — Get cold-outreach-ready

- [ ] **[YOU]** Memorize the pitch + objection handling
      ([`HOSPICE_GTM.md`](HOSPICE_GTM.md) + [`BATTLECARD.md`](BATTLECARD.md)).
- [ ] **[YOU]** Build the **20–30 Utah hospice target list** (Medicare Care
      Compare, NHPCO, Utah DOPL) into a simple CRM.
- [ ] **[YOU]** Recruit the **first named expert reviewer** (a licensed funeral
      director) — closes the #1 authority gap.
- [ ] **[BUILD]** Payment decommission **Stages 2–3** (families free; scrub the
      $49 copy everywhere, incl. `for-funeral-homes`).
- [ ] **[BUILD]** Trust spine: **/promise + /methodology** live, with a **named
      reviewer in the Article schema** ([`TRUST_SPINE.md`](TRUST_SPINE.md)).
- [ ] **[BUILD]** **Family support SOP** in place ([`FAMILY_SUPPORT_SOP.md`](FAMILY_SUPPORT_SOP.md)).
- [ ] **[BUILD/DESIGN]** Design + print the collateral
      ([`HOSPICE_COLLATERAL.md`](HOSPICE_COLLATERAL.md)): family one-pager,
      referral card, hospice leave-behind.

> **GATE — end of week 2:** legal pre-flight underway · families demonstrably
> free · trust/neutrality pages live · pitch + collateral + target list ready.
> When these are true, you can cold-email without anything contradicting you.

## Week 3 — First cold outreach

- [ ] **[YOU]** Send the **first 10 cold emails + calls** (copy in
      [`HOSPICE_COLLATERAL.md`](HOSPICE_COLLATERAL.md)). Log every touch.
- [ ] **[YOU]** Weekly cadence target: **15 new contacts, 5 calls booked.**
- [ ] **[BUILD]** Wire **reach analytics** (closes a scorecard gap) and prep a
      first **Fair-Price Index stat** for the pitch.

## Weeks 4–8 — Discovery → signed pilots

- [ ] **[YOU]** Run **10+ discovery calls**; lead with their pain (the unfunded
      13-month mandate, 42 CFR 418.64, + their CAHPS score).
- [ ] **[YOU]** Sign **1–2 free 60-day pilots** (~10–15 families, metrics +
      data-grant in writing).
- [ ] **[YOU]** **Run the cases by hand** ([`PLAN_OF_ATTACK.md`](PLAN_OF_ATTACK.md)
      §6B): free tools → request itemized GPLs → neutral side-by-side → family
      chooses → **record every outcome** in `/admin/outcomes`.
- [ ] **[BUILD]** A hand-made proof sheet first; the partner-portal/reporting v1
      ([`PARTNER_PORTAL_SPEC.md`](PARTNER_PORTAL_SPEC.md)) **only if** a live pilot
      needs it.

> **GATE — by ~week 8:** ≥1 signed pilot, outcomes recording producing real
> savings + satisfaction data.

## Weeks 9–12 — Convert & publish

- [ ] **[YOU]** Compile the **proof sheet** (families served, avg savings,
      satisfaction, time-to-resolution); **ask for the paid annual contract** +
      peer-hospice intros.
- [ ] **[BUILD]** Publish the **first Fair-Price Index** with a press push
      ([`FAIR_PRICE_INDEX.md`](FAIR_PRICE_INDEX.md)); partner-portal MVP if
      converting.
- [ ] **[YOU]** Write the **decision memo** vs the [`SCORECARD.md`](SCORECARD.md)
      go/no-go: raise? go full-time? next 90 days.

> **THE MILESTONE — by ~day 90:** one hospice paying (or about to). Everything
> above exists to make that one yes happen and prove it repeats.

---

## The daily rhythm (until the first yes)

Morning — build (the [BUILD] list). Midday — sales (calls land when people
answer). Afternoon — content / case delivery / follow-ups. Evening — CRM hygiene
+ tomorrow's 3 priorities, **≥1 of which must move a hospice toward paying.**
Weekly: reach up? a deal advanced? data deeper? Monthly: metrics vs the scorecard.

## What stays OFF the whole time

`OUTREACH_LIVE` and `OUTREACH_NOTIFICATIONS_ENABLED` stay off. In pilots,
"contacting the homes" can be **you, by hand** (phone/email). Flipping the switch
to automated outreach is a separate decision **after** legal clears it and email
deliverability is set up — not part of this 90 days.

## If a gate slips

- **Legal not cleared by week 3** → keep building + list-building; do *discovery*
  calls (no signed pilot) until cleared. Don't run a pilot un-cleared.
- **No hospice will pilot after sustained effort** → pivot the lead channel to
  **employers / EAPs** (same free-to-family model), per the risk register.
- **Outcomes migration not applied** → it blocks the pilot proof; treat as P0.
