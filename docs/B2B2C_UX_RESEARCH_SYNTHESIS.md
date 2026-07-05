# B2B2C UX Research Synthesis — Marketing Site, Product IA, Trust, and the Family Hand-off

**Date:** 2026-07-04
**Inputs:** four research reports — (1) mature B2B AI marketing-site patterns, (2) B2B SaaS logged-in product navigation, (3) trust/proof-grounding patterns, (4) B2B2C buyer/end-user split patterns (healthcare benefits).
**Scope:** Honest Funeral's actual current implementation — `app/page.tsx` (family homepage), `app/partners/page.tsx` (B2B marketing), `app/partners/apply/` (partner apply flow), `app/admin/partners/` (founder approval console), `app/partner/r/[token]/` (partner report + `links/` + `check/`), `components/ReferralCoBrand.tsx`, `lib/referral-codes.ts`.
**Purpose:** permanent reference doc — concrete, file-level recommendations, each traced to a specific research finding. Not a general playbook.

---

## 1. What's already right

Honest Funeral's current build already matches several best practices the research surfaces independently — worth naming so future work doesn't accidentally regress them.

| Current implementation | Matches | Detail |
|---|---|---|
| `components/ReferralCoBrand.tsx` pairs "Provided to you free by {name}" with a hard-coded neutrality pledge in the *same component*, so a partner name can never render without it | **Report 4** — "Employer/hospice identity shown as a soft provenance cue... never as a directory or steering mechanism" | This is stronger than any of the report-4 comparators (Lyra/Spring/Calm/Teladoc) — none of them show a live counter-pledge next to the sponsor name. It's a genuine Honest Funeral improvement on the pattern, not just a match. |
| `ReferralCoBrand` fetches only a `name` from `/api/partner/resolve` and the family is never asked to create an account tied to the hospice | **Report 4** — "the hospice never sees which specific family activated it (aggregate-only reporting)"; also matches the EAP pattern ("employees can contact the EAP directly... preserving privacy of *why* someone is using it") | Matches the strongest privacy pattern found (EAP), not just the median one. |
| `?ref=CODE` on `/plan-now` as the entire activation mechanism — no login, no employer-credential step | **Report 4** — "Single reduced-friction activation artifact (subdomain, code, or QR)... rather than a full co-branded portal per hospice" | Honest Funeral already picked the *lightest* option in report 4's spectrum (URL param) rather than the heavier subdomain-per-employer pattern Lyra uses. Correct call for a lean product — see §4. |
| `app/partner/r/[token]/page.tsx` uses an unguessable bearer token instead of username/password | **Report 4 (implicit)** + **Report 2**'s framing of admin/reporting as a separate surface reached by its own gate | Matches the *separation* principle (report 2 §2/§4: reporting is a distinct surface, gated differently from daily workflow) without needing to build real partner auth — appropriate for a pre-scale partner count. |
| The AI "plain English digest" on the partner report page only summarizes **aggregate** outcomes, never case-level data | **Report 4** — Spring Health: "only 'billing or program engagement data' (i.e., aggregate) flows back"; Duolingo for Schools: "teachers see aggregate progress... not content of mistakes" | Matches the strongest privacy-preserving comparator (Duolingo), not the weaker ones. |
| `app/partners/page.tsx` redesign uses a live-computed demo card and numbered how-it-works | **Report 1** — "proof/metrics get pushed just below the fold," structured sections rather than hero-stuffing | Directionally right shape; see §2 for the gap (the *content* of what's below the fold still needs report-3's rigor). |
| Hard guardrail: never fabricate a number/logo/testimonial | **Report 1**'s own pattern is *built on* real customer counts and logos Honest Funeral doesn't have yet — the guardrail correctly blocks copying the letter of report 1 before Honest Funeral has the underlying proof. See §4. |

---

## 2. Concrete gaps, ranked by leverage

Ranked by (a) how directly it moves an institutional buyer toward paying, (b) how cheap it is to build given current code. Each item names the real file and the specific finding it traces to.

