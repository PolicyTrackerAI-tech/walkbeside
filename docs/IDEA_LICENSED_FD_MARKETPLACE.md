# Parked idea — a marketplace of state-licensed funeral directors

> **STATUS: PARKED. Do NOT build yet.** Captured 2026-06-09. We finish the core
> concept first (the `docs/LAUNCH_CHECKLIST.md` 211-item list → a real Utah
> launch). Revisit this only after that ships and is working. This file exists
> so the idea isn't lost and so outside counsel can opine on it as a *fork* of
> the same licensing question — not so we act on it now.

## The concept

Today Honest Funeral is software + a deterministic outreach pipeline: we email
funeral homes on a family's behalf and bring back itemized quotes. The parked
idea is a second mode — an **Uber/DoorDash-style marketplace of independent,
state-licensed funeral directors** who pick up family "intakes" as gig work:
do the consult, request/compare GPLs, and advocate for the family, on their own
schedule, paid per case. The platform runs vetting, matching, payments, QA, and
the consumer relationship; the licensed FD performs the regulated act.

## Why it's compelling

- **It turns the licensing blocker into the moat.** If advocate outreach
  requires a funeral/broker-type license in a given state, the answer isn't
  "don't operate" — it's "the person performing the regulated act *is* a
  state-licensed FD." We stop looking like an unlicensed broker and become the
  platform that routes regulated work to licensed pros (the rideshare structure:
  the driver holds the license; the platform runs the market).
- **Network effects instead of a copyable tool.** A directory + an email
  template is cloneable. A vetted, multi-state roster of licensed FDs who do
  neutral family intakes is not. That's the Tier-2 ("$500M–1B") shape the
  strategy docs aim at.
- **Latent supply exists.** Many licensed FDs are underpaid W-2, semi-retired,
  or between roles. "Do family intakes on your schedule, get paid per case, no
  embalming room" is an attractive gig.
- **Better consumer outcome.** A licensed human in the loop can go deeper than a
  templated email — read a GPL line by line, catch upsells, sit with the family.

## The hard questions to resolve BEFORE building

1. **Per-state licensing.** A license is state-specific; coverage is built
   state-by-state. Utah-first is still the wedge. Which states, in what order?
2. **What act actually needs a license?** Requesting a GPL ≠ arranging a funeral
   ≠ negotiating. The narrower the regulated act, the lighter the requirement.
   Counsel should scope this precisely.
3. **Worker classification.** "Gig" + "licensed professional" + platform-set
   workflow is the W-2-vs-1099 fight (cf. rideshare). Needs a labor read
   alongside the funeral-law read.
4. **Conflict-of-interest wall.** An FD who also works for a funeral home can't
   neutrally advocate against funeral homes. Likely need independents only, or a
   hard conflict wall, to keep the "we take no money from the industry" promise.
5. **Unit economics.** Per-case FD payout vs the family fee. The current flat
   $49 almost certainly doesn't cover a licensed human's time — this mode
   probably needs its own (higher) price tier or a different model.
6. **Trust + QA.** Vetting, ratings, recordings/transcripts, recourse when an FD
   underperforms. The platform owns the consumer relationship and the quality bar.

## How it connects to the existing plan

- **Lawyer brief as a fork.** The licensing opinion we're already commissioning
  (`docs/LAWYER_BRIEF.md` §B) can answer *both* models at once — "does this act
  require a license, and can a licensed person cover it" is the same question for
  the software-only tool (Option A) and this marketplace (Option B). Ask counsel
  to frame it as A vs B so we don't pay twice.
- **AI deputy as the dispatcher.** The "Sister AI deputy" / concierge in
  `docs/ai_deep_dive.md` is the natural matching + QA layer — route intakes,
  pre-read GPLs for the FD, summarize, flag anomalies.
- **The directory becomes two-sided.** `funeral_homes` is the demand side we
  already model; this adds a supply side (`funeral_directors`?) with its own
  vetting flow — a structural mirror of the `/admin/vetting` we already built.

## When we pick this up — first steps (not now)

1. Get the A-vs-B licensing opinion back from counsel (Utah first).
2. Validate supply: talk to 5–10 licensed UT FDs about the gig premise + pay.
3. Pick the narrowest regulated act that still helps families, and price the tier.
4. Prototype the supply-side vetting + matching on top of the existing admin
   tooling and AI deputy.

Until then: **head down on the core concept.**
