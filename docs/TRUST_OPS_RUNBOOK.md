# Trust Operations Runbook

> **The trust-protection runbook.** Honest Funeral's entire moat is *conflict-free trust* + a *proprietary outcomes dataset* (`OPERATING_PLAN.md` §7, §2). For a for-profit with no mission-lock, neutrality is a **practice we prove, not a structure people can verify** — and **one exposed exaggeration, leak, or unowned error undoes the brand** (`OPERATING_PLAN.md` §7, the for-profit trust burden). This runbook is how we protect it operationally.
>
> Ryan Currie · June 2026 · v1 · Not legal advice; **[COUNSEL]** tags are asks for the startup/healthcare attorney engaged before the first institutional contract or any PHI (per bible Part 8).

**Scope & how this pairs with the existing docs.** This document does **not** restate what already exists — it extends three docs and the bible:

| Existing doc | What it owns (don't restate it here) | What this runbook adds |
|---|---|---|
| [`PRIVACY_RETENTION.md`](PRIVACY_RETENTION.md) | What we store, retention windows, self-serve deletion, backups | The **new-model** data classes (outcomes, GPLs, partner-attribution), PII-vs-de-identified line, access controls, HIPAA/PHI minimization, the de-identified grant |
| [`SECURITY.md`](SECURITY.md) | Headers, rate-limit, CSRF, RLS, PII-in-logs, the `ADMIN_EMAILS` admin gate, sessions | **Incident/breach response** — detection, containment, notification, on-call, severity ladder |
| [`TRUST_SPINE.md`](TRUST_SPINE.md) | The `/corrections`, `/methodology`, `/promise` pages | The **corrections workflow** behind the page + the **PR-attack response posture** |
| [`COMPLIANCE_ADDENDUM.md`](COMPLIANCE_ADDENDUM.md) §2, §6 | HIPAA/BAA approach (A), privacy-policy rewrite asks | The operational PHI-minimization checklist engineers and the founder run |

> **Correction to a common misreference:** the admin gate is **no longer** `ADMIN_PREVIEW_KEY` (the URL-secret scheme was removed — it leaked into history/logs/Referer). It is now a **logged-in Supabase session on the `ADMIN_EMAILS` allowlist** (`lib/admin-auth.ts`, `lib/admin.ts`). Anywhere this runbook says "the admin gate," that's what it means. **`ADMIN_EMAILS` must be set in production** — until it is, any logged-in user is an admin (`lib/env.ts` enforces it only when `OUTREACH_LIVE=true`, which is off; so this is a manual pre-pilot gate — see the checklist in Part 1).

---

# Part 1 — Data governance & retention (the new model)

The pivot moved us from *consumer-fee + outreach* to *institution-paid source of truth*. That added **three new data classes** the old `PRIVACY_RETENTION.md` table doesn't cover, and it made one rule load-bearing: **identifiable family case data stays private and purgeable; only de-identified aggregates feed the moat (the Index, the dataset, partner reports).**

## 1.1 Data inventory — new-model additions

Extends the `PRIVACY_RETENTION.md` "What we store" table. Only the **new or reclassified** items are listed here.

| Data | Where | Class | Tied to / scoped by | Retention |
|---|---|---|---|---|
| **Outcomes — per case** (`negotiated_price_cents`, `amount_paid_cents`, `satisfaction_score`, `savings_vs_listed_cents`, `outcome_recorded_at`) | `negotiations` (new columns, `2026-06-22-negotiation-outcomes.sql`) | **Financial/satisfaction analytics, PHI-free.** PII-adjacent only because the row is owner-linked | Existing `negotiations_owner` RLS (`auth.uid()`) — **unchanged** by the migration | Purge with the case (1.3); **de-identified aggregate kept indefinitely** for the Index |
| **Outcomes — per home** (`chosen`, `listed_price_cents`, `negotiated_price_cents`, `hidden_fees`) | `negotiation_outreach` (new columns) | Same as above | Existing `outreach_owner` RLS — **unchanged** | Same as above |
| **GPLs collected** (price lists from homes, via advocacy / mystery-shop / crowdsource) | advocacy case rows + future `gpl_*` store | **Business pricing data, not personal data** about the family | Service-role write; the family's *own* uploaded GPL is owner-scoped | Indefinite (this is the price layer of the moat) |
| **Partner-attribution code** (which hospice referred a family) | a **non-clinical** column on the family row | **Must never be joined to anything that makes the row PHI** (COMPLIANCE §2.3) | Owner-scoped; service-role for aggregate reporting | Purge with the case; survives only as an aggregate count |
| **De-identified outcomes export** (what feeds the Fair-Price Index + partner dashboards) | aggregation read via service-role behind the admin gate | **De-identified aggregate** — never per-family | No public read of raw rows; aggregate only | **Indefinite** (the moat; covered by the data-use grant) |

**The PII vs. de-identified line (the single most important distinction in this doc):**

- **PII / identifiable** = anything on a row reachable from a `auth.uid()` or an email: account email, deceased name, zip, scenario, the raw per-case outcome figures **as attached to that family**. Stays RLS-owner-scoped. Purgeable. Never shared with a partner or published.
- **De-identified aggregate** = a figure computed across **n>5** cases with no path back to a family: "12 families served, avg satisfaction 4.6, median savings $X in [metro]." This is what a hospice report shows and what the Fair-Price Index publishes. **Never publish a cell below n>5 + significance** (guardrail #4).

## 1.2 PHI minimization — the standing rule (HIPAA without a BAA)

The pilot ships **approach (A): family self-enrollment** (COMPLIANCE §2). A hospice hands the family a link/flyer; the family enters their own info. The hospice shares **no PHI** with us, so we are **likely not a business associate** and **need no BAA**. Hold this line.

**Engineer + founder checklist — run before any partner pilot, re-run on any schema change touching family data:**

- [ ] **Self-enrollment only.** The partner portal MVP is a **link generator + flyer**, never a PHI intake form (no social-worker-typed roster, no census feed). Approaches (B)/(C) are out of MVP and require a BAA + SOC 2.
- [ ] **Collect the minimum.** Never add: diagnosis, hospice medical-record number, date of death/admission, any clinical field. Nothing in the pivot needs PHI beyond what the family voluntarily types.
- [ ] **Outcomes columns stay PHI-free.** They are financial/satisfaction analytics. Don't add a clinical column to `negotiations`/`negotiation_outreach`.
- [ ] **Partner code is segregated.** It lives on a non-clinical column; it is never joined into anything that would turn the dataset into PHI.
- [ ] **No public read of family data.** New columns inherit owner-scoped RLS. Reporting reads **aggregated, de-identified** via service-role behind the admin gate — never a per-family roster to a partner.
- [ ] **`ADMIN_EMAILS` is set in prod** (the founder's address only, to start). Verify `/admin/*` 404s for a non-allowlisted logged-in account.
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` is server-only** — never `NEXT_PUBLIC_*`, never shipped to the client, never logged.

**[COUNSEL]** Confirm approach (A) keeps us out of business-associate status; confirm a family voluntarily entering a *deceased* relative's name doesn't change the analysis; get a standard BAA on the shelf in case a hospice insists on (B)/(C).

## 1.3 Retention & the de-identified grant (extends `PRIVACY_RETENTION.md` §Retention)

`PRIVACY_RETENTION.md` already defines self-serve deletion (`/account` → `/api/account/delete` → `auth.admin.deleteUser` cascade) and the recommended 12-month auto-purge. **The new-model reconciliation:**

| On this event | Identifiable case data | De-identified aggregate |
|---|---|---|
| Family deletes account | Hard-deleted via the existing cascade | **Survives** only as an already-computed aggregate count (no path back) |
| 12-month post-close auto-purge *(add the cron when volume warrants — `PRIVACY_RETENTION.md`)* | Purged | **Survives** in the aggregate |
| Partner pilot ends | Family rows stay owner-scoped (the family still owns their account) | Aggregate already delivered; retained per the data-use grant |

**The data-use grant is load-bearing for the moat** (COMPLIANCE §3): every pilot/MSA must grant us the right to use **de-identified, aggregated** outcomes for the Index and dataset. The export pipeline that feeds the Index must pull **only fields the grant covers** and **only at n>5**. Without the grant, the data we collect can't legally fuel the product.

**[COUNSEL]** Rewrite the consumer privacy policy (COMPLIANCE §6) to disclose: partner-referred arrival, de-identified aggregate reporting to institutions, use of de-identified outcomes in a public Index, and outcomes retention. Reconcile the 12-month purge of *identifiable* data with *indefinite* retention of *de-identified aggregates*.

## 1.4 Access controls (summary; full enforcement lives in `SECURITY.md`)

| Who | What they reach | Mechanism |
|---|---|---|
| A family | Only their own rows | Owner-scoped RLS (`auth.uid()`) on every user table |
| The founder / admin tooling (`/admin/outcomes`, `/admin/vetting`) | Service-role reads, **de-identified for partner-facing numbers** | `ADMIN_EMAILS` allowlist + Supabase session (`lib/admin-auth.ts`) |
| A hospice partner | **Aggregate report only** (n>5), never a roster | Generated export; no direct DB access |
| The public / API roles | L1 content only; `funeral_homes` deny-by-default writes; internal columns revoked | `2026-06-09-rls-hardening.sql` |

---

# Part 2 — Incident & breach response

A breach is **existential for a trust brand** (`OPERATING_PLAN.md` Part 13: "over-invest here"). This is the muscle memory for when something goes wrong. It extends `SECURITY.md` (which describes the *controls*); this describes the *response*.

## 2.1 On-call & roles

| Role | Who (today) | Owns |
|---|---|---|
| **Incident Commander (IC)** | **Ryan (founder)** | The call: declare, drive, decide notification. Solo-founder = you are always IC until a hire. |
| **Comms** | Ryan (or first hire) | What we say to families, partners, press. Drafts from the scripts in Part 3. |
| **[COUNSEL] Legal** | Outside counsel (on retainer pre-pilot) | Breach-notification obligations, regulator contact |
| **Security contact** | `security@honestfuneral.co` *(create the alias; route to founder)* | The inbound channel for reported vulnerabilities |

**Pre-pilot setup checklist:**
- [ ] Create `security@honestfuneral.co` and `privacy@honestfuneral.co` aliases → founder inbox.
- [ ] Save break-glass steps: Supabase dashboard (pause project, rotate keys), Vercel (rollback deploy, rotate env), Stripe (restricted-key revoke), Resend/Postmark (revoke API key).
- [ ] Counsel's after-hours contact saved.
- [ ] Know where the **secrets** live (Vercel env, Supabase dashboard) and how to rotate each in <15 min.

## 2.2 Severity ladder

| Sev | Definition | Example | Response time | Notify |
|---|---|---|---|---|
| **SEV-1** | Confirmed exposure of **identifiable family data**, or attacker write/admin access, or any PHI exposure | Family case rows readable cross-account; service-role key leaked; DB dump exfiltrated | **Immediately**, drop everything | IC + **[COUNSEL]** now; affected families + regulators per law |
| **SEV-2** | Credible exposure risk, not yet confirmed; or exposure of **internal-only** data | A vuln that *could* read other accounts; admin gate bypassed but no data confirmed taken | **< 2 hours** | IC + [COUNSEL] standby |
| **SEV-3** | Security weakness, no data at risk | Rate-limit bypass; report-only CSP violation; dependency CVE not exploited | **< 1 business day** | IC; ticket it |
| **SEV-4** | Hardening / hygiene | Stale secret to rotate; missing header | Backlog | IC |

> **Default up.** If you can't tell SEV-2 from SEV-1, treat it as SEV-1 until proven otherwise. For a trust brand, over-reacting is cheap; under-reacting is fatal.

## 2.3 The response loop — Detect → Contain → Eradicate → Notify → Learn

**Detect (how we'd find out):**
- [ ] A reporter emails `security@`. (Most likely path early — have the alias live.)
- [ ] Anomaly in Supabase logs / Vercel logs / Stripe radar / unexpected egress.
- [ ] A family or partner reports seeing data that isn't theirs.
- [ ] Remember: **`lib/observability.ts` masks PII in logs** (`maskEmail`, `hashId`); raw bodies/payloads aren't logged. Logs are safe to read and share internally during triage.

**Contain (stop the bleeding — do these first, in order):**
- [ ] **Declare** the sev and start a timestamped log (every action, UTC). This log is the legal record.
- [ ] **Rotate the implicated secret immediately** if any credential could be involved: `SUPABASE_SERVICE_ROLE_KEY`, Supabase anon/JWT secret, Stripe keys, Resend/Postmark keys, `ADMIN_EMAILS` access. Rotate in Vercel + the source dashboard; redeploy.
- [ ] **Cut access** to the vulnerable path: roll back the bad Vercel deploy, or pause the Supabase project for SEV-1 if data is actively leaking.
- [ ] **Preserve evidence** before you fix — screenshot/export the relevant logs.
- [ ] Confirm the kill switches are still off: `OUTREACH_LIVE` unset, `OUTREACH_NOTIFICATIONS_ENABLED` off (no outbound made worse during an incident).

**Eradicate & recover:**
- [ ] Patch root cause; add the RLS policy / guard that should have existed.
- [ ] Verify with the actual reproduction (don't assume).
- [ ] Restore from a clean backup only if data integrity is in question (Supabase managed backups — confirm ≥30-day window per `PRIVACY_RETENTION.md`).
- [ ] Add a **vitest test** that fails on the old bug (we have a suite — `lib/__tests__/`).

**Notify (SEV-1/SEV-2 — [COUNSEL]-driven):**
- [ ] **[COUNSEL] decides the legal obligation** before any external statement. Triggers vary: state breach-notification laws (CCPA/CPRA + the launch state), and HIPAA breach rules **if we ever hold PHI** (we shouldn't, under approach A — `COMPLIANCE_ADDENDUM` §2).
- [ ] Notify **affected families** plainly (script in Part 3.4): what happened, what data, what we did, what they should do. No spin.
- [ ] Notify **affected hospice partners** directly and first — they staked their reputation on us; they hear it from us, not the news.
- [ ] If a number we published is implicated, also run the **corrections** process (Part 3).

**Learn (within 72h of resolution):**
- [ ] Blameless post-mortem in the incident log: timeline, root cause, what detection missed, the permanent fix, the new test/control.
- [ ] If the incident touched published data or our neutrality claims, consider a proactive `/corrections` entry (owning it beats being exposed — Part 3).

---

# Part 3 — Corrections & public-error process

This is the **GiveWell move** (`OPERATING_PLAN.md` §7): a for-profit proves neutrality by **publicly owning its errors**. A wrong published number, a savings claim that doesn't hold, or a methodology flaw is a **trust event, not just a bug**. The public surface is `/corrections` (spec in `TRUST_SPINE.md` §4); this is the operational process behind it.

> **Why this is non-negotiable:** guardrail #4 — *never publish a number we can't defend.* When we do anyway, the **only** recovery is to correct it visibly and fast. A consistent correction practice is itself a mitigating factor if a claim is later found imprecise.

## 3.1 What counts as a correction (and what doesn't)

| Log it on `/corrections` | Don't log it |
|---|---|
| A published **number** changed (Fair-Price Index figure, "families overpay by $X", a city/metro stat) | A typo or copy-edit |
| A **factual/legal claim** corrected (glossary, faith content, an FTC/Funeral-Rule statement) | A design tweak |
| A **methodology** change that moves a published figure | Adding new content that doesn't change an existing claim |
| A **savings/fair-price claim** that data no longer supports | A bug with no public-facing claim attached |

## 3.2 The workflow (owner: founder, until a content hire)

| Step | Action | SLA |
|---|---|---|
| 1. **Intake** | Error arrives via `corrections@honestfuneral.co`, a reader, or internal QA. Acknowledge receipt. | < 1 business day |
| 2. **Verify** | Confirm it's actually wrong against the **source data / methodology**. Don't correct on a hunch — the correction must itself be accurate (date, before/after). | < 2 business days |
| 3. **Assess scope** | Is the wrong figure cited elsewhere (other pages, a press release, an AI answer we seeded, a partner report)? Fix **every** instance. | same |
| 4. **Fix the source** | Correct the underlying page/figure; if a published number, re-derive it at n>5 + significance. | promptly |
| 5. **Log it publicly** | Add a dated `/corrections` entry: **date · what was wrong · what's correct now · why it happened.** Plain language. | **within the SLA we publish on the page — pick a number we can hit** |
| 6. **Notify if needed** | If a **partner** received the wrong figure in a report, tell them directly. If press cited it, send the correction. | promptly |

**Pre-launch:** `/corrections` ships with an honest empty state — *"No corrections yet. When we get something wrong, we'll post it here."* (TRUST_SPINE §4). The promise on the page ("email `corrections@`; we post material corrections") must be a process we **actually run** — so set an SLA you can hit and route the alias to the founder.

## 3.3 PR-attack / "they say we steer" response posture

Because the model is "we judge funeral homes and take none of their money," expect attacks — most likely **"this is steering"** or **"the numbers are inflated/self-serving."** The posture:

| Attack | The truth that defuses it | The move |
|---|---|---|
| **"You steer families to homes that pay you."** | **No home pays us — ever** (guardrail #1). We present neutral options; the family chooses (guardrail #3); that's *why* we can't steer. | Point to the **`/promise`** page (no-funeral-home-money pledge) + the neutral-options product. Don't get defensive — the business model *is* the answer. |
| **"Your savings/price numbers are inflated."** | Every published figure is at **n>5 + significance**, with a public **`/methodology`** page and real GPL data. | Show the methodology; if a specific figure is genuinely off, **run the corrections process publicly** — that turns an attack into proof of integrity. |
| **"You're a for-profit pretending to be neutral."** | We say so openly. Neutrality is a **practiced track record**, not a claimed structure — see the conflict-free behavior, the public mistakes page, named reviewers. | Lean into the transparency, not away from it. |
| **"You mishandled our data."** | Run **Part 2** first; then comms. | Facts before posture. Never deny before you've verified. |

**Comms rules under attack:** (1) **Verify before you respond** — never deny something that turns out true. (2) **Plain, calm, non-defensive** voice (the brand voice — `OPERATING_PLAN.md` §7). (3) **Point to the receipts** — `/promise`, `/methodology`, `/corrections`, named reviewers — let the trust spine do the work. (4) **If we were wrong, say so and correct it** faster than anyone expects — that *is* the brand.

## 3.4 Family-notification script (SEV-1/SEV-2 — adapt with [COUNSEL])

> **Subject: An important security notice about your Honest Funeral account**
>
> We're writing to tell you directly about a security issue we found on [date]. [One plain sentence: what happened.] The information that may have been affected was [specific data — e.g., "your account email and the funeral price details you entered"]. We do **not** have evidence that [the worse thing that did *not* happen].
>
> Here's what we did: [contained it at HH:MM, rotated the affected credentials, fixed the cause, added a test so it can't recur]. Here's what we suggest you do: [concrete steps, if any].
>
> We hold ourselves to being the one company in this space you can trust completely, and we're sorry we fell short. If you have any questions, reply to this email or write to privacy@honestfuneral.co. — Ryan, Honest Funeral

---

## Appendix — the one-line invariants this runbook protects

- **No funeral-home / insurer money. Free to families. Never steer. n>5 + significance before any published number. Identifiable data stays private and purgeable; only de-identified aggregates feed the moat.** (Guardrails #1–4.)
- **Outreach stays off:** `OUTREACH_LIVE` unset, `OUTREACH_NOTIFICATIONS_ENABLED` off; the only home-email path is `sendOutreachForNegotiation`.
- **Admin = `ADMIN_EMAILS` allowlist + Supabase session** (not a URL key); **service-role key is server-only**; **PHI is minimized by family self-enrollment** (no BAA under approach A).
- **When in doubt, default the severity up, verify before you speak, and correct in public.** One exposed exaggeration undoes the brand.
