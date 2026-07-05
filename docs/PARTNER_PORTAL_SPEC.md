# Partner Portal + Reporting Dashboard — L3 product spec

> **⚠️ Partly superseded (2026-07-05).** The portal shipped, but with a
> simpler schema than §1.2/§5.1 spec here: one `partners` table
> (`report_token`-gated, no separate `institutions`/`partner_users` tables)
> plus `partner_codes` for referral attribution — no
> `2026-06-XX-partner-portal.sql` 4-table migration was ever written. Live
> today: self-serve apply (`app/partners/apply/`) → founder approval
> (`app/admin/partners/`, now with a `status` pipeline dropdown) → aggregate
> report (`app/partner/r/[token]/`) → coordinator referral-link manager
> (`.../links/`) → a coordinator-facing AI quote-check tool (`.../check/`) →
> neutral `?ref=CODE` intake wired into `/plan-now`. Read §2–§4 below for the
> *principles* (still load-bearing) but treat §1.2/§5.1's table names and
> ticket list as historical, not a build target — see
> [`ENGINEERING_BACKLOG.md`](ENGINEERING_BACKLOG.md) for what's actually next.
>
> **Build-priority #3** in the bible's order (after outcomes instrumentation and
> the free price tool + trust spine). This is **the sellable product** — the
> thing a hospice pays for. See [`OPERATING_PLAN.md`](OPERATING_PLAN.md) §3 (L3),
> §5 (sales), §8 (legal/anti-steering), and [`ROADMAP.md`](ROADMAP.md) P3.
>
> **The one job of this doc:** define what a hospice uses (a neutral 30-second
> intake + a reporting dashboard) tightly enough to **run one Utah hospice pilot
> by hand**, and clearly enough to know what waits. The reporting dashboard is
> just a partner-scoped read of the **outcomes data we already capture** — the
> whole moat thesis is that L3 sells the data L2 instruments.

---

## 0. Guardrail compliance (read first — this is law)

Every design choice below is constrained by the six guardrails. The two that
shape this product most:

- **#3 Never steer a family to a specific home.** The intake flow a social
  worker uses **must present a neutral tool and never recommend a home.** No
  partner ever sees "we sent your family to Home X." The social worker hands the
  family a neutral entry point and walks away. (§2 below is the load-bearing
  design.)
- **#4 Never publish a number we can't defend.** The dashboard shows the
  partner's *own* aggregate outcomes (their families), not home-level public
  claims. The `n>5 + significance` rule applies to any *cross-partner* or
  *public* figure, not to a partner viewing their own cohort — but we still
  suppress small-n cells in the dashboard to avoid implying precision we don't
  have (§3.4).

Also inherited, unchanged: **#1** (no funeral-home/insurer money — the partner
pays, and the *hospice* is the payer, not an insurer), **#2** (families still
free), **#5/#6** (we stay advice+data; don't rent the flywheel).

**PHI minimization (HIPAA).** A hospice is a covered entity. The MVP design
**avoids us holding PHI** by preferring **family self-enrollment** (the social
worker hands over a neutral link/code; the family enrols themselves). The intake
record stores no diagnosis, no decedent medical data — at most a partner
attribution and, only if the family volunteers it, contact info the family
itself typed. A BAA is a counsel item *before* any flow where the partner types
a family's identifying info into our system (§5, §6).

---

## 1. Data model

### 1.1 What already exists (reuse, do not duplicate)

