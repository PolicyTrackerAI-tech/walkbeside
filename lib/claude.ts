import Anthropic from "@anthropic-ai/sdk";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { FEATURES, PUBLIC, hasServer, requireServer } from "./env";
import { logEvent, logWarn } from "./observability";

/**
 * Single model for every feature. Checked against the live model list
 * 2026-07-14: claude-sonnet-5 is out (Sonnet 4.6's successor, intro-priced
 * through 2026-08-31), but swapping it in changes two load-bearing defaults —
 * omitting `thinking` now runs adaptive thinking (which spends thinking tokens
 * inside each call's max_tokens budget) and its tokenizer counts ~30% more
 * tokens for the same text — so every call site needs an explicit thinking
 * config plus a max_tokens re-baseline, verified with an analyzer-fixture
 * before/after run. That re-baseline belongs to next week's model-tiering
 * task (alongside Haiku 4.5 for cheap classification); never swap the string
 * alone.
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

export interface CallOpts {
  /** Ledger tag, e.g. "analyzer-extract" — one stable name per feature. */
  feature: string;
  system: string;
  user: string;
  maxTokens?: number;
  /** Attributes the spend to a case in api_cost_events when known. */
  negotiationId?: string;
  /**
   * Mark the system prompt as a cache breakpoint (it must be byte-stable —
   * see lib/negotiation/prompts.ts). Note: prompts below the model's minimum
   * cacheable prefix (2048 tokens on claude-sonnet-4-6) silently don't cache;
   * the marker is harmless then (no write premium is charged) and starts
   * paying off as prompts grow past the minimum.
   */
  cacheSystem?: boolean;
  /**
   * Hard per-call budget for latency-bound callers (the inbound webhook).
   * Also disables SDK retries so the bound can't silently triple.
   */
  timeoutMs?: number;
}

/**
 * The cost-tagged path every plain string-in/string-out Claude call goes
 * through: one messages.create + usage recorded to api_cost_events + one
 * structured log line, then textOf(). Call sites with non-string content
 * (vision blocks) keep calling client() directly and add recordUsage().
 */
export async function callClaude(o: CallOpts): Promise<string> {
  const msg = await client().messages.create(
    {
      model: MODEL,
      max_tokens: o.maxTokens ?? 1000,
      system: o.cacheSystem
        ? [
            {
              type: "text" as const,
              text: o.system,
              cache_control: { type: "ephemeral" as const },
            },
          ]
        : o.system,
      messages: [{ role: "user", content: o.user }],
    },
    o.timeoutMs ? { timeout: o.timeoutMs, maxRetries: 0 } : undefined,
  );
  await persistUsage(o.feature, msg, o.negotiationId);
  return textOf(msg);
}

/**
 * Cost-tag a Claude response for call sites that build their own
 * messages.create (vision extraction). Fire-and-forget: never throws, never
 * blocks the caller.
 */
export function recordUsage(
  feature: string,
  msg: Anthropic.Message,
  negotiationId?: string,
): void {
  void persistUsage(feature, msg, negotiationId);
}

let _svc: SupabaseClient | null = null;
function serviceClient(): SupabaseClient {
  if (!_svc) {
    _svc = createSupabaseClient(
      PUBLIC.supabaseUrl,
      requireServer("SUPABASE_SERVICE_ROLE_KEY"),
    );
  }
  return _svc;
}

/**
 * Best-effort ledger write (api_cost_events is RLS deny-all — service role
 * only) + one structured log line. A ledger failure must never break a
 * user-facing call, so every failure path degrades to a logWarn.
 *
 * input_tokens = billed prompt tokens (uncached + cache writes);
 * cache_read_tokens = prompt tokens served from cache (~0.1x price).
 */
async function persistUsage(
  feature: string,
  msg: Anthropic.Message,
  negotiationId?: string,
): Promise<void> {
  const u = msg.usage;
  const inputTokens =
    (u?.input_tokens ?? 0) + (u?.cache_creation_input_tokens ?? 0);
  const outputTokens = u?.output_tokens ?? 0;
  const cacheReadTokens = u?.cache_read_input_tokens ?? 0;

  logEvent("ai.call", {
    feature,
    model: msg.model,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    ...(negotiationId ? { negotiationId } : {}),
  });

  if (!FEATURES.supabase() || !hasServer("SUPABASE_SERVICE_ROLE_KEY")) return;
  try {
    const { error } = await serviceClient().from("api_cost_events").insert({
      feature,
      model: msg.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_read_tokens: cacheReadTokens,
      negotiation_id: negotiationId ?? null,
    });
    if (error) {
      logWarn("ai.cost_ledger_insert_failed", { feature, error: error.message });
    }
  } catch (e) {
    logWarn("ai.cost_ledger_insert_failed", {
      feature,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
