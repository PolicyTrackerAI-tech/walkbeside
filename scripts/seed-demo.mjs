/**
 * Seed the Funerose demo account — a fictional "Johnson family" case used
 * for investor/sister/press walkthroughs. Idempotent: running twice leaves
 * the account in the same state.
 *
 * Usage:
 *   DEMO_PASSWORD=xxx DEMO_ZIP=94110 \
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/seed-demo.mjs
 *
 * Requires: DEMO_PASSWORD, DEMO_ZIP (5-digit US ZIP in launch metro),
 * NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Optional: DEMO_EMAIL (defaults to demo@funerose.com).
 */

import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  DEMO_EMAIL = "demo@funerose.com",
  DEMO_PASSWORD,
  DEMO_ZIP,
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

async function ensureDemoUser() {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
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
      title: "Authorize Funerose to contact funeral homes on our behalf",
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

async function main() {
  console.log(`Seeding demo account: ${DEMO_EMAIL}`);
  const userId = await ensureDemoUser();
  console.log(`  user id: ${userId}`);
  await clearExisting(userId);
  await seed(userId);
  console.log("Done.");
  console.log("");
  console.log("Sign in at /login with:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: (the DEMO_PASSWORD you set)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
