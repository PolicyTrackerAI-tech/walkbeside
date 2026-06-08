# Honest Funeral — AI Strategy

*A buildable plan for turning AI plus proprietary funeral-pricing data into an uncopyable moat. Written for the founder who will ship it.*

> **Before building from §5.2:** verify current Claude model IDs and pricing
> against the live API reference rather than hardcoding from memory. Any faith
> or pricing claim surfaced by AI features must clear the validations in
> `docs/CLAIMS_VALIDATION.md` first. Outreach generation must pass the pre-send
> guard (`lib/negotiation/guard.ts`) shipped this session.

---

## 1. The Thesis: AI + Proprietary Pricing Data Is the Moat

Honest Funeral is not an "AI funeral app." It is a **data-collection machine wearing the clothes of a consumer advocacy product.** Every free tool and every $49 advocacy run exists in part to do one thing: capture a verified, line-item-level price observation tied to a real home, a real zip, a real service type, and — eventually — a real family outcome.

The moat compounds in four layers, each harder to copy than the last:

1. **A clean, deduped, geocoded, ownership-classified directory of ~19,000 US funeral homes.** Anyone can scrape Yellow Pages. Almost no one can keep it clean, know which homes are SCI/Dignity subsidiaries, know which respond to outreach, and know which publish a GPL. This is the table-stakes asset. Build it pre-launch.
2. **Parsed, canonicalized General Price Lists (GPLs).** Funeral homes deliberately use opaque, inconsistent terminology. Mapping "graveside support" / "preparation charge" / "professional staff fee" to a canonical taxonomy is hard domain work. Every GPL we parse makes the next parse better and the per-metro benchmark sharper. **This is where "national-adjusted" benchmarks become "metro-validated" — the single highest-credibility upgrade in the product.**
3. **Quote + reply + outcome data from live negotiations.** When a home replies with a quote, we learn their real pricing, their tone, their responsiveness, and their FTC compliance behavior. When the family signs, we learn ground truth: which home, what final price, how much saved. No competitor can fabricate this without fielding their own outreach network at scale.
4. **The flywheel.** More families → more quotes → tighter metro distributions and richer home reputation profiles → better recommendations and negotiation → better outcomes → more families. The data improves the product, and the improved product collects more data.

Why this is genuinely uncopyable: the funeral industry's own directories have a structural conflict of interest (they serve the homes, not consumers), so they will never publish predatory-pricing intelligence or compliance scores. General-purpose LLM competitors have no proprietary GPL corpus and no live negotiation feed. The data only exists if you do the unglamorous work of collecting and validating it — which is exactly why it's defensible.

**Strategic implication for sequencing:** the data work is not a phase-3 nicety. It is the foundation. Pre-launch we clean the directory and seed launch-metro benchmarks. At launch every family interaction is instrumented to capture provenance. Post-launch the intelligence layer (reputation, anomaly detection, public Fair-Price Index) gets built *on top of data we've been hoarding since day one.* You cannot retrofit data capture; instrument first.

---

## 2. Surface-by-Surface

Effort legend: **S** = days, **M** = 1–3 weeks, **L** = 3+ weeks / multi-component. Phase: pre-launch / launch / post-launch. Moat: how much each item compounds the defensible data asset (Low / Med / High / Core).

### 2.1 Data Ingestion, Cleaning & Normalization

Turning the raw Utah Supabase dump and the future ~19k USA dataset into a clean, deduped, geocoded, enriched directory. **This section is the bedrock — most of it is pre-launch.**

| Idea | What it does | Effort | Phase | Moat |
|---|---|---|---|---|
| **Parsing & extraction from messy home data** | Claude (text + vision) extracts name, address, phone, email, zip from free-text/PDF/OCR junk into structured rows; uncertain fields tagged `[NEEDS_REVIEW]`. Run extraction twice (vision + OCR) and surface conflicts. | S | pre-launch | Med |
| **AI record dedup & entity resolution** | Batch 100–500 homes through Claude to cluster name/phone/address variants ("Smith & Sons" vs "Smith and Sons Service"). Confidence-scored: auto-merge >0.95, human queue <0.85. | M | pre-launch | High |
| **Ownership classification (independent vs SCI/Dignity/Loewen)** | Classify each home as independent / regional / corporate and infer parent company against a curated chain list. Output `{ownership_type, parent_company?, confidence}`. | M | pre-launch | High |
| **Geocoding & service-area inference** | Geocode full addresses via Maps/Mapbox (~$0.005 each); Claude fills plausible missing city/zip; infer `service_radius_miles` (independent ~8mi, SCI ~20mi). Powers accurate /prices-by-zip. | M | pre-launch | Med |
| **Data quality scoring & staleness detection** | Per-home 0–100 score + flags (invalid phone, stale GPL >1yr, closed). Used to prioritize outreach and suppress junk from the public directory. Re-score quarterly. | S | pre-launch | Med |
| **Missing-data inference & cold-start backfill** | For homes with name+city only, pull website/phone from Maps, infer likely email (`office@domain`), store with confidence; `active=false` until verified. Test inferred emails in staging before real outreach. | S | pre-launch | Med |
| **Web scraping & GPL-availability detection** | Detect each home's website, find/flag whether they publish a GPL online. Builds the "which homes are transparent" dataset; pulls published GPLs directly without waiting on outreach. | M | launch | High |
| **GPL parsing & line-item standardization** | Vision + text extraction of GPL line items → map to canonical `LINE_ITEMS` taxonomy with per-item confidence. Flags non-standard bundles/discounts. **The raw material for metro benchmarks.** | M | launch | Core |
| **Automated GPL analysis & outreach routing** | Inbound GPL at `advocate+[id]@honestfuneral.co` → parse → run `priceListAnalysisSystem()` → compare to benchmarks → insert into `negotiation_outreach` → one-line dashboard summary → optional `followUpSystem()` draft. | M | launch | High |
| **Price anomaly detection & regional benchmarking** | Once ~20% of a metro's homes have GPLs, flag line items >25% above median and price inversions. Surfaces "Check This" warnings; only run when n>20 per metro. | M | launch | High |
| **Transparency scoring & FTC compliance check** | Per-home transparency score + compliance signals (GPL published? itemized? state-board complaints?). Badge on /prices (green/yellow/red). **Requires source links + legal review before publishing red flags.** | L | launch | High |
| **Multi-source data validation & conflict resolution** | When data arrives from multiple sources, store all versions in `data_versions` with timestamp+source; Claude picks authoritative value weighted by source reliability (state board > user edit), not just recency. | M | launch | Med |
| **Continuous ingestion pipeline** | Recurring agent scrapes state boards / Maps / listings, detects new + changed homes, runs full enrichment, alerts ops to high-priority changes (e.g. "SCI acquired new SLC home"). | L | launch | High |

