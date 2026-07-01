# Honest Funeral — Legal Review Brief

**Prepared for:** outside counsel (startup / consumer-regulatory / FTC /
healthcare-referral)
**Prepared by:** Ryan Currie, founder, Honest Funeral (LLC)
**Status:** pre-launch. Live testing on the public site expected within weeks.

> This document is internal preparation material, written by the founder with
> AI assistance. It is **not** legal advice and contains no legal conclusions —
> it exists so a qualified attorney can (1) understand the business quickly and
> (2) identify where we could get into trouble before we scale. Everything
> below marked **[CONFIRM]** is an assumption counsel should correct.
>
> **⚠️ Business model changed 2026-06-24 — this brief was rewritten to match.**
> An earlier version of this document described a $49 flat consumer fee, paid
> by the family, charged upfront via Stripe. **That model is fully
> decommissioned.** If any earlier draft of this brief, or any conversation
> with counsel, referenced the $49 fee, Stripe checkout, or a 14-day refund
> window, treat it as superseded — the money flow described below is the
> current, live reality of the shipped product.

---

## 1. The one-paragraph business

Honest Funeral is a **free, neutral consumer-advocate web app** for families
who have just had a death in the family. It takes **no money from funeral
homes and no money from insurers**, and charges the **family nothing, ever** —
not for the free tools, and not for the advocate-outreach feature described
below. It is not itself a funeral home, broker, directory, insurer, or law
firm. Revenue comes from **institutions that serve the dying** — hospices
first, then employers — who pay us to make this free service available to the
families they serve, and who receive an **aggregate, de-identified** outcomes
report showing the value delivered (money saved, FTC issues caught,
satisfaction). No individual family's data is ever shared with a paying
institution.

---

## 2. What the product actually does (surfaces)

**Free to every family, no exceptions, no account required for most of it:**
- **Fair-price lookup / Fair-Price Index** — enter a ZIP, see national-benchmark
  price ranges per funeral line item, adjusted regionally, with sources cited.
- **Price-list checker (`/analyzer`)** — family uploads a photo (or pastes text)
  of a funeral home's itemized price list; AI flags line items priced above the
  fair range and likely FTC Funeral Rule issues, and can draft a message back to
  the home. This is the product's primary surface.
- **Prep kit / rights guide, faith guides, obituary/eulogy helper, post-funeral
  checklist, veterans-benefits checker** — free guidance content.
- **Advocate outreach (account required, still free)** — described in detail
  below.

**Advocate outreach — free to the family, no charge at any step:**
1. Family creates an account, authorizes us in writing to contact homes on
   their behalf, and we identify the local homes we would contact.
2. We email those homes **identifying ourselves as Honest Funeral, the
   family's named advocate** (we do **not** impersonate the family and do
   **not** send anonymous/secret-shopper inquiries — see §4), invoking the
   family's **FTC Funeral Rule** right to an itemized General Price List. This
   fires immediately on authorization — there is no payment gate of any kind.
3. Homes reply; we collect/parse quotes and present them side by side.
4. Family picks a home (or none) — **free either way**. We notify the chosen
   home; the family meets them in person to make selections and sign directly
   with that home.
5. Post-close, we ask the family a single calm satisfaction question (1–5) and
   may record what they ultimately paid the funeral home — for our own
   outcomes data (see §F below), never billed to the family.

**Institutional revenue (the actual business model):** hospices (and later
employers) pay Honest Funeral, under a separate institutional agreement, for
the right to refer their patients'/employees' families to this free service.
In exchange, the paying institution receives a periodic **aggregate,
de-identified** report (families helped, total overcharge caught, average
savings, FTC issues flagged, satisfaction, time-to-resolution) — never a
specific family's name, situation, or outcome. **[CONFIRM]** No secondary
consumer-facing referral revenue (insurance, financing, attorneys) is currently
built or planned; if that changes, this brief needs an update before it ships.

---

## 3. How money moves (exact)

- **The family pays nothing.** Not the free tools, not the advocate outreach,
  not at any point in the flow. There is no Stripe checkout, no fee, no refund
  policy for the family — none of that code path exists in the product.
- **Who pays:** a hospice (or, later, an employer) under a direct institutional
  agreement/contract, negotiated separately from anything a family sees.
