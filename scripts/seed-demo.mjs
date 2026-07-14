/**
 * Seed the Honest Funeral demo account — a fictional "Johnson family" case used
 * for investor/sister/press walkthroughs — plus two fictional partner orgs
 * ("Demo Hospice" and "Demo Employer") with portal sign-in seats, referral
 * codes, and a closed-case cohort large enough (n>5) that the partner report
 * shows real aggregates instead of the small-sample suppression. Idempotent:
 * running twice leaves everything in the same state.
 *
 * Partner demo orgs are seeded by THIS script only — there is no SQL twin in
 * supabase/seed/demo-account.sql (creating auth users needs the admin API).
 *
 * Usage:
 *   DEMO_PASSWORD=xxx DEMO_ZIP=94110 \
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/seed-demo.mjs
 *
 * Requires: DEMO_PASSWORD, DEMO_ZIP (5-digit US ZIP in launch metro),
 * NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Optional: DEMO_EMAIL (defaults to demo@honestfuneral.co),
 * DEMO_PARTNER_NAME (defaults to "Demo Hospice"),
 * DEMO_EMPLOYER_NAME (defaults to "Demo Employer") — rename for a sales
 * recording without touching code.
 *
 * SAFETY: an existing partners row is adopted ONLY if its application_notes
 * carries the exact seeded-demo marker (DEMO_ORG_MARKER below, written on
 * insert). If the name matches a real partner instead, the script aborts
 * before writing or deleting anything for that org — pick a different name
 * via DEMO_PARTNER_NAME / DEMO_EMPLOYER_NAME and rerun.
 */

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  DEMO_EMAIL = "demo@honestfuneral.co",
  DEMO_PASSWORD,
  DEMO_ZIP,
  DEMO_PARTNER_NAME = "Demo Hospice",
  DEMO_EMPLOYER_NAME = "Demo Employer",
} = process.env;

