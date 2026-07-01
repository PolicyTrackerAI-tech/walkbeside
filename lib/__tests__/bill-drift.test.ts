import { describe, it, expect } from "vitest";
import { diffBillAgainstQuote } from "@/lib/bill-drift";
import type { RawItem } from "@/lib/negotiation/price-list-parse";

const item = (name: string, cents: number): RawItem => ({ name, cents });
const range = (name: string, low: number, high: number): RawItem => ({
  name,
  cents_low: low,
  cents_high: high,
});

describe("diffBillAgainstQuote", () => {
  it("identical documents → everything unchanged, zero drift", () => {
    const doc = [item("Basic services fee", 219500), item("Embalming", 89500)];
    const r = diffBillAgainstQuote(doc, doc);
    expect(r.driftCents).toBe(0);
    expect(r.savedCents).toBe(0);
    expect(r.items.every((i) => i.kind === "unchanged")).toBe(true);
  });

  it("a charge on the bill that wasn't quoted is 'added' and drives the headline", () => {
    const quote = [item("Basic services fee", 219500)];
    const bill = [item("Basic services fee", 219500), item("Utility vehicle", 35000)];
    const r = diffBillAgainstQuote(quote, bill);
    expect(r.driftCents).toBe(35000);
    expect(r.addedCount).toBe(1);
    expect(r.items.find((i) => i.kind === "added")?.name).toBe("Utility vehicle");
  });

  it("pairs lines by benchmark id even when the wording differs, and computes the increase", () => {
    // Both names resolve to the same benchmarked item (embalming).
    const quote = [item("Embalming", 89500)];
    const bill = [item("Embalming of remains", 119500)];
    const r = diffBillAgainstQuote(quote, bill);
    const inc = r.items.find((i) => i.kind === "increased");
    expect(inc?.deltaCents).toBe(30000);
    expect(r.driftCents).toBe(30000);
    expect(r.increasedCount).toBe(1);
  });

  it("reports decreases and removals as savings — drift is honest both directions", () => {
    const quote = [item("Basic services fee", 219500), item("Limousine", 30000)];
    const bill = [item("Basic services fee", 199500)];
    const r = diffBillAgainstQuote(quote, bill);
    expect(r.driftCents).toBe(0);
    expect(r.savedCents).toBe(20000 + 30000); // decrease + removed line
    expect(r.items.find((i) => i.kind === "removed")?.name).toBe("Limousine");
  });

  it("a quote range resolved to a fixed bill price is a 'selection', not drift — even above the range top", () => {
    const quote = [range("Urns", 20000, 200000)];
    const bill = [item("Urn (bronze)", 250000)];
    const r = diffBillAgainstQuote(quote, bill);
    const sel = r.items.find((i) => i.kind === "selected");
    expect(sel).toBeDefined();
    expect(sel?.quoteCentsLow).toBe(20000);
    expect(r.driftCents).toBe(0); // ranges are catalogs, not promises
  });

  it("pairs unbenchmarked lines by normalized name", () => {
    const quote = [item("Memorial DVD  ", 15000)];
    const bill = [item("memorial dvd", 15000)];
    const r = diffBillAgainstQuote(quote, bill);
    expect(r.items[0].kind).toBe("unchanged");
  });

  it("duplicate lines on one side stay conservative — one pairs, the extra is 'added'", () => {
    const quote = [item("Embalming", 89500)];
    const bill = [item("Embalming", 89500), item("Embalming", 89500)];
    const r = diffBillAgainstQuote(quote, bill);
    expect(r.items.filter((i) => i.kind === "unchanged")).toHaveLength(1);
    expect(r.items.filter((i) => i.kind === "added")).toHaveLength(1);
  });

  it("headline = added + increases only; decreases never offset it", () => {
    const quote = [item("Embalming", 89500), item("Hearse", 40000)];
    const bill = [
      item("Embalming", 99500), //   +10000
      item("Hearse", 30000), //      -10000 (does NOT cancel the increase)
      item("Documentation fee", 5000), // added
    ];
    const r = diffBillAgainstQuote(quote, bill);
    expect(r.driftCents).toBe(15000);
    expect(r.savedCents).toBe(10000);
  });
});
