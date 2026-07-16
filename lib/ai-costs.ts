/**
 * Per-model list prices for the /admin/ai-costs triage estimate.
 *
 * The ledger (api_cost_events) records the serving model per row — including
 * dated ids like "claude-haiku-4-5-20251001" — so estimates are priced per
 * event by model prefix, not at one flat rate. This is still a TRIAGE
 * number to spot a runaway feature, never invoice reconciliation: list
 * prices drift, and cache writes are billed at a premium the ledger doesn't
 * itemize. Two properties are load-bearing:
 *
 * 1. Prefix matching, first match wins — dated snapshot ids keep pricing
 *    correctly as Anthropic rotates them.
 * 2. Unknown models fall back to the MOST EXPENSIVE known tier — a new or
 *    renamed model can only OVERestimate. Underestimating would hide the
 *    runaway spend this page exists to catch.
 */

export interface ModelRates {
  usdPerMInput: number;
  usdPerMOutput: number;
  usdPerMCacheRead: number;
}

// Sonnet sticker — also the most expensive tier in the fleet, and therefore
// the unknown-model fallback.
const SONNET_STICKER: ModelRates = {
  usdPerMInput: 3,
  usdPerMOutput: 15,
  usdPerMCacheRead: 0.3,
};

const SONNET_5_INTRO: ModelRates = {
  usdPerMInput: 2,
  usdPerMOutput: 10,
  usdPerMCacheRead: 0.2,
};

const HAIKU_4_5: ModelRates = {
  usdPerMInput: 1,
  usdPerMOutput: 5,
  usdPerMCacheRead: 0.1,
};

/** claude-sonnet-5 launch pricing runs through this UTC day, inclusive. */
export const SONNET_5_INTRO_END = "2026-08-31";

const RATE_TABLE: { prefix: string; rates: (day: string) => ModelRates }[] = [
  {
    prefix: "claude-sonnet-5",
    // Priced by the DAY THE CALL RAN (row's created_at), not the render
    // date — September's view of an August row stays an August price.
    rates: (day) => (day <= SONNET_5_INTRO_END ? SONNET_5_INTRO : SONNET_STICKER),
  },
  { prefix: "claude-sonnet-4-6", rates: () => SONNET_STICKER },
  { prefix: "claude-haiku-4-5", rates: () => HAIKU_4_5 },
];

/**
 * Rates for a ledger row's model on the (UTC) day it ran. `day` is a
 * "YYYY-MM-DD" string — lexicographic comparison is date comparison.
 */
export function ratesFor(
  model: string | null | undefined,
  day: string,
): ModelRates {
  const m = model ?? "";
  for (const row of RATE_TABLE) {
    if (m.startsWith(row.prefix)) return row.rates(day);
  }
  return SONNET_STICKER; // unknown model → most expensive known tier
}

/** Estimated USD for one api_cost_events row, priced by its own model + day. */
export function estUsdForEvent(e: {
  model?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_tokens?: number | null;
  created_at: string;
}): number {
  const rates = ratesFor(e.model, e.created_at.slice(0, 10));
  return (
    ((e.input_tokens ?? 0) / 1_000_000) * rates.usdPerMInput +
    ((e.output_tokens ?? 0) / 1_000_000) * rates.usdPerMOutput +
    ((e.cache_read_tokens ?? 0) / 1_000_000) * rates.usdPerMCacheRead
  );
}
