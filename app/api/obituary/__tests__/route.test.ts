import { describe, it, expect, vi, beforeEach } from "vitest";

// A Claude API failure must never surface as a 500 to a grieving family —
// the route falls back to the same deterministic draft the Claude-off branch
// uses. claudeAvailable() returns true so the ONLY way the fallback can
// appear is through the catch path this test pins.
vi.mock("@/lib/claude", () => ({
  claudeAvailable: () => true,
  callClaude: vi.fn(async () => {
    throw new Error("api down");
  }),
}));

// Persistence is irrelevant here; a stubbed anonymous session keeps the
// route's optional save branch inert regardless of local env vars.
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  })),
}));

import { POST } from "../route";
import { callClaude } from "@/lib/claude";

beforeEach(() => {
  vi.mocked(callClaude).mockClear();
});

describe("POST /api/obituary — Claude failure fallback", () => {
  it("returns 200 with the deterministic draft when callClaude throws", async () => {
    const res = await POST(
      new Request("http://test/api/obituary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inputs: { fullName: "Jane Doe", born: "March 1950" },
          length: "short",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { draft: string };
    // The Claude path threw, so a draft can only have come from the fallback.
    expect(vi.mocked(callClaude)).toHaveBeenCalledTimes(1);
    expect(body.draft).toContain("Jane Doe");
    expect(body.draft).toContain("born March 1950");
  });
});