**Top picks:** record dedup + entity resolution; GPL parsing & line-item standardization; continuous ingestion pipeline.

### 2.2 Price List & Quote Parsing (Vision + Extraction)

The pipeline from a photographed/forwarded GPL to clean, comparable, canonical line items.

| Idea | What it does | Effort | Phase | Moat |
|---|---|---|---|---|
| **Quote totals audit** | Sum line items vs stated grand total; flag arithmetic mismatches >5% and duplicate/contradictory items ("$350 unaccounted for"). Catches bait-and-switch and tired-family errors. | S | launch | Med |
| **Multi-modal GPL ingestion (vision → structured)** | Upload photo/PDF → base64 → Claude vision → `{items:[{name,cents}], total_cents}`. Page-split + aggregate for multipage PDFs. Store image metadata + confidence in `price_list_uploads`. OCR fallback. | M | launch | High |
| **Canonical line-item mapper** | Reference prompt with all 24 canonical `LINE_ITEMS`; classify each raw item → `{raw_name, canonical_id, confidence, explanation}` in `quote_line_item_matches`. Threshold 75%, flag below for review. | M | launch | Core |
| **Confidence-scored extraction + auto-review flagging** | Second validation pass rates each item high/med/low; <70% items go to `extraction_review_queue` and an ops dashboard. Family sees "✓ Verified" / "⚠ Flagged" badges. AI-vs-human-corrected pairs become a fine-tuning corpus. | M | post-launch | High |
| **Predatory pattern recognition** | Beyond high prices — flag deceptive *formatting* (total-before-items, small-font fees, bundling that hides per-item cost) plus statistical outliers. Learns per-chain layout tricks. | M | post-launch | High |
| **Service-type auto-detection** | Infer which services a home actually offers from its GPL line items (cremation-only vs traditional-capable vs green-burial). Filters home lookups to capable homes. | S | post-launch | Med |
| **Auto-generated follow-up summaries** | `/api/negotiate/[id]/summarize-reply`: parse reply → classify items → identify outliers → draft follow-up via enhanced `followUpSystem()` with FTC language. Family approves before send. | M | post-launch | High |
| **Predatory-item alerting + negotiation scripts** | Per-item "How do I negotiate this?" → data-backed script with FTC cite (e.g. §16 CFR 453.2(b)) and decline language from `faith-traditions.ts whatYouCanDecline`. Tone slider. | M | post-launch | High |
| **Quote comparison explainability** | On `/compare`, Claude writes 2–3 sentences explaining *why* Home B costs more — real service difference vs markup — with an AI-generated disclaimer. | S | post-launch | Med |
| **Historical GPL tracking & price-change detection** | Version GPLs in `funeral_home_gpls`; diff on each upload; flag "basic services +20% in 3 months." Powers "this home raised prices 12% in 6 months" negotiation leverage. | M | post-launch | High |
| **Email attachment auto-ingestion (Resend webhook)** | Resend `email.received` webhook on `advocate+[id]@` → extract attachments → `/api/analyze-price-list` → auto-populate quote → trigger follow-up draft → notify dashboard. Closes the copy/paste loop. | L | post-launch | High |
| **GPL fidelity / FTC-compliance audit** | Checklist of required FTC GPL elements; flag incomplete/fake GPLs ("missing death-certificate fees — ask for the full list"). Lawyer-validated checklist; human override. | M | post-launch | High |
| **Regional fair-price baseline refinement** | Aggregate validated GPLs by zip → median/p25/p75/p95 per line item in `pricing_benchmarks_by_zip`; swap hardcoded ranges for `fairRange(lineItemId, zip)`. Fall back to regional/national when zip n<5. | M | post-launch | Core |

**Top picks:** regional fair-price baseline refinement; multi-modal GPL ingestion; canonical line-item mapper.

### 2.3 Outreach Generation, Negotiation & Reply Handling

AI that writes/personalizes transparent advocate emails per home, runs multi-turn follow-ups, parses inbound replies, escalates. Builds on existing `lib/negotiation/prompts.ts` (`initialEmailSystem/User`, `followUpSystem`, `summarizeQuoteSystem`).

