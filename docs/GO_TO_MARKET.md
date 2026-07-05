# The path to your first paying hospice

The single sequenced path that ties every other plan together — optimized for
your scarcest resource (time) and for **getting to cold outreach fast.** Read
this when you want to know "what do I do next, and in what order."

## The core insight (why this is efficient)

**You can start cold outreach to hospices before the product is finished.** The
bible says you run the first pilots *by hand* ([`OPERATING_PLAN.md`](OPERATING_PLAN.md)
§5, §11). The **partner portal (L3) is what you build *after* a hospice says
yes**, to scale and onboard peer hospices. So the path to your first cold email
is **short and mostly not engineering** — it's a pitch, collateral, a legal
pre-flight, a way to run a family for free, and a pilot agreement.

> **Defer until a hospice says yes:** the partner portal, the reporting
> dashboard, the Fair-Price Index, programmatic SEO depth. Building L3 before
> talking to a hospice is the classic founder time-sink. Talk first.

---

## Phase 0 — Pre-flight: what must be true before the first cold email

This is the gate. Keep it minimal. Most of it is **not** engineering and can run
in parallel. Start the **legal** item first — it has the longest lead time.

| # | Gate | Minimal version (to start outreach) | Owner | Plan |
|---|---|---|---|---|
| 0.1 | **Legal pre-flight** | Counsel clears **Utah anti-steering** + confirms **family self-enrollment keeps us out of BAA territory** | You + attorney | [`COMPLIANCE_ADDENDUM.md`](COMPLIANCE_ADDENDUM.md) |
| 0.2 | **Families can go free** | A pilot family pays **$0** for the advocacy. The free tools (prices, guides, analyzer) are already free; the one paid piece is the $49 advocacy — run pilot families free via the existing free-email bypass now, with the full [`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md) landing in parallel | You (eng-light) | PAYMENT_DECOMMISSION |
| 0.3 | **Credible trust story** | The "we take no money from funeral homes" story is true and visible, with **no $49 family-fee copy** contradicting it. Minimal: scrub the fee copy + a clean `/our-role`; the full trust spine (`/promise`, `/methodology`) strengthens it but isn't blocking | You | [`TRUST_SPINE.md`](TRUST_SPINE.md) |
| 0.4 | **The pitch, memorized** | The hospice pitch + objection handling, ready to say cold | You | [`HOSPICE_GTM.md`](HOSPICE_GTM.md) |
| 0.5 | **Collateral printed** | The family one-pager + the hospice leave-behind + the cold-email/call copy | You | [`HOSPICE_COLLATERAL.md`](HOSPICE_COLLATERAL.md) |
| 0.6 | **Pilot agreement** | A one-page free-60-day pilot agreement (~10–15 families, metrics in writing, de-identified data-use grant) | You + attorney | HOSPICE_GTM + COMPLIANCE |
| 0.7 | **Outcomes recording works** | You can record a case's outcomes (so the pilot produces the proof + the moat data) — apply the outcomes migration | You (eng) | [`ENGINEERING_BACKLOG.md`](ENGINEERING_BACKLOG.md) P1 |
| 0.8 | **Target list** | 20–30 named Utah hospices with decision-maker contacts | You | HOSPICE_GTM |

**The gate to start cold outreach:** 0.1, 0.4, 0.5, 0.6, 0.8 done, and 0.2/0.3
at least minimally true. That's **~2–3 weeks of mostly-non-engineering work +
the lawyer** — not months of building.

---

## Phase 1 — Cold outreach (the campaign)

Run it as a disciplined process (full mechanics in [`HOSPICE_GTM.md`](HOSPICE_GTM.md)).

- Work the 20–30 list through the 8-stage pipeline; warm entry via
  chaplains/social workers or straight to the bereavement coordinator.
- Cadence: ready-to-send email → call → voicemail → follow-up
  ([`HOSPICE_COLLATERAL.md`](HOSPICE_COLLATERAL.md) has the copy).
- Weekly targets: X new contacts, Y calls booked, Z discoveries.
- **Goal of the phase:** booked discovery calls.

## Phase 2 — Discovery → signed pilot

- Discovery: confirm the pain (the unfunded 13-month bereavement mandate +
  CAHPS scores + staff hours) and the right decision-maker.
- Pitch the **free 60-day pilot** (~10–15 families, metrics agreed in writing).
- **Goal:** a signed pilot agreement.

## Phase 3 — Run the pilot by hand (the data engine)

This is where the moat is born. **You personally run every case.** Per family:

1. **Referral in** — the hospice hands the family the one-pager (claim code /
   short URL). The family self-enrolls (no PHI to us).
2. **Free tools first** — fair-price lookup + the "is this quote fair?" checker.
3. **Advocacy** — you invoke the family's FTC right to itemized GPLs, request
   them from local **vetted** homes, return a **neutral** side-by-side (never a
   recommendation — guardrail #3).
4. **Family chooses** — they pick; you never steer.
5. **Record the outcome** — listed / quoted / negotiated / paid / chosen /
   hidden fees / satisfaction in `/admin/outcomes`. **This is the moat.**
6. **Aggregate** — families served, avg savings, satisfaction, time-to-resolution.

> Outreach stays **off** during pilots unless you've deliberately turned it on —
> the GTM "contact homes" step can be you on the phone/email by hand at first.
> `OUTREACH_LIVE` is a separate, explicit decision.

## Phase 4 — Convert → then build the portal

> **Update (2026-07-05):** the founder built the portal, marketing page
> (`/partners`), demo-request lead capture, and a coordinator-facing AI tool
> ahead of a signed pilot rather than waiting for Phase 4 — see
> [`ENGINEERING_BACKLOG.md`](ENGINEERING_BACKLOG.md) for current state. The
> sequencing logic below (prove it by hand first) is still sound advice for
> *future* builds; it just wasn't followed for the portal itself, and that's
> fine — the goal (a live report to hand a converting hospice) is met either
> way.

- Compile the pilot results into a one-page proof sheet.
- Ask for the **paid annual contract** + intros to peer hospices.
- **Only now** build the partner portal + reporting dashboard
  ([`PARTNER_PORTAL_SPEC.md`](PARTNER_PORTAL_SPEC.md)) to scale onboarding and
  hand the hospice a live report instead of a hand-made sheet.

---

## The efficient order (what to do now / soon / later)

- **Now (parallel, mostly non-engineering):** start the legal pre-flight (0.1 —
  longest lead time); finalize the pitch + collateral; scrub the $49 family copy;
  draft the pilot agreement; build the target list.
- **Soon (light engineering):** apply the outcomes migration (0.7); land payment
  decommission Stages 1–3 so families are cleanly free.
- **Later (only after a hospice says yes):** partner portal, reporting
  dashboard, Fair-Price Index, programmatic SEO depth.

This maps onto the bible's 90-day sprint, but the headline is: **cold outreach
starts in weeks, not after building everything.** The first paying hospice is
the one milestone that matters; everything else is in service of that yes and
proving it repeats.
