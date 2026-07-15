import { describe, it, expect, beforeEach } from "vitest";
import {
  RATE_LIMITS,
  rateLimit,
  clientIp,
  __resetRateLimit,
} from "@/lib/rate-limit";

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

describe("RATE_LIMITS coverage", () => {
  // Every public POST endpoint that reaches Claude must have a rule — the
  // proxy matches exact pathnames, so a sub-path like draft-letter is NOT
  // covered by its parent's entry (that gap shipped once; keep it closed).
  it("covers every Claude-calling public endpoint", () => {
    for (const path of [
      "/api/analyze-price-list",
      "/api/analyze-price-list/draft-letter",
      "/api/analyze-price-list/explain",
      "/api/compare-bill",
      "/api/extract-price-list-image",
      "/api/subscription-finder",
      "/api/eulogy",
      "/api/obituary",
    ]) {
      expect(RATE_LIMITS[path], `${path} missing from RATE_LIMITS`).toBeDefined();
    }
  });

  it("throttles the draft-letter rule past its limit", () => {
    const rule = RATE_LIMITS["/api/analyze-price-list/draft-letter"];
    const t = 4_000_000;
    for (let i = 0; i < rule.limit; i++) {
      expect(rateLimit("ip:/api/analyze-price-list/draft-letter", rule, t).ok).toBe(true);
    }
    // The 9th call inside the same minute is rejected.
    expect(rateLimit("ip:/api/analyze-price-list/draft-letter", rule, t).ok).toBe(false);
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