| Idea | What it does | Effort | Phase | Moat |
|---|---|---|---|---|
| **Pre-launch home data cleaning & audit** | Batch the 19k table through Claude for email validity, dedup clusters, chain detection, predicted responsiveness (google_rating proxy). Output CSV for ops sign-off. Catches typos ("funerahome.co"). | S | pre-launch | High |
| **Sensitive-context detection & safeguarding** | Scan `OutreachContext.notes` for suicide/abuse/hardship + deceased PII; warn on triggering metaphors; redact deceased name from subject (use ref number); admin tone checklist. | S | launch | Low (trust) |
| **Multi-turn follow-up generator + FTC compliance checker** | After inbound quote: summarize, compare to `pricing-data.ts` ranges, draft warm follow-up; detect FTC violations (unitemized, bundling-as-required) → escalate with pre-drafted note. Human in loop. | M | launch | High |
| **Automated inbound email parsing & classification** | Webhook/poll on `advocate+[id]@` → Claude extracts itemized quote JSON + classifies (full/partial/decline/auto-reply/spam) + sentiment → updates `negotiation_outreach.status` and `quote_items`. PDF/image fallback to analyzer. | L | launch | High |
| **Real-time quote comparison & recommendation dashboard** | On each new quote recompute best price, per-item fair-range classification, clustering, 2σ outlier flags; Claude narrates "Home A is 12% under fair — likely best; Home B's required-embalming flag is non-compliant." | M | launch | High |
| **Negotiation tone feedback loop** | Classify reply tone (defensive/collaborative/non-responsive) → guide family ("inflexible on bundling — try a phone call"); store classifications for long-term per-home learning. | S | launch | Med |
| **Home profile enrichment & personalization** | Cluster homes (region, price tier, sentiment, compliance); append behavioral tags (responsive, high-margin, non-compliant) after each reply; inflect outreach tone per home. Tags must be **behavioral, not demographic.** | M | post-launch | High |
| **Intelligent scheduling & multi-home coordination** | Model reply-latency curves; time-stagger sends to maximize clustered replies without looking coordinated. Launch = FIFO; post-launch = learned. | M | post-launch | High |
| **Proactive no-reply detection & escalation** | Daily job flags overdue homes; distinguishes likely-no-reply vs spam-filtered (cross-family signal: "2 other families also got no reply — possible email issue"); suggests re-send/call; marks dead emails inactive. | M | post-launch | High |
| **Outreach A/B testing & prompt optimization** | Randomized email variants per cohort; track reply rate by variant/region; meta-prompt refines `initialEmailSystem()` weekly (human-reviewed before deploy). Learns warm-for-small / formal-for-corporate. | M | post-launch | High |
| **Multi-language & accessibility outreach** | Generate outreach in family's language (ES/ZH/KO/VI) with plain-English expansion of jargon. High-value against predatory targeting of immigrant communities. Human review for launch languages. | S | post-launch | Med |
| **Compliance reputation tracking & public report** | Per-home compliance score (itemized GPL? bundling? response time? price consistency) → anonymized regional leaderboard; home self-service dashboard incentivizes compliance. **Legal review required (defamation/endorsement risk).** | M | post-launch | High |
| **Regional fair-price intelligence extraction from quotes** | Every parsed quote → aggregate per zip+line_item → learned local ranges in `regional_pricing_stats` once n≥20. The compounding core asset. Never expose single-home pricing publicly. | M | post-launch | Core |

**Top picks:** regional fair-price intelligence extraction; multi-turn follow-up generator + FTC checker; automated inbound email parsing.

### 2.4 Consumer-Facing AI (Guidance, Obituary, Grief, Concierge)

The empathetic surface families touch directly — and a rich source of how bereaved people actually talk.

| Idea | What it does | Effort | Phase | Moat |
|---|---|---|---|---|
| **Eulogy & tribute co-creator** | `/api/eulogy`: deceased personality + a memory + relationship + tone + length → speaker-ready ~400–600 word eulogy. "Write like a family member, not a journalist; avoid 'lost a battle' unless asked." Multiple versions per session. | S | launch | Med (grief-language corpus) |
| **Tradition-adaptive cheat sheet generator** | Printable per-faith "questions to ask the FH" + decline scripts from `FAITH_TRADITIONS` (`whatToAskTheFH`, `whatYouCanDecline`, `commonPitfalls`). Caches generated PDF; HTML fallback. | S | launch | Med |
| **Smart /decide with conditional follow-ups** | Optional "Tell me more" after the rule-based recommendation; detects genuine ambivalence ("faith says burial, but money is tight") and re-runs with balanced weighting. Must stay sub-2s and skippable. | S | launch | Med |
| **24/7 crisis concierge chat** | Streaming multi-turn chat over the four scenario archetypes; references local laws via zip; keyword-detects crisis (suicidal ideation → escalate to 988 + on-call advocate via Resend). Stored in `concierge_chats`. **Hard-coded state rules override generation; legal review of guidance.** | M | launch | High |
| **Quote comparison narrator** | On `/negotiate/[id]/compare`: 3–4 paragraph plain-English story of the spread, grounded strictly in the matrix + benchmarks; never makes the final choice ("We can't choose for you, but here are the facts"). | S | post-launch | Med |
| **Real-time price negotiation coach** | Collapsible coach panel on `/worksheet`; per line item: classify vs fair range, surface faith-specific decline guidance, generate a soft 2-sentence script. Families flag "worked / FD pushed back." Faith-tradition-matched tone. | M | post-launch | High |
| **Document explainer ("upload a confusing paper")** | `/analyzer/document-explainer`: parse invoices/deeds/insurance/Medicaid letters → plain-English line-by-line + deadlines + predatory-clause flags. Side-by-side view. **"Our interpretation, not legal advice"; flag action items for a lawyer.** | M | post-launch | High |
| **Grief support & coping companion** | Post-funeral check-ins; warm acknowledgment + 2–3 grief-lit coping steps + curated resources (GriefShare, 988). "Companion, NOT therapist." Crisis keywords → escalate. Reviewed by a grief counselor/chaplain. | M | post-launch | Med |
| **Comparative scenario planner ("what if…")** | `/plan/scenarios`: faith + zip + preference → 2–3 cost/time/logistics alternatives with neutral pros/cons, grounded in `FAITH_TRADITIONS`, `phase-detector.ts`, real pricing. Sometimes the priciest option is right. | M | post-launch | Med |
| **Grief milestone prompts & memory keeper** | `/memory-keeper` + scheduled Resend emails at 1wk/1mo/3mo/anniversary with tradition-specific rituals; family logs memories to `memory_entries`. Opt-in only, easy unsubscribe. | M | post-launch | Med |
| **Multi-faith expansion via community feedback** | Mine concierge chats for underrepresented traditions; `/admin/feedback-analyzer` flags gaps ("Moroccan Islamic practice differs from generic Sunni"); founder + clergy author new `FaithTradition` entries. Every new profile clergy-reviewed. | M | post-launch | High |