### Gap 1 — `app/partners/page.tsx` has no trust/security section, and the product has no trust page at all
**Finding:** Report 3 — the near-universal trust-page anatomy is compliance badges linking to the *external standard's definition*, named third-party auditors, downloadable artifacts (subprocessor list, data-flow diagram, retention policy), and an FAQ that "answers the skeptical question directly rather than deflecting it." Report 1 independently confirms: "Security/compliance moves from a footer afterthought to a hero-adjacent element... this is the single clearest maturity signal."
**Gap:** `app/partners/page.tsx` currently has a "trust card grid" per the confirmed state, but there's no dedicated `/trust` (or `/partners/security`) page, and the hospice-transmits-zero-PHI claim — Honest Funeral's single strongest, most defensible trust claim — isn't structurally presented the way report 3 prescribes (named mechanism, FAQ-style skeptical answer, artifact).
**Action:** Add a `/trust` page (or a `#trust` section directly in `app/partners/page.tsx`) that does exactly what Honest Funeral can *actually* back up today: state the no-PHI-transmission mechanism concretely ("the hospice hands out a code; Honest Funeral never receives a name, MRN, or admission date — here is the data flow"), include a literal small diagram or numbered data-flow list (family → activation → aggregate-only report back, nothing hospice → platform), and add an FAQ block answering "do you ever see which family used this?" and "what exactly does the hospice see?" directly. This is report 3's cheapest-to-build, highest-credibility move because Honest Funeral's PHI story is *already true* — it just isn't demonstrated the way Harvey/Vanta demonstrate theirs (report 3: "don't just assert a control, show the... evidence stream").
**Do not** add compliance badges (SOC 2, HIPAA seal, ISO) Honest Funeral hasn't earned — see §4.

