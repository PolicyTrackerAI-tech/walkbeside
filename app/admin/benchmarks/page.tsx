import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminPage } from "@/lib/admin-auth";
import {
  aggregateBenchmarks,
  proposalSpec,
  type AnalysisRecord,
} from "@/lib/benchmark-pipeline";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";

export const metadata: Metadata = {
  title: "Benchmark pipeline — admin",
  robots: { index: false, follow: false },
};

const fmt = (c: number) => `$${Math.round(c / 100).toLocaleString("en-US")}`;

/**
 * The crowdsourced benchmark refinement pipeline — read-only by design.
 * This page PROPOSES; applying a change is a founder-reviewed PR that edits
 * lib/pricing-data.ts, bumps PRICING_LAST_UPDATED, and adds the /corrections
 * entry. There is deliberately no "apply" button here.
 */
export default async function AdminBenchmarksPage() {
  await requireAdminPage("/admin/benchmarks");

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // select("*") tolerates the pre-migration schema (no zip column yet).
  const { data, error } = await admin
    .from("price_list_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);

  const records: AnalysisRecord[] = ((data as Array<Record<string, unknown>> | null) ?? []).map(
    (r) => ({
      userId: String(r.user_id ?? ""),
      zip: (r.zip as string | null) ?? null,
      items: Array.isArray(r.items)
        ? (r.items as AnalysisRecord["items"])
        : [],
    }),
  );

  const groups = aggregateBenchmarks(records);
  const proposals = groups.filter((g) => g.proposal);
  const national = groups.filter((g) => g.region === "national");
  const metro = groups.filter((g) => g.region !== "national");
  const withZip = records.filter((r) => (r.zip ?? "").length >= 3).length;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <section className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Admin · benchmark pipeline</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Crowd-observed prices vs the survey baseline
            </h1>
            <p className="text-ink-soft text-sm">
              {records.length.toLocaleString("en-US")} stored analyses ({withZip} with
              a zip) · de-identified · deduped · national-normalized. Proposals
              appear only at n ≥ {SMALL_SAMPLE_THRESHOLD} per item with median
              drift beyond tolerance — and nothing here auto-applies:
              a change ships as a reviewed PR to lib/pricing-data.ts plus a
              /corrections entry.
            </p>
            {error && (
              <p className="text-sm text-warn mt-2">
                Query error: {error.message}
              </p>
            )}
          </div>

          <Card tone={proposals.length > 0 ? "primary" : "soft"}>
            <CardTitle>
              {proposals.length > 0
                ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} ready for review`
                : "No proposals yet"}
            </CardTitle>
            {proposals.length === 0 ? (
              <p className="text-sm text-ink-soft mt-2">
                Either samples are still under the n ≥ {SMALL_SAMPLE_THRESHOLD}{" "}
                gate or observed medians sit inside tolerance of the current
                ranges. Both are fine — the gate exists so a handful of
                outliers can never rewrite a benchmark.
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {proposals.map((g) => (
                  <pre
                    key={`${g.itemId}-${g.region}`}
                    className="whitespace-pre-wrap font-mono text-xs text-ink bg-surface-soft border border-border rounded-xl p-4"
                  >
                    {proposalSpec(g)}
                  </pre>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>National groups ({national.length})</CardTitle>
            {national.length === 0 ? (
              <p className="text-sm text-ink-soft mt-2">
                No benchmarked line items in stored analyses yet.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-ink-muted">
                      <th className="py-1 pr-3">Item</th>
                      <th className="py-1 pr-3">n</th>
                      <th className="py-1 pr-3">p25 / median / p75</th>
                      <th className="py-1 pr-3">Current range</th>
                      <th className="py-1">Median</th>
                    </tr>
                  </thead>
                  <tbody>
                    {national.map((g) => (
                      <tr key={g.itemId} className="border-t border-border">
                        <td className="py-1.5 pr-3 text-ink">{g.itemName}</td>
                        <td className={`py-1.5 pr-3 ${g.sufficient ? "text-ink" : "text-ink-muted"}`}>
                          {g.n}
                          {!g.sufficient && " (small)"}
                        </td>
                        <td className="py-1.5 pr-3 text-ink-soft">
                          {fmt(g.p25Cents)} / {fmt(g.medianCents)} / {fmt(g.p75Cents)}
                        </td>
                        <td className="py-1.5 pr-3 text-ink-soft">
                          {fmt(g.currentLowCents)}–{fmt(g.currentHighCents)}
                        </td>
                        <td className="py-1.5">
                          <span
                            className={
                              g.medianVsRange === "within"
                                ? "text-good"
                                : g.medianVsRange === "above"
                                  ? "text-warn"
                                  : "text-ink-muted"
                            }
                          >
                            {g.medianVsRange}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {metro.length > 0 && (
            <Card>
              <CardTitle>Metro groups ({metro.length}) — informational only</CardTitle>
              <p className="text-xs text-ink-muted mt-1 mb-3">
                Raw local prices (not normalized). No proposals are ever made
                from metro groups; they exist to show where a metro-specific
                benchmark process would have data to work with.
              </p>
              <div className="space-y-1 text-sm">
                {metro.map((g) => (
                  <div key={`${g.itemId}-${g.region}`} className="flex flex-wrap gap-x-3 text-ink-soft">
                    <span className="text-ink">{g.itemName}</span>
                    <span>{g.region}</span>
                    <span>n={g.n}</span>
                    <span>
                      {fmt(g.p25Cents)} / {fmt(g.medianCents)} / {fmt(g.p75Cents)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
