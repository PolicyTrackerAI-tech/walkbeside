# Site Audit 2026-07 — Findings Ledger

Append-only. Every finding gets one row. Status flows LEAD → CONFIRMED / REJECTED →
FIXED / QUEUED / PARKED / KILLED. Severity: **P0** live safety/legal/privacy exposure ·
**P1** broken or dishonest functionality a real user can hit · **P2** misalignment/value
drag · **P3** polish. Criterion: **C**ontent / **F**unctionality / **U**se / **V**alue.

Rows below are pre-seeded from the 2026-07-27 mapping pass (main @ `c47a6a0`). Everything
is a LEAD until its audit day verifies it live.

## P0 candidates — verify first

| ID | Day | Sev | Crit | Finding | Status |
|---|---|---|---|---|---|
| A1-01 | A1 | P0 | F | `ADMIN_EMAILS` unset in prod would make EVERY logged-in user admin (`lib/admin.ts:34` permissive default; `lib/env.ts` only enforced under `OUTREACH_LIVE=true`, off). **FIXED (code): prod now fails closed** — unset allowlist denies everyone; dev stays permissive; test pins both branches; boot warning added. **FOUNDER: set `ADMIN_EMAILS` in Vercel before merge** (else team loses /admin). | FIXED + FOUNDER |
| A1-02 | A1 | P0 | F | `/funeral-home-opt-out` performed the `active=false` write on GET render — mail-scanner prefetch of the tokenized link could deactivate homes before a human clicked. **FIXED: confirm-button POST (server action); GET only validates + renders.** No live links exist yet (OUTREACH_LIVE never on). | FIXED |
| A1-03 | A1 | P1 | F | `/preferences/[id]` unsubscribe applied on GET via service role. **Downgraded P0→P1:** the anniversary email embeds the bare `/preferences/[id]` URL (verified `cron/anniversary/route.ts:149`), NOT `?action=unsubscribe`, so the email link never silently unsubscribed. **FIXED anyway: converted to POST server action.** The uuid-as-capability SMS-number concern (`/api/preferences/sms`) is a separate design tradeoff → A4. | FIXED |
| A2-01 | A2 | P0 | C/U | Negotiate flow completable by a real family today with "we're contacting funeral homes / most reply within 24 hours" while OUTREACH_LIVE is off — rows record `dry_run`, nothing sends, and the status page prints the literal string `dry_run` (status/page.tsx:521-527). Promoted from homepage, dashboard, analyzer, /prices, nurture email. | LEAD |
| A8-01 | A8 | P0 | C | `/privacy` dated April 2026 — predates the B2B2C pivot; zero mention of institutional partners, referral attribution, or aggregate de-identified partner reporting (grep-confirmed). The pilot's data flow is undisclosed in the governing document. | LEAD |

## P1 — broken or dishonest, user-reachable