**Top picks:** 24/7 crisis concierge chat; real-time price negotiation coach; document explainer.

> The obituary helper and negotiation reply analyzer already exist in the codebase; the consumer-facing items here extend that foundation rather than rebuild it.

### 2.5 Pricing Intelligence & Predatory Detection (The Moat Engine)

Where collected GPLs and quotes become defensible per-metro, per-home intelligence. **Most items are post-launch because they need data density — but the capture that feeds them must be live at launch.**

| Idea | What it does | Effort | Phase | Moat |
|---|---|---|---|---|
| **Pre-launch bulk GPL collection & validation harness** | `/admin/bulk-gpl-collector`: import homes, batch-email GPL requests, track open/reply/bounce, parse arrivals, ops validates/rejects/fixes. **Gate go-live on 60%+ of launch-metro homes having validated GPLs.** | L | pre-launch | Core |
| **Predatory line-item detection & alert** | On each quote, score every item 0–100 vs `predatoryAt` threshold + metro 90th percentile + the home's own history (2σ). >80 = ALERT badge; >90 = auto-draft "ask why" prompt. Tight thresholds — false positives kill trust. | M | launch | High |
| **AI-powered GPL parsing & line-item standardization** | `/api/gpl-parse`: vision + semantic mapping to canonical `LINE_ITEMS` with confidence; detect hidden bundles; confirm with family below 70%. Pre-populates `quote_items` so cross-home comparison works. | M | launch | Core |
| **Metro fair-price distribution engine** | Nightly: aggregate all parsed items by metro/zip3 → percentiles (10/25/50/75/90) per line item per service type into `metro_pricing_distributions` with `n_data_points`. Return local percentiles instead of national. Needs 20+ diverse quotes per item per metro. | M | post-launch | Core |
| **Home-level pricing reputation profiles** | Per-home running stats: avg deviation from metro median per item, which items they consistently overprice/undercut, times_quoted. UI: "embalming consistently +$400 (5 quotes)." **Only flag if n>5 and p<0.05; phrase as data, not "greedy."** | M | post-launch | High |
| **Fair-deal scorer & negotiation recommendation engine** | Combine metro deviation + reputation + service baseline + competitive position → 1–10 deal score with transparent breakdown + auto-drafted targeted follow-up. | L | post-launch | High |
| **Trend detection (seasonal & chain patterns)** | Monthly time-series for seasonality and chain price correlation; "same chain is $300 cheaper 45 min away." Chain-coordination detection is **antitrust-adjacent — never imply collusion without evidence.** | L | post-launch | High |
| **AI-driven re-negotiation rounds** | On `replied` with sparse quote, draft a follow-up referencing specific high items vs benchmark; family approves before send; up to 3 rounds in `negotiation_follow_ups`. | M | post-launch | High |
| **Comparative price report (PDF leverage)** | When family has 2+ quotes, generate a downloadable report: their quote vs local/national + per-item fair ranges + bullet talking points + FTC QR link. Watermarked, shareable with the home. | M | post-launch | High |
| **Bring-your-own-quote analysis** | "Already have a quote?" in `/decide`/`/prep` → analyze + home-reputation lookup, no outreach, no fee. Grows benchmark data without $49 friction. Risk: cannibalizing paid advocacy if seen as a perfect substitute. | M | post-launch | High |
| **Real-time pricing anomaly dashboard (internal)** | Admin view of 7-day quote activity, anomalies, pending validations, response patterns via Supabase subscriptions. Admin-only access control. | M | post-launch | Low (ops) |
| **Confidence-weighted public Fair-Price Index** | Public per-metro benchmarks with confidence bands (`high: n>=30`); `/api/public/fair-price-index/[metro]` + HTML page; CC-BY licensed for journalists/regulators. Generates PR, backlinks, regulatory goodwill. Airtight CIs required. | M | post-launch | Core (distribution) |

**Top picks:** metro fair-price distribution engine; home-level pricing reputation profiles; pre-launch bulk GPL collection & validation harness.

### 2.6 Internal Ops, Content Engine & Trust/Safety

The machinery that keeps the AI safe, grounded, cheap, and legally defensible.

