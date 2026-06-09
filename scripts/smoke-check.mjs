/**
 * Pre-launch smoke check — the headless half of the launch-day runbook
 * (docs/SMOKE_TEST.md). Verifies the things you can verify without a browser
 * or a real card, so you don't flip OUTREACH_LIVE blind.
 *
 * It checks:
 *   - config: OUTREACH_LIVE state + presence/shape of the send-path env vars
 *   - data:   how many funeral homes are actually CONTACTABLE
 *             (active=true AND vetted=true AND has an email — the exact gate
 *             lib/negotiation/directory.ts applies), optionally for a zip
 *   - a live negotiation's outreach row statuses (--neg=<id>), so during the
 *     manual test you can confirm pending → dry_run/sent without opening Supabase
 *
 * Usage:
 *   npm run smoke:check                 # config + directory summary
 *   npm run smoke:check -- --zip=84101  # + the homes that zip would contact
 *   npm run smoke:check -- --neg=<uuid> # + that negotiation's outreach statuses
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (read from
 * .env.local automatically via the npm script). Exits non-zero if a launch
 * blocker is found (e.g. zero contactable homes).
 */

import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const zipArg = args.find((a) => a.startsWith("--zip="))?.split("=")[1];
const negArg = args.find((a) => a.startsWith("--neg="))?.split("=")[1];

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const problems = [];
const ok = (m) => console.log(`  ✓ ${m}`);
const warn = (m) => console.log(`  ⚠ ${m}`);
const bad = (m) => {
  console.log(`  ✗ ${m}`);
  problems.push(m);
};

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\n✗ Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n",
  );
  process.exit(1);
}

const present = (name) => Boolean(process.env[name] && process.env[name].trim());

function checkConfig() {
  console.log("\nConfig");
  const live = process.env.OUTREACH_LIVE === "true";
  if (live) warn("OUTREACH_LIVE = true  → real emails WILL be sent");
  else ok("OUTREACH_LIVE != true → sends are recorded as dry_run (safe)");

  // Required to safely run live (mirrors LIVE_REQUIRED_VARS in lib/env.ts):
  // a blocker when OUTREACH_LIVE=true, just a heads-up otherwise.
  function liveCritical(name, okMsg, missMsg) {
    if (present(name)) ok(okMsg);
    else if (live) bad(missMsg);
    else warn(`${name} unset (dev dry-run)`);
  }
  function optional(name, okMsg, missMsg) {
    if (present(name)) ok(okMsg);
    else warn(missMsg);
  }

  // Send path
  liveCritical(
    "RESEND_API_KEY",
    "RESEND_API_KEY set",
    "RESEND_API_KEY missing (no email can send live)",
  );
  optional(
    "RESEND_FROM",
    `RESEND_FROM = ${process.env.RESEND_FROM}`,
    "RESEND_FROM unset → defaults to hello@honestfuneral.co",
  );
  liveCritical(
    "RESEND_WEBHOOK_SECRET",
    "RESEND_WEBHOOK_SECRET set (bounce handling)",
    "RESEND_WEBHOOK_SECRET missing — the bounce webhook requireServer()s it and will 500 while live",
  );

  // Payments
  const sk = process.env.STRIPE_SECRET_KEY ?? "";
  if (!sk) {
    warn("STRIPE_SECRET_KEY unset → checkout bypasses to a dev send");
  } else if (sk.startsWith("sk_test_")) {
    if (live) bad("STRIPE_SECRET_KEY is a TEST key but OUTREACH_LIVE=true");
    else ok("STRIPE_SECRET_KEY = test key");
  } else {
    ok("STRIPE_SECRET_KEY = live key");
  }
  liveCritical(
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_WEBHOOK_SECRET set",
    "STRIPE_WEBHOOK_SECRET missing (webhook can't verify)",
  );

  // Ops
  liveCritical(
    "ADMIN_EMAILS",
    "ADMIN_EMAILS set",
    "ADMIN_EMAILS unset → any logged-in user would be an admin",
  );
  optional(
    "ALERT_WEBHOOK_URL",
    "ALERT_WEBHOOK_URL set (push alerts on)",
    "ALERT_WEBHOOK_URL unset → failures logged but not pushed",
  );
}

async function checkDirectory(admin) {
  console.log("\nDirectory (funeral_homes)");
  const { count: total } = await admin
    .from("funeral_homes")
    .select("*", { count: "exact", head: true });
  const { data: contactable, error } = await admin
    .from("funeral_homes")
    .select("name, state, zip, email")
    .eq("active", true)
    .eq("vetted", true)
    .not("email", "is", null);
  if (error) {
    bad(`could not read funeral_homes: ${error.message}`);
    return;
  }
  const n = contactable?.length ?? 0;
  console.log(`  total rows: ${total ?? 0}`);
  if (n === 0) bad("0 contactable homes (active + vetted + email) — outreach has nowhere to go");
  else ok(`${n} contactable homes (active + vetted + email)`);

  // by state
  const byState = {};
  for (const h of contactable ?? []) byState[h.state ?? "?"] = (byState[h.state ?? "?"] ?? 0) + 1;
  const states = Object.entries(byState).sort((a, b) => b[1] - a[1]);
  if (states.length) console.log("  by state: " + states.map(([s, c]) => `${s}:${c}`).join("  "));

  if (zipArg) {
    console.log(`\n  Homes ${zipArg} would contact (directory order):`);
    const zip3 = zipArg.slice(0, 3);
    const exact = contactable.filter((h) => h.zip === zipArg);
    const prefix = contactable.filter((h) => h.zip?.startsWith(zip3) && h.zip !== zipArg);
    const rest = contactable.filter((h) => !h.zip?.startsWith(zip3));
    const ordered = [...exact, ...prefix, ...rest].slice(0, 4);
    if (ordered.length === 0) warn(`no contactable homes near ${zipArg}`);
    for (const h of ordered) console.log(`    - ${h.name} (${h.zip}) <${h.email}>`);
  }
}

async function checkNegotiation(admin) {
  console.log(`\nNegotiation ${negArg}`);
  const { data: neg, error } = await admin
    .from("negotiations")
    .select("id, status, zip, service_type, fee_cents, created_at")
    .eq("id", negArg)
    .single();
  if (error || !neg) {
    bad(`negotiation not found: ${error?.message ?? "no row"}`);
    return;
  }
  console.log(`  status: ${neg.status}  zip: ${neg.zip}  service: ${neg.service_type}  fee_cents: ${neg.fee_cents ?? "—"}`);
  const { data: rows } = await admin
    .from("negotiation_outreach")
    .select("home_name, home_email, status")
    .eq("negotiation_id", negArg)
    .order("created_at", { ascending: true });
  if (!rows?.length) {
    warn("no outreach rows");
    return;
  }
  const counts = {};
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  console.log("  outreach: " + Object.entries(counts).map(([s, c]) => `${s}:${c}`).join("  "));
  for (const r of rows) console.log(`    - [${r.status}] ${r.home_name} <${r.home_email ?? "no email"}>`);
}

async function main() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  console.log("Honest Funeral — pre-launch smoke check");
  checkConfig();
  await checkDirectory(admin);
  if (negArg) await checkNegotiation(admin);

  console.log("");
  if (problems.length) {
    console.log(`✗ ${problems.length} blocker(s) — do NOT flip OUTREACH_LIVE until resolved:`);
    for (const p of problems) console.log(`    - ${p}`);
    console.log("");
    process.exit(1);
  }
  console.log("✓ No blockers found. Follow docs/SMOKE_TEST.md for the full manual run.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
