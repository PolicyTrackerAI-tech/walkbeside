import { describe, it, expect, vi } from "vitest";

// lib/analytics.ts imports @vercel/analytics for trackTool; stub it so the
// pure sanitizer can be tested without a browser runtime.
vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

import { sanitizeAnalyticsUrl } from "@/lib/analytics";

// P0: nothing person- or credential-shaped may reach analytics. Every rule
// here mirrors a real URL the app produces today.
describe("sanitizeAnalyticsUrl", () => {
  it("strips referral codes from the query", () => {
    expect(
      sanitizeAnalyticsUrl("https://honestfuneral.co/plan-now?ref=HF-7KQ2MD"),
    ).toBe("https://honestfuneral.co/plan-now");
  });

  it("strips unsubscribe tokens and auth-callback params", () => {
    expect(
      sanitizeAnalyticsUrl(
        "https://honestfuneral.co/unsubscribe?token=abc123&list=nurture",
      ),
    ).toBe("https://honestfuneral.co/unsubscribe");
    expect(
      sanitizeAnalyticsUrl(
        "https://honestfuneral.co/auth/callback?code=secret&next=%2Fportal",
      ),
    ).toBe("https://honestfuneral.co/auth/callback");
  });

  it("collapses per-case UUID path segments to [id]", () => {
    expect(
      sanitizeAnalyticsUrl(
        "https://honestfuneral.co/negotiate/1f6b0e6a-2f4b-4b1e-9a3c-8d2f6c1a9e0b/status",
      ),
    ).toBe("https://honestfuneral.co/negotiate/[id]/status");
  });

  it("collapses bearer-token path segments to [token]", () => {
    const token = "680668b4c6462a82b2d0f036259d726aeb676ab0b4e2ce69"; // 48-hex, report_token shape
    expect(
      sanitizeAnalyticsUrl(`https://honestfuneral.co/partner/r/${token}/links`),
    ).toBe("https://honestfuneral.co/partner/r/[token]/links");
  });

  it("drops URL fragments (implicit-flow tokens live there)", () => {
    expect(
      sanitizeAnalyticsUrl("https://honestfuneral.co/#access_token=eyJhbGci"),
    ).toBe("https://honestfuneral.co/");
  });

  it("leaves ordinary content paths untouched", () => {
    expect(
      sanitizeAnalyticsUrl("https://honestfuneral.co/funeral-costs/salt-lake-city"),
    ).toBe("https://honestfuneral.co/funeral-costs/salt-lake-city");
    // Short ids and ordinary words never trip the hex rule.
    expect(sanitizeAnalyticsUrl("https://honestfuneral.co/guides/caskets")).toBe(
      "https://honestfuneral.co/guides/caskets",
    );
  });

  it("returns null for an unparsable URL (caller drops the event)", () => {
    expect(sanitizeAnalyticsUrl("not a url")).toBeNull();
    expect(sanitizeAnalyticsUrl("")).toBeNull();
  });
});
