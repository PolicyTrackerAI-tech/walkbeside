import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env";

const KEYS = [
  "OUTREACH_LIVE",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_WEBHOOK_SECRET",
  "RESEND_FROM",
  "UNSUBSCRIBE_SECRET",
  "ADMIN_EMAILS",
  "CRON_SECRET",
  "ANTHROPIC_API_KEY",
  "POSTMARK_INBOUND_USER",
  "POSTMARK_INBOUND_SECRET",
  "ALERT_WEBHOOK_URL",
];

let saved: Record<string, string | undefined>;

beforeEach(() => {
  // Clean slate: snapshot + unset every var the validator looks at.
  saved = {};
  for (const k of KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function setLiveAllRequired() {
  process.env.OUTREACH_LIVE = "true";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
  process.env.NEXT_PUBLIC_APP_URL = "https://honestfuneral.co";
  process.env.STRIPE_SECRET_KEY = "sk_live_abc";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
  process.env.RESEND_API_KEY = "re_abc";
  process.env.RESEND_WEBHOOK_SECRET = "whsec_resend";
  process.env.UNSUBSCRIBE_SECRET = "unsub";
  process.env.ADMIN_EMAILS = "founder@honestfuneral.co";
  process.env.CRON_SECRET = "cron";
}

describe("validateEnv", () => {
  it("not live + nothing set → warnings, no hard errors", () => {
    const { errors, warnings } = validateEnv();
    expect(errors).toHaveLength(0);
    expect(warnings.some((w) => w.includes("NEXT_PUBLIC_SUPABASE_URL"))).toBe(true);
  });

  it("live + nothing set → errors for core + live-required vars", () => {
    process.env.OUTREACH_LIVE = "true";
    const { errors, warnings } = validateEnv();
    // A CORE var that was only a warning when not-live becomes a hard error.
    expect(errors.some((e) => e.includes("NEXT_PUBLIC_SUPABASE_URL"))).toBe(true);
    expect(warnings.some((w) => w.includes("NEXT_PUBLIC_SUPABASE_URL"))).toBe(false);
    // LIVE-required vars also error.
    expect(errors.some((e) => e.includes("RESEND_WEBHOOK_SECRET"))).toBe(true);
    expect(errors.some((e) => e.includes("ADMIN_EMAILS"))).toBe(true);
    // Stripe is NOT live-required: outreach has no payment dependency.
    expect(errors.some((e) => e.includes("STRIPE"))).toBe(false);
  });

  it("does not double-report a var that's in both core and live buckets", () => {
    process.env.OUTREACH_LIVE = "true";
    const { errors } = validateEnv();
    const svc = errors.filter((e) => e.includes("SUPABASE_SERVICE_ROLE_KEY"));
    expect(svc).toHaveLength(1);
  });

  it("live + all required set → no errors", () => {
    setLiveAllRequired();
    process.env.RESEND_FROM = "Honest Funeral <hello@honestfuneral.co>";
    const { errors } = validateEnv();
    expect(errors).toHaveLength(0);
  });

  it("live + no Stripe key at all → still no errors (outreach has no payment dependency)", () => {
    setLiveAllRequired();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    process.env.RESEND_FROM = "Honest Funeral <hello@honestfuneral.co>";
    const { errors } = validateEnv();
    expect(errors).toHaveLength(0);
  });

  it("live + sandbox RESEND_FROM is a warning, not an error", () => {
    setLiveAllRequired();
    process.env.RESEND_FROM = "onboarding@resend.dev";
    const { errors, warnings } = validateEnv();
    expect(errors).toHaveLength(0);
    expect(warnings.some((w) => w.toLowerCase().includes("sandbox"))).toBe(true);
  });
});
