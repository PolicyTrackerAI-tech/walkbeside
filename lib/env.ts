/**
 * Centralised env access. Server-only values live behind helper getters
 * that throw if used at runtime without being set — this avoids silently
 * making API calls with empty keys.
 */

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
 * Required to safely run LIVE outreach (real money + real emails). These are
 * LIVE-specific and intentionally do NOT repeat CORE_VARS — when live, a
 * missing CORE var already escalates to an error above, so listing it here too
 * would print the failure twice.
 */
const LIVE_REQUIRED_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "UNSUBSCRIBE_SECRET",
  "ADMIN_EMAILS", // empty = any logged-in user is an admin; dangerous when live
  "CRON_SECRET",
];

/** Nice-to-have when live; degrade gracefully, so warn rather than block. */
const LIVE_RECOMMENDED_VARS = [
  "ANTHROPIC_API_KEY", // outreach copy falls back to deterministic templates
  "POSTMARK_INBOUND_USER", // funeral-home reply pipeline
  "POSTMARK_INBOUND_SECRET",
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
    if ((process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_")) {
      errors.push(
        "OUTREACH_LIVE=true but STRIPE_SECRET_KEY is a TEST key (sk_test_) — use a live key",
      );
    }
    const from = (process.env.RESEND_FROM ?? "").toLowerCase();
    if (from.includes("resend.dev") || from.includes("onboarding@")) {
      warnings.push(
        "RESEND_FROM looks like a Resend sandbox address — set a verified-domain sender before launch",
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
