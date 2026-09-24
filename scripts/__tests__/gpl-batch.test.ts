import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { analysisInputHash as tsHash } from "@/lib/analysis-hash";
import { redactContact as tsRedact } from "@/lib/redact";
import { extractionConfidence as tsConfidence } from "@/lib/extraction-confidence";
import { LINE_ITEMS } from "@/lib/pricing-data";
import { matchLineItem } from "@/lib/negotiation/price-list-parse";
import {
  MAX_LIST_AGE_MONTHS,
  analysisInputHash,
  analysisRow,
  extractionConfidence,
  heldReason,
  homeNamePattern,
  lineItemIds,
  listAgeMonths,
  redactContact,
  validateRecord,
  type GplRecord,
} from "../lib/gpl-batch.mjs";

/**
 * scripts/lib/gpl-batch.mjs mirrors three app functions because a plain Node
 * script can't import TypeScript. These tests are what keep the mirror
 * honest: if the app's version changes and the script's doesn't, CI fails.
 */
describe("gpl-batch mirrors the app exactly", () => {
  const samples = [
    "JOHN T. RHINES FUNERAL HOME\nWashington, DC (202) 529-4300\nEmbalming  $995.00",
    "  Direct cremation   $1,895  call 202-555-0142 or office@home.com  ",
    "Casket 18-gauge $2,450 · acct 123456789012 · card 4111 1111 1111 1111 · ssn 123-45-6789",
  ];

  it("analysisInputHash", () => {
    for (const s of samples) expect(analysisInputHash(s)).toBe(tsHash(s));
  });

  it("redactContact", () => {
    for (const s of samples) expect(redactContact(s)).toBe(tsRedact(s));
  });

  it("extractionConfidence", () => {
    const cases = [
      { itemCount: 0, statedTotalCents: null, itemSumCents: 0 },
      { itemCount: 0, statedTotalCents: 399500, itemSumCents: 0 },
      { itemCount: 3, statedTotalCents: null, itemSumCents: 250000 },
      { itemCount: 12, statedTotalCents: 500000, itemSumCents: 500000 },
      { itemCount: 7, statedTotalCents: 600000, itemSumCents: 500000 },
      { itemCount: 7, statedTotalCents: 100000, itemSumCents: 500000 },
    ];
    for (const c of cases) expect(extractionConfidence(c)).toBe(tsConfidence(c));
  });

  it("lineItemIds reads exactly the LINE_ITEMS ids", () => {
    expect(lineItemIds()).toEqual(new Set(LINE_ITEMS.map((l) => l.id)));
  });

  it("homeNamePattern escapes like the save route", () => {
    expect(homeNamePattern("A*1 50%_off\\")).toBe("%A\\*1 50\\%\\_off\\\\%");
  });
});

const ids = new Set(LINE_ITEMS.map((l) => l.id));
const base: GplRecord = {
  homeName: "Test Funeral Home",
  zip: "20001",
  sourceUrl: "https://example.com/gpl.pdf",
  provenance: "posted",
  effectiveDate: "2026-02-01",
  retrievedAt: "2026-09-24",
  text: "TEST FUNERAL HOME GENERAL PRICE LIST Embalming $995 Basic services $2,500",
  items: [
    { name: "Basic services", cents: 250000, matchedItemId: "basic-services" },
    { name: "Embalming", cents: 99500, matchedItemId: "embalming" },
    { name: "Caskets", cents: 150000, isRange: true, centsLow: 150000, centsHigh: 900000 },
  ],
};

describe("validateRecord", () => {
  it("accepts a well-formed record", () => {
    expect(validateRecord(base, ids)).toEqual([]);
  });

  it("rejects an unknown benchmark id, a bad zip, a missing effective date and an unknown provenance", () => {
    const errs = validateRecord(
      {
        ...base,
        zip: "2000",
        provenance: "scraped",
        effectiveDate: "",
        items: [{ name: "X", cents: 100, matchedItemId: "not-a-benchmark" }],
      },
      ids,
    );
    expect(errs.join("\n")).toMatch(/zip/);
    expect(errs.join("\n")).toMatch(/provenance/);
    expect(errs.join("\n")).toMatch(/effectiveDate/);
    expect(errs.join("\n")).toMatch(/unknown matchedItemId/);
  });

  it("allows one observation per benchmark per document", () => {
    const errs = validateRecord(
      {
        ...base,
        items: [
          { name: "Direct cremation", cents: 310000, matchedItemId: "direct-cremation-fee" },
          { name: "Direct cremation with box", cents: 269000, matchedItemId: "direct-cremation-fee" },
        ],
      },
      ids,
    );
    expect(errs.join("\n")).toMatch(/already mapped/);
  });
});

