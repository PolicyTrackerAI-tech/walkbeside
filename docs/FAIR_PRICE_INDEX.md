# Fair-Price Index — Build Spec

> **Status:** spec / build-priority #4 (after outcomes layer, families-free + trust spine, first hospice pilot infra). The Index is the moat's *public face* — the Case-Shiller of funeral pricing, the quarterly press event, and the #1 driver of AI/journalist citations. It is **L1 (free public)** in the [Operating Plan](OPERATING_PLAN.md) three-layer model, but it is the surface where the **L2 outcomes data** becomes visible to the world.
>
> Aligns to [`OPERATING_PLAN.md`](OPERATING_PLAN.md) §4 and [`ROADMAP.md`](ROADMAP.md) P4. Data sourcing lives in [`DATA_PLAN.md`](DATA_PLAN.md). This doc is the *Index-specific* methodology, page spec, and release cadence.

---

## 0. What this is, in one paragraph

The Fair-Price Index is a named, versioned, methodology-backed benchmark of what an honest funeral *should* cost — national and per-metro, by service type and by line item — published on a free public URL, refreshed quarterly, and led every release with one original statistic drawn from our own data ("Families in Salt Lake City overpay by $X on a traditional burial"). It is computed from two inputs: the **GPL price layer** (what homes list) and the **outcomes layer** (what families actually paid after advocacy). The first is scrapeable and a commodity; the second exists nowhere else and is the moat. The Index is the artifact that turns that data into reach, authority, and AI citations — without ever publishing a number we can't defend.

---

## 1. The hard guardrails this spec encodes (non-negotiable)

From [`OPERATING_PLAN.md`](OPERATING_PLAN.md) §14 and the company bible. Every methodology decision below exists to satisfy one of these:

| # | Guardrail | How the Index honors it |
|---|---|---|
| 4 | **Never publish a number we can't defend** | `n > 5` + significance gate on *any* home-level claim; methodology page; freshness timestamps; every figure traces to source records |
| 3 | **Never steer to a specific home** | The Index ranks *metros* and *line items*, never "best home." Home-level data is aggregated; we never publish "Home X is cheapest" |
| 1 | **Never take funeral-home / insurer money** | The Index is free, public, no sponsored placement, no "featured home." This is *why* it's credible |
| 2 | **Never charge the family** | Index + methodology + every tool feeding it stays free |

> **The single most important rule for this doc:** *Honest* is the brand. One exposed exaggeration in a press release undoes the moat. The `n > 5` gate, the significance test, and the "we don't have enough data yet" honesty are features, not limitations — they are the product.

---

## 2. Methodology

### 2.1 The fixed line-item taxonomy (the spine)

Every price record — listed, quoted, negotiated, paid — normalizes onto **one fixed taxonomy**. This already exists in code as `LINE_ITEMS` in [`lib/pricing-data.ts`](../lib/pricing-data.ts) (currently **21 items**; the plan targets **~24** — see gap §6). Each item already carries `fairLow`, `fairHigh`, `predatoryAt`, `required`, `categories`, and a `highMarkup` flag. The taxonomy is the join key between the public benchmark and the outcomes layer.

The 21 line items today (id → name):

| Category | Items |
|---|---|
| Service fees | `basic-services`, `transfer`, `graveside`, `service-facility`, `viewing` |
| Body handling | `embalming`, `body-prep` |
| Transport | `hearse`, `limo` |
| Merchandise | `casket-metal`, `casket-wood`, `cremation-container`, `urn`, `vault`, `headstone` |
| Cemetery | `plot`, `open-close` |
| Admin / extras | `death-cert`, `obituary-newspaper`, `programs`, `flowers-fh` |

**Taxonomy rules:**
- The taxonomy is **frozen per Index version**. Adding/removing a line item bumps the methodology version (`v1` → `v2`) and is disclosed on the methodology page. We never silently re-shape the spine — a journalist comparing two quarters must be comparing the same thing.
- Each line item also rolls into **8 service-type totals** (`SERVICE_TOTALS`): direct-cremation, cremation-with-service, traditional-burial, graveside-burial, green-burial, aquamation, body-donation, memorial-no-body. The Index headline figures are at the *service-total* level (defensible aggregates); the line-item detail is the supporting evidence.

### 2.2 The two data layers feeding the Index

