# Honest Funeral — Funeral Home Data Plan (pre-launch)

Goal: go from "a raw, unsorted dump of Utah homes in Supabase" to a clean,
deduped, geocoded, enriched **national** funeral-home dataset that powers
advocate outreach and seeds the pricing moat. The AI mechanics for each stage
are detailed in `docs/AI_STRATEGY.md` (data-pipeline section) — this doc is the
data shape, sourcing, and sequencing.

---

## 1. Current state

- Table `funeral_homes`, read by `lib/negotiation/directory.ts`.
- Columns in use today: `name`, `email`, `zip`, `active`.
- ~193 Utah homes, raw/unsorted.
- **Scaling problem:** the lookup currently `select`s **all rows** and filters
  by ZIP **in memory**. Fine for 193 rows; it will be slow and wasteful at
  ~19,000. Must move to indexed, ZIP/geo-scoped queries before national launch.

## 2. Target

- ~19,000 active US funeral homes (the rough size of the US market).
- Cleaned, deduped, geocoded, enriched, with a transparency/quality signal.
- Queried by ZIP → nearest N with a valid contact email, fast and indexed.

## 3. Proposed schema (`funeral_homes`)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `name` | text | canonical, title-cased |
| `email` | text | **outreach requires this**; null = not contactable yet |
| `phone` | text | fallback / enrichment |
| `website` | text | enrichment + transparency check |
| `address`, `city`, `state`, `zip` | text | normalized |
| `lat`, `lng` | float8 | geocoded; enables radius queries |
| `service_area_zips` | text[] | optional, inferred |
| `ownership` | enum | independent / corporate (SCI, etc.) / cooperative / unknown |
| `chain_name` | text | when corporate |
| `gpl_available_online` | bool | did we find a published price list? |
| `transparency_score` | int | 0–100, derived (see §7) |
| `data_source` | text | provenance (which dataset/scrape) |
| `confidence` | int | record-quality score from cleaning |
| `active` | bool | open for business |
| `last_verified_at` | timestamptz | freshness |
| `dedupe_key` | text | normalized name+address hash |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `zip`, `(state, city)`, geo index on `(lat,lng)`, partial index on
`active = true AND email IS NOT NULL` (the outreach-eligible set).

## 4. Ingestion & normalization pipeline (stages)

1. **Land raw** — keep every source dump in a `funeral_homes_raw` table, never
   edit in place. Preserve original fields + `data_source`.
2. **Parse & standardize** — addresses (USPS format), phone (E.164), names
   (strip "Inc/LLC", title-case), emails (validate syntax + MX).
3. **Geocode** — address → lat/lng + canonical ZIP. Flag ungeocodable.
4. **Dedupe / entity-resolve** — same home appears across sources with name
   variants. Build `dedupe_key` from normalized name + address; AI-assist the
   fuzzy/ambiguous matches (see AI strategy). Merge, keeping best fields.
5. **Classify** — ownership (independent vs corporate chain), home type.
6. **Enrich** — find website, check for an online GPL, pull phone/email if
   missing.
7. **Score** — `confidence` (record quality) and `transparency_score` (§7).
8. **Promote** — clean rows → `funeral_homes` (the live table) with `active`
   and `last_verified_at` set.
9. **Refresh loop** — re-verify periodically; mark closed homes `active=false`.

## 5. Sourcing the rest of the USA

Candidate sources (verify licensing/ToS for each before use):
- State funeral board licensee lists (public; authoritative; per-state).
- Federal/industry directories and business datasets.
- Web scrape + enrichment to fill email/website where lists lack them
  (email is the gating field for outreach).
- The FTC and consumer datasets for transparency signals.

> The **email address is the bottleneck** — a home with no contactable email
> can't be in advocate outreach. Prioritize sources/enrichment that yield
> verified emails, and track coverage (% of homes with valid email) per state.

## 6. Dedup / entity resolution

- Deterministic first: normalized `dedupe_key` (name+address+zip hash).
- AI-assisted second pass for near-duplicates (e.g. "Smith Mortuary" vs "Smith
  Family Mortuary & Cremation" at the same address). Keep a human-reviewable
  merge log.

## 7. Transparency score (a launch differentiator + the moat seed)

Derive 0–100 per home from signals we can observe:
- Publishes GPL/prices online? (biggest weight — the Funeral Rule encourages it)
- Responds to outreach with a written GPL? (populated post-launch from real
  outreach outcomes — this is where the dataset starts compounding)
- Independent vs corporate (informational, not punitive)
- Completeness of record

Post-launch, **every outreach reply updates this score** — homes that respond
fast with honest itemized quotes rank higher. That feedback loop is the moat.

## 8. Scaling the lookup (code change required)

Replace the load-all-rows approach in `directory.ts` with:
- ZIP-prefix + geo-radius query, `active = true AND email IS NOT NULL`, ordered
  by distance, `LIMIT n`. Use the partial index above.
- Keep the `sample-homes.ts` fallback for dev / empty-table.

## 9. AI's role

The cleaning, dedup, classification, enrichment, GPL-detection, and ongoing
quote-parsing are all AI-assisted — see the **data-pipeline** and **GPL-parsing**
sections of `docs/AI_STRATEGY.md`. The dataset is also what every post-launch
intelligence feature reads from.

## 10. Pre-launch checklist

1. Define the target schema (above) + migration.
2. Build the raw→clean pipeline; run it on the Utah dump first as the test case.
3. Source + ingest national data; measure **email coverage per state**.
4. Geocode + dedupe + enrich; spot-check quality.
5. Swap `directory.ts` to indexed/geo queries.
6. Decide launch states = states with (a) legal clearance (lawyer brief §6) AND
   (b) sufficient email coverage. Gate outreach to those.
7. Stand up the transparency-score feedback loop so it starts learning on day 1.