### Gap 2 — The partner marketing page's ROI numbers need report 3's "methodology-as-content" treatment, not just a bold stat
**Finding:** Report 3 — Harvey's pattern is publishing "the measurement methodology itself as content," triangulating multiple methods, and pairing every named figure with a specific customer and task. The weak failure mode is "a bare percentage next to a logo with no baseline stated." This is explicitly the same shape as Honest Funeral's own guardrail #4 (n>5 + significance + cite methodology).
**Gap:** `app/partners/page.tsx`'s "bold hero stats" and "live-computed demo card" are good structurally (report 1 pattern), but per the confirmed state there's no visible link from a stat to *how it was computed*. Given guardrail #4 is already law here, the product is positioned to do this better than most B2B AI sites, not worse — but only if the methodology is surfaced, not just the number.
**Action:** Every stat on `app/partners/page.tsx` should link or expand to a one-paragraph "how we calculated this" (baseline stated, sample size, what's excluded) — reuse the same discipline that presumably already exists for the Fair-Price Index (`docs/FAIR_PRICE_INDEX.md`) and `/methodology`. Concretely: if the live-computed demo card shows a dollar figure, add a small "see the math" disclosure inline, not buried in a separate methodology page. This turns guardrail #4 from a defensive constraint into the actual marketing asset report 3 says buyers want ("claim exactly what your evidence supports, and show the evidence chain next to the claim so the reader can audit it themselves").

### Gap 3 — `app/admin/partners/` is a single pending/active list; no separation between daily admin workflow and buyer-facing reporting
**Finding:** Report 2 — the dominant pattern across HubSpot/Salesforce/Linear/Asana is three concentric layers: (a) daily workflow nav, (b) a settings/admin layer gated by role, (c) a reporting/analytics layer aimed at the buyer, "either as its own top-level nav item or folded into the admin console." Asana explicitly separates project-level dashboards (contributor) from portfolio dashboards (manager/buyer).
**Gap:** Right now the founder-facing `app/admin/partners/` (a status-pipeline dropdown) and the partner-facing `app/partner/r/[token]/page.tsx` (the report) are the *only* two views — there's no aggregate, cross-partner view for Honest Funeral's own team to see "which hospices are engaging, which are stalling" the way a buyer-side rollup would. This matters at exactly the moment Honest Funeral is trying to convert its first hospice — the founder needs the portfolio view report 2 describes, not just a per-partner status field.
**Action:** This is a *founder-tool* gap, low urgency pre-first-deal, but cheap: add a simple aggregate table/summary at the top of `app/admin/partners/` (counts by status, days-in-pipeline, last-activity) before it's needed for more than a handful of partners. Don't build a separate app or nav layer for this — report 2's own bottom line says the separation is "almost always same app, conditional rendering by permission," full separation is reserved for genuinely different populations. A single admin surface with a summary strip at top is the correctly-scoped version.

### Gap 4 — No named-auditor / falsifiable-mechanism language anywhere in the confirmed copy
**Finding:** Report 3 — "naming the specific auditor/instrument rather than saying 'independently verified'" and "absolute, falsifiable commitments... stated in terms specific enough to be caught in a lie."
**Gap:** Honest Funeral's strongest falsifiable claim is structural, not third-party-audited: "the hospice transmits zero PHI," "family data is private via RLS," "OUTREACH_LIVE kill switch." These are *code-level* guarantees CLAUDE.md itself documents, but report 3's pattern is to state them in exactly the "catch us in a lie" register on the public-facing side, the way Harvey names Schellman/NCC Group/Bishop Fox.
**Action:** On `app/partners/page.tsx` or the new `/trust` page (Gap 1), phrase the no-PHI and no-steering guarantees as falsifiable mechanism statements rather than value statements: not "we protect your patients' privacy" but "Honest Funeral's servers never receive a patient name, MRN, or admission date — the only API call your organization's referral code triggers returns an aggregate count." This is free (no new engineering — it's a copy change) and directly matches report 3's highest-leverage, lowest-cost finding.

### Gap 5 — `app/partners/page.tsx` nav/page structure has no segmentation by buyer type (hospice vs. employer)
**Finding:** Report 1 — "Solutions is consistently segmented two ways simultaneously: by company size and by industry/use case." Report 2 confirms role/segment-based nav is standard once there's more than one buyer type.
**Gap:** CLAUDE.md's own stated roadmap is hospices first, then employers. A single undifferentiated `app/partners/page.tsx` pitching both simultaneously risks the generic-pitch failure report 1 flags in early-stage sites.
**Action — deliberately low priority, sequenced correctly:** do **not** build this now (see §4 — segmented nav is a maturity signal for companies with existing multi-segment proof, and Honest Funeral has zero paying customers of either type yet). Flag it as the natural *next* step once the first hospice deal closes and employer GTM starts: at that point, split the single page into a hospice-first page with an employer variant/toggle, matching report 1's pattern only once there are two real buyer stories to tell. Listed here so it isn't forgotten, not so it's built now.

### Gap 6 — The partner report page's AI digest has no "how we calculated this" attached, and no confidence/sample-size signal
**Finding:** Report 3's core prescription — "documented baseline, explicit attribution method, full cost accounting" — applied directly to `app/partner/r/[token]/page.tsx`'s Claude-generated plain-English digest.
**Gap:** An AI-generated summary of aggregate outcomes is exactly the kind of claim report 3 warns is "the weak version... seen across generic healthcare-AI marketing... a bare percentage... with no baseline stated" if it isn't paired with a stated sample size and method. This is also a **guardrail #4 compliance question** (n>5 + significance before any home-level public claim) — worth double-checking the digest generation logic enforces this the same way the public Fair-Price Index does.
**Action:** Ensure the digest always states its own n (e.g., "based on 14 families this quarter") and never renders a claim below the guardrail's significance floor — if this is already enforced server-side, surface it in the UI copy itself so the partner sees the confidence, not just the founder-side logic. This turns an internal safety rule into the exact trust signal report 3 says buyers respond to.

---

## 3. The B2B2C hand-off mechanism specifically

### How Honest Funeral does it today
- Hospice coordinator hands a family a referral code/link (in person, on paper, or digitally) at admission.
- Family clicks `?ref=CODE` on `/plan-now`.
- `components/ReferralCoBrand.tsx` client-side reads the code (URL param or on-device memory via `readReferral()`), calls `/api/partner/resolve?code=...`, and — only if a name resolves — renders a banner: *"Provided to you free by {name}. Honest Funeral is independent... Your choices are never shared with {name} — they see only anonymous totals."*
- No account creation tied to the hospice. No login. The banner fails silently (`// banner is cosmetic; never surface an error for it`) if resolution fails.

### Comparison against report 4's five comparators

| Company (Report 4) | Activation mechanism | vs. Honest Funeral |
|---|---|---|
| **Lyra Health** | Branded subdomain per employer (`osu.lyrahealth.com`) or self-identify employer on a generic domain | Heavier than Honest Funeral's URL param — requires either DNS/subdomain provisioning per partner or a self-identify step. Honest Funeral's single-param approach is *lighter-weight and correctly scoped* for a pre-scale partner count; building per-hospice subdomains now would be premature infrastructure for zero-to-few partners. |
| **Spring Health** | Employer-sponsored credentials that double as both auth *and* entitlement/tier-unlock in one step; simple reference codes for SSO-less edge cases | This is the closest analog to Honest Funeral's `?ref=CODE`, and confirms the one-step design is correct: "the eligibility check *is* the activation, one step." Honest Funeral already does this — no gap. |
| **Calm for Business** | Unique sign-up link from HR; identifier validates eligibility instantly, unlocks a possibly-pre-existing personal account | Same shape as Honest Funeral. One difference worth noting: Calm explicitly frames itself as "a gateway to employer-sponsored benefits" in *employer-facing* materials — i.e., positions itself as a routing layer. Honest Funeral's `app/partners/page.tsx` could borrow this framing language for the employer-audience variant (see Gap 5, deferred). |
| **Teladoc** | Family/employee explicitly identifies their *employer* (not the insurer) as sponsor; eligibility sometimes printed on the insurance card itself | This is the most literal "provided by" artifact in the research — closest concept to Honest Funeral's banner. Honest Funeral's banner text ("Provided to you free by {name}") is doing the same conceptual work as Teladoc's ID-card co-pay line, just digitally. No gap — already matched. |
| **Duolingo for Schools** | Teacher dashboard *mirrors* the student view but strips to aggregate progress only | Confirms the direction of `app/partner/r/[token]/page.tsx`'s aggregate-only design. No gap. |

### Concrete improvement available
The one real, concrete difference in the research worth adopting: **none of the five comparator companies show the neutrality/privacy pledge *inline with the sponsor name*, the way `ReferralCoBrand` already does** — they assert privacy on a separate trust/FAQ page (report 4 explicitly flags this as a gap in the *other* companies: "none of these companies publish their PHI-firewall mechanics openly; it's asserted, not demonstrated, in public marketing"). Honest Funeral's inline pledge is already ahead of the pattern.

The one thing genuinely missing relative to report 4: **Spring Health's tier-unlock concept** — their login simultaneously reveals *what the family is entitled to* (session count varies by employer contract). Honest Funeral's referral code today only resolves a `name` for the banner; it doesn't yet surface to the family what, if anything, differs about their experience because a specific hospice referred them (beyond the banner). If institutional contracts ever tier by benefit level (e.g., a premium hospice partner unlocks the AI negotiate-flow concierge sooner, or a report gets a dedicated coordinator contact), the `/api/partner/resolve` response and `ReferralCoBrand` are the right place to extend — resolve `{ name, tier? }` rather than just `{ name }` — but only build this when a real tiered-contract need exists; do not speculatively add tiers now.

**Bottom line:** the hand-off mechanism needs no urgent fix. It is, if anything, the most research-aligned part of the current product — matching or exceeding every B2B2C comparator's privacy and friction posture. Effort is better spent on Gaps 1–2 (trust surface, methodology-as-content) where real gaps exist.

---

## 4. What NOT to adopt

Patterns from the mature-company research that would be actively wrong for Honest Funeral right now, given its guardrails and actual scale.

1. **Fabricated or premature customer-count / logo rows (Report 1).** Report 1's credibility formula — "a specific customer count... recognizable enterprise logos... immediately under the hero" — is exactly what CLAUDE.md's hard guardrail forbids ("never fabricate a number/logo/testimonial there's no data for"). Honest Funeral has zero or near-zero paying institutional customers today (90-day goal is *one* hospice). Do not add a "trusted by" logo row or a customer-count stat to `app/partners/page.tsx` until real logos/counts exist — an empty or placeholder version of this pattern is worse than omitting it, because it invites exactly the skepticism report 3 says specificity is supposed to defuse.

2. **Compliance badge rows (SOC 2, ISO 27001, ISO 42001, HIPAA seal) (Reports 1 & 3).** These are "table stakes" per report 1 *for companies that have actually completed the audits*. Honest Funeral's real HIPAA story is structural avoidance (the hospice-transmits-nothing design keeps it out of business-associate territory *by construction*, per CLAUDE.md), not a BAA-backed compliance certification. Displaying a HIPAA badge would misrepresent that design choice as a certification Honest Funeral doesn't hold. Use Gap 1/4's approach instead (explain the mechanism, don't badge it).

3. **Analyst validation citations (Forrester Wave, G2 badges) (Report 1).** These require third-party analyst relationships and review volume Honest Funeral doesn't have. Do not simulate this with self-graded "trusted by families" claims — it's the same fabrication risk as #1.

4. **Deep mega-menu navigation segmented by company size and industry (Report 1) and multi-app/role-switcher IA (Report 2 — Salesforce's App Launcher, ServiceNow's fully separate Agent Workspace vs. Employee Center).** These patterns exist because Vanta/HubSpot/Salesforce serve many buyer types and many internal roles at scale. Honest Funeral today has exactly one buyer type live (hospices) and a handful of surfaces (`apply`, `admin/partners`, `partner/r/[token]` + `links` + `check`). Building a mega-menu or a full app-switcher would be complexity theater — it signals a maturity Honest Funeral hasn't earned and adds navigation cost with no current multi-segment audience to serve. Gap 5 above already defers the *simplest* version of segmentation (hospice vs. employer variants) until there's a second real buyer story — don't skip ahead to report 1/2's enterprise-scale nav depth.

5. **Live continuous-monitoring dashboards showing controls "passing in real time" (Report 3 — Vanta/Drata's own trust pages).** This pattern exists because Vanta/Drata's *product* is compliance monitoring — showing it live is literally demonstrating their own tool. Honest Funeral has no equivalent continuous-control product to showcase; attempting a "live" dashboard here would be decorative, not evidentiary, and risks becoming a maintenance burden or, worse, a stale/fake-looking widget — the opposite of report 3's actual point (evidence must be real to be worth showing).

6. **Institutional, third-person "category-owner" brand voice (Report 1 — "the leading platform," "the #1 Agentic Trust Platform").** CLAUDE.md's locked positioning decision is explicit: "voice is founder-as-builder consumer advocate... not a credential," and the family-facing homepage is deliberately "crisis-sensitive," not institutional. Report 1 itself notes this voice shift is a *late-maturity* signal ("founder/scrappy voice disappears... replaced by institutional third-person") — appropriate only after brand equity is established. Adopting it now on either `app/page.tsx` or `app/partners/page.tsx` would be copying the letter of a mature-company pattern while skipping the market position that earned it.

7. **Employer-branded subdomains per partner (Report 4 — Lyra's `<partner>.lyrahealth.com`).** As noted in §3, this is real infrastructure (DNS, per-tenant theming) suited to a company with many established enterprise contracts. Report 4's own synthesis recommends the *lighter* option for Honest Funeral ("rather than building a whole co-branded site per hospice") — the current `?ref=CODE` + banner approach is the correct scope; don't over-build this ahead of partner count.

---

### Summary table — action priority

| # | Action | File(s) | Effort | Traces to |
|---|---|---|---|---|
| 1 | Add `/trust` page or `#trust` section: state no-PHI mechanism concretely, FAQ format | `app/partners/page.tsx` (new section) or new `app/trust/page.tsx` | Medium | Report 3 (trust-page anatomy), Report 1 (security hero-adjacent) |
| 2 | Attach "how we calculated this" to every stat on the partner marketing page | `app/partners/page.tsx` | Low | Report 3 (methodology-as-content), guardrail #4 |
| 3 | Add an aggregate summary strip to the admin partner list | `app/admin/partners/` | Low | Report 2 (buyer/portfolio reporting layer) |
| 4 | Rephrase privacy claims as falsifiable mechanism statements | `app/partners/page.tsx`, new trust page | Low (copy only) | Report 3 (named-mechanism language) |
| 5 | Segment hospice vs. employer marketing pages | `app/partners/page.tsx` | Deferred until 2nd buyer segment is real | Report 1 (segmented solutions nav) |
| 6 | Surface sample-size/confidence in the AI digest UI | `app/partner/r/[token]/page.tsx` | Low | Report 3 + guardrail #4 |

No changes recommended to `components/ReferralCoBrand.tsx` or the referral-code activation flow itself — it already matches or exceeds every B2B2C comparator pattern found in Report 4.