| ID | Day | Sev | Crit | Finding | Status |
|---|---|---|---|---|---|
| A1-04 | A1 | P1 | F | `/api/share/create`: anonymous, NO rate limit, 100KB payloads; `ResumeClient` hydrated EVERY payload key into sessionStorage. **FIXED: 5/hr/IP rate limit + `/resume/[id]` hydrates only `SHARE_KEYS` (extracted to `lib/share-keys.ts`, which had already drifted between two copies).** | FIXED |
| A1-05 | A1 | P2 | F | `/og` renders arbitrary query text under the brand mark — anyone can mint official-looking cards. **Downgraded P1→P2 (brand-abuse, not data breach).** Fix = sign OG URLs (helper + reject unsigned), touches all metadata call sites → decision + A6. | QUEUE |
| A1-06 | A1 | P1 | F | `UNSUBSCRIBE_SECRET ?? "fallback-please-set"` at 4 token sites (nurture-email.ts, negotiation/email-body.ts) = forgeable tokens. **FIXED: `lib/unsubscribe-secret.ts` prefers the env var, else derives a high-entropy secret from the service-role key (always set in prod); literal is dev-only.** | FIXED |
| A1-07 | A1 | P1 | F | `/api/family/digest` + `/api/planning/signup`: anonymous endpoints that email arbitrary addresses (digest carries attacker text in titles); per-instance in-memory rate limits are the only brake; domain reputation risk. Verify limits + consider origin checks. | LEAD |
| A2-02 | A2 | P1 | C | "Reach out to N homes" (9/14/20) in the wizard is template fiction from `sample-homes.ts` `homesForRadius` — contradicts intro's "3–5" and the actual vetted count (possibly 0). | LEAD |
| A2-03 | A2 | P1 | C | /how-it-works: "Sent from advocate@honestfuneral.co" vs code default `arrangements@` (email-body.ts:116) unless OUTREACH_FROM overrides in prod. | LEAD |
| A2-04 | A2 | P1 | C | Closed page claims "We've let the home you chose know" even on the `no_quote` path where `notifyChosenHome` sends nothing; "we'll loop you in once a slot is set" has no mechanism. | LEAD |
| A2-05 | A2 | P1 | C | Message relay stores family messages as sent-looking thread items when paused ("stored but not sent" — no visual distinction); family believes the home received it. | LEAD |
| A2-06 | A2 | P1 | C | Present-tense "funded by the institutions we partner with" on /tell-your-hospice + /for-funeral-homes with zero paying institutions; /our-role claims operational features (messaging thread, meeting scheduling) never exercised by a real case. | LEAD |
| A3-01 | A3 | P1 | C | "Typical overcharge $2,000–$5,000" — most-repeated number on the site (homepage ×3, /partners, /employers, nurture) — uncited anywhere; guardrail #4's most exposed claim. | LEAD |
| A3-02 | A3 | P1 | C | /prices displays zip-ADJUSTED fair ranges beside UNadjusted national predatory thresholds; analyzer adjusts predatoryAt by region — the two tools can rate the same quote differently. | LEAD |
| A3-03 | A3 | P1 | C | Cross-surface contradictions: casket savings 40–70% vs 50–80%; price variation "3–10×" vs "3×"; certificates 10–15 vs 5–10 vs 3; probate "10 states" vs 25; "1.7M receive hospice" vs "1.7M die in hospice = half of US deaths". | LEAD |
| A4-01 | A4 | P1 | V | Outcomes capture has ONE mouth: the closed page, reachable only via choose-a-home (never run live). Abandon / independent-arrangement / no_homes paths are never asked → the moat's data funnel is nearly closed. | LEAD |
| A4-02 | A4 | P1 | V | Anonymous analyzer checks (the default; tool never prompts sign-in) persist nothing — the wedge's data job depends on a sign-in funnel the page doesn't push. | LEAD |
| A4-03 | A4 | P1 | F | Phase-detector reads `honestfuneral.*` keys but /decide writes `hf-decide:*` — decide signal can never fire; `PhaseGating` has zero consumers (dead chain mounted in layout). | LEAD |
| A5-01 | A5 | P1 | C | /partners still carries the CAHPS / "Medicare Annual Payment Update" pitch card — the retired framing the market-research law bans and PR #167 replaced with referral-reputation. Only live sales surface with it. | LEAD |
| A5-02 | A5 | P1 | F | Pause split: token pages (`lib/partner-auth.ts`) gate only on `active`; session portal also parks `status` paused/archived — a status-paused partner keeps full token access (report, links, check). | LEAD |
| A5-03 | A5 | P1 | U | Token surface has no /materials twin — a coordinator with only the quick link cannot print the kit without a sign-in seat; first pilot friction. | LEAD |
| A6-01 | A6 | P1 | U | `/analyzer` — the wedge product — absent from sitemap AND near-empty metadata (no description, no OG, no canonical) while ~140 glossary pages got full treatment. | LEAD |
| A6-02 | A6 | P1 | U | Measurement unproven: GSC verification + Vercel Analytics are env/dashboard toggles invisible to the repo — reach may be entirely unmeasured. | LEAD |
| A10-01 | A10 | P1 | F | No CI exists (no .github dir) — 638 tests, typecheck, lint, build, guardrail greps run only when a human remembers. | LEAD |
| A10-02 | A10 | P1 | F | Guardrail code without tripwires: vetted-gate `.eq("vetted", true)` unasserted (fake ignores eq args); consent WRITE path (declined-never-persists) untested; `resolvePartnerToken` untested; `OUTREACH_NOTIFICATIONS_ENABLED` untested; no single-send-path architecture test (3 gated sites, convention only). | LEAD |
| A10-03 | A10 | P1 | F | Vision extractor (`extract-price-list-image`) — the photo-snap wedge's first impression — has zero eval fixtures; `inbound-quote-parse` also uneval'd AND sends raw FD reply bodies to Claude unredacted (undocumented exception). | LEAD |

