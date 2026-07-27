import { describe, it, expect, vi, beforeEach } from "vitest";
import { __resetRateLimit } from "@/lib/rate-limit";
import { LINE_ITEMS, PRICING_LAST_UPDATED } from "@/lib/pricing-data";
import type { ActiveBenchmarkRow } from "@/lib/benchmarks-store";

vi.mock("@/lib/benchmarks-store", () => ({
  listActiveBenchmarks: vi.fn(async () => []),
}));

import { listActiveBenchmarks } from "@/lib/benchmarks-store";
import { GET } from "../route";

const listMock = vi.mocked(listActiveBenchmarks);

const activeRow = (
  over: Partial<ActiveBenchmarkRow> = {},
): ActiveBenchmarkRow => ({
  lineItemId: "basic-services",
  fairLowCents: 149950,
  fairHighCents: 250000,
  predatoryAtCents: 350000,
  tier: "verified",
  n: 8,
  version: "2026-07-v1",
  effectiveAt: "2026-07-20T00:00:00+00:00",
  scope: "metro",
  scopeValue: "Salt Lake City",
  sources: [{ name: "Utah GPL review", kind: "founder-note" }],
  ...over,
});

const req = (qs = "") =>
  new Request(`http://test.local/api/fair-price-index/data${qs}`, {
    headers: { "x-forwarded-for": "203.0.113.9" },
  });

beforeEach(() => {
  __resetRateLimit();
  listMock.mockReset();
  listMock.mockResolvedValue([]);
});

describe("GET /api/fair-price-index/data (JSON)", () => {
  it("returns the full national catalog with units and metadata", async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
    const body = await res.json();
    expect(body.units).toBe("USD");
    expect(body.national).toHaveLength(LINE_ITEMS.length);
    expect(body.national[0]).toEqual({
      item: LINE_ITEMS[0].id,
      name: expect.any(String),
      fairLow: LINE_ITEMS[0].fairLow,
      fairHigh: LINE_ITEMS[0].fairHigh,
      predatoryAt: LINE_ITEMS[0].predatoryAt,
      perUnit: LINE_ITEMS[0].perUnit === true,
    });
    expect(body.overrides).toEqual([]);
    expect(body.metadata.lastUpdated).toBe(PRICING_LAST_UPDATED);
    expect(body.metadata.url).toContain("/fair-price-index");
    expect(body.metadata.dataUrl).toContain("/api/fair-price-index/data");
    expect(body.metadata.methodology).toContain("/methodology");
    expect(body.metadata.isAccessibleForFree).toBe(true);
  });

  it("serializes overrides in dollars with null predatoryAt preserved", async () => {
    listMock.mockResolvedValue([
      activeRow(),
      activeRow({
        lineItemId: "urn",
        tier: "community",
        predatoryAtCents: null,
        n: 9,
      }),
    ]);
    const res = await GET(req());
    const body = await res.json();
    expect(body.overrides).toHaveLength(2);
    expect(body.overrides[0]).toEqual({
      scope: "metro",
      value: "Salt Lake City",
      item: "basic-services",
      tier: "verified",
      fairLow: 1499.5,
      fairHigh: 2500,
      predatoryAt: 3500,
      n: 8,
      version: "2026-07-v1",
      updated: "2026-07-20",
      sources: [{ name: "Utah GPL review", kind: "founder-note" }],
    });
    expect(body.overrides[1].predatoryAt).toBeNull();
    // lastUpdated tracks the newest promoted row past the catalog date.
    expect(body.metadata.lastUpdated).toBe("2026-07-20");
  });

  it("degrades to a 200 national-only payload when the store read throws", async () => {
    listMock.mockRejectedValue(new Error("boom"));
    const res = await GET(req());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.national).toHaveLength(LINE_ITEMS.length);
    expect(body.overrides).toEqual([]);
    expect(body.metadata.lastUpdated).toBe(PRICING_LAST_UPDATED);
  });

  it("never carries family/case-shaped fields (consent-seam pin)", async () => {
    listMock.mockResolvedValue([activeRow()]);
    const res = await GET(req());
    const raw = JSON.stringify(await res.json());
    for (const forbidden of [
      "user_id",
      "userId",
      "price_list_analyses",
      "negotiation",
      "family_zip",
      "email",
      "home_name",
    ]) {
      expect(raw).not.toContain(forbidden);
    }
  });

  it("rate limits after 30 requests per IP", async () => {
    for (let i = 0; i < 30; i++) {
      expect((await GET(req())).status).toBe(200);
    }
    const res = await GET(req());
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});

describe("GET /api/fair-price-index/data?format=csv", () => {
  it("returns the flat table: quoted header, national modeled rows, override rows", async () => {
    listMock.mockResolvedValue([
      activeRow({ predatoryAtCents: null, lineItemId: "urn", tier: "community" }),
    ]);
    const res = await GET(req("?format=csv"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="fair-price-index.csv"',
    );
    const text = await res.text();
    const lines = text.split("\r\n").filter(Boolean);
    expect(lines[0]).toBe(
      '"scope","value","item","name","tier","fair_low","fair_high","predatory_at","n","version","updated","sources"',
    );
    // header + 30 national + 1 override
    expect(lines).toHaveLength(1 + LINE_ITEMS.length + 1);
    expect(lines[1]).toContain('"national","US"');
    expect(lines[1]).toContain('"modeled"');
    // National rows never borrow n/version/sources.
    expect(lines[1]).toMatch(
      new RegExp(`,"","","${PRICING_LAST_UPDATED}",""$`),
    );
    const override = lines.at(-1)!;
    expect(override).toContain('"metro","Salt Lake City","urn"');
    expect(override).toContain('"community"');
    // Null predatory_at stays an empty quoted field, never 0.
    expect(override).toContain('"2500","",');
    expect(override).not.toContain('"0"');
  });

  it("escapes CSV-injection prefixes and doubles internal quotes", async () => {
    listMock.mockResolvedValue([
      activeRow({
        sources: [{ name: '=HYPERLINK("evil") "note"' }],
      }),
    ]);
    const res = await GET(req("?format=csv"));
    const text = await res.text();
    expect(text).toContain(`"'=HYPERLINK(""evil"") ""note"""`);
  });

  it("degrades to a national-only CSV when the store read throws", async () => {
    listMock.mockRejectedValue(new Error("boom"));
    const res = await GET(req("?format=csv"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const lines = (await res.text()).split("\r\n").filter(Boolean);
    // header + 30 national rows, zero overrides
    expect(lines).toHaveLength(1 + LINE_ITEMS.length);
    expect(lines[1]).toContain('"national","US"');
  });
});