```
                 ┌─────────────────────────────────────────┐
                 │            FAIR-PRICE INDEX               │
                 │   national + per-metro, per service type  │
                 │   + per-line-item "fair vs charged" gap   │
                 └─────────────────────────────────────────┘
                          ▲                      ▲
          PRICE LAYER (commodity)        OUTCOMES LAYER (the moat)
          what homes LIST                what families PAID
          ─────────────────────         ──────────────────────────
          • GPL line items              • negotiations.target_home_estimate_cents (listed)
          • per home → per metro        • negotiation_outreach.quote_cents (quoted)
          • timestamped                 • negotiation_outreach.negotiated_price_cents
          • source: scrape/shop/        • negotiations.amount_paid_cents (paid)
            crowdsource/state           • negotiations.savings_vs_listed_cents (generated)
                                        • negotiation_outreach.hidden_fees (jsonb)
                                        • negotiations.satisfaction_score (1–5)
```

The outcomes columns are **real and already specced** — see [`supabase/migrations/2026-06-22-negotiation-outcomes.sql`](../supabase/migrations/2026-06-22-negotiation-outcomes.sql) (pending PR). The Index's flagship statistics — *savings achieved*, *gap between listed and paid*, *hidden-fee incidence* — come **only** from this layer. The price layer alone can produce a "fair range"; only the outcomes layer can produce "families overpay by $X," which is the headline that gets cited.

### 2.3 How a figure is computed

For each `(metro, service_type)` cell, and within it each `(metro, line_item)` cell:

