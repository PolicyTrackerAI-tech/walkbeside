import Anthropic from "@anthropic-ai/sdk";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { FEATURES, PUBLIC, hasServer, requireServer } from "./env";
import { logEvent, logWarn } from "./observability";

/**
 * Model configuration for every feature. THE LAW (D3, 2026-07-16): these
 * strings — and any thinking/max_tokens config — change ONLY in a PR carrying
 * before/after `npm run eval:analyzer` output (test/evals/BASELINE.md is the
 * committed baseline), and a swap ships only when every aggregate metric is
 * ≥ baseline.
 *
 * claude-sonnet-5 (swapped 2026-07-16, eval-verified): two load-bearing
 * defaults differ from sonnet-4-6 — (1) omitting `thinking` runs ADAPTIVE
 * thinking, which spends thinking tokens inside each call's max_tokens
 * budget, so callClaude pins `thinking: { type: "disabled" }` explicitly
 * (live-verified accepted on sonnet-5, sonnet-4-6, and haiku-4-5; our
 * features are deterministic extraction/drafting, not reasoning); and
 * (2) its tokenizer counts ~30% more tokens for the same text, so every
 * call site's maxTokens was re-baselined ~1.35x — a cap tuned for
 * sonnet-4-6 could truncate the same output on sonnet-5. Sticker price
 * unchanged ($3/$15 per MTok; intro $2/$10 through 2026-08-31).
 */
export const MODEL = "claude-sonnet-5";

/**
 * Cheap classification-shaped features (subscription-finder) run on Haiku
 * 4.5 ($1/$5 per MTok vs $3/$15) — extraction quality there is list-shaped
 * classification, not the benchmarked GPL pipeline the eval gates.
 */
export const CLASSIFIER_MODEL = "claude-haiku-4-5";

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
  /**
   * Per-call model override (defaults to MODEL). Only two callers may use it:
   * cheap classification features pinned to a smaller model, and the eval
   * harness's dev-only comparison flag (scripts/eval-analyzer.mjs --model=X).
   * Any change to which model a feature runs on ships only in a PR carrying
   * before/after `npm run eval:analyzer` output.
   */
  model?: string;
  maxTokens?: number;
  /** Attributes the spend to a case in api_cost_events when known. */
  negotiationId?: string;
  /**
   * Mark the system prompt as a cache breakpoint (it must be byte-stable —
   * see lib/negotiation/prompts.ts). Note: prompts below the model's minimum
   * cacheable prefix (model-dependent; ~2048 tokens on the Sonnet family)
   * silently don't cache; the marker is harmless then (no write premium is
   * charged) and starts paying off as prompts grow past the minimum.
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
      model: o.model ?? MODEL,
      // Explicit for every model: on claude-sonnet-5 an OMITTED thinking
      // param means adaptive thinking, which silently spends thinking tokens
      // inside max_tokens and blows the latency budget of time-bounded
      // callers (the inbound webhook). Never remove without an eval run.
      thinking: { type: "disabled" },
      max_tokens: o.maxTokens ?? 1300,
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
  // Truncation is otherwise invisible: JSON callers surface it as a parse
  // failure, but prose callers (obituary/eulogy/draft-letter) would serve a
  // mid-sentence draft as if complete. Log-only — the caps were re-baselined
  // so this should be rare; a recurring feature here means its cap is wrong.
  if (msg.stop_reason === "max_tokens") {
    logWarn("ai.truncated_at_max_tokens", {
      feature: o.feature,
      model: msg.model,
      maxTokens: o.maxTokens ?? 1300,
    });
  }
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
