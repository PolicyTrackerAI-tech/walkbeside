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
 * structural. `fmtCents`/`stripeAvailable` imports elsewhere are fine and
 * expected (they exist today on family surfaces for displaying quote
 * amounts) — the pin keys on the `stripe` factory specifier, not the module.
 *
 * If the scan ever flags a TEST file: fix the test to the vi.hoisted mock
 * pattern used here; NEVER exclude the file from the scan.
 */

// ---------------------------------------------------------------------------
// Mocks (hoisted so no static `import { stripe }` appears in this file).
// ---------------------------------------------------------------------------

const {
  stripeMock,
  sessionsCreateMock,
  customersCreateMock,
  portalCreateMock,
  constructEventMock,
} = vi.hoisted(() => {
  const sessionsCreateMock = vi.fn();
  const customersCreateMock = vi.fn();
  const portalCreateMock = vi.fn();
  const constructEventMock = vi.fn();
  const stripeMock = vi.fn(() => ({
    checkout: { sessions: { create: sessionsCreateMock } },
    customers: { create: customersCreateMock },
    billingPortal: { sessions: { create: portalCreateMock } },
    webhooks: { constructEvent: constructEventMock },
  }));
  return {
    stripeMock,
    sessionsCreateMock,
    customersCreateMock,
    portalCreateMock,
    constructEventMock,
  };
});
vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
  stripeAvailable: () => true,
  fmtCents: (c: number) => String(c),
}));
vi.mock("@/lib/partner/auth", () => ({ requirePartnerApi: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import { requirePartnerApi } from "@/lib/partner/auth";
import { createClient } from "@supabase/supabase-js";
import { RATE_LIMITS, __resetRateLimit } from "@/lib/rate-limit";
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

/** Queue-based service-role fake (house pattern from partner auth tests). */
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
  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry === ".next") continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full, out);
      else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
    }
    return out;
  }
  const files = ["app", "components", "lib"].flatMap((d) => walk(join(ROOT, d)));

  it("only app/api/stripe/ imports the stripe factory", () => {
    const factoryImport =
      /import\s*\{[^}]*\bstripe\b[^}]*\}\s*from\s*["']@\/lib\/stripe["']/;
    const offenders = files.filter((f) => {
      const rel = relative(ROOT, f);
      if (rel.startsWith(join("app", "api", "stripe") + "/")) return false;
      return factoryImport.test(readFileSync(f, "utf8"));
    });
    expect(
      offenders.map((f) => relative(ROOT, f)),
      "The `stripe` factory may only be imported under app/api/stripe/ — no family (or any other) surface may ever construct a Stripe client. fmtCents/stripeAvailable imports are fine; test files must mock via vi.hoisted, never import the factory.",
    ).toEqual([]);
  });

  it("no Stripe client is constructed outside lib/stripe.ts", () => {
    const construct = /\bnew\s+Stripe\s*\(/;
    const offenders = files.filter((f) => {
      const rel = relative(ROOT, f);
      if (rel === join("lib", "stripe.ts")) return false;
      return construct.test(readFileSync(f, "utf8"));
    });
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it("partner billing surfaces carry no steering words", () => {
    // Word-ban from the sprint acceptance gate: featured/recommended/sponsor
    // (any form) never appear on billing/partner-desk copy.
    const surfaces = files.filter((f) => {
      const rel = relative(ROOT, f);
      return (
        rel === join("components", "partner", "BillingCard.tsx") ||
        rel.startsWith(join("app", "portal", "settings") + "/") ||
        rel.startsWith(join("app", "admin", "partners") + "/")
      );
    });
    expect(surfaces.length).toBeGreaterThan(0);
    const banned = /featured|recommended|sponsor/i;
    const offenders = surfaces.filter((f) => banned.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it("the webhook has no RATE_LIMITS entry (throttling Stripe retries drops events)", () => {
    expect(Object.keys(RATE_LIMITS).some((p) => p.includes("stripe"))).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// Eligibility + invoice-language constants.
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
});

// ---------------------------------------------------------------------------
// (b) insurer 403 pin + (c) flag pin — the checkout route.
// ---------------------------------------------------------------------------

describe("POST /api/stripe/checkout", () => {
  it("403s an insurer even with BILLING_LIVE=true (guardrail #1)", async () => {
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("insurer"));
    const res = await checkoutPost();
    expect(res.status).toBe(403);
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("403s a funeral-home-shaped partner_type (structurally unpayable)", async () => {
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
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
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([{ data: { billing_tier: null, stripe_customer_id: null } }]);
    const res = await checkoutPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "tier_not_assigned" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("creates a subscription checkout for an eligible, tiered hospice", async () => {
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([
      { data: { billing_tier: "small", stripe_customer_id: "cus_1" } },
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
});

describe("POST /api/stripe/portal-link", () => {
  it("403s an insurer even with BILLING_LIVE=true (guardrail #1)", async () => {
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("insurer"));
    const res = await portalLinkPost();
    expect(res.status).toBe(403);
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("409s before Stripe when no customer exists yet", async () => {
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    requirePartnerApiMock.mockResolvedValue(partnerCtx("hospice"));
    scriptSvc([{ data: { stripe_customer_id: null } }]);
    const res = await portalLinkPost();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "no_subscription" });
    expect(stripeMock).not.toHaveBeenCalled();
  });

  it("opens the customer portal for a subscribed hospice", async () => {
    vi.stubEnv("BILLING_LIVE", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_PRICE_SMALL", "price_small_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
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

describe("POST /api/stripe/webhook", () => {
  it("503s (before reading anything) when the webhook secret is absent", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(503);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("400s a bad signature — the signature IS the auth", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    constructEventMock.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const calls = scriptSvc([]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(400);
    expect(calls).toEqual([]); // nothing written
  });

  it("checkout.session.completed → active + set-once started_at + customer backfill", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { partner_id: "p1" },
          client_reference_id: "p1",
          customer: "cus_9",
        },
      },
    });
    const calls = scriptSvc([
      { data: { stripe_customer_id: null, billing_started_at: null } },
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
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: { metadata: { partner_id: "p1" }, customer: "cus_9" },
      },
    });
    const calls = scriptSvc([
      {
        data: {
          stripe_customer_id: "cus_9",
          billing_started_at: "2026-08-01T00:00:00Z",
        },
      },
      { data: null },
    ]);
    await webhookPost(webhookReq());
    expect(calls[1].update).toEqual({ billing_status: "active" });
  });

  it("subscription.updated maps statuses explicitly and stamps billing_plan", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          status: "past_due",
          metadata: { partner_id: "p1" },
          customer: "cus_9",
          items: { data: [{ price: { id: "price_small_test" } }] },
        },
      },
    });
    const calls = scriptSvc([{ data: null }]); // update ok
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls[0].op).toBe("update");
    expect(calls[0].update).toEqual({
      billing_status: "past_due",
      billing_plan: "price_small_test",
    });
  });

  it("an unmapped subscription status writes NOTHING (check-constraint trap)", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          status: "paused",
          metadata: { partner_id: "p1" },
          customer: "cus_9",
          items: { data: [] },
        },
      },
    });
    const calls = scriptSvc([]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200); // acknowledged, ignored — no retry churn
    expect(calls).toEqual([]);
  });

  it("subscription.deleted → canceled", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    constructEventMock.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { status: "canceled", metadata: { partner_id: "p1" } },
      },
    });
    const calls = scriptSvc([{ data: null }]);
    const res = await webhookPost(webhookReq());
    expect(res.status).toBe(200);
    expect(calls[0].update).toEqual({ billing_status: "canceled" });
    expect(calls[0].filters.id).toBe("p1");
  });

  it("unknown event types are acknowledged and ignored", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
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