1. **Gather records** from both layers, normalized to the fixed taxonomy, scoped to the metro (3-digit ZIP prefix via [`lib/zip-regions.ts`](../lib/zip-regions.ts) — 914 prefixes today) and to a freshness window (default trailing 18 months; configurable).
2. **Compute robust central tendency** — use the **median**, not the mean (funeral pricing is right-skewed; one $28k predatory bill shouldn't move the benchmark). Report the median and the interquartile range (IQR / 25th–75th percentile), not a single point.
3. **Compute the gap** — the headline metric is `listed_median − paid_median` (the "overpay gap") and `paid_median` vs our published `fairHigh` benchmark.
4. **Apply the publication gate** (§2.4). If the cell fails, it is **not published as a claim** — it falls back to the modeled benchmark (`fairLow/fairHigh` × `regionMultiplier`) and is labeled `national-adjusted`, *not* as observed data.
5. **Stamp** the cell with `n`, `as_of` date, `data_source` tier, and methodology version.

### 2.4 The publication gate (the `n > 5` rule, made precise)

A cell may be published **as a data-backed claim** only if **all** hold:

- [ ] **n > 5** distinct records (distinct homes for a price claim; distinct *cases* for an outcomes claim). This is the bible's hard floor.
- [ ] **Significance / stability** — the IQR is reported alongside; we do not publish a point estimate without its spread. For any *comparative* claim ("metro A overpays more than metro B"), the medians' bootstrap 95% confidence intervals must not overlap.
- [ ] **No single-home identifiability** — a metro cell with n=6 where 5 records are one corporate chain is *not* publishable as a metro figure (it's really a home figure). Require ≥4 *distinct operators*.
- [ ] **Never a single-home public claim** — we publish metro/national aggregates only. Home-level data stays internal (feeds the [transparency score](DATA_PLAN.md#7), used in advocacy, never published as "Home X charges $Y" in a way that's defamatory).

Cells that fail the gate render as **"Not enough verified data yet"** — and that honesty is on-brand (the GiveWell move). A `data_source` tier label is shown on every figure:

| Tier (`PriceDataSource` in code) | Meaning | Shown as |
|---|---|---|
| `validated` | ≥20 GPL-validated records, gate passed | "Validated against local price lists" |
| `metro-average` | gate passed, 6–19 records | "Based on your metro's collected data" |
| `national-adjusted` | below gate — modeled benchmark only | "Modeled from national benchmarks, adjusted for your region" |

The hook already exists: `dataSourceForZip()` in [`lib/pricing-data.ts`](../lib/pricing-data.ts) returns `national-adjusted` for every ZIP today. The Index makes this function *real* — driven by record counts per metro instead of a hardcoded constant.

### 2.5 Timestamping & freshness

- Every record carries a collection date; every published cell carries an `as_of` (the cutoff of records included) and a `computed_at`.
- Records older than the freshness window (default 18 months) are excluded from *current* figures but retained for trend lines.
- The public page shows "Data as of [Qx YYYY] · next update [Qx+1]." A stale Index is a dead Index — the quarterly cadence (§4) is what keeps it cited.

---

## 3. Data sources & collection

Four channels feed the price layer; the advocacy service feeds the outcomes layer. Full pipeline (land-raw → normalize → geocode → dedupe → classify → enrich → score → promote) is in [`DATA_PLAN.md`](DATA_PLAN.md) §4. Index-relevant summary:

| Channel | What it yields | Index layer | Status today | Owner of "upload" surface |
|---|---|---|---|---|
| **1. Own advocacy** ([`/negotiate`](../app/negotiate)) | Real GPLs + the full outcomes record (listed/quoted/negotiated/paid/hidden-fees/satisfaction) | **Outcomes (the gold)** | Flow exists; outcomes migration pending-PR; `OUTREACH_LIVE` off | `lib/negotiation/send.ts` is the single send point |
| **2. Mystery shopping** | Itemized GPLs by metro (FTC Funeral Rule entitles anyone to request) | Price | Manual / not built | Founder, metro by metro |
| **3. Crowdsourcing** "upload your price list" | GPLs families were handed | Price | **Partial surface exists** — `/analyzer` already does photo + Claude OCR of a quote ("is this fair?"). Needs a *consented "contribute this to the Index"* checkbox + storage | `app/analyzer/Analyzer.tsx` |
| **4. Public state postings** | GPLs from states requiring online disclosure | Price | Not built; scrape + normalize | Pipeline §5 in DATA_PLAN |

> **The collection bottleneck is the same as the dataset's:** the email-contactable home (for advocacy) and the consented upload (for crowdsourcing). For the *first* Index (Utah-only, see §7), channel 1 (the pilot cases you run by hand) + channel 2 (you personally mystery-shopping ~30 SLC homes) are the realistic sources. Channels 3–4 scale it later.

**Crowdsource consent (load-bearing for guardrail #4):** the `/analyzer` upload must gain an explicit, unchecked-by-default "Let Honest Funeral use this price list (anonymized) to improve the public Fair-Price Index" checkbox. Without consent the upload stays private to the family. Contributed GPLs are PII-stripped (no family name, no decedent name — see the existing PII redaction in the AI foundations) before entering the price layer.

---

## 4. The public surface (pages to build)

Two new public routes plus JSON-LD. Build them in the existing Next.js App Router, reusing `SiteHeader`, `Card`, `ArticleSchema`, `ogImage` — the same components the [`/average-funeral-cost`](../app/average-funeral-cost/page.tsx) page already uses.

### 4.1 `/fair-price-index` — the Index page

The hero is **one original statistic** (the GEO/AI-citation driver) above the fold:

```
THE 2026 FAIR-PRICE INDEX
Families overpay by a median of $X,XXX on a traditional burial.
Based on N verified price lists and M advocacy outcomes across K metros.
Data as of Q3 2026 · methodology ↗
```

Sections, in order (answer-first, statistic-led):
1. **The headline number** + the 2–3 supporting stats (overpay gap by service type; hidden-fee incidence rate; median savings achieved through advocacy).
2. **National table** — per service type: fair range (our benchmark), observed median listed, observed median paid, the gap, `n`, `data_source` tier.
3. **By metro** — sortable table linking to each `/funeral-costs/[city]` page (89 city entries exist today). Each metro shows its tier badge; ungated metros show "Modeled" honestly.
4. **By line item** — the "where families overpay most" breakdown, seeded from the `highMarkup` items already flagged in `LINE_ITEMS` (casket, embalming, vault, headstone, flowers-through-home, metal casket).
5. **Methodology link + trust spine** — link to `/methodology`, the no-funeral-home-money pledge, the public mistakes page, named reviewers.
6. **Download / cite** — a "cite this Index" block (suggested citation text + the canonical URL) and a downloadable CSV/JSON of the *aggregate* figures (never home-level). Making it trivially citable is the point.

### 4.2 `/methodology` — the methodology page

The credibility anchor. Must contain, plainly:
- The fixed taxonomy (the ~24 line items) and the 8 service types.
- How figures are computed (median + IQR, §2.3).
- **The publication gate stated in public** — "We do not publish any metro or home figure based on fewer than 6 independent sources, and we never name a single funeral home's price." This sentence *is* the trust.
- The four data sources, with honest current coverage ("Q3 2026: N homes, K metros, M outcomes").
- Freshness policy + version history (`v1`, taxonomy changes).
- What we *don't* claim (no steering, no single-home pricing, modeled vs observed clearly labeled).

### 4.3 Schema / JSON-LD (the AI-citation plumbing)

- `Dataset` + `Article` JSON-LD on `/fair-price-index`; `Article` on `/methodology`.
- Stable, canonical, free public URLs (no auth, no paywall — only a public URL gets cited by journalists, Wikipedia, and LLMs).
- Original-stat-led TL;DR at the top of each page (the #1 driver of AI citations per [`OPERATING_PLAN.md`](OPERATING_PLAN.md) §6).
- Allow AI crawlers in `robots.txt`; submit to sitemap.
- OG image with the headline number (reuse `lib/og.ts`).

---

## 5. Quarterly release & PR cadence

The Index is a **recurring press event**, not a static page. This is the Case-Shiller mechanic — the same name, every quarter, with a fresh number.

**Per-quarter checklist:**

- [ ] **Cut the data** — recompute all cells with records through the quarter's cutoff; re-run the publication gate; diff vs last quarter.
- [ ] **Find the headline** — the sharpest *defensible* stat (biggest overpay gap, fastest-rising line item, highest-savings metro). Must pass the gate; must be one sentence.
- [ ] **Internal defensibility review** — for the headline + every number in the press release, confirm: `n`, the source records, the significance test, and "could a funeral-home lawyer challenge this?" If yes, soften or drop. *This review is mandatory before any release.*
- [ ] **Update the pages** — bump version, update `as_of`, regenerate OG image, update the CSV/JSON download, update methodology version history.
- [ ] **Write the release** — answer-first, stat-led, with the methodology link. Reframe to "On the family's side. Always."
- [ ] **Pitch** — personal-finance / consumer / local desks (per [`OPERATING_PLAN.md`](OPERATING_PLAN.md) §6 PR flywheel). For early Utah-only Indexes, pitch *local* (SLC Tribune, local TV) before national.
- [ ] **Annual companion** — once a year, the national **price-disclosure survey** (% of homes posting prices online — the FTC-relevant stat) as a second, bigger press beat.

**Flywheel:** Index → press → high-authority backlinks → SEO + AI citations → traffic → more crowdsourced GPLs + more advocacy cases → deeper data → a stronger next Index. The cadence is what compounds it.

**Cadence guardrail:** don't release before the gate is satisfiable. A first Index on n=8 SLC cases that says "*early data from our first 8 advocacy cases*" honestly is fine; a national Index implying a dataset we don't have is the unrecoverable mistake.

---

## 6. What exists today vs. the gap to a real Index

### Exists (build from these):

| Asset | File | What it gives the Index |
|---|---|---|
| Line-item taxonomy (21 items, fair/predatory thresholds, markup flags) | [`lib/pricing-data.ts`](../lib/pricing-data.ts) | The frozen spine + the modeled benchmark + classify logic |
| 8 service-type totals | `SERVICE_TOTALS` in same file | The headline aggregate level |
| Regional multipliers (914 ZIP-prefix metros) | [`lib/zip-regions.ts`](../lib/zip-regions.ts) | Per-metro scoping + COLA adjustment |
| Data-source tiering hook | `dataSourceForZip()`, `PriceDataSource`, `DATA_SOURCE_LABEL` | The honest "validated vs modeled" labeling — currently hardcoded to `national-adjusted` |
| Programmatic metro pages (89 cities) | [`app/funeral-costs/[city]/page.tsx`](../app/funeral-costs/[city]/page.tsx) + `lib/city-pages.ts` | The per-metro landing pages the Index links into |
| Head-term page (proves the page pattern) | [`app/average-funeral-cost/page.tsx`](../app/average-funeral-cost/page.tsx) | Template for the Index page (components, schema, OG) |
| Crowdsource entry point | [`app/analyzer/Analyzer.tsx`](../app/analyzer) | Photo + Claude OCR of a quote — needs a consent-to-contribute checkbox |
| Outcomes columns | [`supabase/migrations/2026-06-22-negotiation-outcomes.sql`](../supabase/migrations/2026-06-22-negotiation-outcomes.sql) | listed/quoted/negotiated/paid/hidden-fees/satisfaction/`savings_vs_listed_cents` — the headline-stat source |

### The gap (what's missing):

| Gap | Why it matters | Where it lands |
|---|---|---|
| **No collected price records** — `LINE_ITEMS` values are *national modeled estimates*, "not yet validated against launch-market GPLs" (the file says so) | The Index needs *observed* data, not our own estimates, or the headline isn't defensible | Channels 1–2 (advocacy + mystery shopping); a `price_records` table |
| **Outcomes migration not applied** (pending PR, `OUTREACH_LIVE` off) | No outcomes = no "families overpay by $X" headline | Roadmap P1 — apply it; it's the prerequisite |
| **No aggregation job** — nothing computes median/IQR/gate per cell | The Index is a computation over records; this is the core build | New: a server job/route that reads both layers → writes an `index_cells` snapshot per quarter |
| **`dataSourceForZip()` is hardcoded** | Tiering must be data-driven (record counts per metro) | Replace the constant with a per-metro count lookup |
| **No Index / methodology pages** | The public surface itself | §4 — two new routes |
| **No consent-to-contribute on `/analyzer`** | Guardrail #4 — can't use uploads without consent | Add checkbox + PII strip + storage |
| **Taxonomy is 21, plan says ~24** | Minor — completeness | Consider adding: cremation fee (distinct from container), refrigeration/shelter of remains, online/permit filing fees |
| **`directory.ts` loads all rows in memory** | Scaling concern for the *home* side at national volume (see [`DATA_PLAN.md`](DATA_PLAN.md) §8) | Indexed ZIP/geo queries — orthogonal but related |

---

## 7. Scope cuts — MVP-for-one-hospice vs. later

The 90-day goal is **one hospice paying**, not a national Index. The first Index exists to be *proof and press for the Utah pilot*, not a finished product. Cut hard:

### MVP (the first Index — Utah-only, hand-computed is acceptable)
- [ ] **One metro: Salt Lake City** (the pilot ICP region — [`OPERATING_PLAN.md`](OPERATING_PLAN.md) §5).
- [ ] **Data:** the handful of pilot advocacy outcomes (channel 1) + ~30 founder-mystery-shopped SLC GPLs (channel 2). If the gate (n>5) isn't met for a service type, **say so** — "early data from our first N cases."
- [ ] **Computation can be a spreadsheet/script**, not a live aggregation job. The number must be *correct and defensible*, not *automated*.
- [ ] **One public page** (`/fair-price-index`) + **one methodology page**, original-stat-led, schema-marked, free URL. Reuse the `/average-funeral-cost` template wholesale.
- [ ] **Consent checkbox on `/analyzer`** so crowdsourcing starts compounding from day one (cheap; do it now).
- [ ] **One headline, defensibility-reviewed**, pitched to *local* press alongside the pilot results.
- [ ] Honest tiering: every figure labeled `metro-average` (collected) or `national-adjusted` (modeled). No figure implied as more solid than it is.

### Later (after the first paid contract / more metros / a raise)
- [ ] Live aggregation job + `index_cells` snapshot table; data-driven `dataSourceForZip()`.
- [ ] Multi-metro, then national rollup; per-line-item breakdown across metros.
- [ ] Trend lines (quarter-over-quarter) once ≥2 quarters of data exist.
- [ ] Channels 3 (crowdsource at volume) + 4 (state-posting scrape) as primary feeders.
- [ ] Downloadable aggregate CSV/JSON + a "cite this" block + Wikipedia/Wikidata presence.
- [ ] The annual national **price-disclosure survey** as a second press beat.
- [ ] Bootstrap-strap-replacement of the modeled `LINE_ITEMS` benchmarks with observed medians as coverage crosses the gate per metro.

### Explicitly **not** in any version (guardrail violations)
- ❌ Any "cheapest home" / home-level public ranking (guardrail #3).
- ❌ Any sponsored, featured, or paid placement (guardrail #1).
- ❌ Any metro figure below n>5 published as fact (guardrail #4).
- ❌ Any paywall on the Index or methodology (guardrail #2).
- ❌ Naming a single home's price in a way a lawyer could call defamatory (§2.4).

---

## 8. Acceptance criteria for "the Index is real"

The Index has crossed from "our estimates dressed up" to "a defensible benchmark" when:

1. Every published figure traces to ≥6 independent source records and passes the significance check.
2. The headline statistic comes from the **outcomes layer** (real families, real savings), not the modeled `LINE_ITEMS` benchmarks.
3. `dataSourceForZip()` is data-driven, and at least one metro reads `metro-average` or `validated` from *collected* records.
4. The `/methodology` page lets an adversarial journalist reproduce our logic and find no number we can't defend.
5. It shipped on a free, schema-marked public URL and got cited at least once (press, backlink, or LLM answer) — the only external proof the flywheel turns.

---

_Companion docs: [`OPERATING_PLAN.md`](OPERATING_PLAN.md) (the bible, §4 + §14), [`ROADMAP.md`](ROADMAP.md) (P4), [`DATA_PLAN.md`](DATA_PLAN.md) (the pipeline + transparency score). Code anchors: `lib/pricing-data.ts`, `lib/zip-regions.ts`, `lib/city-pages.ts`, `app/average-funeral-cost/`, `app/funeral-costs/[city]/`, `app/analyzer/`, `supabase/migrations/2026-06-22-negotiation-outcomes.sql`._