## P2 — misalignment / value drag

| ID | Day | Sev | Crit | Finding | Status |
|---|---|---|---|---|---|
| A2-07 | A2 | P2 | C | /decide "Nothing is saved" vs sessionStorage persistence read by other pages; "as many as nine homes" claims; decide savings claim needs methodology trace. | LEAD |
| A3-04 | A3 | P2 | C | /average-funeral-cost titled "2026 averages" over fair-price BANDS; "save more than a year of groceries"; "required minimum" phrasing on zip pages; hardcoded prose numbers drift from LINE_ITEMS. | LEAD |
| A3-05 | A3 | P2 | C | Citation verification set: 42 CFR 418.64 "13 months/unfunded", 16 CFR 453.3(e)/(f) paraphrases, CFA "up to 50%", Fed SHED 40%/$400, "60% die without a will", CDC 135-per-suicide, "~10% complicated grief", headstone 30–60%. | LEAD |
| A3-06 | A3 | P2 | C | /methodology promises every catalog change is logged on /corrections — verify the 2026-06-26 Wave-1 changes actually appear there. | LEAD |
| A4-04 | A4 | P2 | F | Compare-quotes: silent slot drop when one of three quotes fails; one persisted row per quote per click (near-duplicate benchmark feed rows); /family SHARE_KEYS omits plan-now + worksheet. | LEAD |
| A4-05 | A4 | P2 | F | Analyzer silent degradation: naiveExtract regex takeover is invisible to the family (extractionMethod exposed only on dev eval runs). | LEAD |
| A5-04 | A5 | P2 | F | /admin/outcomes headline numbers have no is_test exclusion; demo orgs share prod tables with only DEMO_ORG_MARKER separating them; `partner_leads.handled_at` has no write path (perpetual re-triage); approve seats contact_email verbatim, no confirmation. | LEAD |
| A5-05 | A5 | P2 | C | `codesWithClaims` (negotiations only) vs report `priceListChecks` show contradictory activity numbers for the same partner. | LEAD |
| A6-03 | A6 | P2 | U | Sitemap gaps: /rights, /our-role, /next-30-days, /tell-your-hospice, /eulogy missing; /briefing (localStorage-empty to crawlers) and /after redirect stub present; `lastModified: new Date()` everywhere. Robots: /api/ disallow blocks the advertised Dataset DataDownload URLs; /signup fossil. | LEAD |
| A6-04 | A6 | P2 | U | 87-city ISR cluster emits no canonicals; /funeral-homes/[zip] = unbounded ~100k thin-page space, indexable, no canonical/noindex, titles promise prices but page lists no homes. | LEAD |
| A6-05 | A6 | P2 | C | article-schema hardcodes datePublished 2026-05-14 across ~23 pages; Dataset license→/methodology; JSON-LD raw-script escape bypass on /fair-price-index; OG tagline predates checker-first positioning. | LEAD |
| A7-01 | A7 | P2 | C | Never-executed human-review gates shipped live: sensitive-grief redline (suicide/overdose/child pages say "Sister to redline" — reviewer model retired) and faith clergy sign-off (pending since 2026-05-21; /admin/faith-qa access model conflicts + localStorage-only state). Decide: commission or formally accept. | LEAD |
| A7-02 | A7 | P2 | U | Planning trio: /plan-now vs /planning vs /plan-ahead — one job, three pages, drifting duplicate copy, colliding footer labels, /where routes to the weakest, guides hub omits the newest. Merge decision. | LEAD |
| A7-03 | A7 | P2 | C | /headstone-vendors claims "vetted monument companies" while lib/cemetery-vendors.ts says re-verification never happened (ftcVerified never set); 18 vendors ≠ "serving your area". | LEAD |
| A8-02 | A8 | P2 | C | /terms arbitration TODO unresolved ("do not change without legal sign-off"); PRIVACY_RETENTION.md omits all post-pivot data classes; LAWYER_OUTREACH four weeks stale; entity LLC-vs-C-corp drift. | LEAD |
| A9-01 | A9 | P2 | C | Unmarked-stale docs misdirect agents: PLAN_OF_ATTACK / ATTACK_PLAN / EXECUTION_PLAN (no banners), ENGINEERING_BACKLOG (#1 item shipped), TRUST_SPINE ("$49 verified on main" — false), MARKETING_AUTHORITY (Index "not built"), SCORECARD (frozen 6/24), GO_TO_MARKET ($49 live, Index deferred), ROADMAP top half ("L3 does not exist"). BUSINESS_PLAN fork: canonical v2 sits on open PR #167. Stale PR #127. | LEAD |
| A9-02 | A9 | P2 | F | Dead code: commercial-suppression system (designed grief-safety feature silently inert — mapper disagreement on whether proxy.ts sets the cookie: resolve, then wire or delete), PriceTable, content.ts dead exports, sample-homes findHomes, partner-digest legacy branch, analyzer legacy-shape fallback (post-Migration-A), lib/partner-auth vs lib/partner/auth split. | LEAD |
| A9-03 | A9 | P2 | C | Payment-era naming/copy fossils: isPaidUser, gateUntilPaid, send.ts "paid negotiation" alert, notify-chosen-home Stripe docstring, outreach-preview "selects them and pays", dashboard stripe columns select, seed README, schema "Walk Beside" header, TODO-FD/"sister" comments, wb_ localStorage prefix. | LEAD |

## P3 — polish / hygiene

| ID | Day | Sev | Crit | Finding | Status |
|---|---|---|---|---|---|
| A1-08 | A1 | P3 | F | Postmark webhook Basic-Auth compare not timing-safe; resend-webhook no timestamp freshness (replay = re-deactivate); rate-limiter per-instance (documented). | LEAD |
| A4-06 | A4 | P3 | C | resume/[id] "Pick up where she left off" gendered metadata; negotiate/error.tsx payment-era copy + false "your requests still go out". | LEAD |
| A5-06 | A5 | P3 | C | PartnersClient + materials handoff copy hardcode honestfuneral.co / "Honest Funeral" (brand-constant rule); "We run every case by hand" will silently become false at scale. | LEAD |
| A6-06 | A6 | P3 | C | DIRECTORY_AS_OF "July 2026" hardcoded (CMS ~quarterly refresh); PRICING_LAST_UPDATED 2026-06-26 aging on the citable Index; hospice state-page indexed titles embed live counts. Schedule the refresh clocks (A11). | LEAD |
| A7-04 | A7 | P3 | C | Glossary "call us" with no phone path; livestream password in plaintext localStorage; Miami blurb promises Spanish services on an English-only product; i18n-es drafts drifting from evolved EN pages. | LEAD |
| A9-04 | A9 | P3 | F | No /admin index page — nine tools, no cross-links; founder memorizes nine URLs. | LEAD |

## Verified / closed

### A1 (2026-07-27) — verified CLEAN (no action needed)

| ID | Finding | Evidence |
|---|---|---|
| A1-C1 | **RLS airtight across all 19 tables** — anon key gets 0 rows from every owner-scoped/deny-all table incl. `hospices` (~6,852 rows, proving denial not emptiness); non-granted `funeral_homes` columns → 401; anon INSERT → 401 RLS violation. | Live anon-key probe of prod `bhadjvukoyvfbzbcqunp.supabase.co` |
| A1-C2 | **Outreach kill-switch holds** — all 3 home-directed sends gated on `OUTREACH_LIVE`; the 18-site `sendEmail` census found no ungated home send (`notify-family-of-reply` is family-directed). | Code review + grep |
| A1-08 | Postmark webhook non-timing-safe compare; Resend webhook no timestamp-freshness (replay = re-deactivate inactive home, negligible). Batched to A10. | Code review → QUEUE |
