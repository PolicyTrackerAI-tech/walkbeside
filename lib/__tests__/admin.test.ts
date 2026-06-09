import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAdminEmail, adminAllowlistConfigured } from "@/lib/admin";

let saved: string | undefined;
beforeEach(() => {
  saved = process.env.ADMIN_EMAILS;
  delete process.env.ADMIN_EMAILS;
});
afterEach(() => {
  if (saved === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = saved;
});

describe("isAdminEmail", () => {
  it("permissive when ADMIN_EMAILS is unset (any logged-in user is admin)", () => {
    expect(isAdminEmail("anyone@example.com")).toBe(true);
    expect(isAdminEmail(null)).toBe(true);
    expect(adminAllowlistConfigured()).toBe(false);
  });

  it("only listed emails when configured, case-insensitive", () => {
    process.env.ADMIN_EMAILS = "Founder@Honestfuneral.co, ops@x.com";
    expect(adminAllowlistConfigured()).toBe(true);
    expect(isAdminEmail("founder@honestfuneral.co")).toBe(true);
    expect(isAdminEmail("OPS@X.COM")).toBe(true);
    expect(isAdminEmail("stranger@evil.com")).toBe(false);
  });

  it("null/empty email is rejected once an allowlist is configured", () => {
    process.env.ADMIN_EMAILS = "founder@honestfuneral.co";
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });
});
