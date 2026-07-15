import { describe, it, expect, vi, beforeEach } from "vitest";

// Same contract as the obituary route: a Claude API failure returns the
// deterministic placeholder draft, never a 500. claudeAvailable() is true so
// the fallback can only arrive via the new catch path.
vi.mock("@/lib/claude", () => ({
  claudeAvailable: () => true,
  callClaude: vi.fn(async () => {
    throw new Error("api down");
  }),
}));

import { POST } from "../route";
import { callClaude } from "@/lib/claude";

beforeEach(() => {
  vi.mocked(callClaude).mockClear();
});

describe("POST /api/eulogy — Claude failure fallback", () => {
  it("returns 200 with the placeholder draft when callClaude throws", async () => {
    const res = await POST(
      new Request("http://test/api/eulogy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inputs: { name: "Jane" },
          durationMinutes: 3,
          tone: "warm",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { draft: string };
    expect(vi.mocked(callClaude)).toHaveBeenCalledTimes(1);
    expect(body.draft).toContain("Jane");
    // The fallback draft is explicit about being a placeholder.
    expect(body.draft).toContain("[NOTE:");
  });
});