| Table | Owner / RLS | Reuse for L3 |
|---|---|---|
| `negotiations` | `user_id` → `auth.users`, `negotiations_owner` RLS (`auth.uid() = user_id`) | The family case + **outcomes columns** (`negotiated_price_cents`, `amount_paid_cents`, `satisfaction_score`, `outcome_recorded_at`, `savings_vs_listed_cents` generated). **This is the dashboard's source data.** |
| `negotiation_outreach` | inherits family owner via `outreach_owner` RLS | per-home outcomes (`chosen`, `listed_price_cents`, `negotiated_price_cents`, `hidden_fees`) — feeds hidden-fee + savings metrics |
| `negotiation_messages` | `negotiation_messages_owner_read` | time-to-resolution signal (first contact → close) |
| `funeral_homes` | public read of `active`; vetted gate in `lib/negotiation/directory.ts` | unchanged — partners never touch this |
| service-role admin pattern | `ADMIN_PREVIEW_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (`app/admin/vetting`, `app/admin/outcomes`) | the dashboard reuses **exactly this read pattern** for the MVP (§5) |

The dashboard reads the **same outcomes columns** `/admin/outcomes` already
reads (`NEG_COLS` / `OUTREACH_COLS` in `app/api/admin/outcomes/route.ts`),
filtered to one partner's families. No new outcomes capture is invented here.

### 1.2 New tables (the only net-new schema)

A new migration `supabase/migrations/2026-06-XX-partner-portal.sql` (idempotent,
mirrors the existing migration style). Four small tables + **one nullable FK on
`negotiations`** to link a family case to a partner.

```sql
-- 1. The institution (hospice today; employer/insurer later via `kind`).
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'hospice'
    check (kind in ('hospice','employer','insurer')),
  slug text unique not null,              -- co-brand / referral URL key, e.g. 'canyon-hospice'
  brand_logo_url text,                    -- white-label (later); null = HF default
  brand_color text,                       -- hex; null = HF default
  status text not null default 'pilot'
    check (status in ('pilot','active','paused','churned')),
  pilot_started_at timestamptz,
  contract_started_at timestamptz,        -- null until they pay (the 90-day goal)
  patient_census int,                     -- for census-tiered pricing hypothesis (§5 OP)
  notes text,                             -- internal (founder)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Partner users — a hospice's staff who log in (or, MVP, who we represent).
