/**
 * Centralised env access. Server-only values live behind helper getters
 * that throw if used at runtime without being set — this avoids silently
 * making API calls with empty keys.
 */

import { BILLING_PRICE_ENV } from "./billing";

export const PUBLIC = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export function requireServer(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing env var ${name}. Set it in .env.local before using this feature.`,
    );
  }
  return v;
}

export function hasServer(name: string): boolean {
  return Boolean(process.env[name]);
}

export const FEATURES = {
  supabase: () =>
    Boolean(PUBLIC.supabaseUrl && PUBLIC.supabaseAnonKey),
  claude: () => hasServer("ANTHROPIC_API_KEY"),
  stripe: () => hasServer("STRIPE_SECRET_KEY"),
  /**
   * Checkout-capable: a Stripe key plus at least one tier price id (the env
   * names come from BILLING_PRICE_ENV in lib/billing.ts — created by the
   * founder in the Stripe dashboard; amounts never live in code).
   * INSTITUTIONAL billing only (hospice/employer partners) — there is no
   * family payment anywhere (guardrail #2). "At least one" is deliberately
   * loose (the founder may configure tiers incrementally); checkout itself
   * requires the SPECIFIC assigned tier's env and 409s quietly otherwise.
   * The UI's "configured" signal is this AND BILLING_LIVE === "true" AND
   * billingEligible(partner_type), all read at request time.
   */
  billing: () =>
    hasServer("STRIPE_SECRET_KEY") &&
    Object.values(BILLING_PRICE_ENV).some(hasServer),
  email: () => hasServer("RESEND_API_KEY"),
};

// ---------------------------------------------------------------------------
// Boot-time validation (called from instrumentation.ts)
//
// The lazy `requireServer()` getters above throw only at the moment a feature
// is used — too late when the failure is "OUTREACH_LIVE got flipped on but the
// Stripe webhook secret is missing" (a payment fires, then the send path
// explodes). This validator runs once at server start and, crucially, applies
// a STRICTER set of checks when OUTREACH_LIVE === "true" so the launch switch
// can't fire with a missing send-path secret.
// ---------------------------------------------------------------------------

function isMissing(name: string): boolean {
  const v = process.env[name];
  return !v || v.trim() === "";
}

/** Needed for a working app. Warn in dev; hard error when going live. */
const CORE_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

/**
 * Required to safely run LIVE outreach (real emails to funeral homes). These
 * are LIVE-specific and intentionally do NOT repeat CORE_VARS — when live, a
 * missing CORE var already escalates to an error above, so listing it here too
 * would print the failure twice.
 *
 * Stripe is deliberately NOT here: the family-facing product is free, and
 * Stripe exists only for INSTITUTIONAL billing (hospice/employer), which has
 * its own switch — `BILLING_LIVE`, validated in its own block below. Outreach
 * has no payment dependency, so it must not fail to boot over a Stripe var
 * (that requirement was leftover coupling from the decommissioned $49
 * family-fee model).
 */
const LIVE_REQUIRED_VARS = [
  "RESEND_API_KEY",
  "RESEND_WEBHOOK_SECRET", // route requireServer()s it; missing → webhook 500s, bounces unhandled
  "UNSUBSCRIBE_SECRET",
  "ADMIN_EMAILS", // empty = any logged-in user is an admin; dangerous when live
  "CRON_SECRET",
];

/** Nice-to-have when live; degrade gracefully, so warn rather than block. */
const LIVE_RECOMMENDED_VARS = [
  "ANTHROPIC_API_KEY", // outreach copy falls back to deterministic templates
  "POSTMARK_INBOUND_USER", // funeral-home reply pipeline
  "POSTMARK_INBOUND_SECRET",
  "ALERT_WEBHOOK_URL", // push alerts for failed sends / bounces
];

export function validateEnv(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const live = process.env.OUTREACH_LIVE === "true";

  for (const v of CORE_VARS) {
    if (isMissing(v)) {
      if (live) errors.push(`${v} is required but missing`);
      else
        warnings.push(
          `${v} is not set (ok for partial local dev; required for a working app)`,
        );
    }
  }

  if (live) {
    for (const v of LIVE_REQUIRED_VARS) {
      if (isMissing(v)) {
        errors.push(
          `OUTREACH_LIVE=true but ${v} is missing — refusing to run live outreach without it`,
        );
      }
    }
    for (const v of LIVE_RECOMMENDED_VARS) {
      if (isMissing(v)) {
        warnings.push(`OUTREACH_LIVE=true and ${v} is not set (feature degraded)`);
      }
    }
    // Footguns: live mode with test/sandbox values.
    const from = (process.env.RESEND_FROM ?? "").toLowerCase();
    if (from.includes("resend.dev") || from.includes("onboarding@")) {
      warnings.push(
        "RESEND_FROM looks like a Resend sandbox address — set a verified-domain sender before launch",
      );
    }
  }

  // Institutional billing switch (mirrors the OUTREACH_LIVE pattern): the
  // flag must never come on with a missing webhook secret — checkout would
  // charge a hospice while every lifecycle event 503s, so billing_status
  // never leaves 'none' and the portal keeps offering checkout to a partner
  // who already paid. ADMIN_EMAILS is required because /admin/partners tier
  // assignment now selects the Stripe price (the admin gate is permissive
  // until it's set).
  if (process.env.BILLING_LIVE === "true") {
    for (const v of ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "ADMIN_EMAILS"]) {
      if (isMissing(v)) {
        errors.push(
          `BILLING_LIVE=true but ${v} is missing — refusing to run institutional billing without it`,
        );
      }
    }
    if (!Object.values(BILLING_PRICE_ENV).some((v) => !isMissing(v))) {
      errors.push(
        "BILLING_LIVE=true but no STRIPE_PRICE_* tier price id is set — checkout can never succeed",
      );
    }
  }

  return { errors, warnings };
}

/**
 * Validate the environment at server boot. Logs warnings; throws (aborting
 * startup) on hard errors so a misconfigured deploy fails fast and loud.
 */
export function assertEnvAtBoot(): void {
  const { errors, warnings } = validateEnv();
  for (const w of warnings) console.warn(`[env] warning: ${w}`);
  if (errors.length) {
    throw new Error(
      `[env] Refusing to start — fix these environment variables:\n  - ${errors.join("\n  - ")}`,
    );
  }
  if (process.env.OUTREACH_LIVE === "true") {
    console.log(
      "[env] OUTREACH_LIVE=true — live outreach enabled; required vars present.",
    );
  }
}
