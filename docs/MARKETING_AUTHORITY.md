# Marketing as Authority — The Source-of-Truth Playbook

> Operationalizes Part 6 of the [Operating Plan](OPERATING_PLAN.md) ("Marketing: becoming the source of truth"). Marketing here is **not ads — it is authority.** The job is to become the answer Google, ChatGPT, Perplexity, and journalists give when an American asks what a funeral costs. Every play below feeds one of the three engines: **reach** (organic + AI + press), the **data flywheel**, and the **institutional pipeline** (a hospice trusts a brand its families already trust).

> **Guardrail check.** This entire doc lives inside guardrail #2 (free to families) and guardrail #6 (don't rent the flywheel). Two plays touch guardrail #4 (never publish a number we can't defend): the **Fair-Price Index** and any **home-level** claim. Both are gated on n>5 + significance + a public methodology page before publish. Nothing here takes funeral-home or insurer money (#1).

---

## 0. TL;DR — where we are, where the leverage is

We already have a strong L1 SEO build: a national head-term page, an 87-metro city cluster, a 63-term glossary, 40+ guides, valid Article + FAQ schema, a clean sitemap/robots, and dynamic OG images. **The architecture is good. The two things missing are the two things that win the next era of discovery:** (1) a **proprietary, citable statistic** (the Fair-Price Index) that earns AI citations and press backlinks, and (2) the **trust spine** (methodology, pledge, mistakes, named reviewers) that makes a YMYL site authoritative enough to be cited at all. Everything else is incremental.

