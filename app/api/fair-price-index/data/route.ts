import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  listActiveBenchmarks,
  type ActiveBenchmarkRow,
} from "@/lib/benchmarks-store";
import { LINE_ITEMS, PRICING_LAST_UPDATED } from "@/lib/pricing-data";
import { datasetLastUpdated } from "@/lib/fair-price-dataset";
import { displayItemName } from "@/lib/verified-local-prices";
import { BRAND } from "@/lib/brand";

/**
 * GET /api/fair-price-index/data — the Fair-Price Index as a public dataset
 * (JSON, or ?format=csv), so the index is citable by machines as well as
 * people. All money is DOLLARS (converted from the store's cents at this
 * serialize edge); `units: "USD"` declares it.
 *
 * PRIVACY CONTRACT (guardrail #4 + the consent seam): this payload never
 * contains raw observations, per-home prices, funeral home names attached to
 * prices, family/case data, or any row below the n≥5 gate. That is
 * structural, not aspirational: the endpoint reads ONLY the static
 * LINE_ITEMS catalog and regional_benchmarks aggregates via
 * listActiveBenchmarks(), which sanitizes sources to provenance-only fields
 * and re-applies the n≥SMALL_SAMPLE_THRESHOLD floor at the read edge. Never
 * add a read of price_list_analyses, negotiation_outreach, or any other
 * raw table here.
 *
 * Failure posture mirrors /api/benchmarks/tier: any error degrades to a
 * valid 200 national-only payload, never a 500.
 */

const BY_ID = new Map(LINE_ITEMS.map((it) => [it.id, it]));

// The modeled national catalog — static, always present; the degraded
// payload is exactly this plus overrides: [].
const NATIONAL = LINE_ITEMS.map((it) => ({
  item: it.id,
  name: displayItemName(it.name),
  fairLow: it.fairLow,
  fairHigh: it.fairHigh,
  predatoryAt: it.predatoryAt,
  perUnit: it.perUnit === true,
}));

function buildMetadata(lastUpdated: string) {
  return {
    name: `${BRAND.name} Fair-Price Index`,
    description:
      "Fair-price ranges for the common charges on a US funeral home's General Price List, from a service that takes no money from funeral homes or insurers.",
    publisher: { name: BRAND.name, url: BRAND.url },
    url: `${BRAND.url}/fair-price-index`,
    dataUrl: `${BRAND.url}/api/fair-price-index/data`,
    csvUrl: `${BRAND.url}/api/fair-price-index/data?format=csv`,
    license: `${BRAND.url}/methodology`,
    methodology: `${BRAND.url}/methodology`,
    citeAs: `${BRAND.name} Fair-Price Index (updated ${lastUpdated}), ${BRAND.url}/fair-price-index`,
    isAccessibleForFree: true,
    lastUpdated,
    tiers: {
      modeled:
        "National fair-price benchmarks adjusted by a regional cost index. The default for every item.",
      verified:
        "Aggregated from at least five real local price lists for the named area; a person reviews each range before it publishes.",
      community:
        "Aggregated from at least five prices reported by families in the named area.",
    },
    notes: [
      "Every override row carries n, the number of observations behind its range; the publish gate refuses anything under five, and this endpoint filters out any row below five again before serving it.",
      "The data rows carry only aggregated ranges — never individual observations, per-home prices, or family data.",
      "Override sources are provenance notes (name, kind, access date); the payload has no price fields outside the aggregate range columns.",
      "Items priced per each or per day (for example death certificates) carry perUnit: true in the JSON; the CSV does not carry this flag.",
    ],
  };
}

function toOverride(r: ActiveBenchmarkRow) {
  return {
    scope: r.scope,
    value: r.scopeValue,
    item: r.lineItemId,
    tier: r.tier,
    fairLow: r.fairLowCents / 100,
    fairHigh: r.fairHighCents / 100,
    // null stays null — never coerced to 0 (a fake threshold is a published
    // number we can't defend).
    predatoryAt: r.predatoryAtCents === null ? null : r.predatoryAtCents / 100,
    n: r.n,
    version: r.version,
    updated: r.effectiveAt.slice(0, 10),
    sources: r.sources,
  };
}

const CSV_COLUMNS = [
  "scope",
  "value",
  "item",
  "name",
  "tier",
  "fair_low",
  "fair_high",
  "predatory_at",
  "n",
  "version",
  "updated",
  "sources",
];

/**
 * Every field quoted (RFC 4180, internal quotes doubled); values starting
 * with = + - @ get a leading apostrophe inside the quotes — CSV-injection
 * hygiene, since source names are free-text founder notes.
 */
function csvField(v: string | number | null): string {
  let s = v === null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function buildCsv(rows: ActiveBenchmarkRow[]): string {
  const lines = [CSV_COLUMNS.map(csvField).join(",")];
  for (const it of LINE_ITEMS) {
    // National modeled rows: n/version/sources stay empty — printing
    // anything would imply a sample size or promotion that doesn't exist.
    lines.push(
      [
        "national",
        "US",
        it.id,
        displayItemName(it.name),
        "modeled",
        it.fairLow,
        it.fairHigh,
        it.predatoryAt,
        "",
        "",
        PRICING_LAST_UPDATED,
        "",
      ]
        .map(csvField)
        .join(","),
    );
  }
  for (const r of rows) {
    const item = BY_ID.get(r.lineItemId);
    lines.push(
      [
        r.scope,
        r.scopeValue,
        r.lineItemId,
        item ? displayItemName(item.name) : r.lineItemId,
        r.tier,
        r.fairLowCents / 100,
        r.fairHighCents / 100,
        r.predatoryAtCents === null ? null : r.predatoryAtCents / 100,
        r.n,
        r.version,
        r.effectiveAt.slice(0, 10),
        r.sources.map((s) => s.name).join("; "),
      ]
        .map(csvField)
        .join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}

const CACHE_HEADERS = { "Cache-Control": "public, max-age=3600" };

export async function GET(req: Request) {
  // Throttled in-route: the proxy rate-limiter only guards POSTs.
  const rl = rateLimit(`${clientIp(req.headers)}:/api/fair-price-index/data`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  const wantsCsv = new URL(req.url).searchParams.get("format") === "csv";

  const csvResponse = (rows: ActiveBenchmarkRow[]) =>
    new NextResponse(buildCsv(rows), {
      headers: {
        ...CACHE_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="fair-price-index.csv"',
      },
    });

  try {
    // listActiveBenchmarks degrades to [] on its own; the outer try/catch is
    // the belt for everything else — this endpoint never 500s.
    const rows = await listActiveBenchmarks();
    if (wantsCsv) return csvResponse(rows);
    return NextResponse.json(
      {
        metadata: buildMetadata(datasetLastUpdated(rows)),
        units: "USD",
        national: NATIONAL,
        overrides: rows.map(toOverride),
      },
      { headers: CACHE_HEADERS },
    );
  } catch {
    // National-only degrade, in the format that was asked for.
    if (wantsCsv) return csvResponse([]);
    return NextResponse.json(
      {
        metadata: buildMetadata(PRICING_LAST_UPDATED),
        units: "USD",
        national: NATIONAL,
        overrides: [],
      },
      { headers: CACHE_HEADERS },
    );
  }
}
