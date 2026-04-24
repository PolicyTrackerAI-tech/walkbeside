import Anthropic from "@anthropic-ai/sdk";
import { FEATURES, requireServer } from "./env";

/**
 * Use claude-sonnet-4-6 for negotiation/parsing/obituary work.
 * The brief specified sonnet-4-5; we upgrade to current default.
 */
export const MODEL = "claude-sonnet-4-6";

let _client: Anthropic | null = null;
export function client(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: requireServer("ANTHROPIC_API_KEY") });
  }
  return _client;
}

export const claudeAvailable = FEATURES.claude;

/**
 * Plain-text helper — extracts the first text block, trimmed.
 */
export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