| Idea | What it does | Effort | Phase | Moat |
|---|---|---|---|---|
| **Faith content QA harness** | `/admin/faith-qa`: Claude audits `faith-traditions.ts` against curated clergy sources for accuracy, missing citations, `TODO-FD` markers with risk levels. **100% of TODO-FD resolved + clergy-approved pre-launch.** Re-run monthly. *(Already started on this branch.)* | M | pre-launch | Med |
| **Regional data cleaning & enrichment pipeline** | Ingest the full ~19k dataset; normalize names, detect chains, geocode, validate emails/websites, cross-ref state licensing; `funeral_homes` gets `quality_score` (0–100), `parent_chain`, `last_verified_at`. Monthly refresh. | L | pre-launch | Core |
| **PII redaction & audit trail** | Middleware in `/app/api` + `lib/supabase/server` redacts SSN/phone/address/names before storage; logs every redaction; RLS-gated audit page. Context-aware so it doesn't redact zips in benchmarks. | M | launch | Low (trust) |
| **Negotiation email grounding & citation audit** | Second Claude pass extracts every factual/legal claim in a draft email, validates against whitelisted fact-bases (`pricing-data.ts`, `faith-traditions.ts`, regulation DB, FTC Rule); flags ungrounded claims for admin sign-off. | M | launch | High |
| **Funeral home vetting engine** | Pre-outreach fraud/abuse flags: invalid email, FTC actions, license status, price outliers. Auto-flag only on hard signals; human review for complaint-rate; outreach router skips flagged homes unless approved. | L | launch | High |
| **Price list OCR & next-gen analyzer** | Upgrade `analyze-price-list/route.ts`: multipage PDF/image, complex tables, upsell-pattern + percentile flagging, negotiation targets; always show raw JSON for family correction. | M | launch | High |
| **Eval harness (quality & safety)** | Hand-built gold sets (price lists, obituaries, faith claims, email groundedness); run weekly + pre-deploy; `evals` table + regression alerts. **All evals 95%+ before launch.** Add production failures as new cases. | M | launch | Low (enabler) |
| **Claim grounding & hallucination detection** | Generalized pre-send layer: every factual claim labeled supported / plausible-inference / ungrounded / contradictory against whitelisted sources; ungrounded → human review or "we recommend" reframing. | M | launch | Med |
| **AI-powered SEO content engine (city/state pages)** | Generate 800–1200 word local pages (regional pricing + state regs + faith sections + internal links) into pgvector with a human approve gate → ISR revalidate. Seed top 100 metros by hand. **Lawyer-verified regulation fact-base; cite statutes inline.** | M | launch | High |
| **Support triage & FAQ generation** | Classify inbound support → templated answer / human inbox / escalation; auto-draft FAQ entries from novel questions. Never auto-respond to emotional/crisis email. | S | post-launch | Low |
| **Post-funeral analytics copilot** | On close, synthesize homes contacted, quotes, selection, savings, faith-specific outcomes into `analytics_insights`; feeds benchmark refinement + problem-home detection. Internal-only unless family opts in. | M | post-launch | High |
| **Proactive lifecycle messaging** | Phase-aware nudges (next step, missed deadline, post-funeral resources); one message per phase transition; clear opt-out; supportive not sales-y. | S | post-launch | Low |
| **Multi-language content localization** | Translate emails/faith guides/analyzer results (ES/ZH/VI) with **human bilingual review** + curated funeral glossary. | M | post-launch | Low |

**Top picks:** regional data cleaning & enrichment pipeline; post-funeral analytics copilot; AI-powered SEO content engine.

### 2.7 Data Architecture, Capture Strategy & Model/Cost Ops

The plumbing that makes every other surface instrumented, cheap, and retrainable. **Build the foundations pre-launch; you cannot retrofit capture.**

