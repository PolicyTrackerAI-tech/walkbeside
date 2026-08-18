# Entity Plan: LLC today, Delaware C-corp before the first paid contract (DRAFT)

> **DRAFT for counsel and CPA review. Not legal or tax advice.** Prepared
> 2026-08-18. This resolves the documented contradiction in the company's own
> papers (LLC in the lawyer brief; Delaware C-corp in the finance docs) into
> a sequenced plan with dates. The founder's two live questions are answered
> first.

## Question 1: "Add Honest Funeral Co. to the d/b/a line of my LLC?"

**Yes, this week, and it turns out to be legally required, not just tidy:**
Utah Code § 42-2-5 requires anyone transacting business under an assumed
name to file the assumed-name certificate **within 30 days of commencing
business under that name**, and § 42-2-10 bars a non-compliant business from
maintaining any action in Utah courts until it complies (plus late fees).
The company began operating publicly as "Honest Funeral Co." on 2026-08-18,
so the 30-day clock is running. ~$22 and about ten minutes, and it does not
conflict with the C-corp plan. (The chapter is recodified effective
10/1/2026 with new section numbers; same substance.)

Why now: the LLC is the operating entity today, and outreach emails, the
counsel engagement, and pilot conversations are all happening under the name
"Honest Funeral Co." A registered d/b/a makes that name legally usable today
(signature blocks, the bank, any early paper) instead of a trade name with no
registration behind it.

How (Utah): Utah Division of Corporations and Commercial Code, online via
Utah OneStop / the Division's business registration portal. Register the
assumed name (d/b/a) "Honest Funeral Co." under the existing LLC. Fee is
approximately $22; renewable every three years. Two checks at filing time:

1. Name availability: the name must be distinguishable in Utah's registry.
2. Designator rules: "Co."/"Company" is generally permitted for an LLC's
   assumed name (unlike "Inc."/"Corp.", which imply incorporation). If the
   portal rejects "Co." for an LLC-owned assumed name, do not fight it; that
   is simply a reason to accelerate Phase 2 below, where the name becomes
   the corporation's actual legal name. **[COUNSEL: confirm Utah's
   designator rule for assumed names held by an LLC.]**

What it does not do: a d/b/a changes nothing about taxes, liability, or
structure. It is a name registration, nothing more.

## Question 2: "Is the LLC even the right starting structure?"

**It was the right starting structure. It is the wrong ending structure. The
plan's own doctrine already says so, and the timeline now has dates.**

The honest analysis:

- **What the LLC did well:** cheap, simple, pass-through, zero maintenance
  while the company was one founder writing code with no revenue. Nothing
  about having started as an LLC was a mistake, and nothing about it is
  urgent to undo this week.
- **Why it cannot be the ending structure:**
  1. **Investors require the Delaware C-corp.** YC requires it; MBC and
     essentially all institutional and most angel paper (SAFEs) presume it.
     The November checkpoint makes this real within roughly ninety days.
  2. **QSBS.** Qualified small business stock treatment (IRC §1202), the
     founder's single largest potential tax benefit at an eventual
     acquisition, is available only for C-corp stock, and its five-year
     holding clock starts at stock issuance. Every month as an LLC is a
     month the clock is not running. **[CPA: confirm QSBS qualification at
     issuance.]**
  3. **Equity mechanics.** Advisor grants (the hospice-insider advisor is a
     named top-3 priority), option pools, and the acquisition endgame all
     work cleanly in a Delaware C-corp and awkwardly in an LLC.
  4. **Contracting optics.** Hospice procurement and their counsel expect a
     conventional counterparty; the services agreement should ideally be
     signed by the corporation.
- **Why not just tax-elect:** electing C-corp taxation for the LLC changes
  taxes, not the entity. Investors want Delaware corporate stock, not Utah
  LLC units taxed like a corporation. It solves nothing that matters here.

## The sequenced plan

**Phase 1, this week (founder, no professionals needed):**
1. Register the d/b/a "Honest Funeral Co." on the LLC (above).
2. Continue operating exactly as now. The free pilot, if timing ever forces
   it, can be signed by the LLC d/b/a Honest Funeral Co.; the services
   agreement draft already pre-approves assignment to the successor
   corporation. Target remains: corporation exists before the first PAID
   contract.

**Phase 2, within ~30 days (mechanics ~$500–700; counsel papers it inside
the setup package):**
1. Form **Honest Funeral Co.**, a Delaware corporation, via Clerky or Stripe
   Atlas (standard startup stack: certificate of incorporation, bylaws,
   initial board consent, founder common stock purchase with IP assignment,
   83(b) election within 30 days of stock purchase, EIN). The corporate name
   IS the brand, so the corporation needs no d/b/a at all. Check Delaware
   name availability first; "Honest Funeral Co." must be distinguishable in
   Delaware's registry. **[COUNSEL: review the formation set rather than
   drafting it; confirm authorized shares / par value defaults are sane.]**
2. Register the corporation as a foreign corporation doing business in Utah
   (Utah foreign registration, modest fee), since operations are in Utah.
3. Open the corporate bank account; move Stripe, Vercel, Supabase, and
   domain billing to the corporation.

**Phase 3, at counsel setup (the migration; do not DIY the judgment calls):**
1. Move the business from the LLC to the corporation. For a pre-revenue
   company with trivial assets, the standard clean path is an **asset
   assignment**: the LLC (and the founder personally, for anything held
   personally) assigns all IP, the domains, the data, and the contracts to
   the corporation, typically as part of the founder's stock-purchase IP
   assignment. The alternative, a statutory conversion of the LLC into the
   Delaware corporation, is also available and sometimes cleaner for
   continuity. **Which path is a tax and liability judgment call: [COUNSEL +
   CPA decide. Pre-revenue with no outside members and no material
   liabilities, either should be tax-clean under §351 principles, but this
   is exactly the kind of step that is cheap to check and expensive to
   redo.]**
2. Re-point any signed agreements (counsel engagement letter, any pilot) to
   the corporation via the pre-approved assignment.
3. Dissolve or wind down the LLC once nothing remains in it, and let its
   d/b/a registration lapse. **[COUNSEL: confirm timing so nothing signed by
   the LLC is orphaned.]**

## Cost summary

| Item | Cost | Who |
|---|---|---|
| Utah d/b/a on the LLC | ~$22 | Founder, this week |
| Delaware formation: Clerky Company Lifetime Package (verified 2026-08-18; incl. DE expedited filing fees + agent year 1 + post-incorporation setup + unlimited SAFE/hiring docs) | $819 | Founder, in progress |
| Utah foreign registration | ~$50–75 | Founder, with Phase 2 |
| Counsel review of formation + migration papering | inside the $3–7.5k package | Counsel |
| CPA check on the LLC→corp migration | ~$300–750 one-time | CPA |
| Delaware franchise tax, ongoing | ~$400–450/yr minimum (par-value method) | Annual |

## What this changes in other documents

- The services agreement and pilot agreement signature blocks say
  "[Honest Funeral Co. entity]" until Phase 2 completes, then name the
  corporation.
- The counsel outreach email's item 5 becomes "review our formation set and
  paper the LLC-to-corporation migration" rather than "form our entity,"
  which is cheaper.
- MBC/YC materials can state "Delaware C-corp (in formation)" once Phase 2
  starts.