create table if not exists public.partner_users (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,  -- null until they accept an invite
  email text not null,
  role text not null default 'staff'
    check (role in ('admin','staff','viewer')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (institution_id, email)
);
create index if not exists partner_users_user_idx on public.partner_users (user_id);

-- 3. The neutral referral/intake record. Anti-steering-safe by construction:
--    it records "a partner pointed a family at the neutral tool" — NOT a home.
create table if not exists public.partner_referrals (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  created_by_partner_user uuid references public.partner_users(id) on delete set null,
  -- One-time claim code the family enters; ties their self-started case back to
  -- the partner WITHOUT the partner ever creating a family account or storing PHI.
  claim_code text unique not null,
  -- Optional, family-volunteered only. Prefer null (self-enrol). Never a diagnosis.
  family_label text,                      -- e.g. "the Reyes family" — partner-typed, optional
  intake_channel text not null default 'self_enroll'
    check (intake_channel in ('self_enroll','staff_assisted')),
  status text not null default 'pending'
    check (status in ('pending','claimed','expired')),
  claimed_negotiation_id uuid references public.negotiations(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);
create index if not exists partner_referrals_inst_idx
  on public.partner_referrals (institution_id, created_at desc);

-- 4. The family↔institution link, set when a family claims a referral code.
--    Lives on negotiations so the dashboard can aggregate by institution with a
--    single join and the family keeps full RLS ownership of the row.
alter table public.negotiations
  add column if not exists institution_id uuid
    references public.institutions(id) on delete set null;
alter table public.negotiations
  add column if not exists partner_referral_id uuid
    references public.partner_referrals(id) on delete set null;
create index if not exists negotiations_institution_idx
  on public.negotiations (institution_id) where institution_id is not null;
```

**Why these shapes:**

- **`partner_referrals.claim_code` is the anti-steering firewall.** The partner
  generates a neutral code/link; the family self-starts and claims it. The
  partner never picks a home, never sees which home was chosen, and (in MVP)
  never types the family's identity. This is what makes the referral *neutral*
  and **why a hospice can legally endorse us** (OP §8).
- **The link lives on `negotiations` as a nullable FK**, not in a join table the
  partner can write. The family row stays owner-scoped; we *add* an attribution,
  we don't move ownership.
- **No PHI columns.** `family_label` is optional, family-or-staff-typed free
  text with no medical meaning. Diagnosis/decedent data is never modeled.

### 1.3 RLS — three scopes, one new principle

| Data | Who reads | Mechanism |
|---|---|---|
| Family case + outcomes (`negotiations`, `negotiation_outreach`, `negotiation_messages`) | **only the owning family** | existing owner RLS — **unchanged**. The link FK inherits it. |
| Aggregate dashboard (counts, averages over a partner's families) | partner staff of that institution | **service-role aggregation** (MVP) → later a `security definer` RPC that returns only aggregates, never rows |
| `institutions`, `partner_users`, `partner_referrals` | partner staff of that institution + service role | new RLS keyed on `partner_users.user_id = auth.uid()` |

**The hard rule:** **a partner never reads a family's row.** Even an institution
admin sees only **aggregates** (and, for QA, *their own* referral codes' claim
status — never the linked case's contents). The dashboard is built from
SUM/AVG/COUNT, not from row exposure. This keeps guardrail #3 (no
home-level visibility to the partner) and PHI minimization intact.

```sql
alter table public.institutions   enable row level security;
alter table public.partner_users  enable row level security;
alter table public.partner_referrals enable row level security;

-- A partner user sees their own institution + co-members.
create policy "partner_users_self" on public.partner_users
  for select using (
    institution_id in (
      select pu.institution_id from public.partner_users pu
      where pu.user_id = auth.uid()
    )
  );
create policy "institutions_member_read" on public.institutions
  for select using (
    id in (select institution_id from public.partner_users where user_id = auth.uid())
  );
-- Partner can create + read their own referral codes (to read claim STATUS only).
create policy "referrals_member" on public.partner_referrals
  for all using (
    institution_id in (select institution_id from public.partner_users where user_id = auth.uid())
  ) with check (
    institution_id in (select institution_id from public.partner_users where user_id = auth.uid())
  );
-- NO partner policy is ever added to negotiations / negotiation_outreach.
-- Aggregates reach partners only through a security-definer RPC or service role.
```

---

## 2. The neutral 30-second intake flow (anti-steering-safe)

The flow a bereavement/social worker runs. **Designed so the partner physically
cannot steer** and (MVP) never holds PHI.

### 2.1 The principle

> The social worker hands the family a **neutral door**, not a destination. They
> say: "Here's a free, independent tool that will show you fair funeral prices
> and help you compare — they take no money from funeral homes." That's it. The
> family walks through the door on their own.

### 2.2 The flow (two safe variants)

**Variant A — self-enrol (default; zero PHI to us):**
1. Partner user opens `/portal/refer` (or a printed card), clicks **"New referral."**
2. We mint a `partner_referrals` row (`intake_channel='self_enroll'`, `status='pending'`)
   and show a **short claim code + QR + link** (`/negotiate/start?ref=CODE`).
3. Social worker gives the code/card to the family. **Done — under 30 seconds.**
   No family name, no diagnosis, nothing medical entered.
4. The family later visits `/negotiate/start?ref=CODE`, self-enrols (existing signup), and
   the code is **claimed**: we set `negotiations.institution_id` + the referral's
   `claimed_negotiation_id`/`status='claimed'`. The family owns their case as
   today.

**Variant B — staff-assisted (only with a BAA; gated behind a flag):**
- Same as A, but the worker may type a `family_label` and the family's email to
  send the link. Adds one field. **Not in MVP** unless counsel clears the BAA;
  ships behind `PARTNER_STAFF_ASSISTED_ENABLED` (default off), mirroring how
  `OUTREACH_LIVE` gates risky behavior.

### 2.3 What the worker NEVER does / sees
- Never selects, ranks, or names a funeral home.
- Never sees which home a family chose or paid (that lives in the family-private
  outcomes data; the partner only ever sees aggregates).
- Never sees another family's case.
- The UI shows **no home list at all** — only "generate a neutral referral."

### 2.4 Copy guardrail
Every partner-facing string is reviewed against the anti-steering rule. The
referral screen states verbatim: *"Honest Funeral is neutral. We present all
options and never recommend a specific funeral home. We take no money from
funeral homes."* (Reuses the existing trust-spine language from `/our-role`.)

---

## 3. The reporting dashboard

**What the hospice buys.** It must produce the **CAHPS + compliance + ROI proof**
a bereavement coordinator shows their Executive Director (OP §5). Route:
`/portal/dashboard` (later) / `/admin/partners/[slug]` (MVP, founder-run).

### 3.1 The exact metrics (all derived from outcomes data we already capture)

| Metric | Source | Why the hospice cares |
|---|---|---|
| **Families served** | `count(negotiations where institution_id = X)` | Proof they delivered the 13-month bereavement duty (42 CFR 418.64) |
| **Families with a recorded outcome** | `count(... where outcome_recorded_at is not null)` | Engagement / completion |
| **Avg satisfaction (1–5)** | `avg(satisfaction_score)` over their cohort | **CAHPS proxy** — the family-satisfaction lever |
| **Satisfaction distribution** | histogram of `satisfaction_score` | Defensible detail, not a single fragile number |
| **Avg savings / family** | `avg(savings_vs_listed_cents)` (generated col) | **The ROI headline** — "$X saved per family" |
| **Total savings delivered** | `sum(savings_vs_listed_cents)` | Aggregate value to families |
| **Hidden-fee incidents caught** | count of non-empty `negotiation_outreach.hidden_fees` | "We protected your families from $Y in surprise fees" |
| **Time-to-resolution** | `outcome_recorded_at − created_at` (median) | Responsiveness story |
| **Referral funnel** | `partner_referrals` by `status` (pending/claimed/expired) | Adoption — did staff actually hand it out |

### 3.2 What it explicitly does NOT show
- **No per-family rows.** No names, no home chosen, no individual prices.
  Aggregates only (guardrail #3 + PHI minimization).
- **No funeral-home-level public claims** to the partner. The partner sees *their
  families' savings*, not "Home X overcharges."

### 3.3 Compliance / CAHPS artifact (the deliverable)
A one-page **exportable summary** (PDF/print view) the coordinator can drop into
a board packet: families served, satisfaction, total savings, hidden fees
caught, time-to-resolution, over the period — with the methodology + the
"we take no funeral-home money" line. This *is* the sales proof sheet from
OP §5 stage 7, generated automatically.

### 3.4 Small-n suppression
Any aggregate cell with **n < 5 underlying families** renders as "Not enough
data yet" rather than a number. Honors guardrail #4 (don't imply precision we
can't defend) even within a partner's own view, and matches the public
`n>5 + significance` discipline.

---

## 4. Auth, roles, co-brand / white-label

### 4.1 Roles
| Role | Can |
|---|---|
| `admin` | invite/remove partner users, view dashboard + export, generate referrals, edit co-brand |
| `staff` | generate referrals, view dashboard (read) |
| `viewer` | view dashboard + export only (e.g. an Executive Director) |

All scoped to **one institution** via `partner_users`. No cross-institution
visibility, ever.

### 4.2 Auth mechanism
- **Reuses existing Supabase auth** (same `auth.users`, email + Google sign-in
  the family flow already uses).
- A partner user is just an `auth.users` row **plus** a `partner_users` row
  linking them to an institution with a role. Invite flow: founder creates the
  `partner_users` row with an email; the invitee signs in; on first login we
  match `partner_users.email` → set `user_id`, `accepted_at`.
- **MVP:** no self-serve invites — founder seeds `partner_users` via SQL/service
  role (like seeding `funeral_homes`).

### 4.3 Co-brand / white-label
- **MVP:** a partner `slug` + optional `brand_logo_url` + `brand_color` on
  `institutions`. The referral page (`/negotiate/start?ref=CODE`) and the printable summary
  render "Honest Funeral × {Hospice}" with the logo. Honest Funeral branding and
  the neutrality pledge **always remain visible** (neutrality is the product;
  never hide it).
- **Later:** full white-label subdomain, themed portal. Not MVP.

---

## 5. MVP scope — run ONE hospice pilot by hand

**Principle:** the founder runs every pilot case by hand (OP §5 stage 6;
ROADMAP P3). The portal only needs to do the two things the founder *can't* fake:
**(1) generate a neutral referral code**, **(2) show the aggregate report.**
Everything else is service-role + SQL, exactly like `/admin/vetting` and
`/admin/outcomes` today.

### 5.1 MVP — build this
- [ ] **Migration** `2026-06-XX-partner-portal.sql` — the 4 tables + 2 FK columns
      + RLS above. Idempotent, matches existing migration style.
- [ ] **Seed one institution + the founder as its `admin` partner_user** via SQL
      (no invite UI yet).
- [ ] **Referral generation** — `app/admin/partners/[slug]` page +
      `POST /api/admin/partners/referral`, gated by `ADMIN_PREVIEW_KEY` +
      `SUPABASE_SERVICE_ROLE_KEY` (clone `app/api/admin/outcomes/route.ts`
      structure and the `app/admin/vetting/page.tsx` auth check). Returns a
      claim code + `/negotiate/start?ref=CODE` link + QR.
- [ ] **Claim-on-enrol** — `/negotiate/start` (`app/negotiate/start/Wizard.tsx`)
      reads `?ref=CODE`, and on case creation stamps `negotiations.institution_id`
      + flips the referral to `claimed`. Validate the code exists + `pending` +
      not expired; silently ignore a bad code (never block the family).
- [ ] **Aggregate dashboard (founder view)** — `app/admin/partners/[slug]` renders
      §3.1 metrics by reading the **same outcomes columns** `/admin/outcomes`
      reads, filtered `where institution_id = X`, via service role. Reuse the
      `NEG_COLS`/`OUTREACH_COLS` selects and compute SUM/AVG/COUNT in TS (the
      cohort is tiny in a pilot). Apply §3.4 small-n suppression.
- [ ] **Printable summary** — a print-styled view of the dashboard = the proof
      sheet for OP §5 stage 7.
- [ ] **Anti-steering copy** on the referral screen (§2.4).

### 5.2 Explicitly cut from MVP (waits)
| Deferred | Why it can wait |
|---|---|
| Partner **self-serve login** + invite emails | Founder seeds `partner_users` by SQL; one pilot doesn't need staff accounts |
| `security definer` aggregate **RPC** | MVP reads via service role in the founder-run admin page; the RPC is only needed once *partners* log in directly |
| **Staff-assisted intake** (Variant B) + any PHI/BAA path | Self-enrol avoids PHI entirely; gate behind `PARTNER_STAFF_ASSISTED_ENABLED` until counsel clears a BAA |
| **White-label subdomains / themed portal** | `slug` + logo + color is enough co-brand for a pilot |
| Employer / insurer `kind` flows | `kind` column exists for later; only `hospice` is built |
| Census-tiered **billing** automation | `patient_census` + `contract_started_at` stored; invoicing is manual/Stripe out of band (and never funeral-home/insurer money) |
| Family-facing "your hospice referred you" badge | Nice-to-have trust signal; not required to prove value |
| CSV/API **data export** for the partner | The printable summary covers the pilot; raw export is a later, contracted feature |

### 5.3 MVP build order
1. Migration + seed one institution + founder partner_user.
2. Referral generation page/API (clone admin/outcomes pattern).
3. `?ref=CODE` claim wiring in the start wizard.
4. Aggregate dashboard + printable summary.
5. Run the pilot; capture outcomes via the **existing** `/admin/outcomes` tool;
   the dashboard renders them by institution.

### 5.4 Reuse map (what this leans on, nothing new invented)
- **Outcomes data** → `negotiations` + `negotiation_outreach` outcome columns
  (already specced in `2026-06-22-negotiation-outcomes.sql`). The dashboard is a
  partner-filtered read of these. **L3 sells what L2 instruments — this is the
  whole thesis.**
- **Admin pattern** → `ADMIN_PREVIEW_KEY` + service-role client, exactly as
  `app/admin/vetting/page.tsx` and `app/api/admin/outcomes/route.ts`.
- **Auth** → existing Supabase `auth.users` + email/Google sign-in.
- **Outreach safety** → unchanged. Partner intake creates a *family* case; the
  family's own actions drive any home contact, still gated by `OUTREACH_LIVE`
  through the single send path `lib/negotiation/send.ts`. The portal adds **no**
  new email-to-home path.

---

## 6. Open questions for counsel / founder (load-bearing)

- [ ] **BAA trigger:** does the self-enrol referral code (no PHI to us) keep us
      out of BAA territory, and what exactly flips it (Variant B)? (OP §8)
- [ ] **Anti-steering per state:** confirm Utah specifically that a neutral
      referral code presenting all options is not "steering." (OP §8)
- [ ] **Pilot agreement + data terms:** who owns the aggregate report; can we use
      anonymized cross-pilot outcomes in the Fair-Price Index? (OP §4, §8)
- [ ] **CAHPS framing:** confirm we describe satisfaction as our own measure, not
      an official CAHPS score, to avoid an indefensible claim (guardrail #4).
- [ ] **Pricing model to test:** per-facility annual SaaS tiered by
      `patient_census` vs per-decedent-family — validate in the pilot (OP §5).
