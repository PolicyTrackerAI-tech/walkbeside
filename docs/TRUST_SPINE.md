# Trust Spine — page specs

> **Fee note:** the live family charge is `FLAT_FEE_CENTS` = **$199** (some copy/docs say **$49** — stale). Scrub targets below should grep for **both** `$49` and `$199` (and `fee_cents`) to catch the real strings.

> Build-priority **#2** in the roadmap (after the outcomes layer). See
> [`ROADMAP.md`](ROADMAP.md) P2: "Build the trust spine: methodology page, 'we
> take no money from funeral homes' page, public mistakes page, named
> reviewers."

**Why this is structure, not marketing.** Honest Funeral is a for-profit with
no mission-lock. Per the bible (`OPERATING_PLAN.md` §7, "The for-profit trust
burden"): *neutrality is a practice you must prove, not a structure people can
verify. Your track record IS the asset.* These four pages are how the track
record becomes visible and durable. Counter-positioning is a 3–5 year window;
the trust spine is what converts that window into a moat (§2).

**What this doc covers.** Four pages — purpose, content outline, FTC §5
substantiation requirements, and schema/JSON-LD — for each:

1. `/promise` — "We take no money from funeral homes" (the pledge)
2. `/methodology` — how the Index + fair-price numbers are computed
3. `/corrections` — public mistakes/corrections log (the GiveWell move)
4. `/team` — named team + expert reviewers, with credentials

It also maps the **overlap with the three existing trust pages** so we extend,
not duplicate.

---

## 0. The guardrails these pages must honor

Every page here is bound by `CLAUDE.md`'s six guardrails. The two that shape
copy most:

- **Guardrail #2 — never charge the grieving family.** The existing trust pages
  (`/our-role`, `/how-it-works`, `/faq`, `/about`) are written around the legacy
  **$49 pay-to-send** model and say so repeatedly ("What the $49 actually pays
  for", "flat $49, refundable in 14 days", `fee_cents`). That model is being
  removed (`PAYMENT_DECOMMISSION.md`). **None of the four new pages may
  reference a family fee.** The payer story is: *families pay nothing;
  institutions (hospices → employers → insurers) pay.* If the decommission has
  not landed when these ship, write the new pages to the **post-decommission**
  truth anyway and flag the old pages for the same scrub.
- **Guardrail #4 — never publish a number we can't defend.** This is the entire
  load of `/methodology` and the FTC §5 sections below. No home-level public
  claim without **n>5 + significance**; every public number traces to a source
  or carries a disclaimer.

---

## 1. Overlap map — extend vs. build new

| Existing page | What it already says | Decision |
|---|---|---|
| `app/our-role/page.tsx` | "Not a funeral home"; what we do / don't do; "we don't take money from you, ever"; "For regulators and press" block. **Legacy:** "$49 fee only when they choose a funeral home", "consumer-paid advocacy service". | **Keep, narrow, link.** Stays the *legal-role* page (advice layer, not a funeral establishment). Move the no-money *pledge* to `/promise` and link out. Scrub the $49 / "consumer-paid" lines per guardrail #2. |
| `app/how-it-works/page.tsx` | Step-by-step of the outreach flow. **Legacy:** entire page is "What the $49 actually pays for". | **Reframe (separate task, tracked in `PAYMENT_DECOMMISSION.md`).** Not part of the trust spine, but it's the loudest $49 surface — flag it. The trust spine links to it only after it's de-fee'd. |
| `app/faq/page.tsx` | "How do you make money?", "Are you affiliated with any funeral homes?", "Can I trust your price data?". **Legacy:** answers anchor on "$49". | **Keep as FAQ; re-point the money + data answers** to `/promise` and `/methodology` as the canonical source. Rewrite the three relevant Q&As to the institutional payer + remove $49. |
| `app/about/page.tsx` | "Who's behind it" (one person, not an FD); "Why we can stay on your side". **Legacy:** PRINCIPLES card "A flat $49". | **Keep as the narrative/brand page.** `/team` is the *credentials* page (structured, reviewer-focused); `/about` stays the *story*. Cross-link. Scrub the $49 principle. |

**New routes to create:** `app/promise/`, `app/methodology/`, `app/corrections/`,
`app/team/`. All four use the existing `SiteHeader` + `BackLink` + `Card` UI and
the `JsonLd` component (`components/seo/JsonLd.tsx`).

**Navigation:** add `/promise` and `/methodology` to the primary trust links;
`/corrections` and `/team` live in the footer + cross-links. (`SiteHeader.tsx`
nav currently lists `/how-it-works` and `/about`.)

---

## 2. `/promise` — "We take no money from funeral homes"

### Purpose
The single canonical statement of the conflict-free model and the six
guardrails. This is the page we point press, regulators, hospice
decision-makers, and skeptical families to. It must be quotable and stable —
a URL that can be cited. Replaces the scattered "we don't take money" lines in
`/our-role`, `/faq`, `/about` as the source of truth (those link here).

### Content outline
1. **One-sentence pledge** (h1 + lede): *"Honest Funeral takes no money from
   funeral homes, cemeteries, or insurers. Families pay nothing. We are paid by
   the institutions that serve the dying — hospices first."* (Mirrors
   `CLAUDE.md` thesis.)
2. **Who pays us, in order** — a small table: Families → **$0, always**;
   Funeral homes / cemeteries / vendors → **$0, never, by rule**; Insurers (as
   our payer) → **never**; Hospices / employers (B2B2C) → **yes, they pay for
   the service we give their families free.** One line each on *why* that keeps
   us neutral.
3. **The six guardrails** — list verbatim from `CLAUDE.md` §"six guardrails",
   each with one plain-language gloss. These are "non-negotiable law"; present
   them as such.
4. **Why a family-side advocate can't take home money** — the
   counter-positioning argument (every comparison site, executor, and Empathy
   is paid by the other side; the neutral seat is the empty one). Keep tight;
   link to `/methodology` for the data claim and `/team` for who stands behind
   it.
5. **What "neutral" means operationally** — we never steer to a specific home
   (anti-steering law, guardrail #3); we present all options; the family
   chooses. We never publish a number we can't defend (→ `/methodology`). When
   we get something wrong, we post it (→ `/corrections`).
6. **Cross-links:** `/our-role` (our legal role), `/methodology` (the numbers),
   `/corrections` (when we're wrong), `/team` (who we are).

### Substantiation (FTC §5)
The core claim *"we take no money from funeral homes"* is a material
representation about our business model — it must be literally, presently true
and stay true.

- [ ] **Literal truth check:** no revenue line, referral fee, commission,
  lead-sale, or in-kind benefit from any funeral home, cemetery, monument
  company, or insurer-as-payer. Reconcile against actual revenue (Stripe +
  contracts) before publishing and at each material change.
- [ ] **No future-tense overreach.** Say what is true *now*; if/when an insurer
  becomes a *distribution* partner (not our payer), the wording must already
  draw that line. Avoid absolute "never will" promises that bind beyond the
  guardrails we actually enforce.
- [ ] **Anti-steering claim** ("we never steer to a specific home") must be
  backed by product behavior: the negotiate flow presents the full vetted set
  and the family selects. Don't claim it on this page if any surface ranks or
  recommends a single home. (Counsel to confirm per launch state —
  `LAWYER_BRIEF.md`.)
- [ ] **"Families pay nothing"** must be true site-wide before this ships —
  i.e. after `PAYMENT_DECOMMISSION.md`. Do not publish this page while the $49
  charge is live; that would be a false statement.
- [ ] **Substantiation file:** keep an internal note (date, revenue sources,
  who verified) so the claim is defensible if challenged. Re-verify quarterly.

### Schema / JSON-LD
- `WebPage` with `about` an `Organization` node (Honest Funeral), and
  `publishingPrinciples` → this page's URL, `correctionsPolicy` →
  `/corrections`, `ownershipFundingInfo` → this page (the funding disclosure).
  These three properties are exactly what Google's E-E-A-T / news guidance reads
  for a trust signal.
- Add the `Organization` once in the root layout and reference it; here, surface
  `ownershipFundingInfo` and `publishingPrinciples` pointing at `/promise`.

```jsonc
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "We take no money from funeral homes",
  "url": "https://honestfuneral.co/promise",
  "about": {
    "@type": "Organization",
    "name": "Honest Funeral",
    "url": "https://honestfuneral.co",
    "ownershipFundingInfo": "https://honestfuneral.co/promise",
    "publishingPrinciples": "https://honestfuneral.co/promise",
    "correctionsPolicy": "https://honestfuneral.co/corrections"
  }
}
```

---

## 3. `/methodology` — how the numbers are computed

### Purpose
The defense for guardrail #4. Every public number — the fair-price ranges on
`/prices` and `/funeral-costs`, and (when it ships) the Fair-Price Index — must
trace back to a documented method here. This is the page journalists and LLMs
cite, and the page that lets us say "published methodology" in the hospice pitch
and to counsel. Without it we cannot make any savings or fair-price claim under
FTC §5.

### Content outline
1. **What this page covers** (answer-first TL;DR): the two number families see
   — (a) the **fair-price range** per line item per region, and (b) the
   **Fair-Price Index** — and how each is built, how fresh it is, and where it's
   thin.
2. **Data sources, named and ranked.** Today (be honest about the current
   state): national funeral-pricing benchmarks + FTC Funeral Rule GPL
   disclosures, regionally adjusted — and the explicit caveat already in
   `lib/pricing-data.ts`: *"not yet validated against launch-market General
   Price Lists."* Then the four collection channels we're building toward
   (`OPERATING_PLAN.md` §4): (1) our own advocacy GPLs + outcomes, (2) mystery
   shopping, (3) crowdsourced uploads, (4) public postings. Mark which are live
   vs planned.
3. **The fixed taxonomy.** We normalize every price to a ~24-item line-item
   taxonomy (the `LINE_ITEMS` set in `lib/pricing-data.ts`: basic-services fee,
   transfer, embalming, etc.). Show the taxonomy or link to a reference list.
4. **How a range is computed.** Per home → per line item → per metro; every
   record timestamped. We publish a **range, not a point** (a quote is
   *reasonable* vs *the lowest possible* — language already in the FAQ). State
   the regional-adjustment method (the COLA/`zip-regions` multiplier) plainly.
5. **The Fair-Price Index** (when published): national + per-metro, quarterly,
   versioned; the headline stat and how it's derived; link to each release.
6. **Sample size & significance — the guardrail, stated as policy.** Verbatim
   commitment: *we publish no home-level claim without n>5 and a significance
   check; below threshold we show "not enough local data," not a number.* (This
   mirrors the FAQ's "we won't make up numbers" and `pricing-data.ts`.)
7. **Freshness.** Each number carries an "as of" date / data vintage; cadence
   for refresh; how timestamps work.
8. **The outcomes layer** (what makes our data unique). Describe — without
   exposing any family's private case (RLS-owner-scoped, `CLAUDE.md`) — that we
   measure listed → quoted → negotiated → paid → satisfaction per case
   (`negotiations.savings_vs_listed_cents` is a generated column;
   `negotiation_outreach.hidden_fees`). Any aggregate published from this obeys
   the n>5 rule and is de-identified.
9. **Limitations & known gaps.** Where coverage is thin, what we don't yet
   measure, and a pointer to `/corrections` for anything we got wrong.
10. **Versioning footer.** "Methodology v1 — last updated YYYY-MM-DD." Change
    this page through `/corrections` when the method changes materially.

### Substantiation (FTC §5)
This page *is* the substantiation for every quantitative claim on the site.

- [ ] **Every public figure traces here.** No range, "families overpay by $X",
  "save $1,500–$3,000", or Index number appears anywhere on the site unless its
  derivation is documented on this page. (Audit the FAQ's "$1,500–$3,000 on
  direct cremation" and "$2,000–$5,000 overpay" claims against a real source or
  reword them as illustrative.)
- [ ] **n>5 + significance gate** enforced in code before any home-level or
  metro-level public claim renders; document the threshold here and match it in
  the data layer.
- [ ] **Current-state honesty.** Until GPLs are collected, the page must say the
  ranges are benchmark-derived and *not yet locally validated* (carry the
  `pricing-data.ts` caveat forward). Do not imply local verification we don't
  have.
- [ ] **Dated & versioned.** "As of" date on the page and on each number;
  changelog via `/corrections`.
- [ ] **Reviewer sign-off.** A named methodology reviewer (→ `/team`) approves
  v1; record who/when. The bible flags a part-time licensed FD / bereavement
  expert as the first hire for exactly this credibility.
- [ ] **Reproducibility note.** Keep an internal doc (not necessarily public)
  sufficient for a third party to recompute a published number — the real test
  of "defensible."

### Schema / JSON-LD
- `WebPage` typed as a methodology/technical article; set `inLanguage`,
  `dateModified`, and `isPartOf` the Organization. Optionally model the Index
  as a `Dataset` once public:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Methodology — how we compute fair-price numbers",
  "url": "https://honestfuneral.co/methodology",
  "dateModified": "2026-06-24",
  "isPartOf": { "@type": "WebSite", "name": "Honest Funeral", "url": "https://honestfuneral.co" }
}
```
```jsonc
// When the Index is published (later), add a Dataset node:
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Honest Funeral Fair-Price Index",
  "description": "Quarterly national + per-metro benchmark of funeral prices.",
  "url": "https://honestfuneral.co/fair-price-index",
  "isAccessibleForFree": true,
  "creator": { "@type": "Organization", "name": "Honest Funeral" },
  "license": "https://honestfuneral.co/methodology",
  "temporalCoverage": "2026/.."
}
```

---

## 4. `/corrections` — public mistakes & corrections log

### Purpose
The GiveWell move (`OPERATING_PLAN.md` §7): a for-profit proves neutrality by
publicly owning its errors. A visible corrections log is the single highest-
trust signal we can build, and it's the page that makes "honest" defensible
rather than a slogan. It also *reduces* FTC §5 exposure: a documented, prompt
correction practice is a mitigating factor for any claim later found imprecise.

### Content outline
1. **Why this page exists** (short lede): *"We will get things wrong. When we
   do, we post it here — what was wrong, when, and what we changed. Track record
   is the only honest proof of neutrality."*
2. **How to report an error** — one email (`corrections@honestfuneral.co` or
   reuse `support@`), what we commit to: acknowledge within X business days,
   post material corrections here.
3. **The log** — reverse-chronological entries. Each entry, a fixed shape:
   - **Date** posted
   - **What was wrong** (the claim/number/page, quoted)
   - **The correct version**
   - **What we changed** (page, code, methodology)
   - **Severity** (typo / data error / claim error) and whether it affected a
     published number
   - **Source** of the catch (us / a reader / a reviewer) — credit external
     catchers.
4. **Scope note** — we log substantive corrections (numbers, factual/legal
   claims, methodology), not routine copy edits; methodology version bumps link
   from `/methodology`.
5. **Empty-state** (at launch): an honest placeholder — *"No corrections yet.
   This page is here on purpose, before we need it."* — not a fake entry.

### Implementation note
MVP-for-one-hospice: a **static, hand-maintained** list (a typed
`CORRECTIONS: Correction[]` array in the page file, like the `FAQ` array
pattern in `app/faq/page.tsx`). No CMS, no DB table. Later: move to a
`corrections` table or MDX if volume grows. Do **not** over-build this.

### Substantiation (FTC §5)
- [ ] **The page's own promise is a claim** — "we acknowledge within X days /
  post material corrections" must be a process we actually run. Pick a number we
  can keep (e.g. 5 business days) and keep it.
- [ ] **No silent edits to published numbers.** If a fair-price figure or Index
  release changes materially after publication, it gets a `/corrections` entry
  *and* a `/methodology` version bump — never a quiet swap. This is the
  discipline that makes guardrail #4 credible.
- [ ] **Accuracy of entries.** Each correction must itself be accurate
  (date, before/after). Ironic but real: the corrections page is the last page
  that can afford a mistake.

### Schema / JSON-LD
- `WebPage` referenced by the Organization's `correctionsPolicy`. Each
  substantive correction to a dated article can additionally carry a
  `CorrectionComment` on that article, but the page itself:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Corrections & mistakes",
  "url": "https://honestfuneral.co/corrections",
  "description": "Every material error we've found or been told about, and what we changed.",
  "isPartOf": { "@type": "Organization", "name": "Honest Funeral", "correctionsPolicy": "https://honestfuneral.co/corrections" }
}
```

---

## 5. `/team` — named team & expert reviewers

### Purpose
E-E-A-T for a YMYL topic (`OPERATING_PLAN.md` §6): funeral pricing is a
"your money or your life" subject, so Google, journalists, and hospice buyers
all want named, credentialed humans behind the content — especially the
reviewer of medical/legal/faith/pricing claims. This page is also where the
first hire (a part-time licensed funeral director / bereavement expert, per
§11) becomes a public trust asset.

### Content outline
1. **Who builds this** — the founder, named, with an honest bio. *Reuse the
   `/about` framing — "a builder, not a funeral director"* — but here, structured
   and credential-forward. Do **not** reintroduce any "built by a licensed
   funeral director" framing (explicitly removed per memory/decisions).
2. **Expert reviewers** — a card per reviewer with **real, verifiable
   credentials**: name, credential (e.g. licensed funeral director, license #
   + state; grief counselor; clergy for faith content; attorney for legal
   review), what they review, and a link out where one exists. This is the
   section that does the heavy E-E-A-T lifting.
3. **What each reviewer signed off on** — map reviewers to content areas:
   pricing/methodology, faith traditions (`lib/faith-traditions.ts` — the
   `FAITH_REVIEW_FINDINGS` work needs clergy sign-off), glossary
   (`lib/glossary.ts`), legal/FTC claims. Be honest where review is *pending*
   rather than claiming sign-off we don't have.
4. **How we choose reviewers / conflicts** — reviewers are not paid by funeral
   homes either; disclose any relationships. Ties back to `/promise`.
5. **Contact** — `legal@` / `support@` for credential or correction queries.

### MVP scope cut
At launch we may have **only the founder** and possibly one paid reviewer. Then
this page must be **honest about that**: list who exists, mark content areas as
"reviewer pending" where true. A `/team` page that invents reviewers is a
guardrail-#4 violation and the worst possible page to fake. Build the structure
(a typed `TEAM` / `REVIEWERS` array) now; fill it as real people sign on.

### Substantiation (FTC §5)
Credentials are material representations of expertise — high scrutiny.

- [ ] **Every credential verifiable.** License numbers, titles, and
  affiliations must be real and current; keep proof on file. A licensed FD's
  state license # should be checkable against the state board.
- [ ] **No implied review that didn't happen.** Only claim a reviewer "reviewed"
  content they actually reviewed; "reviewer pending" everywhere else.
- [ ] **Don't overstate the founder.** No FD/clinical credential the founder
  doesn't hold (consistent with the locked decision to remove FD-builder
  framing).
- [ ] **Conflict disclosure** — affirm reviewers take no funeral-home money or
  disclose any industry tie.
- [ ] **Keep it current** — when a reviewer leaves or a credential lapses,
  update within the same `/corrections` discipline.

### Schema / JSON-LD
- `Organization` with `founder` and `member` `Person` nodes; each reviewer a
  `Person` with `jobTitle`, `hasCredential` (`EducationalOccupationalCredential`),
  and `worksFor`/affiliation. Reviewers can also be referenced as `reviewedBy`
  from individual content pages later.

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Honest Funeral",
  "url": "https://honestfuneral.co",
  "founder": {
    "@type": "Person",
    "name": "Ryan Currie",
    "jobTitle": "Founder",
    "description": "Builder and consumer advocate. Not a licensed funeral director."
  },
  "member": [
    {
      "@type": "Person",
      "name": "<Reviewer name>",
      "jobTitle": "Funeral pricing & methodology reviewer",
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Licensed Funeral Director",
        "recognizedBy": { "@type": "Organization", "name": "<State> Funeral Board" }
      }
    }
  ]
}
```

---

## 6. Build checklist (MVP-for-one-hospice)

Ship order within this spine (each is small; all four are static React pages
using the existing UI kit + `JsonLd`):

- [ ] **`/promise`** first — the canonical no-money page; blocked on
  `PAYMENT_DECOMMISSION.md` landing (can't claim "families pay nothing" while
  $49 is live). Re-point `/faq` "how do you make money" + `/our-role` no-money
  lines here.
- [ ] **`/methodology`** — needed before any savings/Index claim and for the
  hospice pitch; carries the current `pricing-data.ts` caveat honestly. Gate
  the n>5 rule in code in the same change.
- [ ] **`/corrections`** — static `CORRECTIONS` array + honest empty state; wire
  `correctionsPolicy` in the Organization schema.
- [ ] **`/team`** — structure + founder now; reviewer cards as real reviewers
  sign on; never fake a reviewer.
- [ ] **Wiring:** add `/promise` + `/methodology` to `SiteHeader` nav; all four
  to the footer; cross-link from `/our-role`, `/faq`, `/about`. Add
  `publishingPrinciples` / `ownershipFundingInfo` / `correctionsPolicy` to the
  site-wide `Organization` JSON-LD.
- [ ] **Scrub pass (separate but required):** remove every `$49` / "consumer-
  paid" / "refundable in 14 days" line from `/our-role`, `/how-it-works`,
  `/faq`, `/about` so the spine and the rest of the site tell one story
  (tracked in `PAYMENT_DECOMMISSION.md`).

### Explicit scope cuts (do later, not now)
- No CMS / DB tables — static typed arrays for `/corrections` and `/team`.
- No public dataset/API surface on `/methodology` yet — describe the method;
  publish the Index page separately under P4.
- No per-article `reviewedBy` / `CorrectionComment` wiring yet — page-level
  schema only for v1.
- No automated freshness/version stamping — hand-dated "as of" + a manual
  changelog until volume justifies tooling.
