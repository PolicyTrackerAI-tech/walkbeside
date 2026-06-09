import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the Supabase server helper so we control who's "logged in".
vi.mock("@/lib/supabase/server", () => ({ getUser: vi.fn() }));
// Mock next/navigation so redirect()/notFound() halt (as they do in Next) and
// we can assert how they were called.
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("REDIRECT");
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

import { getUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { requireAdminApi, requireAdminPage } from "@/lib/admin-auth";

const getUserMock = vi.mocked(getUser);
const redirectMock = vi.mocked(redirect);
const notFoundMock = vi.mocked(notFound);

let saved: string | undefined;
beforeEach(() => {
  saved = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = "founder@honestfuneral.co";
  getUserMock.mockReset();
  redirectMock.mockClear();
  notFoundMock.mockClear();
});
afterEach(() => {
  if (saved === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = saved;
});

// P0: no auth-bypass — both guards must reject anonymous + non-allowlisted
// callers and only pass allowlisted admins.
describe("requireAdminApi", () => {
  it("401s an anonymous caller", async () => {
    getUserMock.mockResolvedValue(null as never);
    const res = await requireAdminApi();
    expect(getUserMock).toHaveBeenCalled();
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("403s a logged-in non-admin", async () => {
    getUserMock.mockResolvedValue({ email: "stranger@evil.com" } as never);
    const res = await requireAdminApi();
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("passes (returns null) an allowlisted admin", async () => {
    getUserMock.mockResolvedValue({ email: "founder@honestfuneral.co" } as never);
    const res = await requireAdminApi();
    expect(res).toBeNull();
  });
});

describe("requireAdminPage", () => {
  it("redirects an anonymous caller to login with an encoded next path", async () => {
    getUserMock.mockResolvedValue(null as never);
    await expect(requireAdminPage("/admin/messages")).rejects.toThrow("REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login?next=%2Fadmin%2Fmessages");
  });

  it("404s a logged-in non-admin (doesn't confirm the route exists)", async () => {
    getUserMock.mockResolvedValue({ email: "stranger@evil.com" } as never);
    await expect(requireAdminPage("/admin/vetting")).rejects.toThrow("NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("returns the email for an allowlisted admin", async () => {
    getUserMock.mockResolvedValue({ email: "founder@honestfuneral.co" } as never);
    await expect(requireAdminPage("/admin/vetting")).resolves.toBe(
      "founder@honestfuneral.co",
    );
    expect(redirectMock).not.toHaveBeenCalled();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
