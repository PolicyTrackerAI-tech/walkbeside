import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://test.local" },
  requireServer: (k: string) => (k === "CRON_SECRET" ? "cron-secret" : "service-key"),
}));
vi.mock("@/lib/observability", () => ({ logEvent: vi.fn(), captureError: vi.fn() }));

import { createClient } from "@supabase/supabase-js";
import { GET } from "../route";

const createClientMock = vi.mocked(createClient);

function fakeAdmin(fail: string[] = []) {
  const deletes: { table: string; filter: unknown[] }[] = [];
  createClientMock.mockReturnValue({
    from: (table: string) => ({
      delete: () => ({
        lt: (...filter: unknown[]) => ({
          select: async () => {
            deletes.push({ table, filter });
            return fail.includes(table)
              ? { data: null, error: { message: "relation does not exist" } }
              : { data: [{ id: "a" }, { id: "b" }], error: null };
          },
        }),
      }),
    }),
  } as never);
  return deletes;
}

const run = (auth?: string) =>
  GET(new Request("http://test.local/api/cron/purge-expired-links", {
    headers: auth ? { authorization: auth } : {},
  }));

beforeEach(() => createClientMock.mockReset());

describe("GET /api/cron/purge-expired-links (audit A8-05)", () => {
  it("refuses a call without the cron secret and deletes nothing", async () => {
    const deletes = fakeAdmin();
    expect((await run()).status).toBe(401);
    expect((await run("Bearer wrong")).status).toBe(401);
    expect(deletes).toHaveLength(0);
  });

  it("deletes only rows whose expiry has passed, in both link tables", async () => {
    const deletes = fakeAdmin();
    const body = await (await run("Bearer cron-secret")).json();
    expect(body).toEqual({ ok: true, purged: { share_links: 2, household_links: 2 } });
    expect(deletes.map((d) => d.table)).toEqual(["share_links", "household_links"]);
    for (const d of deletes) {
      expect(d.filter[0]).toBe("expires_at");
      expect(Date.parse(String(d.filter[1]))).toBeLessThanOrEqual(Date.now());
    }
  });

  it("one table failing doesn't stop the other", async () => {
    fakeAdmin(["share_links"]);
    const body = await (await run("Bearer cron-secret")).json();
    expect(body.purged).toEqual({ share_links: null, household_links: 2 });
  });

  it("is scheduled in vercel.json", () => {
    const cfg = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8"));
    expect(cfg.crons.map((c: { path: string }) => c.path)).toContain("/api/cron/purge-expired-links");
  });
});