function required(name, value) {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

required("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
required("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);
required("DEMO_PASSWORD", DEMO_PASSWORD);
required("DEMO_ZIP", DEMO_ZIP);

if (!/^\d{5}$/.test(DEMO_ZIP)) {
  console.error("DEMO_ZIP must be a 5-digit US ZIP");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Find-or-create a confirmed auth user with DEMO_PASSWORD.
 * NOTE: listUsers reads page 1 / perPage 200 only — fine while the project
 * has well under 200 auth users; revisit paging if that ever stops holding.
 */
async function ensureUser(email) {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function clearExisting(userId) {
  const tables = [
    "obituaries",
    "cert_trackers",
    "price_list_analyses",
    "tasks",
  ];
  for (const t of tables) {
    await admin.from(t).delete().eq("user_id", userId);
  }
  const { data: negs } = await admin
    .from("negotiations")
    .select("id")
    .eq("user_id", userId);
  if (negs?.length) {
    const ids = negs.map((n) => n.id);
    await admin.from("negotiation_outreach").delete().in("negotiation_id", ids);
    await admin.from("negotiations").delete().in("id", ids);
  }
}

async function seed(userId) {
  await admin
    .from("profiles")
    .upsert({
      id: userId,
      display_name: "Sarah Johnson",
      zip: DEMO_ZIP,
      scenario: "hospital",
      deceased_name: "Robert Johnson",
    });

  const { data: neg, error: negErr } = await admin
    .from("negotiations")
    .insert({
      user_id: userId,
      zip: DEMO_ZIP,
      service_type: "traditional-burial",
      target_home_name: "Johnson Memorial",
      target_home_estimate_cents: 750000,
      status: "received",
      best_quote_cents: 580000,
      savings_cents: 170000,
    })
    .select("id")
    .single();
  if (negErr) throw negErr;

  await admin.from("negotiation_outreach").insert([
    {
      negotiation_id: neg.id,
      home_name: "Johnson Memorial",
      home_email: "arrangements@johnsonmemorial.example",
      quote_cents: 750000,
      status: "replied",
      notes: "Basic services $2,400. Casket $3,800. Viewing $900. Limo $400.",
    },
    {
      negotiation_id: neg.id,
      home_name: "Oakview Funeral Services",
      home_email: "info@oakview.example",
      quote_cents: 580000,
      status: "replied",
      notes:
        "Basic services $1,950. Casket $2,600. Viewing $750. No limo. Most transparent breakdown received.",
    },
    {
      negotiation_id: neg.id,
      home_name: "Memorial Gardens",
      home_email: "contact@memorialgardens.example",
      status: "sent",
      notes: "Initial outreach sent — awaiting reply.",
    },
  ]);

  await admin.from("obituaries").insert({
    user_id: userId,
    inputs: {
      full_name: "Robert Johnson",
      dates: "[TO VERIFY]",
      spouse: "Sarah Johnson",
      children: "[TO VERIFY]",
      occupation: "[TO VERIFY]",
      service_details: "[TO VERIFY]",
    },
    draft:
      "Robert Johnson passed away on [TO VERIFY]. He was a devoted husband to Sarah, and a lifelong [TO VERIFY]. Services will be held at [TO VERIFY].",
  });

  await admin.from("tasks").insert([
    {
      user_id: userId,
      phase: "first-steps",
      title: "Look up fair funeral prices for your zip code",
      status: "done",
      position: 0,
      completed_at: new Date().toISOString(),
    },
    {
      user_id: userId,
      phase: "first-steps",
      title: "Call hospice and get pronouncement paperwork started",
      status: "done",
      position: 1,
      completed_at: new Date().toISOString(),
    },
    {
      user_id: userId,
      phase: "funeral",
      title: "Authorize Honest Funeral to contact funeral homes on our behalf",
      status: "done",
      position: 2,
      completed_at: new Date().toISOString(),
    },
    {
      user_id: userId,
      phase: "funeral",
      title: "Review quotes and pick a home",
      href: `/negotiate/${neg.id}/results`,
      status: "open",
      position: 3,
    },
    {
      user_id: userId,
      phase: "service",
      title: "Finish the obituary draft",
      href: "/obituary",
      status: "open",
      position: 4,
    },
  ]);
}

/* ---------------------------------------------------------------------------
 * Demo partner orgs (product week Day 2): "Demo Hospice" + "Demo Employer",
 * each with an owner seat + one more member, referral codes, and a closed-case
 * cohort with real outcome columns so the partner report clears the n>5
 * suppression and shows live aggregates.
 *
 * Everything here is fictional and obviously so. Every write is scoped to the
 * exact demo org ids and demo family user ids resolved below. Prod has a REAL
 * partner named "DEMO 1" — so: EXACT-name lookups only, never name-prefix
 * matching, never a delete against the partners table, and an existing row is
 * adopted ONLY when its application_notes carries DEMO_ORG_MARKER (set on
 * insert). A name collision with any other partner aborts the script.
 * ------------------------------------------------------------------------ */

// Written to partners.application_notes on insert and REQUIRED on any row this
// script adopts — the provenance check that keeps a real partner untouchable.
const DEMO_ORG_MARKER = "Seeded demo organization — all data fictional.";

// Mirrors lib/referral-codes.ts — unambiguous alphabet, HF- prefix.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function newReferralCode() {
  const bytes = randomBytes(6);
  let body = "";
  for (let i = 0; i < 6; i++) {
    body += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `HF-${body}`;
}

const daysAgoIso = (days) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

/**
 * Deterministic closed cases (hand-written, not random, so reseeding is
 * stable). `family` indexes the shared demo-family users; savings sit in the
 * buildsheet's $700–$2,400 band; `savings_vs_listed_cents` is a GENERATED
 * column (estimate − paid), so we only ever write its inputs. Home names are
 * strictly fictional, on .example domains, drawn from a small per-org pool.
 *
 * EVERY case carries exactly two replied quotes — the chosen home slightly
 * above amount_paid (a small negotiation delta) and one higher competitor —
 * so the report's "Avg quotes / family" tile reads 2.0, matching the
 * multi-quote pitch. Exactly ONE case (a hospice one) carries hidden_fees.
 *
 * amount_paid (estimate − savings) is deliberately kept BELOW the metro
 * median for each service type (SERVICE_TOTALS fair-band midpoint × the zip
 * multiplier — ~$1,520 / ~$4,512 / ~$9,500 at Salt Lake's 0.95), so the
 * report's "saved vs metro median" pilot metric reads positive, matching a
 * cohort we actually negotiated for.
 */
const HOSPICE_CASES = [
  {
    family: 0,
    serviceType: "direct-cremation",
    estimateCents: 209000,
    savingsCents: 84500,
    satisfaction: 5,
    createdDaysAgo: 58,
    resolutionDays: 5,
    outreach: [
      {
        home: "Cedar Lane Funeral Home",
        email: "arrangements@cedarlane.example",
        quoteCents: 129500,
        chosen: true,
      },
      {
        home: "Riverbend Cremation",
        email: "care@riverbend.example",
        quoteCents: 152000,
      },
    ],
  },
  {
    family: 1,
    serviceType: "traditional-burial",
    estimateCents: 1076000,
    savingsCents: 238000,
    satisfaction: 5,
    createdDaysAgo: 51,
    resolutionDays: 7,
    benefitCents: 25500,
    outreach: [
      {
        home: "Willow Grove Memorial",
        email: "office@willowgrove.example",
        quoteCents: 851000,
        chosen: true,
      },
      {
        home: "Hillcrest Burial & Memorial",
        email: "contact@hillcrest.example",
        quoteCents: 902000,
      },
    ],
  },
  {
    family: 2,
    serviceType: "cremation-with-service",
    estimateCents: 537000,
    savingsCents: 152500,
    satisfaction: 4,
    createdDaysAgo: 44,
    resolutionDays: 4,
    // Exactly ONE hospice case carries hidden fees, so FTC-flagged > 0.
    outreach: [
      {
        home: "Lakeside Cremation & Funeral",
        email: "hello@lakesidecare.example",
        quoteCents: 392000,
        chosen: true,
        hiddenFees: [
          {
            label: "Crematory fee listed twice",
            cents: 39500,
            note: "Line 7 duplicates line 3.",
          },
        ],
      },
      {
        home: "Maplewood Chapel",
        email: "info@maplewoodchapel.example",
        quoteCents: 431000,
      },
    ],
  },
  {
    family: 3,
    serviceType: "direct-cremation",
    estimateCents: 188000,
    savingsCents: 70000,
    satisfaction: 4,
    createdDaysAgo: 37,
    resolutionDays: 9,
    // amount_paid = 118,000
    outreach: [
      {
        home: "Riverbend Cremation",
        email: "care@riverbend.example",
        quoteCents: 121500,
        chosen: true,
      },
      {
        home: "Maplewood Chapel",
        email: "info@maplewoodchapel.example",
        quoteCents: 139000,
      },
    ],
  },
  {
    family: 4,
    serviceType: "traditional-burial",
    estimateCents: 1013000,
    savingsCents: 201000,
    satisfaction: 5,
    createdDaysAgo: 29,
    resolutionDays: 6,
    benefitCents: 110000,
    // amount_paid = 812,000
    outreach: [
      {
        home: "Hillcrest Burial & Memorial",
        email: "contact@hillcrest.example",
        quoteCents: 824000,
        chosen: true,
      },
      {
        home: "Willow Grove Memorial",
        email: "office@willowgrove.example",
        quoteCents: 876500,
      },
    ],
  },
  {
    family: 5,
    serviceType: "direct-cremation",
    estimateCents: 220000,
    savingsCents: 88500,
    satisfaction: 5,
    createdDaysAgo: 20,
    resolutionDays: 3,
    // amount_paid = 131,500
    outreach: [
      {
        home: "Cedar Lane Funeral Home",
        email: "arrangements@cedarlane.example",
        quoteCents: 135000,
        chosen: true,
      },
      {
        home: "Riverbend Cremation",
        email: "care@riverbend.example",
        quoteCents: 154500,
      },
    ],
  },
  {
    family: 6,
    serviceType: "cremation-with-service",
    estimateCents: 534000,
    savingsCents: 132000,
    satisfaction: 4,
    createdDaysAgo: 11,
    resolutionDays: 5,
    // amount_paid = 402,000
    outreach: [
      {
        home: "Maplewood Chapel",
        email: "info@maplewoodchapel.example",
        quoteCents: 409500,
        chosen: true,
      },
      {
        home: "Lakeside Cremation & Funeral",
        email: "hello@lakesidecare.example",
        quoteCents: 446000,
      },
    ],
  },
];

const EMPLOYER_CASES = [
  {
    family: 2,
    serviceType: "direct-cremation",
    estimateCents: 213000,
    savingsCents: 92000,
    satisfaction: 5,
    createdDaysAgo: 55,
    resolutionDays: 6,
    outreach: [
      {
        home: "Cedarwood Family Funeral",
        email: "arrangements@cedarwoodfamily.example",
        quoteCents: 126500,
        chosen: true,
      },
      {
        home: "Summit Cremation Services",
        email: "desk@summitcremation.example",
        quoteCents: 141000,
      },
    ],
  },
  {
    family: 3,
    serviceType: "traditional-burial",
    estimateCents: 1052000,
    savingsCents: 226000,
    satisfaction: 4,
    createdDaysAgo: 47,
    resolutionDays: 8,
    outreach: [
      {
        home: "Oak Hollow Memorial",
        email: "office@oakhollow.example",
        quoteCents: 838500,
        chosen: true,
      },
      {
        home: "Stonebridge Funeral Home",
        email: "contact@stonebridge.example",
        quoteCents: 897000,
      },
    ],
  },
  {
    family: 4,
    serviceType: "cremation-with-service",
    estimateCents: 531000,
    savingsCents: 141500,
    satisfaction: 5,
    createdDaysAgo: 40,
    resolutionDays: 4,
    // amount_paid = 389,500
    outreach: [
      {
        home: "Summit Cremation Services",
        email: "desk@summitcremation.example",
        quoteCents: 397000,
        chosen: true,
      },
      {
        home: "Oak Hollow Memorial",
        email: "office@oakhollow.example",
        quoteCents: 438500,
      },
    ],
  },
  {
    family: 5,
    serviceType: "direct-cremation",
    estimateCents: 205000,
    savingsCents: 76500,
    satisfaction: 4,
    createdDaysAgo: 31,
    resolutionDays: 7,
    benefitCents: 89000,
    // amount_paid = 128,500
    outreach: [
      {
        home: "Cedarwood Family Funeral",
        email: "arrangements@cedarwoodfamily.example",
        quoteCents: 132500,
        chosen: true,
      },
      {
        home: "Summit Cremation Services",
        email: "desk@summitcremation.example",
        quoteCents: 147000,
      },
    ],
  },
  {
    family: 6,
    serviceType: "traditional-burial",
    estimateCents: 981000,
    savingsCents: 187000,
    satisfaction: 5,
    createdDaysAgo: 22,
    resolutionDays: 5,
    // amount_paid = 794,000
    outreach: [
      {
        home: "Stonebridge Funeral Home",
        email: "contact@stonebridge.example",
        quoteCents: 806500,
        chosen: true,
      },
      {
        home: "Oak Hollow Memorial",
        email: "office@oakhollow.example",
        quoteCents: 859000,
      },
    ],
  },
  {
    family: 7,
    serviceType: "direct-cremation",
    estimateCents: 220000,
    savingsCents: 103500,
    satisfaction: 5,
    createdDaysAgo: 9,
    resolutionDays: 3,
    // amount_paid = 116,500
    outreach: [
      {
        home: "Summit Cremation Services",
        email: "desk@summitcremation.example",
        quoteCents: 119500,
        chosen: true,
      },
      {
        home: "Cedarwood Family Funeral",
        email: "arrangements@cedarwoodfamily.example",
        quoteCents: 136000,
      },
    ],
  },
];

/** Find-or-create one demo partner org with seats and referral codes. */
async function ensurePartnerOrg({
  name,
  partnerType,
  ownerEmail,
  secondEmail,
  secondRole,
  codeLabels,
}) {
  // 1) partners row — exact-name lookup; insert ONLY when missing. An
  //    existing row is adopted ONLY if it carries DEMO_ORG_MARKER; a real
  //    partner that happens to share the name aborts the whole run BEFORE
  //    any seat upsert, code insert, delete, or case insert.
  const { data: found, error: findErr } = await admin
    .from("partners")
    .select("id, report_token, application_notes, contact_email")
    .eq("name", name)
    .maybeSingle();
  if (findErr) throw findErr;
  if (found && found.application_notes !== DEMO_ORG_MARKER) {
    console.error(
      `REFUSING TO SEED: a partners row named "${name}" already exists but is NOT a seeded demo org.\n` +
        `  Its application_notes does not carry the demo marker (contact_email: ${found.contact_email ?? "none"}),\n` +
        `  so it looks like a REAL partner — this script will not touch it: no seats, codes,\n` +
        `  case deletes, or case inserts were written for this org.\n` +
        `  Pick a different demo org name via DEMO_PARTNER_NAME / DEMO_EMPLOYER_NAME and rerun.`,
    );
    process.exit(1);
  }
  let partner = found;
  if (!partner) {
    const { data, error } = await admin
      .from("partners")
      .insert({
        name,
        partner_type: partnerType,
        status: "pilot",
        active: true,
        approved_at: new Date().toISOString(),
        contact_name: "Demo Owner",
        contact_email: ownerEmail,
        application_notes: DEMO_ORG_MARKER,
      })
      .select("id, report_token")
      .single();
    if (error) throw error;
    partner = data;
  }

  // 2) Sign-in seats bound to real auth users, so /portal/login works
  //    immediately (no email-delivery bind step in a demo). invited_email is
  //    lowercased at every write site (plain-column unique index).
  const seats = [
    { email: ownerEmail, role: "owner" },
    { email: secondEmail, role: secondRole ?? "member" },
  ];
  const memberEmails = [];
  for (const seat of seats) {
    const uid = await ensureUser(seat.email);
    const { error } = await admin.from("partner_members").upsert(
      {
        partner_id: partner.id,
        invited_email: seat.email.trim().toLowerCase(),
        role: seat.role,
        user_id: uid,
        accepted_at: new Date().toISOString(),
        deactivated_at: null, // reseed always restores sign-in
      },
      { onConflict: "partner_id,invited_email", ignoreDuplicates: false },
    );
    if (error) throw error;
    memberEmails.push(seat.email);
  }

  // 3) Referral codes. If the org already has codes, LEAVE them — printed
  //    demo materials keep working across reseeds. Otherwise insert three,
  //    with exactly one revoked so the links UI demos every state.
  const { data: existingCodes, error: codesErr } = await admin
    .from("partner_codes")
    .select("code, active")
    .eq("partner_id", partner.id);
  if (codesErr) throw codesErr;
  const codes = existingCodes ?? [];
  if (codes.length === 0) {
    for (let i = 0; i < codeLabels.length; i++) {
      const revoked = i === codeLabels.length - 1;
      const row = {
        code: newReferralCode(),
        partner_id: partner.id,
        label: codeLabels[i],
        active: !revoked,
        revoked_at: revoked ? new Date().toISOString() : null,
      };
      // Retry the (vanishingly unlikely) global code collision.
      for (let attempt = 0; ; attempt++) {
        const { error } = await admin.from("partner_codes").insert(row);
        if (!error) break;
        if (error.code === "23505" && attempt < 4) {
          row.code = newReferralCode();
          continue;
        }
        throw error;
      }
      codes.push(row);
    }
  }
  const activeCodes = codes.filter((c) => c.active).map((c) => c.code);
  // If a portal demo revoked every code, fall back to any code — the
  // attribution FK stays valid either way.
  const codePool = activeCodes.length ? activeCodes : codes.map((c) => c.code);

  return {
    id: partner.id,
    name,
    reportToken: partner.report_token,
    memberEmails,
    codePool,
  };
}

/** Ensure the 8 shared demo family users + their profiles. */
async function ensureDemoFamilies() {
  const families = [];
  for (let i = 1; i <= 8; i++) {
    const nn = String(i).padStart(2, "0");
    const email = `demo-family-${nn}@honestfuneral.co`;
    const uid = await ensureUser(email);
    families.push({ uid, email, nn });
  }
  // Profiles — display name, zip, and the bereavement check-in flag on the
  // first four (drives the report's "bereavement reminded" percentage). The
  // anniversary cron can never target these users: it also requires
  // anniversary_emails_opt_in + date_of_death, which stay unset.
  for (let i = 0; i < families.length; i++) {
    const f = families[i];
    const { error } = await admin.from("profiles").upsert({
      id: f.uid,
      display_name: `Demo Family ${f.nn}`,
      zip: DEMO_ZIP,
      anniversary_emails_sent: i < 4 ? ["1mo"] : [],
    });
    if (error) throw error;
  }
  return families;
}

/**
 * Clear ONLY the demo cohort so reseeding is deterministic: cases that are
 * BOTH tagged to a demo org id AND owned by a demo family user, plus the demo
 * family users' tool artifacts. Demo referral codes are live prod codes, so a
 * real family can arrive through one — their case gets attributed to the demo
 * org but must NEVER be deleted here; such rows are counted and left alone.
 */
async function clearDemoCohort(partnerIds, familyIds) {
  const demoFamilyIds = new Set(familyIds);
  for (const pid of partnerIds) {
    const { data: negs, error } = await admin
      .from("negotiations")
      .select("id, user_id")
      .eq("partner_id", pid);
    if (error) throw error;
    const rows = negs ?? [];
    const demoRows = rows.filter((n) => demoFamilyIds.has(n.user_id));
    const preservedCount = rows.length - demoRows.length;
    if (preservedCount > 0) {
      console.warn(
        `  ${preservedCount} real case(s) attributed to this demo org were left untouched (partner_id ${pid}).`,
      );
    }
    if (demoRows.length) {
      const ids = demoRows.map((n) => n.id);
      const { error: outErr } = await admin
        .from("negotiation_outreach")
        .delete()
        .in("negotiation_id", ids);
      if (outErr) throw outErr;
      const { error: negErr } = await admin
        .from("negotiations")
        .delete()
        .in("id", ids);
      if (negErr) throw negErr;
    }
  }
  for (const t of ["price_list_analyses", "cert_trackers", "obituaries"]) {
    const { error } = await admin.from(t).delete().in("user_id", familyIds);
    if (error) throw error;
  }
}

/** Insert one org's closed cases (with outcomes) + their outreach rows. */
async function seedPartnerCases(org, families, cases) {
  for (const c of cases) {
    const { data: neg, error } = await admin
      .from("negotiations")
      .insert({
        user_id: families[c.family].uid,
        zip: DEMO_ZIP,
        service_type: c.serviceType,
        status: "closed",
        target_home_estimate_cents: c.estimateCents,
        // savings_vs_listed_cents is GENERATED from these two — never write it.
        amount_paid_cents: c.estimateCents - c.savingsCents,
        satisfaction_score: c.satisfaction,
        created_at: daysAgoIso(c.createdDaysAgo),
        outcome_recorded_at: daysAgoIso(c.createdDaysAgo - c.resolutionDays),
        partner_id: org.id,
        partner_code: org.codePool[c.family % org.codePool.length],
        benefit_dollars_recovered_cents: c.benefitCents ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;

    if (c.outreach?.length) {
      // negotiation_outreach has a partial unique index (negotiation_id)
      // WHERE chosen — each case marks at most one row chosen.
      const rows = c.outreach.map((o) => ({
        negotiation_id: neg.id,
        home_name: o.home,
        home_email: o.email,
        quote_cents: o.quoteCents,
        status: "replied",
        chosen: o.chosen ?? false,
        hidden_fees: o.hiddenFees ?? null,
        notes: "Fictional demo data — not a real funeral home.",
      }));
      const { error: outErr } = await admin
        .from("negotiation_outreach")
        .insert(rows);
      if (outErr) throw outErr;
    }
  }
}

/**
 * Tool-engagement floors for the shared demo families: checker runs for 4 of
 * 8, cert trackers for 2, obituaries for 2 — so the report's engagement
 * percentages are non-zero and stable.
 */
async function seedFamilyToolUse(families) {
  const analyses = [
    {
      user: 0,
      raw: "[FICTIONAL DEMO] General Price List — basic services fee $2,195; transfer of remains $395; crematory fee $395; alternative container $150.",
      quoted: 313500,
      fair: 259000,
    },
    {
      user: 1,
      raw: "[FICTIONAL DEMO] General Price List — basic services fee $2,450; embalming $795; metal casket $2,900; hearse $395.",
      quoted: 654000,
      fair: 551500,
    },
    {
      user: 2,
      raw: "[FICTIONAL DEMO] General Price List — basic services fee $2,300; cremation with memorial service $1,850; urn $325.",
      quoted: 447500,
      fair: 391000,
    },
    {
      user: 3,
      raw: "[FICTIONAL DEMO] General Price List — basic services fee $1,995; direct cremation package $1,395; death certificates $25 each.",
      quoted: 341500,
      fair: 302000,
    },
  ];
  for (const a of analyses) {
    const { error } = await admin.from("price_list_analyses").insert({
      user_id: families[a.user].uid,
      raw_text: a.raw,
      total_quoted_cents: a.quoted,
      total_fair_cents: a.fair,
      potential_savings_cents: a.quoted - a.fair,
      items: [{ label: "Basic services fee", cents: 219500 }],
      zip: DEMO_ZIP,
    });
    if (error) throw error;
  }

  for (const idx of [0, 4]) {
    const { error } = await admin.from("cert_trackers").insert({
      user_id: families[idx].uid,
      total_to_order: 8,
      ordered: 5,
      recipients: [
        { name: "Bank (fictional demo)", mailed_at: daysAgoIso(12), received_at: null },
        { name: "Life insurer (fictional demo)", mailed_at: daysAgoIso(10), received_at: daysAgoIso(4) },
      ],
    });
    if (error) throw error;
  }

  const obits = [
    {
      user: 1,
      name: "Alex Rivera",
      draft:
        "[FICTIONAL DEMO] Alex Rivera, 78, is remembered by family and friends for a long career in teaching and a quiet devotion to his garden. A memorial gathering will be announced.",
    },
    {
      user: 5,
      name: "June Calloway",
      draft:
        "[FICTIONAL DEMO] June Calloway, 84, spent four decades as a librarian and never stopped recommending books. Her family will gather privately to remember her.",
    },
  ];
  for (const o of obits) {
    const { error } = await admin.from("obituaries").insert({
      user_id: families[o.user].uid,
      inputs: { full_name: `${o.name} [FICTIONAL DEMO]` },
      draft: o.draft,
    });
    if (error) throw error;
  }
}

/** Seed both demo partner orgs. Returns summaries for the console output. */
async function ensureDemoPartners() {
  const orgs = [
    {
      name: DEMO_PARTNER_NAME,
      partnerType: "hospice",
      ownerEmail: "demo-hospice-owner@honestfuneral.co",
      secondEmail: "demo-hospice-coordinator@honestfuneral.co",
      codeLabels: ["Admission packet", "Front-desk QR", "Email signature"],
      cases: HOSPICE_CASES,
    },
    {
      name: DEMO_EMPLOYER_NAME,
      partnerType: "employer",
      ownerEmail: "demo-employer-owner@honestfuneral.co",
      secondEmail: "demo-employer-benefits@honestfuneral.co",
      codeLabels: ["Benefits portal", "HR handoff", "Manager toolkit"],
      cases: EMPLOYER_CASES,
    },
  ];

  const seeded = [];
  for (const org of orgs) {
    console.log(`  org: ${org.name} (${org.partnerType})`);
    seeded.push(await ensurePartnerOrg(org));
  }

  const families = await ensureDemoFamilies();
  await clearDemoCohort(
    seeded.map((s) => s.id),
    families.map((f) => f.uid),
  );
  for (let i = 0; i < orgs.length; i++) {
    await seedPartnerCases(seeded[i], families, orgs[i].cases);
  }
  await seedFamilyToolUse(families);

  return seeded;
}

async function main() {
  console.log(`Seeding demo account: ${DEMO_EMAIL}`);
  const userId = await ensureUser(DEMO_EMAIL);
  console.log(`  user id: ${userId}`);
  await clearExisting(userId);
  await seed(userId);

  console.log("");
  console.log("Seeding demo partner orgs…");
  const partnerOrgs = await ensureDemoPartners();

  console.log("Done.");
  console.log("");
  console.log("Family demo — sign in at /login with:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: (the DEMO_PASSWORD you set)`);
  console.log("");
  console.log("Partner demo — sign in at /portal/login (same password):");
  for (const org of partnerOrgs) {
    console.log(`  ${org.name}`);
    for (const email of org.memberEmails) {
      console.log(`    member:     ${email}`);
    }
    console.log(`    quick link: /partner/r/${org.reportToken}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
