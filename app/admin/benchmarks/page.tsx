import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminPage } from "@/lib/admin-auth";
import { aggregateAllBenchmarks, proposalSpec } from "@/lib/benchmark-pipeline";
import { fetchBenchmarkRecords } from "@/lib/benchmark-sources";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";
import { PromoteForm } from "./PromoteForm";

export const metadata: Metadata = {
  title: "Benchmark pipeline — admin",
  robots: { index: false, follow: false },
};

const fmt = (c: number) => `$${Math.round(c / 100).toLocaleString("en-US")}`;

/**
 * The crowdsourced benchmark refinement pipeline — read-only for CODE
 * benchmarks. This page PROPOSES; applying a LINE_ITEMS change is a
 * founder-reviewed PR that edits lib/pricing-data.ts, bumps
 * PRICING_LAST_UPDATED, and adds the /corrections entry. There is
 * deliberately no "apply" button for those. Promoting a metro to the
 * verified/community DATA tier is different: it writes a regional_benchmarks
 * row behind a server-enforced n≥5 gate (no override parameter exists) — see
 * /api/admin/benchmarks/promote.
 */
export default async function AdminBenchmarksPage() {
  await requireAdminPage("/admin/benchmarks");

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { analyses, outreach } = await fetchBenchmarkRecords(admin);
  const groups = aggregateAllBenchmarks(analyses, outreach);
  const proposals = groups.filter((g) => g.proposal);
  const national = groups.filter((g) => g.region === "national");
  const metro = groups.filter((g) => g.region !== "national");
  const withZip = analyses.filter((r) => (r.zip ?? "").length >= 3).length;
  // Every observation lands in exactly one national bucket, so summing the
  // national groups gives the source-mix totals (metro buckets would
  // double-count).
  const fromChecker = national.reduce((s, g) => s + (g.sources?.analyses ?? 0), 0);
  const fromQuotes = national.reduce((s, g) => s + (g.sources?.outreach ?? 0), 0);

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
              {analyses.length.toLocaleString("en-US")} stored analyses ({withZip} with
              a zip) · {fromChecker.toLocaleString("en-US")} observations from
              checker uploads · {fromQuotes.toLocaleString("en-US")} from real
              quotes · de-identified · deduped · national-normalized. Proposals
              appear only at n ≥ {SMALL_SAMPLE_THRESHOLD} per item with median
              drift beyond tolerance — and code benchmarks never auto-apply:
              a LINE_ITEMS change ships as a reviewed PR to lib/pricing-data.ts
              plus a /corrections entry. Promoting a metro to the
              verified/community data tier is separate: it writes a
              regional_benchmarks row behind a server-enforced n ≥{" "}
              {SMALL_SAMPLE_THRESHOLD} gate (no override exists).
            </p>
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
              <CardTitle>Metro groups ({metro.length})</CardTitle>
              <p className="text-xs text-ink-muted mt-1 mb-3">
                Raw local prices (not normalized). Metro groups never propose
                code benchmark changes — but a group at n ≥{" "}
                {SMALL_SAMPLE_THRESHOLD} can be promoted to the
                verified/community data tier below. The promote endpoint
                recomputes n server-side and rejects anything under the gate.
                Before promoting, eyeball the source mix (checker uploads vs
                real quotes) — the n gate counts observations, not sources.
              </p>
              <div className="space-y-1 text-sm">
                {metro.map((g) => (
                  <div key={`${g.itemId}-${g.region}`}>
                    <div className="flex flex-wrap gap-x-3 text-ink-soft">
                      <span className="text-ink">{g.itemName}</span>
                      <span>{g.region}</span>
                      <span>n={g.n}</span>
                      <span>
                        {fmt(g.p25Cents)} / {fmt(g.medianCents)} / {fmt(g.p75Cents)}
                      </span>
                      {g.sources && (
                        <span className="text-ink-muted">
                          {g.sources.analyses} checker · {g.sources.outreach} quotes
                        </span>
                      )}
                    </div>
                    {g.sufficient && (
                      <PromoteForm
                        lineItemId={g.itemId}
                        itemName={g.itemName}
                        metro={g.region}
                        p25Cents={g.p25Cents}
                        p75Cents={g.p75Cents}
                      />
                    )}
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
