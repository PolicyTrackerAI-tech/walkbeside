import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Pins callClaude's truncation contract: a response with stop_reason
 * "max_tokens" is a FAILED call and must throw (routing every caller into
 * its deterministic fallback), never return the mid-sentence partial as
 * success. Prose routes (obituary/eulogy/draft-letter/explain) have no
 * other way to detect truncation — JSON callers at least fail at
 * JSON.parse, a family reading a eulogy draft does not.
 */

// The next message the mocked SDK returns — mutate per test.
let nextMessage: Record<string, unknown>;

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn(async () => nextMessage),
    };
  },
}));

process.env.ANTHROPIC_API_KEY = "test-key-for-client-construction";

import { callClaude } from "@/lib/claude";

function message(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    model: "claude-sonnet-5",
    content: [{ type: "text", text: "a complete draft." }],
    stop_reason: "end_turn",
    usage: { input_tokens: 10, output_tokens: 5 },
    ...overrides,
  };
}

beforeEach(() => {
  nextMessage = message({});
});

describe("callClaude truncation contract", () => {
  it("returns the text on a normal end_turn response", async () => {
    const out = await callClaude({
      feature: "test-feature",
      system: "sys",
      user: "hi",
    });
    expect(out).toBe("a complete draft.");
  });

  it("throws when the response was truncated at max_tokens", async () => {
    nextMessage = message({
      stop_reason: "max_tokens",
      content: [{ type: "text", text: "a draft that stops mid-sen" }],
    });
    await expect(
      callClaude({ feature: "test-feature", system: "sys", user: "hi" }),
    ).rejects.toThrow(/truncated at max_tokens.*test-feature/);
  });
});