- **What the institution receives:** the ability to refer/hand families a
  branded link to a free tool, plus an aggregate outcomes report (see §F). It
  does **not** receive any individual family's data, and it has **no role in,
  and no visibility into, which funeral home a specific family selects.**
- **No commissions, kickbacks, or listing fees from funeral homes, ever. We do
  not hold or transmit any funeral payment** — the family pays the funeral home
  directly at the home's own quoted price.
- Stripe remains integrated in the codebase only as scaffolding for future
  institutional billing (e.g., an annual per-facility contract) — no live
  Stripe charge exists in the product today.

---

## 4. Critical factual representations we make (counsel should pressure-test these against reality)

These are claims the **site itself makes**. If any is not literally true of the
shipped product, that is a deception risk we need to fix before launch:

1. **"We identify ourselves by name in every outreach email; we do not
   impersonate families; outreach is transparent, not anonymous."** → Outreach
   emails are built from a **static, deterministic template**
   (`lib/negotiation/email-body.ts`, sent by `app/api/negotiate/start/route.ts`),
   not generated by AI — so this representation is guaranteed by construction.
   The send path also enforces a code-level **email denylist** and an
   `OUTREACH_LIVE` **kill-switch** (dry-run unless explicitly enabled). Counsel
   should read the template once and confirm wording. This is our single most
   important representation and our main defense against impersonation/deception
   claims.
2. **"We take no money from funeral homes or insurers, and we never charge the
   family."** → True today by construction (no payment code path exists for
   families); keep true.
3. **Fair-price ranges / "$X above fair" on the checker.** → These are
   advertising/factual claims that may require substantiation under FTC Act §5.
   Our price data is national benchmarks (sourced from published industry
   survey medians and real price lists, cited on `/methodology`), regionally
   adjusted, **not yet validated against local price lists in every metro** —
   the product discloses this on `/methodology` and in the result itself.
   Question: what substantiation/disclaimers are sufficient here?
