import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, clientIp, __resetRateLimit } from "@/lib/rate-limit";

const RULE = { limit: 3, windowMs: 60_000 };

beforeEach(() => __resetRateLimit());

describe("rateLimit token bucket", () => {
  it("allows up to the limit, then 429s", () => {
    const t = 1_000_000;
    expect(rateLimit("ip:/x", RULE, t).ok).toBe(true);
    expect(rateLimit("ip:/x", RULE, t).ok).toBe(true);
    expect(rateLimit("ip:/x", RULE, t).ok).toBe(true);
    const blocked = rateLimit("ip:/x", RULE, t);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("refills over time", () => {
    const t = 2_000_000;
    rateLimit("ip:/y", RULE, t);
    rateLimit("ip:/y", RULE, t);
    rateLimit("ip:/y", RULE, t);
    expect(rateLimit("ip:/y", RULE, t).ok).toBe(false);
    // A full window later → fully refilled.
    expect(rateLimit("ip:/y", RULE, t + 60_000).ok).toBe(true);
  });

  it("keys are independent", () => {
    const t = 3_000_000;
    for (let i = 0; i < 3; i++) rateLimit("a:/x", RULE, t);
    expect(rateLimit("a:/x", RULE, t).ok).toBe(false);
    // Different key is unaffected.
    expect(rateLimit("b:/x", RULE, t).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(h)).toBe("1.2.3.4");
  });
  it("falls back to x-real-ip then 'unknown'", () => {
    expect(clientIp(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
