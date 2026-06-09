import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the heavy deps so we can drive each branch deterministically.
const constructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  stripe: () => ({ webhooks: { constructEvent } }),
}));
vi.mock("@/lib/negotiation/send", () => ({
  sendOutreachForNegotiation: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({})) }));

import { POST } from "@/app/api/stripe/webhook/route";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";

const sendMock = vi.mocked(sendOutreachForNegotiation);

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "svc";
  constructEvent.mockReset();
  sendMock.mockReset();
});

const signed = () =>
  new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "sig" },
    body: "{}",
  });

const completed = (negotiationId?: string) => ({
  type: "checkout.session.completed",
  data: { object: { metadata: negotiationId ? { negotiationId } : {} } },
});

describe("stripe webhook", () => {
  it("400s a request with no stripe-signature header", async () => {
    const res = await POST(
      new Request("http://localhost/x", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("no_signature");
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("400s (not 500) when the signature is invalid", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad sig");
    });
    const res = await POST(signed());
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("ignores non-checkout events with a 200 and no send", async () => {
    constructEvent.mockReturnValue({ type: "charge.succeeded", data: { object: {} } });
    const res = await POST(signed());
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("checkout.session.completed without a negotiationId → 200, no send", async () => {
    constructEvent.mockReturnValue(completed(undefined));
    const res = await POST(signed());
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("checkout.session.completed with a negotiationId → sends, 200", async () => {
    constructEvent.mockReturnValue(completed("neg_123"));
    sendMock.mockResolvedValue({ sent: 1, dryRun: 0, skipped: 0, failed: 0 });
    const res = await POST(signed());
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledWith(expect.anything(), "neg_123");
  });

  it("returns 500 when sending throws (so Stripe retries the webhook)", async () => {
    constructEvent.mockReturnValue(completed("neg_123"));
    sendMock.mockRejectedValue(new Error("db down"));
    const res = await POST(signed());
    expect(res.status).toBe(500);
  });
});