4. **FTC Funeral Rule "likely violation" flags on a specific home's price
   list.** → Opinion/finding about a specific business's document; the engine
   is deliberately conservative (most findings are graded "worth confirming,"
   not "violation," unless the price list's own text proves it) — but
   defamation/trade-libel exposure is worth a direct read of `/methodology`
   and the finding wording.
5. **"Free to families, forever."** → This is now the company's central public
   claim and differentiator. Counsel should confirm the site is fully
   consistent (no stray pricing language anywhere) before launch, and advise on
   any disclosure obligations around **who does pay us** (see §5.L, new).
6. **Former claim now REMOVED:** the site previously said it was "built by a
   licensed funeral director" and referenced a brother-sister founding team.
   That person is **not currently a founder or active participant**, so we
   removed all such claims to avoid a false-endorsement/deceptive-credential
   problem. Counsel should confirm the removal is complete.

---

## 5. Risk areas — for counsel to assess

### A. FTC Funeral Rule (16 CFR Part 453)
- The Rule binds **funeral providers**, not us. But our whole outreach feature
  **invokes** it on consumers' behalf, and the checker **cites specific
  provisions** when flagging a possible violation. **Q:** Any risk in a
  non-provider asserting consumers' Funeral Rule rights to homes, or publicly
  characterizing a home's price list as a likely violation? Any registration/
  standing issue?

### B. Funeral licensing / unauthorized practice
- Many states license funeral establishments and directors and regulate who may
  **arrange** funerals, **negotiate** on a family's behalf, or act as a funeral
  **broker**. We believe we are an information service + communications agent,
  **not** arranging dispositions or handling remains/payment, and — unlike a
  prior model — we do not charge the family anything, which may bear on the
  licensing analysis. **Q (highest priority):** In which states, if any, does
  "contacting homes and collecting quotes as the family's advocate" require a
  funeral, broker, or similar license, given the service is free to the
  family? This is multi-state — see §6.

### C. Agency / authorization
- We act "on behalf of" the family. **Q:** What authorization do we need from
  the family (written? specific scope?) before contacting homes in their name?
  Is our in-product authorization step sufficient? What's our liability for the
  quotes we relay or the advice we give?

### D. FTC Act §5 / state UDAP (unfair & deceptive practices)
- Our marketing claims (savings figures, "$X above fair," FTC-violation flags,
  "free to families" framing) need substantiation and accurate framing. **Q:**
  What can we claim, with what disclaimers, and what must we be able to prove?

### E. Email & outreach law
- Outreach emails go to **funeral homes** (B2B). **Q:** CAN-SPAM applicability
  (commercial vs transactional/relationship), required headers/opt-out, and
  whether the named-advocate framing changes anything. Any anti-impersonation
  statutes implicated by acting "as the family's advocate."

### F. Data privacy & security (family-side)
- We collect: family account info, the deceased's details (obituary inputs),
  uploaded price-list photos, situation/scenario data, and post-close
  satisfaction/outcome data. This is **sensitive bereavement + financial data**.
  Stored in Supabase, row-level-security-scoped to the owning family. **Q:**
  Obligations under CCPA/CPRA and other state privacy laws; whether any of this
  is "sensitive personal information"; required privacy disclosures; retention
  limits; breach obligations. Is our current Privacy Policy (`/privacy`)
  adequate for the current model?

### G. [Formerly: fee model/refunds — NOW MOOT] Institutional billing
- There is no consumer fee, so the prior refund/tax-on-digital-service analysis
  no longer applies. **Q instead:** as institutional (hospice/employer) billing
  is built out, what contract structure (MSA, per-facility annual fee, etc.) and
  what tax treatment applies to a B2B services contract of this kind? This is
  forward-looking — no institutional contract is signed or billed yet.

### H. Secondary referral revenue [not currently built or planned]
- Not part of the current model. If pursued later (insurance, financing,
  attorney referrals), each would need its own licensing/disclosure review
  before launch — flagging only so this brief stays complete if revisited.

### I. Reliance liability on price data
- Families make decisions on our "fair price" output. **Q:** Disclaimer
  language and structure to limit liability for data inaccuracy, given the data
  is not yet locally validated everywhere (this is already disclosed on
  `/methodology` and in the checker result — counsel should confirm sufficiency).

### J. Advice disclaimers / not legal-financial-medical advice
- We already disclaim this on `/terms`, `/faq`, and in the footer. **Q:** Are
  the disclaimers adequately worded and placed?

### K. Entity, IP, contracts
- LLC + EIN exist. Trademark "Honest Funeral" is descriptive-leaning (weaker
  mark). Prior brand "Funerose" being sunset. **Q (low urgency):** trademark
  clearance/strategy; ensure all contracts/domains are in the LLC's name to
  preserve the liability shield.

### L. Institutional payer relationship — healthcare referral law [NEW, highest priority given the business-model change]
- Hospices are healthcare providers, most of which bill Medicare/Medicaid. A
  hospice paying a third party (us) for a service it then refers its patients'
  families to raises questions that **did not exist under the prior
  consumer-fee model.** Our July 2026 market research (not legal advice —
  compiled against OIG guidance, state statutes, and enforcement records;
  citations in `Honest_Funeral_Market_Research.pdf`) frames the analysis we
  need counsel to confirm or correct:
  - **AKS/CMP framing [CONFIRM]:** funerals are not federally payable, so the
    funeral referral itself appears to fall outside AKS/CMP — the danger vector
    is instead a **free family benefit used to induce HOSPICE selection**
    (one-purpose test). OIG guidance reportedly holds that benefits disclosed
    only **after** provider selection don't violate the inducement bar. Our
    design rules, built to match: the benefit is delivered **post-admission
    only**, never appears in a hospice's pre-admission marketing, and the
    contract is framed as bereavement/psychosocial-support procurement. **Q:**
    Is this framing right, and what contract terms lock it in?
  - **State funeral law [CONFIRM]:** NY Pub. Health Law §3450 and Virginia's
    anti-cappers statute make paying for funeral patronage a license-revocation
    offense (we take nothing from homes — but this also poisons any future
    supply-side monetization); TX Occ. Code ch. 651 and SC define "funeral
    directing" broadly (we stay navigation/education, never "arranging");
    **at-need solicitation bans (FL §497.164, TX, ME, NE)** restrict outbound
    contact with grieving families — our platform is **family-initiated
    activation only** (the hospice hands the family a link; we never
    cold-contact next of kin). **Q:** Do our flows as built clear these?
  - **HIPAA [CONFIRM]:** decedent PHI is protected for 50 years; receiving
    patient/family data **from** a hospice would make us a business associate.
    Our design avoids this by construction — **the hospice transmits nothing;
    families self-activate.** **Q:** Does that hold, and should a BAA template
    exist anyway for hospices that insist on warm-handoff data flows?
  - **Q:** Should the site or the hospice's own materials disclose to the
    family that their hospice is paying for this service, to avoid any
    perception of undisclosed influence — even though we do not steer families
    toward any funeral home and the hospice has no visibility into an
    individual's outcome?
  - **Context for counsel:** the channel is scarred (Grace, a cremation
    startup, used hospice/hospital lead-gen including an EHR death-feed, and
    is the cautionary tale hospices cite) and the compliance climate is tense
    (June 2026 DOJ takedown included a hospice–funeral-home decedent-data
    scheme; CMS moratorium on new hospice enrollments since May 2026). Expect
    conservative vendor diligence; we intend to lead with compliance
    documentation.

---

## 6. Jurisdiction / multi-state note

- **Entity domiciled in:** [CONFIRM — state of LLC formation].
- **Founder operating from:** [CONFIRM — state].
- **Launch market:** Utah (only dataset we have today; first hospice pilot
  target is also Utah).
- **Intended reach:** all 50 states (the site serves any US ZIP).
- Funeral regulation is a **50-state patchwork**. Priority is to clear Utah for
  launch, then map the states we expand into. **Q:** Can we limit advocate
  outreach to states we've cleared, and gate the rest, as a risk-management
  measure?

---

## 7. Materials to bring to the meeting

- This brief.
- The live site (or staging URL) — especially `/how-it-works`, `/our-role`,
  `/faq`, `/terms`, `/privacy`, `/methodology`, `/corrections`, and the
  advocate-outreach flow.
- The **actual outreach email templates** (most important single artifact).
- Current Terms of Service and Privacy Policy.
- LLC formation docs + EIN.
- A short description of the data we store and where (Supabase schema
  summary), including the new outcomes/partner-reporting tables.
- A draft or term sheet, if one exists, of the intended hospice institutional
  agreement — counsel will need this to assess §5.L.

---

## 8. Prioritized questions (ask these first)

1. **Institutional payer / healthcare referral law (§5.L):** Given a hospice
   pays us and refers patients to a service that is free to them, what's our
   Anti-Kickback/Stark/HIPAA exposure, and what contract terms keep us clear of
   it? This gates signing our first hospice pilot agreement.
2. **Licensing (§B):** Does our free advocate-outreach model require a funeral,
   broker, or other license in Utah? In other states? This gates launch.
3. **Outreach representation (§4.1, §E):** Read our outreach emails — are we
   safe describing ourselves as the family's named advocate invoking the FTC
   Funeral Rule? Any impersonation/CAN-SPAM issue?
4. **Advertising substantiation (§D, §4.3–4.4):** What can we claim about fair
   pricing and FTC-violation findings, with what disclaimers?
5. **Authorization (§C):** What family authorization do we need before
   contacting homes in their name, and what's our liability for relayed quotes?
6. **Privacy (§F):** Are our privacy disclosures and data practices compliant
   for sensitive bereavement data across states?

---

## 9. Our current risk-reduction posture (so counsel knows what's already done)

- We take **zero money from funeral homes or insurers**, and charge the family
  **nothing** — removes the conflicts that plague both funeral lead-gen
  businesses and paid-consumer-advocate models.
- Outreach is **transparent and named**, not anonymous impersonation.
- We **removed** the "licensed funeral director built this" credential claim.
- Our fair-price data is **sourced and cited** (`/methodology`) and we publish
  our own corrections openly (`/corrections`) rather than overclaiming.
- Aggregate-only, de-identified reporting to any paying institution — never an
  individual family's data.
- We disclaim legal/financial/medical advice site-wide.
- We can **geo-gate** advocate outreach to cleared states if advised.

*Open the meeting by asking counsel to red-team §5.L (the new institutional-
payer/healthcare-referral question) and §5.B (licensing) — those are where the
real exposure lives under the current model.*