| Idea | What it does | Effort | Phase | Moat |
|---|---|---|---|---|
| **Shared Anthropic client (`lib/claude-ops.ts`)** | Unified wrapper: prompt-cache keys on stable system prompts (~30–40% cost cut after first hit), batch queue for nightly jobs (~50% cheaper), per-feature token/cost tracking, PII-redaction middleware, model-tier selection. | M | pre-launch | Core (enabler) |
| **Model tiering & task-specific selection** | `model_selection_config` mapping task → model/max_tokens/rationale: Haiku for classification, Sonnet for analysis/email/vision, Opus for pre-launch evals. Weekly check: if Haiku error >2%, recommend upgrade. | M | pre-launch | Low (enabler) |
| **PII redaction & retention policy enforcement** | Redact before Claude calls (skip for price-list text where ID isn't needed); encrypt outcome PII at rest; 24-month soft-delete then hard-delete; GDPR/CCPA endpoint; `pii_access_log`. | M | pre-launch | Low (trust) |
| **Operator audit trail & cost anomaly detection** | `operation_audit_log` for every manual edit (price adjust, template override) with delta + reason; cost-spike → check audit log for stray batch jobs. No anonymous changes. | S | pre-launch | Low (trust) |
| **Pre-launch GPL cleaning via Batch API + geo** | Batch-process all available GPLs (~$0.02 each batched) with `priceListAnalysisSystem()` → dedupe items, geocode, seed `pricing_models` with metro benchmarks, flag outliers. Manually review 5% sample. | L | pre-launch | Core |
| **Event-driven quote provenance ledger** | Append-only `events` table: quote_received, manually_entered, verified, home_selected, contract_signed, final_price_reported — each with `source_document_type`, `extraction_method`, `confidence_score`. Ground truth for retraining + benchmark validation. Opt-in + 2yr retention. | M | launch | Core |
| **Price-list extraction confidence + active learning** | Per-item confidence; family confirms low-confidence items (sampled, not all); corrections → `extraction_corrections`; weekly Haiku retrain; track precision/recall per home+region. | M | launch | High |
| **Fair-price benchmark versioning & A/B infra** | `pricing_models` table (version, region, service_type, line_item, ranges, active_at); load active per region; A/B new benchmarks (10/90 split); regional overrides without code change; instant rollback. | L | launch | High |
| **Real-time cost dashboard & feature profitability** | Tag every call with feature/user/negotiation; `api_cost_events`; join to closed negotiations for margin ("close costs $2.14, revenue $49, margin $46.86"); alert if a feature exceeds 10% of expected revenue. | M | launch | Low (ops) |
| **Negotiation email A/B & tone optimization** | `template_id`/`ab_group_id`/`template_version` on outreach; stratified random assignment; track reply rate, completeness, reasonableness, selection; Sonnet generates variants (human-reviewed). | M | post-launch | High |
| **Structured negotiation outcome labels** | `negotiation_outcomes`: chosen home, final price (contract photo/OCR), savings, satisfaction. Ground truth for "validated by actual family outcomes." Incentivize reporting; require contract image; encrypt. | M | post-launch | Core |
| **Home responsiveness & quote-quality scoring** | Per-home computed responsiveness / completeness / fairness from outreach timestamps + quote data + outcomes; surface top-3 and "be cautious" homes per zip. Don't score until n≥10 contacts. | M | post-launch | High |

**Top picks:** shared Anthropic client; event-driven quote provenance ledger; structured negotiation outcome labels.

---

## 3. What Data We Must Capture From Day One

Consolidated from every surface's `dataToCapture`. **The rule: instrument before you build the intelligence. The features in §2.5 and §2.7 only work if these events exist from launch.** Below is a single event/data-capture spec.

### 3.1 Core domain tables (the moat data)

```
funeral_homes
  id, name, parent_chain, ownership_type{independent|regional|corporate},
  email, phone, website, gpl_url, gpl_available,
  address, city, state, zip, zip3, metro, lat, lng,
  service_radius_miles, service_capabilities[],
  quality_score(0-100), transparency_score, ftc_compliance{good|concerns|red_flags},
  responsiveness_score, completeness_score, fairness_score,
  data_source, last_verified_at, last_checked, active

data_versions            -- multi-source conflict history
  home_id, field, value, source, source_reliability, confidence, captured_at

events  (APPEND-ONLY provenance ledger)
  id, negotiation_id, outreach_id, event_type, payload(jsonb), created_at
  event_type ∈ { quote_received, quote_manually_entered, quote_verified,
                 family_selected_home, family_signed_contract, family_reported_final_price,
                 alert_shown, follow_up_sent, redaction_applied }

price_list_uploads / price_list_parses
  id, user_id(nullable for anon BYO), home_id, source_document_type{email|photo|pdf},
  extraction_method{claude_vision|claude_text|manual}, raw_text,
  parsed_items[{raw_name, canonical_id, price_cents, confidence, explanation}],
  total_cents, audit_status, data_quality_score, created_at

extraction_corrections   -- active-learning fine-tune corpus
  parse_id, line_item_id, ai_value, human_value, corrected_by, corrected_at

quote_line_item_matches  -- canonical mapping history
  raw_name, canonical_id, confidence, explanation, home_id

metro_pricing_distributions
  metro, zip3, line_item_id, service_type,
  p10, p25, median, p75, p90, n_data_points, last_updated

funeral_home_pricing_profiles
  home_id, line_item_id, avg_deviation_cents, deviation_stdev, times_quoted,
  flagged_as_outlier, last_analyzed

pricing_models  (versioned benchmark artifact)
  id, version, region, service_type, line_item_id,
  fair_low_cents, fair_high_cents, predatory_at_cents, metadata, active_at

negotiation_flags
  outreach_id, line_item_id, flag_type{predatory_threshold|outlier_percentile|home_pattern},
  score, alert_email_sent

negotiation_outcomes  (GROUND TRUTH)
  negotiation_id, family_chose_home_id, signed_contract_date,
  family_reported_actual_price_cents, savings_cents,
  family_satisfaction_score(1-5), interview_notes
```

### 3.2 Per-event metrics to log (for evals, cost, and model improvement)

- **Extraction:** GPL extraction confidence per item; line-item match accuracy; precision/recall per home + region; quote-totals audit deltas.
- **Outreach:** initial-email reply rate by home/variant/region; time-to-reply by home type + season; tone-classification accuracy; follow-up→negotiation conversion; language preference vs reply rate.
- **Pricing intel:** per-line-item regional variance; price-anomaly true-positive rate; metro benchmark `n_data_points` and adoption; deal-score accuracy vs reported satisfaction; quote volume by source (paid advocate vs bring-your-own).
- **Compliance:** FTC violations detected vs confirmed; transparency-score distribution; GPL fidelity score distribution.
- **Consumer AI:** concierge escalation rate by scenario; negotiation-coach usage + decline-success rate; document-upload types; grief check-in language by tradition; faith-gap detections.
- **Model/cost ops:** model version + feature name on **every** Claude call; tokens in/out + cost; cache-hit rate per feature; cost per closed negotiation vs $49 revenue (margin); eval pass rate per component; grounding coverage (% claims checked / flagged / approved).
- **Ops integrity:** operator audit trail on every manual data change; redaction events; review-queue SLA compliance.

### 3.3 The non-negotiables for day one

1. **Every Claude call is tagged** (feature, model version, tokens, cost, negotiation_id) — via the shared client. Retrofitting attribution is painful.
2. **Every quote is a provenance event**, not just a column update — so outcomes can be tied back to the originating quote.
3. **Every extraction carries a confidence score and method** — so you know which data to trust for benchmarks.
4. **Every benchmark is versioned** — so you can prove "our number was right" and roll back when it isn't.
5. **PII is redacted before storage and before Claude** — established before any real family touches the system.

---

## 4. Phased Build Roadmap

Sequenced by leverage: **data foundations first** (they unlock everything and can't be retrofitted), then a launchable advocacy loop with capture wired in, then the intelligence layer that compounds on accumulated data.

### Phase 0 — Pre-launch: build the asset and the plumbing

*Goal: a clean directory, seeded launch-metro benchmarks, and instrumentation that captures everything from the first real family.*

1. **Shared Anthropic client (`lib/claude-ops.ts`)** — caching, batch queue, cost tracking, PII redaction, model tiering. *Everything downstream depends on it.*
2. **PII redaction + retention + operator audit trail.** Trust foundations live before real data.
3. **Regional data cleaning & enrichment pipeline** — dedup, extraction, ownership classification, geocoding, quality scoring, missing-data backfill over the Utah dump, then the full ~19k. Output: clean `funeral_homes` with `quality_score`.
4. **Pre-launch GPL cleaning via Batch API** + **bulk GPL collection & validation harness.** Seed `pricing_models` / `metro_pricing_distributions` for launch metros. **Go-live gate: 60%+ of launch-metro homes have validated GPLs.**
5. **Faith content QA harness** — resolve 100% of `TODO-FD`, clergy-sign-off. *(Already underway on this branch.)*
6. **Eval harness + gold sets** for analyzer, obituary, email groundedness, faith claims. Pre-launch bar: 95%+.

### Phase 1 — Launch: the advocacy loop, fully instrumented

*Goal: a family can run a $49 advocacy negotiation end-to-end, and every interaction lands as moat data.*

1. **Event-driven quote provenance ledger** + **benchmark versioning/A/B infra.** Capture is live from the first negotiation.
2. **GPL parsing & canonical line-item mapper** + **next-gen OCR analyzer** + **multi-modal vision ingestion** + **quote totals audit.** The parse pipeline.
3. **Automated inbound email parsing & classification** (Resend webhook on `advocate+[id]@`) → **automated GPL analysis & outreach routing.**
4. **Multi-turn follow-up generator + FTC compliance checker** + **negotiation email grounding/citation audit.** Outreach that's safe and sourced.
5. **Real-time quote comparison & recommendation dashboard** + **predatory line-item detection & alert.**
6. **Funeral home vetting engine** (pre-outreach) + **sensitive-context safeguarding.**
7. **24/7 crisis concierge chat** + **eulogy co-creator** + **tradition cheat sheets** + **smart /decide.** The free, trust-building front door.
8. **AI-powered SEO city/state pages** (top 100 metros hand-seeded) — traffic + local credibility.
9. **Web scraping & continuous ingestion pipeline** + **transparency/compliance scoring.** Keep the directory ahead of competitors.
10. **Real-time cost dashboard** + **extraction confidence/active-learning loop.**

### Phase 2 — Post-launch: the intelligence layer (compounds on data)

*Goal: turn accumulated quotes/outcomes into recommendations, reputation, and a public index no one can match.*

1. **Structured negotiation outcome labels** — close the loop with ground-truth savings. *Highest-leverage post-launch item: it validates the entire moat.*
2. **Metro fair-price distribution engine** + **regional fair-price baseline refinement** → swap "national-adjusted" for "metro-validated." The credibility unlock.
3. **Home-level pricing reputation profiles** + **responsiveness/quote-quality scoring** → rank homes per zip.
4. **Fair-deal scorer & recommendation engine** + **AI re-negotiation rounds** + **comparative price report PDF.**
5. **Price anomaly detection, predatory-pattern recognition, historical GPL tracking, trend/chain detection.**
6. **Outreach A/B + email tone optimization** + **home personalization** + **intelligent scheduling** + **no-reply escalation.**
7. **Consumer depth:** negotiation coach, document explainer, scenario planner, grief companion + milestone keeper, comparison narrator, multi-faith expansion, multi-language.
8. **Post-funeral analytics copilot** + **bring-your-own-quote** (free benchmark growth).
9. **Confidence-weighted public Fair-Price Index** — PR, SEO backlinks, regulatory goodwill. The moat goes public *because we update it faster than anyone can copy it.*

**Sequencing logic:** Phase 0 builds the asset and makes capture impossible to skip. Phase 1 ships a real product where every dollar of revenue also buys a data point. Phase 2 spends that accumulated data — and only Phase 2 items that need density (benchmarks, reputation, trends) are deferred there; the *capture* for them is already live from Phase 1.

---

## 5. Foundations

These are cross-cutting and built once, in Phase 0, then reused by every surface.

### 5.1 Shared Claude client — `lib/claude-ops.ts`

Single wrapper around the Anthropic SDK. Every AI call in the codebase goes through it. Responsibilities:

- **Prompt caching** on stable system prompts (the negotiation email template, price-list schema, faith-QA source bundle, obituary system). Cache keys computed from system + first user turn. ~30–40% per-request savings after first hit. *Discipline required: don't tweak cached system prompts mid-flight or you bust the cache.*
- **Batch queue** for non-urgent jobs (nightly directory match, benchmark recompute, bulk GPL parse). ~50% cheaper, ~1-day latency — fine for nightly, not for real-time.
- **Cost tracking** — every call tagged `{feature_name, model, tokens_in, tokens_out, cost_usd, user_id?, negotiation_id?}` → `api_cost_events`.
- **PII redaction middleware** (see 5.4).
- **Model selection** (see 5.2).

### 5.2 Model tiering

`model_selection_config: { task → {model, max_tokens, rationale} }`, in-memory cached:

- **Haiku** — simple classification (service-type detection, reply classification, support triage). Watch error rate; auto-recommend upgrade if >2%.
- **Sonnet** — the workhorse: vision GPL/document parsing, negotiation email generation, quote analysis, concierge chat, eulogy. Vision + reasoning needs Sonnet to disambiguate OCR noise.
- **Opus** — pre-launch eval generation, complex multi-step audits, hardest faith-QA reasoning.
- **Batch + Sonnet** — nightly analytics and bulk GPL backfill.

As Anthropic ships new models, swap via config, re-run evals, no code change. *(Validate the exact current model IDs and pricing against the Claude API reference before wiring — don't hardcode from memory.)* Run eval-driven model selection on a **geographically diverse** sample so the choice isn't Utah-biased.

### 5.3 Eval harness

Hand-built gold sets, versioned: 20 price lists + verified line items + regional classes; 10 obituary inputs + gold outputs; 10 faith assertions + source validations; 10 email drafts + groundedness scores. Run weekly and pre-deploy → `evals` table → regression alerts → incident page on failure. Pre-launch bar: 95%+ per component. Feed every production failure back as a new eval case. Quarterly manual refresh so gold answers don't go stale.

### 5.4 PII & safety

- **Redaction before Claude and before storage:** regex + keyword list + profiles cross-ref for SSN/phone/address/names → placeholders (`[FAMILY_NAME]`, `[ADDRESS]`). **Context-aware** — skip redaction for price-list text (no family ID needed; don't mangle "Smith Funeral Home"), and never redact zips inside pricing benchmarks. Redaction map held in-memory per request, never logged.
- **Retention:** outcome PII encrypted at rest; soft-delete then hard-delete after 24 months; GDPR/CCPA deletion endpoint; `pii_access_log` for every access.
- **Grounding / hallucination layer:** before any factual or legal claim ships to a family or a home, a second Claude pass labels it supported / plausible-inference / ungrounded / contradictory against whitelisted fact-bases only (`pricing-data.ts`, `faith-traditions.ts`, curated regulation DB, FTC Funeral Rule). Ungrounded claims → human review or reframe as "we recommend." **Citations restricted to the whitelist** so Claude can't invent a source.
- **Crisis safety:** concierge + grief surfaces keyword-detect suicidal ideation / medical emergency → hard escalate to 988 and on-call advocate; refuse out-of-scope (medical, clinical mental-health) advice.
- **Hard-coded overrides:** state-specific legal rules (hospital release, embalming opt-out, certificate timing) override model generation — the model never invents law.

### 5.5 Cost discipline

Real-time per-feature margin dashboard from `api_cost_events` joined to closed negotiations. Target intuition from the idea-set: a closed negotiation costs ~$2/negotiation across email + analysis + follow-ups against $49 revenue — healthy. Obituary at ~$0.02/draft but never drives purchase — keep it cheap and as a trust feature, not a cost center. Alert if any feature exceeds 10% of expected revenue (usually a sign of over-regeneration). Caching + batching are the two biggest levers; both live in the shared client.

---

## 6. Risks & Guardrails

| Risk | Where it bites | Guardrail |
|---|---|---|
| **Defamation / reputational liability** | Home reputation profiles, transparency/compliance scores, public Fair-Price Index, predatory flags | Only flag on hard public-record signals; require n>5 and statistical significance (p<0.05) before any "consistently overprices" claim; phrase as data ("based on 5 quotes, embalming +$400"), never "greedy"; keep email/quote logs auditable; **legal review before publishing any home-level red flag or compliance leaderboard.** |
| **Hallucinated facts (prices, laws, sources)** | Concierge, SEO pages, negotiation emails, document explainer, faith claims | Grounding layer + whitelisted-citation-only; hard-coded state legal rules override generation; lawyer-verified regulation fact-base with inline statute cites; "our interpretation, not legal advice" + lawyer-review flags on document explainer; eval harness spot-checks. |
| **Over/under-merging in dedup; false ownership classification** | Directory cleaning | Auto-merge only >0.95 confidence; human queue for <0.85; ownership matched against curated chain list with confidence threshold + borderline manual review. |
| **Bad inferred emails tanking outreach** | Cold-start backfill | Test inferred emails in staging before real sends; use only >0.9 confidence; `active=false` until verified; bounce → drop confidence and re-verify. |
| **False-positive predatory alerts erode trust** | Predatory line-item detection | Tight statistical thresholds; only flag with >20 homes per metro baseline; new homes (no history) excluded from "home-pattern" flags; show the breakdown. |
| **Antitrust-adjacent chain-coordination claims** | Trend detection | Never assert collusion; surface only neutral "same chain cheaper nearby" arbitrage facts; correlation is not evidence. |
| **PII leakage to Claude or in logs** | Every surface | Redaction middleware in shared client; context-aware rules; redaction map never logged; spot-check false negatives. |
| **Tone-deaf grief / emotional automation** | Grief companion, milestone emails, support triage, concierge | "Companion not therapist" framing; opt-in + easy unsubscribe; never auto-respond to emotional/crisis email; reviewed by grief counselor/chaplain; test with real bereaved families before shipping. |
| **Faith inaccuracy offending communities** | Faith content, multi-faith expansion | Curated trusted sources only (never web search); clergy/community-leader approval on every claim and every new tradition; version + audit trail; high-risk claims (disposition, embalming norms) escalated. |
| **Over-aggressive negotiation burning bridges** | Follow-up generator, re-negotiation, negotiation coach, comparative report | Always family-approves before send; soft default tone with optional slider; cap at 3 rounds; scripts ask ("can you clarify?") rather than accuse. |
| **Cannibalizing paid advocacy** | Bring-your-own-quote free analysis | Gate full advocate value (multi-home outreach, FTC-invoking emails) behind the $49; BYO is assessment-only with an upsell to advocate support. |
| **Cost runaway** | All AI calls | Per-feature margin alerts; caching + batching by default; stable cached prompts; operator audit trail to trace cost spikes to stray batch jobs. |
| **Cold-start sparse benchmarks** | Metro distributions, zip-level ranges | Require n≥20 per item per metro (or n≥30 for public "high confidence"); fall back national→regional→zip; always expose sample size to the family. |
| **Privacy expectations on permanent logging** | Provenance ledger, outcome labels | Explicit opt-in toggle at signup; 2-year retention visible upfront; per-record exclusion on request; encrypt outcome prices at rest. |
| **Brittle scraping / format drift** | Continuous ingestion, web GPL detection | Prefer official state-board APIs; Claude adaptive parsing for drift; QA + dedup gate before bulk import; quarterly re-check with `last_checked` timestamps. |

---

### One-line summary

Build the data plumbing and clean the directory **before** launch; instrument every family interaction as provenance from day one; ship a safe, grounded advocacy loop at launch; then spend the accumulated quote-and-outcome data on metro-validated benchmarks, home reputation, and a public Fair-Price Index that competitors can't update as fast as you can — because they don't have the live negotiation feed that only this product collects.
