import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminPage } from "@/lib/admin-auth";
import { estUsdForEvent, SONNET_5_INTRO_END } from "@/lib/ai-costs";

export const metadata: Metadata = {
  title: "AI costs — admin",
  robots: { index: false, follow: false },
};

/**
 * The AI cost ledger, feature × day (Day 4, P12). Read-only over
 * api_cost_events (RLS deny-all; service-role read behind the admin gate,
 * same pattern as /admin/benchmarks). Token counts are exact; the dollar
 * column is an ESTIMATE priced per row by the model that served the call
 * (lib/ai-costs.ts — the fleet is mixed since the 2026-07-16 tiering:
 * sonnet-5 for extraction/drafting, haiku-4-5 for classification) and
 * exists to spot a runaway feature, not to reconcile an invoice.
 */

// Shown window: the most recent active days present in the ledger (derived
// from the data, not the clock — the render stays pure) over the latest
// 10k events.
const WINDOW_DAYS = 14;
const FETCH_LIMIT = 10_000;

interface CostEvent {
  feature: string;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  created_at: string;
}

interface Agg {
  feature: string;
  day: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  /** Summed per event, each priced by its own model + day. */
  estUsd: number;
}

const fmtUsd = (n: number) =>
  n >= 0.01 || n === 0 ? `$${n.toFixed(2)}` : "<$0.01";
const fmtTok = (n: number) => n.toLocaleString("en-US");

export default async function AdminAiCostsPage() {
  await requireAdminPage("/admin/ai-costs");

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data, error } = await admin
    .from("api_cost_events")
    .select(
      "feature, model, input_tokens, output_tokens, cache_read_tokens, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(FETCH_LIMIT);

  const events = ((data as CostEvent[] | null) ?? []);

  // feature × day aggregation, newest day first, features alphabetical.
  const byKey = new Map<string, Agg>();
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    const key = `${day}|${e.feature}`;
    const agg =
      byKey.get(key) ??
      ({
        feature: e.feature,
        day,
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        estUsd: 0,
      } as Agg);
    agg.calls += 1;
    agg.inputTokens += e.input_tokens ?? 0;
    agg.outputTokens += e.output_tokens ?? 0;
    agg.cacheReadTokens += e.cache_read_tokens ?? 0;
    // Priced per event: one feature-day can mix models (e.g. a feature
    // re-tiered mid-day), so the aggregate can't be priced after the fact.
    agg.estUsd += estUsdForEvent(e);
    byKey.set(key, agg);
  }
  const allRows = [...byKey.values()].sort(
    (a, b) => b.day.localeCompare(a.day) || a.feature.localeCompare(b.feature),
  );
  const recentDays = new Set(
    [...new Set(allRows.map((r) => r.day))].slice(0, WINDOW_DAYS),
  );
  const rows = allRows.filter((r) => recentDays.has(r.day));

  const total = rows.reduce(
    (t, r) => ({
      calls: t.calls + r.calls,
      inputTokens: t.inputTokens + r.inputTokens,
      outputTokens: t.outputTokens + r.outputTokens,
      cacheReadTokens: t.cacheReadTokens + r.cacheReadTokens,
      estUsd: t.estUsd + r.estUsd,
    }),
    { calls: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, estUsd: 0 },
  );

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <section className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Admin · AI costs</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Claude spend by feature
            </h1>
            <p className="text-ink-soft text-sm">
              The {recentDays.size || 0} most recent active days from the
              api_cost_events ledger (every call through lib/claude.ts logs
              one row). {total.calls} calls · {fmtTok(total.inputTokens)}{" "}
              input / {fmtTok(total.outputTokens)} output tokens · roughly{" "}
              {fmtUsd(total.estUsd)} at per-model list prices.
            </p>
          </div>

          {error ? (
            <Card tone="soft">
              <p className="text-ink-soft text-sm">
                Couldn&rsquo;t read the ledger: {error.message}
              </p>
            </Card>
          ) : rows.length === 0 ? (
            <Card tone="soft">
              <p className="text-ink-soft text-sm">
                No AI calls logged yet. Rows appear here as soon as any
                Claude-backed feature runs.
              </p>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-ink-muted border-b border-border">
                      <th className="py-2 pr-3">Day</th>
                      <th className="py-2 pr-3">Feature</th>
                      <th className="py-2 pr-3 text-right">Calls</th>
                      <th className="py-2 pr-3 text-right">Input tok</th>
                      <th className="py-2 pr-3 text-right">Output tok</th>
                      <th className="py-2 pr-3 text-right">Cache-read tok</th>
                      <th className="py-2 text-right">Est. cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={`${r.day}|${r.feature}`}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="py-2 pr-3 text-ink-muted whitespace-nowrap">
                          {r.day}
                        </td>
                        <td className="py-2 pr-3 text-ink">{r.feature}</td>
                        <td className="py-2 pr-3 text-right">{r.calls}</td>
                        <td className="py-2 pr-3 text-right">
                          {fmtTok(r.inputTokens)}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {fmtTok(r.outputTokens)}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {fmtTok(r.cacheReadTokens)}
                        </td>
                        <td className="py-2 text-right">
                          {fmtUsd(r.estUsd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-muted mt-3">
                Est. cost = each call&rsquo;s tokens × the list prices of the
                model that served it (sonnet-5 intro-priced through{" "}
                {SONNET_5_INTRO_END}; haiku for classification; unknown models
                priced at the most expensive tier so a surprise can only read
                high) — a triage number, not a bill.
              </p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
