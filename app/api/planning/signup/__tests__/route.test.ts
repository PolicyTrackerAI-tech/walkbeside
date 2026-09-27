import { describe, it, expect, beforeEach, vi } from "vitest";
import crypto from "node:crypto";

vi.mock("@/lib/env", () => ({
  FEATURES: { supabase: () => true, email: () => true },
  PUBLIC: { appUrl: "https://honestfuneral.co" },
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/observability", () => ({ hashId: () => "h" }));

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { POST, ipHashFor } from "../route";

const createClientMock = vi.mocked(createClient);
const sendEmailMock = vi.mocked(sendEmail);

function fakeDb(error: { message: string } | null) {
  const inserts: Record<string, unknown>[] = [];
  createClientMock.mockResolvedValue({
    from: () => ({
      insert: async (row: Record<string, unknown>) => {
        inserts.push(row);
        return { error };
      },
    }),
  } as never);
  return inserts;
}

function signup(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return POST(
    new Request("https://honestfuneral.co/api/planning/signup", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...headers },
      body: JSON.stringify(body),
    }) as never,
  );
}

beforeEach(() => {
  createClientMock.mockReset();
  sendEmailMock.mockReset();
  sendEmailMock.mockResolvedValue({ id: "e1" } as never);
  delete process.env.IP_HASH_SECRET;
});

describe("POST /api/planning/signup (audit A1-07, A8-07)", () => {
  it("a fresh signup is stored and welcomed once", async () => {
    const inserts = fakeDb(null);
    const res = await signup({ email: "a@b.com", source: "grief" });
    expect(res.status).toBe(200);
    expect(inserts[0]).toMatchObject({ email: "a@b.com", source: "grief" });
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it("a repeat signup from the same page is not welcomed again", async () => {
    fakeDb({ message: "duplicate key value violates unique constraint" });
    const res = await signup({ email: "a@b.com", source: "grief" });
    expect(res.status).toBe(200);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("an unknown source is stored as 'other', so it can't mint new unique keys", async () => {
    const inserts = fakeDb(null);
    await signup({ email: "a@b.com", source: "spam-9f3a" });
    expect(inserts[0].source).toBe("other");
  });

  it("a request from another site is refused before anything is stored or sent", async () => {
    const inserts = fakeDb(null);
    const res = await signup({ email: "a@b.com" }, { origin: "https://evil.example" });
    expect(res.status).toBe(403);
    expect(inserts).toHaveLength(0);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("stores no IP hash without IP_HASH_SECRET, and a keyed one with it", async () => {
    let inserts = fakeDb(null);
    await signup({ email: "a@b.com" });
    expect(inserts[0].ip_hash).toBeNull();

    process.env.IP_HASH_SECRET = "s3cret";
    inserts = fakeDb(null);
    await signup({ email: "a@b.com" });
    const plain = crypto.createHash("sha256").update("203.0.113.7").digest("hex");
    expect(inserts[0].ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(inserts[0].ip_hash).not.toBe(plain);
  });
});

describe("ipHashFor", () => {
  it("is null without an IP or a secret, and differs by secret", () => {
    expect(ipHashFor("", "s")).toBeNull();
    expect(ipHashFor("203.0.113.7", undefined)).toBeNull();
    expect(ipHashFor("203.0.113.7", "a")).not.toBe(ipHashFor("203.0.113.7", "b"));
  });
});
