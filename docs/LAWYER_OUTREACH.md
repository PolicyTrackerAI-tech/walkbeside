# Lawyer outreach — QUEUED (send next week, not this week)

> Per the launch plan, we go **next week**, not this. This is drafted and ready
> so that next week sending is one click. **Do not send until you're ready to
> engage** (and have picked the attorney). Drafting ≠ sending.

The attachment is `docs/LAWYER_BRIEF.md` — it's already comprehensive (business,
money flow, the exact representations we make, risk areas A–K, jurisdiction,
materials, prioritized questions). This file is just the cover email + the
send-day checklist so you don't have to reassemble it.

---

## Who to send it to

A firm/attorney with **two** of these, ideally one who has all three:
- **Consumer-protection / FTC advertising** experience (our claims + the FTC
  Funeral Rule invocation),
- **Funeral / death-care or occupational-licensing** familiarity (the gating
  licensing question — Utah specifically),
- **Startup/transactional** comfort (fixed-scope opinion, fast turnaround).

Where to find one: Utah State Bar lawyer referral, a Utah business/regulatory
boutique, or a firm with an advertising-law / consumer-protection practice.
Ask up front for a **fixed-fee initial opinion** so cost is bounded.

---

## The email (ready to send — fill the [brackets])

> **Subject:** Pre-launch legal review — consumer-advocacy startup (funeral pricing), Utah

Hi [Attorney name],

I'm [your name], founder of Honest Funeral ([honestfuneral.co]) — a
consumer-advocacy service that helps grieving families compare funeral prices.
Every tool on the site is free; our only revenue is a flat $49 a family pays
**upfront** for us to contact local funeral homes **as their named advocate**,
collect itemized price lists (invoking the family's FTC Funeral Rule rights),
and bring the quotes back side by side. **We take zero money from funeral homes
— no commissions, referrals, or kickbacks.** The family signs directly with the
home they choose.

We're preparing to launch in **Utah first** (multi-state later) and I want legal
clearance before we take real money or email real funeral homes. I'm looking for
a **defined-scope initial opinion** on:

1. **Licensing (the gating question):** Does our paid advocate-outreach model
   require a funeral, broker, or other license in Utah — and how does this vary
   by state?
2. **Our outreach representations:** Are we safe describing ourselves as the
   family's named advocate invoking the FTC Funeral Rule? Any
   impersonation / CAN-SPAM exposure? (I'll send the exact email templates —
   they're the single most important artifact.)
3. **Advertising substantiation:** What can we claim about "savings" and "fair
   price," with what disclaimers?
4. **Authorization + privacy:** What family authorization do we need before
   contacting homes in their name; are our privacy practices sound for sensitive
   bereavement data?

I've prepared a detailed brief (business model, exact money flow, the
representations we make, and the risk areas we've already addressed) and can
share a staging URL and the outreach templates. We've deliberately removed the
conflicts that plague funeral lead-gen (we take nothing from homes) and can
geo-gate outreach to cleared states if you advise.

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
- [ ] Live or staging URL — esp. `/how-it-works`, `/faq`, `/terms`, `/privacy`, the outreach flow
- [ ] **The outreach email templates** (most important): from `lib/negotiation/email-body.ts` — `buildOutreachEmail` + `buildSelectionEmail`. Paste the rendered text (use `/admin/outreach-preview`).
- [ ] Stripe product/fee config + refund policy text (`docs/REFUND_SOP.md`)
- [ ] Terms of Service + Privacy Policy (`/terms`, `/privacy`)
- [ ] LLC formation docs + EIN
- [ ] Data-storage summary (`docs/PRIVACY_RETENTION.md` covers what we store + where)

Open the consult by asking counsel to **red-team §4 and §5 of the brief** — the
representations we make and the licensing question are where the real exposure is.