describe("old price lists are held back until the home confirms them", () => {
  const at = (effectiveDate: string, retrievedAt = "2026-09-24") => ({ ...base, effectiveDate, retrievedAt });

  it("counts whole months from the printed date to retrieval", () => {
    expect(listAgeMonths(at("2026-02-01"))).toBe(7);
    expect(listAgeMonths(at("2024-07-15"))).toBe(26);
    expect(listAgeMonths(at("2024-09-24"))).toBe(24);
    expect(listAgeMonths(at("2024-09-25"))).toBe(23);
  });

  it(`holds a list printed more than ${MAX_LIST_AGE_MONTHS} months before retrieval, and only that`, () => {
    expect(heldReason(at("2024-09-24"))).toBeNull();
    expect(heldReason(at("2024-08-23"))).toMatch(/25 months/);
    expect(heldReason(at("2024-07-15"))).toMatch(/stillCurrent/);
  });

  it("releases a held list once stillCurrent records how the home confirmed it", () => {
    expect(heldReason({ ...at("2024-07-15"), stillCurrent: "Home confirmed by phone on 2026-10-02" })).toBeNull();
  });

  it("rejects a printed date after retrieval, and a stillCurrent that says nothing", () => {
    expect(validateRecord(at("2026-10-01"), ids).join("\n")).toMatch(/after retrievedAt/);
    expect(validateRecord({ ...at("2024-07-15"), stillCurrent: "yes" }, ids).join("\n")).toMatch(/stillCurrent/);
  });
});

describe("analysisRow builds what the founder-ingest save writes", () => {
  it("tags founder_ingest, sums non-range items, hashes name+zip+text, redacts the stored text", () => {
    const row = analysisRow({ ...base, text: base.text + " call (202) 555-0100" }, "user-1", ids);
    expect(row.extraction_method).toBe("founder_ingest");
    expect(row.user_id).toBe("user-1");
    expect(row.total_quoted_cents).toBe(349500);
    expect(row.input_hash).toBe(tsHash(`${base.homeName}\n${base.zip}\n${base.text} call (202) 555-0100`));
    expect(row.raw_text).not.toMatch(/555-0100/);
    expect(row.items[2]).toMatchObject({ isRange: true, centsLow: 150000, centsHigh: 900000 });
  });
});

/** Every reviewed price list committed to the repo must load. */
describe("committed price-list records (supabase/seed/gpl)", () => {
  const root = join(process.cwd(), "supabase/seed/gpl");
  const files: string[] = [];
  const walk = (d: string) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (n.endsWith(".json")) files.push(p);
    }
  };
  walk(root);

  it("there is at least one", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const f of files) {
    const rec = JSON.parse(readFileSync(f, "utf8")) as GplRecord;
    it(`${rec.homeName}: validates`, () => {
      expect(validateRecord(rec, ids)).toEqual([]);
    });
    it(`${rec.homeName}: its zip is inside a defined service market`, async () => {
      const { marketForZip } = await import("@/lib/service-markets");
      expect(marketForZip(rec.zip)).not.toBeNull();
    });
    it(`${rec.homeName}: the reviewed mapping agrees with the product's matcher, line by line`, () => {
      // A reviewer may overrule the matcher, but only in writing
      // (matcherOverride), so every disagreement is visible and a matcher
      // fix or a bad review shows up here instead of in the benchmarks.
      const disagreements = rec.items
        .filter((i) => !i.isRange && !i.matcherOverride)
        .filter((i) => (matchLineItem(i.name)?.id ?? undefined) !== i.matchedItemId)
        .map((i) => `${i.name}: reviewed ${i.matchedItemId ?? "none"}, matcher ${matchLineItem(i.name)?.id ?? "none"}`);
      expect(disagreements).toEqual([]);
    });
  }
});