| Lever | Status | Where it lives | Priority |
|---|---|---|---|
| Topic-cluster SEO (pillars + city + glossary) | **Built, strong** | `app/funeral-costs`, `app/average-funeral-cost`, `app/glossary`, `lib/city-pages.ts` | Maintain + fill gaps |
| Valid schema / JSON-LD | **Built (Article + FAQ)** | `components/seo/ArticleSchema.tsx`, `lib/article-schema.ts`, `app/faq/page.tsx` | Extend (Dataset, Breadcrumb, FAQ on more pages) |
| AI-crawler access | **Built (open by default)** | `app/robots.ts` | Verify + make explicit |
| **Fair-Price Index (citable stat)** | **Not built** | — | **P1 — the single highest-leverage asset** |
| **Trust spine (methodology/pledge/mistakes/reviewers)** | **Not built** | — | **P1 — required for YMYL authority** |
| Owned email list | **Capture built, list not worked** | `EmailCapture` + welcome email (task #16, #17) | P2 |
| PR flywheel | **Not started** | — | P2 (depends on Index) |
| Wikipedia / Wikidata presence | **Not started** | — | P3 |

---

## 1. SEO architecture — the topic-cluster map (built vs. to-build)

The cluster model from Operating Plan Part 6 is mostly real. Here is the actual built map, with gaps called out.

### What's built (verified in the repo)

| Cluster role | Route(s) | Backing data | Notes |
|---|---|---|---|
| **Head term** (pillar) | `/average-funeral-cost` | `lib/pricing-data.ts` (`SERVICE_TOTALS`, `LINE_ITEMS`) | Answer-first; leads with cremation $1,000–$2,500 / burial $8,000–$12,000; tables for service type + overpriced line items |
| **Cluster hub** | `/funeral-costs` | `lib/city-pages.ts` (`CITIES`) | Links all 87 city pages, sorted |
| **Programmatic metros** | `/funeral-costs/[city]` | `CITIES` × `lib/zip-regions.ts` multiplier | **87 cities**; same-state internal-link block; cross-links to `/funeral-homes/[zip]`, `/estate/[state]`, `/rights` |
| **ZIP tool** (interactive) | `/prices` | 917-multiplier `zip-regions.ts` | National coverage, every US zip |
| **Glossary cluster** | `/glossary` + `/glossary/[slug]` | `lib/glossary.ts` (**63 terms**, 8 categories) | In sitemap at priority 0.5 |
| **Reference clusters** | `/estate/[state]` (25 states), `/faith/[key]` (22), `/guidance/[scenario]` (4), `/after/[topic]` (3) | respective libs | Strong supporting depth |
| **Guides hub** | `/guides` | inline `Guide[]` (9 categories) | 40+ guides across right-now / decisions / after / money / estate / grief / vendors / plan-ahead / reference |

84 `page.tsx` routes total; `app/sitemap.ts` emits static + scenario + after + faith + estate + glossary + city routes.

### Gaps & scope cuts

| Gap | Impact | Action | Cut line |
|---|---|---|---|
| City-count copy must match code | actual is **87** (`CITIES.length`); page metadata reads it dynamically | Audit any hard-coded counts in copy/memory | — |
| **Glossary `/glossary/[slug]` pages lack Article schema** | The index page (`app/glossary/page.tsx`) emits **no** `<ArticleSchema>`; term pages are thin for GEO | Add `ArticleSchema` (or `DefinedTerm` schema) to glossary term pages | Don't over-build; one schema add |
| No **breadcrumb** schema anywhere | Loses rich-result breadcrumbs + cluster-structure signal to crawlers | Add `BreadcrumbList` to city + glossary + guide pages | P3 |
| Estate cluster (25 states) ≠ city cluster (87) | Probate guides exist for fewer states than metros | Fill the missing 25 states only if a metro links to a non-existent state guide (the template already guards this with `hasStateGuide`) | Don't write all 50 — fill on demand |
| **No `/funeral-homes/[city-name]` SEO surface** | Directory is `/funeral-homes/[zip]` (vetted-gated); not a discoverable city landing | Defer — directory is gated + thin until more vetted homes | **CUT until vetting volume exists** |
| No comparison/"vs" long-tail (cremation vs burial cost) | High-intent informational queries uncaptured | One pillar sub-article; link from `/average-funeral-cost` | P3 |

**E-E-A-T reality (YMYL):** funeral cost is a Your-Money-or-Your-Life topic. The current author on every Article schema is `Organization: Honest Funeral` (`lib/article-schema.ts`) — **there is no named human author or expert reviewer.** Google's quality guidelines weight named, credentialed authorship heavily for YMYL. This is the **single biggest authority gap**, and it's solved by the trust spine (§4), not by more content.

---

## 2. Generative-Engine Optimization (get cited by AI)

The next discovery surface is the answer box in ChatGPT, Perplexity, Gemini, and Google AI Overviews. We optimize to **be the citation**, not just to rank. Five mechanics, ranked by leverage.

### 2.1 Lead every page with an original statistic — **the #1 driver of AI citations**

LLMs cite pages that contain a specific, attributable number they can quote. Our pages currently lead with *benchmark* numbers (cremation $1,000–$2,500) drawn from `pricing-data.ts` — good, but those are derived, not *ours*. The differentiator is a number **only we have**: the Fair-Price Index (§3, §5).

- [ ] Every pillar opens with one quotable, sourced stat in the first sentence (already true on `/average-funeral-cost`).
- [ ] Once the Index exists, inject the headline stat ("Families in [metro] overpay by $X") into the city template's intro paragraph and the head-term TL;DR.
- [ ] Attribute every stat inline ("according to the Honest Funeral Fair-Price Index, Q3 2026") so the model has a citable source string.

### 2.2 Schema / JSON-LD coverage

We have valid Article (`articleSchema()`) and one FAQPage (`app/faq/page.tsx`). To-build, in order:

| Schema type | Where to add | Why it matters for GEO |
|---|---|---|
| `FAQPage` | head-term, city template, `/how-to-pay`, `/prices` | Q&A pairs are the unit AI assistants extract |
| `Dataset` | the Fair-Price Index page (when built) | Signals a citable, structured data source to crawlers + Google Dataset Search |
| `BreadcrumbList` | city, glossary, guides | Cluster structure → better entity understanding |
| `DefinedTerm` / `DefinedTermSet` | glossary | Makes the glossary a machine-readable terminology source |
| `Speakable` | head-term TL;DR | Voice-assistant eligibility |

The plumbing is trivial — `components/seo/JsonLd.tsx` already safely renders any object; add builder functions in `lib/` alongside `article-schema.ts`.

### 2.3 Answer-first TL;DRs

`/average-funeral-cost` already answers in sentence one — keep that pattern as the template for every new page. Concrete rule: **the first 40 words must contain the number a reader (or model) came for.** Add a visually-distinct "Short answer:" block to the head-term and city pages so extraction is unambiguous.

### 2.4 Allow AI crawlers (and prove it)

`app/robots.ts` uses `userAgent: "*"` with `allow: "/"` and disallows only `/dashboard`, `/login`, `/api/`, `/signup`. **GPTBot, PerplexityBot, ClaudeBot, and Google-Extended are therefore already allowed by default.** This is the correct posture (we *want* to be trained on and cited) — but it's implicit. To make it intentional and durable:

- [ ] Add explicit `allow` rules for `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `CCBot` so a future "block AI" default never silently flips against us.
- [ ] Keep `/dashboard`, `/login`, `/signup`, `/api/` disallowed (no value to crawl; protects family data routes).
- [ ] **Never** gate L1 content behind auth — guardrail #2 also protects GEO: paywalled pages can't be cited.

### 2.5 Freshness

LLMs and Google both favor recently-updated YMYL pages. Today `articleSchema()` defaults `datePublished`/`dateModified` to a static `2026-05-14`, and `sitemap.ts` sets `lastModified: now` on every route on every build (which is noise, not signal).

- [ ] Drive `dateModified` from real content edits (e.g., the quarterly Index refresh bumps every cost page's `dateModified`).
- [ ] Make `sitemap.ts` `lastModified` reflect actual change, not build time.
- [ ] Quarterly Index release = a real freshness event across the whole cost cluster. **This is the freshness flywheel** — one data refresh re-dates hundreds of pages legitimately.

---

## 3. The Fair-Price Index — the asset that makes all of this work

The Index is the keystone. It is simultaneously the **original stat** that earns AI citations (§2.1), the **press event** that earns backlinks (§5), and the **proof of neutrality** that closes hospices. It does not exist yet and is the **#1 marketing build.**

**What it is:** a named, quarterly, methodology-backed benchmark — national + per-metro — with one sharp headline per release ("Families in Salt Lake City overpay by $X for an identical cremation"). The Case-Shiller / FAIR Health move.

**What we already have to seed v1:** `SERVICE_TOTALS` + `LINE_ITEMS` fair-vs-predatory ranges and the 917-entry regional multiplier table. **But these are benchmarks, not measured outcomes** — they can anchor a v0 "fair-price range" page, not a defensible "overpayment Index." A real Index needs the **outcomes data** (listed/quoted/negotiated/paid) from the L2 instrumentation (ROADMAP P1) plus mystery-shopped GPLs.

**Build (lean):**

- [ ] `/fair-price-index` page — free, public (only a public URL gets cited), `Dataset` schema, answer-first headline stat, per-metro table, "as of Q_ 2026" date.
- [ ] `/methodology` page — n>5 + significance rule, taxonomy, data sources, last-updated. **Required by guardrail #4 before any Index number ships.**
- [ ] v0 ships from benchmarks honestly labeled as benchmarks; v1 swaps in real outcomes once n>5 per metro.

**Hard scope cut:** do **not** publish any **single-home** number until n>5 + significance (guardrail #4; also defamation risk per Operating Plan §4). Metro-level aggregates only at launch.

---

## 4. The trust spine — required for YMYL authority

A for-profit site making money claims about death is the highest-scrutiny content category Google has. We currently assert neutrality in prose (`/our-role`, `/how-it-works`, `/faq`) but have **no structured trust pages and no named human reviewers.** Per ROADMAP P2, these are the build:

| Page | Purpose | Authority payoff |
|---|---|---|
| `/no-funeral-home-money` (pledge) | Formalize guardrail #1 as a standing page | The counter-positioning claim, citable |
| `/methodology` | How every number is derived (gates the Index) | Lets journalists + LLMs trust the stats |
| `/mistakes` | Public corrections log (the GiveWell move) | Proof of honesty — uniquely persuasive in a YMYL trust brand |
| Named **reviewers** with credentials | Replace `author: Organization` with a named human + a reviewing funeral director / grief expert | **Directly lifts E-E-A-T** — the biggest single SEO authority gain available |

The reviewer hire is in Operating Plan §11 (part-time FD/bereavement expert). Until then, the founder is the named author and the pledge/methodology/mistakes pages carry the trust load. **One exposed exaggeration undoes the brand** (guardrail #4) — so the mistakes page is a feature, not an admission.

---

## 5. The PR flywheel

Quarterly Index → press → backlinks → AI citations + SEO → traffic → more data → a stronger next Index. This is how a small site out-authorities funded incumbents.

```
  Fair-Price Index (quarterly)  ──►  press pitch (personal-finance / consumer / local desks)
        ▲                                          │
        │                                          ▼
   more outcomes data   ◄──  traffic  ◄──  high-authority backlinks + AI citations
```

| Step | Action | Tie to build |
|---|---|---|
| Trigger | Publish each quarterly Index + an annual national price-disclosure survey | `/fair-price-index` (§3) |
| Pitch | One sharp headline stat per metro; offer the founder as a neutral source | Index headline string |
| Land | Earn `.org`/news backlinks → both SEO and AI-citation authority | feeds §1, §2 |
| Compound | Each release re-dates the cost cluster (freshness, §2.5) and deepens data | feeds §3 next quarter |

**Scope cut:** no paid PR agency, no press until **Index v1 with real numbers** exists. A premature "survey" with thin n is a guardrail-#4 violation waiting to happen. Founder-led pitching only until a raise (Operating Plan §11).

---

## 6. The owned email list (don't depend on rented reach)

Guardrail #6: never rent the whole flywheel. SEO + AI citations are rented (algorithm-dependent). An email list is **owned reach** and a second discovery channel.

- **Built:** `EmailCapture` component + a working welcome email (tasks #16, #17 — the serverless fire-and-forget bug is fixed; prefill from logged-in user is in).
- **To-build:**
  - [ ] A genuine reason to subscribe that serves the family: "we'll send you the next Fair-Price Index for your metro" and "price-list checklist before you walk in."
  - [ ] Light quarterly cadence tied to the Index release (not a nurture-to-sell sequence — guardrail #2 means we're not selling families anything).
  - [ ] Keep CAN-SPAM clean (footers + HMAC unsubscribe already audited, task #14).
- **Scope cut:** no drip campaigns, no lead scoring. The list exists for reach diversification and Index distribution, not consumer monetization.

---

## 7. Wikipedia / Wikidata presence

LLMs and search both lean heavily on Wikipedia/Wikidata as ground truth. Two distinct plays:

- **Wikidata (do this — low effort):** create an entity item for Honest Funeral once notability basics exist (founded date, founder, official site). Machine-readable; helps entity disambiguation in knowledge graphs.
- **Wikipedia (do NOT self-edit):** never create our own article — it gets flagged and backfires. Instead, become a **citable source** *on existing articles* (e.g., "Funeral home", "Cremation in the United States", "FTC Funeral Rule"). The Fair-Price Index, once press-covered, becomes a legitimately citable secondary source an independent editor can add.
- **Scope cut:** Wikipedia is **P3, downstream of the Index + press.** Do nothing here until there's a covered, citable Index — there's no notable claim to anchor on before then.

---

## 8. Don't rent the whole flywheel — diversification scorecard

Guardrail #6 made operational. Reach must come from ≥3 channels so no single algorithm change is existential (risk register, Operating Plan §13).

| Channel | Type | Status | Health rule |
|---|---|---|---|
| Organic SEO | rented | strong build, no traffic data yet | Track in weekly dashboard; never the *only* green channel |
| AI citations | rented | open to crawlers; no original stat yet | Index unlocks this |
| Earned press | earned | not started | Index unlocks this |
| Email list | **owned** | capture built, unworked | Grow deliberately (§6) |
| Institutional distribution | **owned** (contract) | L3 not built | The most durable channel — a hospice handing us to families is reach no algorithm can revoke |

**The tell:** if in any month one channel is >70% of reach, treat it as a red flag and invest in the others — explicitly per the risk register.

---

## 9. Operating cadence & priority

Aligned to Operating Plan §11 (afternoons = content + Index work) and the 90-day sprint. Marketing tasks are ranked by the same test as everything else: does it grow reach, advance an institutional deal, or deepen the data?

**P1 (this month):**
- [ ] Build `/fair-price-index` v0 + `/methodology` (gated, honest-as-benchmarks).
- [ ] Build the trust spine: `/no-funeral-home-money`, `/mistakes`, named author/reviewer on Article schema.
- [ ] Make AI-crawler allows explicit in `app/robots.ts`.

**P2 (weeks 4–8):**
- [ ] Add `FAQPage` schema to head-term + city template + `/how-it-works`; add `Dataset` schema to the Index.
- [ ] Wire `dateModified` to real edits; fix `sitemap.ts` `lastModified`.
- [ ] Work the email list (Index-subscribe reason); first quarterly send.

**P3 (weeks 8–12, post-Index-v1):**
- [ ] First press push on Index v1 → backlinks.
- [ ] Wikidata entity; pursue Wikipedia citations on existing articles.
- [ ] `BreadcrumbList` + glossary `DefinedTerm`/Article schema; comparison long-tail sub-article.

**Explicit cuts (not now):** new metros beyond 87, `/funeral-homes/[city]` SEO pages, all 50 estate guides, drip email, paid PR, any single-home public number. None of these move the keystone (the Index + trust spine), and several risk guardrail #4.

---

## 10. How marketing is measured

Folds into the Operating Plan §10 weekly dashboard — the **Reach** and **Authority** rows:

- **Reach:** organic visitors, tool uses (`/prices`, `/analyzer`), AI/press citations, email subscribers.
- **Authority:** Index releases shipped, press pickups, high-authority backlinks, Wikipedia/Wikidata citations.
- **The one number that matters here:** *is Honest Funeral the answer when you ask ChatGPT/Perplexity "how much does a funeral cost"?* Spot-check the major assistants each Index quarter and log whether we're cited. That is the whole game stated as a single test.
