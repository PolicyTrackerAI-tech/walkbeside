import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Billing guardrail pins — these are LAW, not style.
 *
 * Guardrail #1 (Operating Plan): never take money from funeral homes or from
 * an insurer as our payer → the eligibility allowlist 403s them BEFORE any
 * flag check, and this file pins it.
 * Guardrail #2: never charge the grieving family → no family surface may
 * even IMPORT the Stripe client factory; the fs scan below makes that
 * structural. `stripeAvailable` imports elsewhere are fine and expected (fmtCents
 * moved to lib/format.ts in A9, so family surfaces no longer import
 * "stripe" at all to print a price) — the pins key on the `stripe` factory binding and on the
 * lib/stripe module specifier, not on the module path alone.
 *
 * If the scan ever flags a TEST file: fix the test to the vi.hoisted mock
 * pattern used here; NEVER exclude the file from the scan.
 */

// ---------------------------------------------------------------------------
// Mocks (hoisted so no static factory import appears in this file).
// ---------------------------------------------------------------------------

const {
  stripeMock,
  sessionsCreateMock,
  customersCreateMock,
  portalCreateMock,
  constructEventMock,
  retrieveMock,
} = vi.hoisted(() => {
  const sessionsCreateMock = vi.fn();
  const customersCreateMock = vi.fn();
  const portalCreateMock = vi.fn();
  const constructEventMock = vi.fn();
  const retrieveMock = vi.fn();
  const stripeMock = vi.fn(() => ({
    checkout: { sessions: { create: sessionsCreateMock } },
    customers: { create: customersCreateMock },
    billingPortal: { sessions: { create: portalCreateMock } },
    webhooks: { constructEvent: constructEventMock },
    subscriptions: { retrieve: retrieveMock },
  }));
  return {
    stripeMock,
    sessionsCreateMock,
    customersCreateMock,
    portalCreateMock,
    constructEventMock,
    retrieveMock,
  };
});
vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
  stripeAvailable: () => true,
}));
vi.mock("@/lib/partner/auth", () => ({ requirePartnerApi: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import { requirePartnerApi } from "@/lib/partner/auth";
import { createClient } from "@supabase/supabase-js";
import { RATE_LIMITS, __resetRateLimit } from "@/lib/rate-limit";
import { validateEnv } from "@/lib/env";
import {
  billingEligible,
  BEREAVEMENT_INVOICE_LINE,
  bereavementInvoiceLine,
} from "@/lib/billing";
import { POST as checkoutPost } from "@/app/api/stripe/checkout/route";
import { POST as portalLinkPost } from "@/app/api/stripe/portal-link/route";
import { POST as webhookPost } from "@/app/api/stripe/webhook/route";

const requirePartnerApiMock = vi.mocked(requirePartnerApi);
const createClientMock = vi.mocked(createClient);

/** Queue-based service-role fake (house pattern from partner auth tests).
 *  Results may carry {error} — supabase-js reports failures that way. */
type Recorded = {
  table: string;
  op: "select" | "update";
  filters: Record<string, unknown>;
  update?: Record<string, unknown>;
};
function scriptSvc(results: { data: unknown; error?: unknown }[]) {
  const calls: Recorded[] = [];
  const client = {
    from(table: string) {
      const call: Recorded = { table, op: "select", filters: {} };
      calls.push(call);
      const q = {
        select: () => q,
        update: (v: Record<string, unknown>) => {
          call.op = "update";
          call.update = v;
          return q;
        },
        eq: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        is: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        order: () => q,
        limit: () => q,
        single: () => q,
        then: (resolve: (r: { data: unknown; error?: unknown }) => void) =>
          resolve(results.shift() ?? { data: null }),
      };
      return q;
    },
  };
  createClientMock.mockReturnValue(client as never);
  return calls;
}

function partnerCtx(partner_type: string) {
  return {
    partner: {
      id: "p1",
      name: "Demo Org",
      partner_type,
      status: "active",
      active: true,
      report_token: "t".repeat(48),
      brand_accent: null,
      notification_email: null,
      contact_email: "owner@example.org",
    },
    member: { id: "m1", role: "owner", invited_email: "owner@example.org" },
    email: "owner@example.org",
  } as never;
}

/** Env for a fully configured, live billing surface. */
function stubLiveBillingEnv() {
  vi.stubEnv("BILLING_LIVE", "true");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
  vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetRateLimit();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

// ---------------------------------------------------------------------------
// (a) fs-scan scope pin — the structural "family-invisible" guarantee.
// ---------------------------------------------------------------------------

describe("Stripe factory scope (guardrail #2 — structural)", () => {
  const ROOT = process.cwd();
  const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".claude", "coverage"]);
  const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$/;
  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full, out);
      else if (CODE_EXT.test(entry)) out.push(full);
    }
    return out;
  }
  // The ENTIRE repo — a factory import in scripts/, proxy.ts, a future src/
  // or pages/ must fail this pin exactly like one in app/.
  const files = walk(ROOT);
  const rel = (f: string) => relative(ROOT, f);
  const inStripeApi = (f: string) =>
    rel(f).startsWith(join("app", "api", "stripe") + "/");
  const isFactoryModule = (f: string) => rel(f) === join("lib", "stripe.ts");

  // The lib/stripe module specifier in any spelling: the @/ alias or any
  // relative path (./stripe from inside lib/, ../../lib/stripe from deeper).
  const SPEC = String.raw`["'](?:@\/lib\/stripe|(?:\.{1,2}\/)+(?:lib\/)?stripe)["']`;
  const NAMED_FACTORY_IMPORT = new RegExp(
    String.raw`import\s*(?:type\s*)?\{[^}]*\bstripe\b[^}]*\}\s*from\s*` + SPEC,
  );
  const NAMESPACE_IMPORT = new RegExp(
    String.raw`import\s*\*\s*as\s+\w+\s*from\s*` + SPEC,
  );
  const REEXPORT = new RegExp(
    String.raw`export\s*(?:\{[^}]*\bstripe\b[^}]*\}|\*)\s*from\s*` + SPEC,
  );
  const DYNAMIC_OR_REQUIRE = new RegExp(
    String.raw`\b(?:import|require)\s*\(\s*` + SPEC,
  );

  it("only app/api/stripe/ imports the stripe factory (named or namespace)", () => {
    const offenders = files.filter((f) => {
      if (inStripeApi(f) || isFactoryModule(f)) return false;
      const src = readFileSync(f, "utf8");
      return NAMED_FACTORY_IMPORT.test(src) || NAMESPACE_IMPORT.test(src);
    });
    expect(
      offenders.map(rel),
      "The `stripe` factory may only be imported under app/api/stripe/ — no family (or any other) surface may ever construct a Stripe client. fmtCents/stripeAvailable named imports are fine; test files must mock via vi.hoisted, never import the factory.",
    ).toEqual([]);
  });

  it("nothing re-exports or dynamically imports lib/stripe, anywhere", () => {
    // Re-exporting would launder the factory behind a new module path the
    // named-import pin can't see; dynamic import/require hides the binding.
    // Banned even under app/api/stripe/ — routes have no reason to do either.
    const offenders = files.filter((f) => {
      if (isFactoryModule(f)) return false;
      const src = readFileSync(f, "utf8");
      return REEXPORT.test(src) || DYNAMIC_OR_REQUIRE.test(src);
    });
    expect(offenders.map(rel)).toEqual([]);
  });

  it("no Stripe client is constructed outside lib/stripe.ts", () => {
    const construct = /\bnew\s+Stripe\s*\(/;
    const offenders = files.filter(
      (f) => !isFactoryModule(f) && construct.test(readFileSync(f, "utf8")),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it("partner billing surfaces carry no steering words", () => {
    // Word-ban from the sprint acceptance gate: featured/recommended/sponsor
    // (any form) never appear on billing/partner-desk copy.
    const cardPath = join("components", "partner", "BillingCard.tsx");
    const surfaces = files.filter((f) => {
      const r = rel(f);
      return (
        r === cardPath ||
        r.startsWith(join("app", "portal", "settings") + "/") ||
        r.startsWith(join("app", "admin", "partners") + "/")
      );
    });
    // The card is the primary surface — if it is renamed or moved, this pin
    // must fail loudly rather than silently stop scanning it.
    expect(surfaces.map(rel)).toContain(cardPath);
    const banned = /featured|recommended|sponsor/i;
    const offenders = surfaces.filter((f) =>
      banned.test(readFileSync(f, "utf8")),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it("the webhook path has no RATE_LIMITS entry (throttling Stripe retries drops events)", () => {
    expect(Object.keys(RATE_LIMITS)).not.toContain("/api/stripe/webhook");
  });
});

// ---------------------------------------------------------------------------
// Eligibility, invoice language, boot validation.
// ---------------------------------------------------------------------------

describe("billing eligibility allowlist (guardrail #1)", () => {
  it("only hospices and employers can ever bill", () => {
    expect(billingEligible("hospice")).toBe(true);
    expect(billingEligible("employer")).toBe(true);
    expect(billingEligible("insurer")).toBe(false);
    expect(billingEligible("funeral_home")).toBe(false);
    expect(billingEligible("")).toBe(false);
  });

  it("invoice language is the verbatim procurement framing", () => {
    expect(BEREAVEMENT_INVOICE_LINE).toBe("bereavement support program");
    expect(bereavementInvoiceLine("small")).toBe(
      "bereavement support program — small",
    );
  });

  it("BILLING_LIVE=true refuses to boot without the webhook secret, admin allowlist, and a price id", () => {
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.stubEnv("ADMIN_EMAILS", "");
    vi.stubEnv("STRIPE_PRICE_SMALL", "");
    vi.stubEnv("STRIPE_PRICE_MID", "");
    vi.stubEnv("STRIPE_PRICE_LARGE", "");
    const { errors } = validateEnv();
    const joined = errors.join("\n");
    expect(joined).toContain("STRIPE_SECRET_KEY");
    expect(joined).toContain("STRIPE_WEBHOOK_SECRET");
    expect(joined).toContain("ADMIN_EMAILS");
    expect(joined).toContain("STRIPE_PRICE_");
  });

  it("BILLING_LIVE off adds no billing boot requirements", () => {
    vi.stubEnv("BILLING_LIVE", "");
    const { errors } = validateEnv();
    expect(errors.join("\n")).not.toContain("BILLING_LIVE");
  });
});

// ---------------------------------------------------------------------------
// (b) insurer 403 pin + (c) flag pin — checkout.
// ---------------------------------------------------------------------------

describe("POST /api/stripe/checkout", () => {
  it("403s an insurer even with BILLING_LIVE=true (guardrail #1)", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("insurer"));
    const res = await checkoutPost();
    expect(res.status).toBe(403);
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("403s a funeral-home-shaped partner_type (structurally unpayable)", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("funeral_home"));
    const res = await checkoutPost();
    expect(res.status).toBe(403);
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("409s when BILLING_LIVE is off, without ever touching Stripe", async () => {
    vi.stubEnv("BILLING_LIVE", "");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    const res = await checkoutPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "billing_not_live" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("lets an employer past eligibility (the flag stops it, not the 403)", async () => {
    vi.stubEnv("BILLING_LIVE", "");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("employer"));
    const res = await checkoutPost();
    expect(res.status).toBe(409);
  });

  it("409s a hospice whose census tier the founder has not assigned yet", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([
      {
        data: {
          billing_tier: null,
          stripe_customer_id: null,
          billing_status: null,
        },
      },
    ]);
    const res = await checkoutPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "tier_not_assigned" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("409s quietly when the assigned tier's price env is missing (not a 5xx)", async () => {
    stubLiveBillingEnv(); // only STRIPE_PRICE_SMALL is set
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([
      {
        data: {
          billing_tier: "large",
          stripe_customer_id: null,
          billing_status: null,
        },
      },
    ]);
    const res = await checkoutPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "tier_not_configured" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("409s an already-subscribed partner instead of stacking a second subscription", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([
      {
        data: {
          billing_tier: "small",
          stripe_customer_id: "cus_1",
          billing_status: "active",
        },
      },
    ]);
    const res = await checkoutPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "already_subscribed" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("creates a subscription checkout for an eligible, tiered hospice", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([
      {
        data: {
          billing_tier: "small",
          stripe_customer_id: "cus_1",
          billing_status: null,
        },
      },
    ]);
    sessionsCreateMock.mockResolvedValue({ url: "https://stripe.test/c/1" });
    const res = await checkoutPost();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: "https://stripe.test/c/1" });
    expect(customersCreateMock).not.toHaveBeenCalled(); // customer existed
    const params = sessionsCreateMock.mock.calls[0][0];
    expect(params.mode).toBe("subscription");
    expect(params.customer).toBe("cus_1");
    expect(params.line_items).toEqual([
      { price: "price_small_test", quantity: 1 },
    ]);
    // The amount lives ONLY in Stripe; code passes the env price id.
    expect(JSON.stringify(params)).not.toMatch(/400|800|1500/);
    // subscription_data.metadata is load-bearing: subscription.updated/.deleted
    // events don't carry the session's metadata.
    expect(params.client_reference_id).toBe("p1");
    expect(params.metadata).toEqual({ partner_id: "p1" });
    expect(params.subscription_data.metadata).toEqual({ partner_id: "p1" });
    expect(params.subscription_data.description).toBe(
      "bereavement support program — small",
    );
  });

  it("creates and persists the Stripe customer on first checkout (guarded)", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    const calls = scriptSvc([
      {
        data: {
          billing_tier: "small",
          stripe_customer_id: null,
          billing_status: null,
        },
      },
      { data: [{ stripe_customer_id: "cus_new" }] }, // guarded claim wins
    ]);
    customersCreateMock.mockResolvedValue({ id: "cus_new" });
    sessionsCreateMock.mockResolvedValue({ url: "https://stripe.test/c/2" });
    const res = await checkoutPost();
    expect(res.status).toBe(200);
    expect(customersCreateMock.mock.calls[0][0].metadata).toEqual({
      partner_id: "p1",
    });
    // The persist is guarded onto a still-null row (concurrency: no forking
    // the partner across two customers).
    expect(calls[1].op).toBe("update");
    expect(calls[1].update).toEqual({ stripe_customer_id: "cus_new" });
    expect(calls[1].filters.id).toBe("p1");
    expect(calls[1].filters.stripe_customer_id).toBeNull();
    expect(sessionsCreateMock.mock.calls[0][0].customer).toBe("cus_new");
  });

  it("aborts (503) rather than proceed with an unpersisted customer id", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([
      {
        data: {
          billing_tier: "small",
          stripe_customer_id: null,
          billing_status: null,
        },
      },
      { data: null, error: { message: "boom" } }, // guarded persist fails
    ]);
    customersCreateMock.mockResolvedValue({ id: "cus_new" });
    const res = await checkoutPost();
    expect(res.status).toBe(503);
    expect(sessionsCreateMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/stripe/portal-link", () => {
  it("403s an insurer even with BILLING_LIVE=true (guardrail #1)", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("insurer"));
    const res = await portalLinkPost();
    expect(res.status).toBe(403);
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("409s when BILLING_LIVE is off, without ever touching Stripe", async () => {
    vi.stubEnv("BILLING_LIVE", "");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    const res = await portalLinkPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "billing_not_live" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("409s before Stripe when no customer exists yet", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([{ data: { stripe_customer_id: null } }]);
    const res = await portalLinkPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "no_subscription" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("opens the customer portal for a subscribed hospice", async () => {
    stubLiveBillingEnv();
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([{ data: { stripe_customer_id: "cus_1" } }]);
    portalCreateMock.mockResolvedValue({ url: "https://stripe.test/p/1" });
    const res = await portalLinkPost();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: "https://stripe.test/p/1" });
    expect(portalCreateMock.mock.calls[0][0].customer).toBe("cus_1");
  });
});

// ---------------------------------------------------------------------------
// Webhook lifecycle (the M2 milestone: "the webhook fires").
// ---------------------------------------------------------------------------

function webhookReq(body = "{}") {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    body,
    headers: { "stripe-signature": "t=1,v1=sig" },
  });
}

function stubWebhookEnv() {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
}

/** A completed checkout session event (card flow unless overridden). */
function completedSession(overrides: Record<string, unknown> = {}) {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        mode: "subscription",
        payment_status: "paid",
        metadata: { partner_id: "p1" },
        client_reference_id: "p1",
        customer: "cus_9",
        ...overrides,
      },
    },
  };
}

const HOSPICE_ROW = {
  partner_type: "hospice",
  stripe_customer_id: null,
  billing_started_at: null,
};

describe("POST /api/stripe/webhook", () => {
  it("503s (before reading anything) when the webhook secret is absent", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(503);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("400s a bad signature — the signature IS the auth", async () => {
    stubWebhookEnv();
    constructEventMock.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const calls = scriptSvc([]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(400);
    expect(calls).toEqual([]); // nothing written
  });

  it("checkout.session.completed (paid) → active + set-once started_at + customer backfill", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue(completedSession());
    const calls = scriptSvc([
      { data: [HOSPICE_ROW] },
      { data: null }, // update ok
    ]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls[1].op).toBe("update");
    expect(calls[1].table).toBe("partners");
    expect(calls[1].filters.id).toBe("p1");
    expect(calls[1].update?.billing_status).toBe("active");
    expect(calls[1].update?.stripe_customer_id).toBe("cus_9");
    expect(calls[1].update?.billing_started_at).toBeTruthy();
  });

  it("checkout.session.completed never rewrites an existing started_at", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue(completedSession());
    const calls = scriptSvc([
      {
        data: [
          {
            partner_type: "hospice",
            stripe_customer_id: "cus_9",
            billing_started_at: "2026-08-01T00:00:00Z",
          },
        ],
      },
      { data: null },
    ]);
    await webhookPost(webhookReq());
    expect(calls[1].update).toEqual({ billing_status: "active" });
  });

  it("an unpaid (async ACH) completion records the customer but NOT active", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue(
      completedSession({ payment_status: "unpaid" }),
    );
    const calls = scriptSvc([{ data: [HOSPICE_ROW] }, { data: null }]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    // Only the customer id — activation waits for async_payment_succeeded
    // (or the subscription events).
    expect(calls[1].update).toEqual({ stripe_customer_id: "cus_9" });
  });

  it("ignores a checkout completion pointing at an ineligible partner row (guardrail #1)", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue(completedSession());
    const calls = scriptSvc([
      { data: [{ ...HOSPICE_ROW, partner_type: "insurer" }] },
    ]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls.length).toBe(1); // the read only — no write ever happens
  });

  it("500s (so Stripe retries) when the completion's partner read fails", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue(completedSession());
    scriptSvc([{ data: null, error: { message: "timeout" } }]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(500);
  });

  it("subscription.updated writes the CURRENT Stripe state, not the event snapshot", async () => {
    stubWebhookEnv();
    // The event claims active — but the subscription is already canceled
    // (stale delivery after .deleted). The write must be canceled: replayed
    // or reordered events can never resurrect a canceled partner.
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          status: "active",
          metadata: { partner_id: "p1" },
          customer: "cus_9",
        },
      },
    });
    retrieveMock.mockResolvedValue({ status: "canceled", items: { data: [] } });
    const calls = scriptSvc([
      { data: [{ id: "p1", partner_type: "hospice" }] },
      { data: null },
    ]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(retrieveMock).toHaveBeenCalledWith("sub_1");
    expect(calls[1].update).toEqual({
      billing_status: "canceled",
      billing_plan: null,
    });
  });

  it("subscription.updated (past_due) maps explicitly and stamps billing_plan", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          status: "past_due",
          metadata: { partner_id: "p1" },
          customer: "cus_9",
        },
      },
    });
    retrieveMock.mockResolvedValue({
      status: "past_due",
      items: { data: [{ price: { id: "price_small_test" } }] },
    });
    const calls = scriptSvc([
      { data: [{ id: "p1", partner_type: "hospice" }] },
      { data: null },
    ]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls[1].update).toEqual({
      billing_status: "past_due",
      billing_plan: "price_small_test",
    });
  });

  it("an active subscription write also back-stamps a missing started_at (set-once)", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "customer.subscription.created",
      data: {
        object: { id: "sub_1", status: "active", metadata: { partner_id: "p1" } },
      },
    });
    retrieveMock.mockResolvedValue({
      status: "active",
      items: { data: [{ price: { id: "price_small_test" } }] },
    });
    const calls = scriptSvc([
      { data: [{ id: "p1", partner_type: "hospice" }] },
      { data: null }, // status write
      { data: null }, // guarded stamp
    ]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls[2].op).toBe("update");
    expect(calls[2].update?.billing_started_at).toBeTruthy();
    expect(calls[2].filters.billing_started_at).toBeNull(); // guarded set-once
  });

  it("a never-started subscription (incomplete) writes NOTHING — the partner can retry checkout", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          status: "incomplete",
          metadata: { partner_id: "p1" },
        },
      },
    });
    retrieveMock.mockResolvedValue({ status: "incomplete", items: { data: [] } });
    const calls = scriptSvc([{ data: [{ id: "p1", partner_type: "hospice" }] }]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200); // acknowledged, ignored — no retry churn
    expect(calls.length).toBe(1); // resolution read only, no write
  });

  it("ignores subscription events resolving to an ineligible partner row (guardrail #1)", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_1", status: "active", metadata: { partner_id: "p9" } },
      },
    });
    const calls = scriptSvc([{ data: [{ id: "p9", partner_type: "insurer" }] }]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(retrieveMock).not.toHaveBeenCalled();
    expect(calls.length).toBe(1);
  });

  it("subscription.deleted → canceled", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { id: "sub_1", status: "canceled", metadata: { partner_id: "p1" } },
      },
    });
    const calls = scriptSvc([
      { data: [{ id: "p1", partner_type: "hospice" }] },
      { data: null },
    ]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls[1].update).toEqual({ billing_status: "canceled" });
    expect(calls[1].filters.id).toBe("p1");
  });

  it("500s (so Stripe retries) when a lifecycle write fails", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { id: "sub_1", status: "canceled", metadata: { partner_id: "p1" } },
      },
    });
    scriptSvc([
      { data: [{ id: "p1", partner_type: "hospice" }] },
      { data: null, error: { message: "boom" } }, // write fails
    ]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(500);
  });

  it("500s (so Stripe retries) when the partner lookup itself fails", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_1", status: "active", metadata: { partner_id: "p1" } },
      },
    });
    scriptSvc([{ data: null, error: { message: "pool exhausted" } }]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(500);
  });

  it("unknown event types are acknowledged and ignored", async () => {
    stubWebhookEnv();
    constructEventMock.mockReturnValue({
      type: "invoice.paid",
      data: { object: {} },
    });
    const calls = scriptSvc([]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls).toEqual([]);
  });

  it("returns NextResponse everywhere (sanity: handlers stay route-shaped)", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    const res = await webhookPost(webhookReq());
    expect(res).toBeInstanceOf(NextResponse);
  });
});
