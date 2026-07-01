# Lawyer outreach — QUEUED (send next week, not this week)

> Per the launch plan, we go **next week**, not this. This is drafted and ready
> so that next week sending is one click. **Do not send until you're ready to
> engage** (and have picked the attorney). Drafting ≠ sending.

> **⚠️ Rewritten 2026-07-01 to match the current business model.** An earlier
> draft of this email described a $49 flat consumer fee. **That model is fully
> decommissioned — the family pays nothing, ever; hospices/employers pay
> instead.** Before sending: (1) confirm you have not already sent the old
> version to counsel — if you have, follow up directly with the corrected facts
> rather than relying on this file alone; (2) re-read `docs/LAWYER_BRIEF.md`
> once yourself, since the new institutional-payer model raises a genuinely new
> legal question (§5.L — Anti-Kickback/Stark/HIPAA) that a prior conversation
> with counsel would not have covered.

The attachment is `docs/LAWYER_BRIEF.md` — it's already comprehensive (business,
money flow, the exact representations we make, risk areas A–L, jurisdiction,
materials, prioritized questions). This file is just the cover email + the
send-day checklist so you don't have to reassemble it.

---

## Who to send it to

A firm/attorney with **two** of these, ideally one who has all three:
- **Consumer-protection / FTC advertising** experience (our claims + the FTC
  Funeral Rule invocation),
- **Healthcare regulatory** experience (Anti-Kickback Statute, Stark Law, HIPAA
  — now the highest-priority question, since a hospice pays us and refers
  patients to a free service),
- **Funeral / death-care or occupational-licensing** familiarity (the gating
  licensing question — Utah specifically).

Where to find one: Utah State Bar lawyer referral, a Utah business/regulatory
boutique, or a firm with a healthcare-compliance or advertising-law practice —
ideally one that can cover both the healthcare-referral question and the
consumer/FTC side, since they're now both load-bearing. Ask up front for a
**fixed-fee initial opinion** so cost is bounded.

---

## The email (ready to send — fill the [brackets])

> **Subject:** Pre-launch legal review — funeral-pricing consumer tool + hospice partnership model, Utah

Hi [Attorney name],

I'm [your name], founder of Honest Funeral ([honestfuneral.co]) — a free,
neutral consumer tool that helps grieving families check whether a funeral
home's price list is fair and flags likely FTC Funeral Rule issues. **Every
tool on the site is free to families, with no charge at any step** — including
an advocate-outreach feature where we contact local funeral homes on a
family's behalf, as their named advocate, to collect itemized price quotes.
**We take zero money from funeral homes or insurers.**

Our revenue comes from a different source: **hospices (and later employers)
pay us**, under a separate institutional agreement, for the right to refer the
families they serve to this free tool. In exchange, the hospice receives an
**aggregate, de-identified** report of outcomes across all the families it
referred — never an individual family's data or situation.

I'm preparing to sign our first hospice pilot agreement and want legal
clearance first. I'm looking for a **defined-scope initial opinion** on:

1. **Healthcare referral law (new, highest priority):** Given a hospice pays us
   and refers its patients' families to a service that's free to them, does
   this implicate the Anti-Kickback Statute, Stark Law, or HIPAA (e.g., a
   Business Associate Agreement if the hospice shares family contact info with
   us)? What contract structure keeps us clear of it?
2. **Licensing:** Does our free advocate-outreach model require a funeral,
   broker, or other license in Utah — and how does this vary by state?
3. **Our outreach representations:** Are we safe describing ourselves as the
   family's named advocate invoking the FTC Funeral Rule? Any
   impersonation / CAN-SPAM exposure? (I'll send the exact email templates —
   they're the single most important artifact.)
4. **Advertising substantiation:** What can we claim about "fair price" and
   FTC-violation findings, with what disclaimers?
5. **Authorization + privacy:** What family authorization do we need before
   contacting homes in their name; are our privacy practices sound for
   sensitive bereavement data?

I've prepared a detailed brief (business model, exact money flow, the
representations we make, and the risk areas we've already addressed) and can
share a staging URL and the outreach templates. We take nothing from funeral
homes or insurers and charge families nothing — the conflicts that plague
funeral lead-gen simply don't exist in this model — and can geo-gate outreach
to cleared states if you advise.

Could we set up an initial consult, and could you let me know your fixed-fee
range for an opinion on the above? Happy to send the brief ahead of time.

Thank you,
[your name]
[phone] · [email]
Honest Funeral, LLC

---

## Forward-looking question to include (one opinion covers both models)

Ask counsel to scope the licensing question for **both** structures so we don't
pay twice (see `docs/IDEA_LICENSED_FD_MARKETPLACE.md`):
- **Option A (now):** software-only consumer tool + deterministic advocate outreach.
- **Option B (later):** a marketplace where **state-licensed funeral directors**
  perform the regulated intake as gig work.

The core question — *does this act require a license, and can a licensed person
cover it* — is the same for both; getting both scoped in one engagement is cheaper.

---

## Send-day checklist (attach / link these — from LAWYER_BRIEF §7)

- [ ] `docs/LAWYER_BRIEF.md` (the brief) attached
- [ ] Live or staging URL — esp. `/how-it-works`, `/our-role`, `/faq`, `/terms`,
      `/privacy`, `/methodology`, `/corrections`, the outreach flow
- [ ] **The outreach email templates** (most important): from `lib/negotiation/email-body.ts` — `buildOutreachEmail` + `buildSelectionEmail`. Paste the rendered text (use `/admin/outreach-preview`).
- [ ] Terms of Service + Privacy Policy (`/terms`, `/privacy`)
- [ ] LLC formation docs + EIN
- [ ] Data-storage summary (`docs/PRIVACY_RETENTION.md` covers what we store + where), including the outcomes/partner-reporting tables
- [ ] A draft or term sheet of the intended hospice institutional agreement, if
      one exists — counsel needs this for the Anti-Kickback/HIPAA question

Open the consult by asking counsel to **red-team §5.L (the new institutional-
payer/healthcare-referral question) and §5.B (licensing) of the brief** — those
are where the real exposure lives under the current model.
