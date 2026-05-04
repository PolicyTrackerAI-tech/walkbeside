/**
 * Side-by-side quote comparison for /negotiate/[id]/compare.
 *
 * Outreach rows store an optional `quote_items` jsonb of the shape
 * `[{lineItemId, name, cents}]`. When populated, this module turns those
 * rows into a denormalized matrix (rows = line items, columns = homes) and
 * classifies each cell against the fair-price ranges in lib/pricing-data.ts.
 *
 * When `quote_items` is null, the home only contributes to a totals-only
 * comparison — same data the /results page already shows.
 */
import {
  LINE_ITEMS,
  classifyPrice,
  type LineItem,
} from "@/lib/pricing-data";

export type CellRating = "good" | "fair" | "high" | "predatory" | "unrated";

export interface QuoteItem {
  lineItemId: string;
  name: string;
  cents: number;
}

/** Outreach shape this module needs — keep loose so callers can pass DB rows. */
export interface OutreachForCompare {
  id: string;
  home_name: string;
  quote_cents: number | null;
  quote_items: unknown;
}

export interface CompareColumn {
  outreachId: string;
  homeName: string;
  totalCents: number | null;
  hasItems: boolean;
}

export interface CompareCell {
  cents: number | null;
  rating: CellRating;
}

export interface CompareRow {
  lineItemId: string;
  name: string;
  /** Reference data when the line item matches a known LINE_ITEMS entry. */
  knownItem: LineItem | null;
  /** Same length as columns; null = home didn't quote this line. */
  cells: CompareCell[];
}

export interface CompareMatrix {
  columns: CompareColumn[];
  rows: CompareRow[];
  /** Total row, classified relative to the cheapest column. */
  totals: CompareCell[];
  /** Savings between the cheapest and most expensive populated total. */
  spreadCents: number;
  /** Cheapest column index, or null if no totals are present. */
  cheapestIndex: number | null;
}

function parseItems(raw: unknown): QuoteItem[] {
  if (!Array.isArray(raw)) return [];
  const out: QuoteItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const id = typeof e.lineItemId === "string" ? e.lineItemId : null;
    const name = typeof e.name === "string" ? e.name : null;
    const cents = typeof e.cents === "number" ? e.cents : null;
    if (!id || !name || cents == null || cents < 0) continue;
    out.push({ lineItemId: id, name, cents });
  }
  return out;
}

const KNOWN_ITEMS = new Map(LINE_ITEMS.map((i) => [i.id, i]));

export function buildCompareMatrix(
  outreach: OutreachForCompare[],
): CompareMatrix {
  const columns: CompareColumn[] = outreach.map((o) => {
    const items = parseItems(o.quote_items);
    return {
      outreachId: o.id,
      homeName: o.home_name,
      totalCents: o.quote_cents,
      hasItems: items.length > 0,
    };
  });

  // Collect every line item id seen across all columns, preserving the
  // canonical LINE_ITEMS order first, then any unknown ids in first-seen order.
  const itemsByColumn: QuoteItem[][] = outreach.map((o) =>
    parseItems(o.quote_items),
  );
  const seen = new Set<string>();
  for (const col of itemsByColumn) {
    for (const it of col) seen.add(it.lineItemId);
  }
  const orderedIds: string[] = [];
  for (const known of LINE_ITEMS) {
    if (seen.has(known.id)) {
      orderedIds.push(known.id);
      seen.delete(known.id);
    }
  }
  // Anything remaining is unknown; preserve first-seen order across columns.
  for (const col of itemsByColumn) {
    for (const it of col) {
      if (seen.has(it.lineItemId)) {
        orderedIds.push(it.lineItemId);
        seen.delete(it.lineItemId);
      }
    }
  }

  // Display name per id: prefer the known canonical name, else the first
  // home's own label for that id.
  const labelById = new Map<string, string>();
  for (const id of orderedIds) {
    const known = KNOWN_ITEMS.get(id);
    if (known) {
      labelById.set(id, known.name);
      continue;
    }
    for (const col of itemsByColumn) {
      const hit = col.find((i) => i.lineItemId === id);
      if (hit) {
        labelById.set(id, hit.name);
        break;
      }
    }
  }

  const rows: CompareRow[] = orderedIds.map((id) => {
    const known = KNOWN_ITEMS.get(id) ?? null;
    const cells: CompareCell[] = itemsByColumn.map((col) => {
      const hit = col.find((i) => i.lineItemId === id);
      if (!hit) return { cents: null, rating: "unrated" };
      const rating: CellRating = known
        ? classifyPrice(known, hit.cents / 100)
        : "unrated";
      return { cents: hit.cents, rating };
    });
    return {
      lineItemId: id,
      name: labelById.get(id) ?? id,
      knownItem: known,
      cells,
    };
  });

  // Totals row: classified relative to the cheapest populated total.
  const populatedTotals = columns
    .map((c) => c.totalCents)
    .filter((c): c is number => c != null && c > 0);
  const cheapest = populatedTotals.length ? Math.min(...populatedTotals) : null;
  const priciest = populatedTotals.length ? Math.max(...populatedTotals) : null;
  const cheapestIndex =
    cheapest == null
      ? null
      : columns.findIndex((c) => c.totalCents === cheapest);

  const totals: CompareCell[] = columns.map((c) => {
    if (c.totalCents == null || c.totalCents <= 0) {
      return { cents: null, rating: "unrated" };
    }
    if (cheapest == null) return { cents: c.totalCents, rating: "unrated" };
    const ratio = c.totalCents / cheapest;
    const rating: CellRating =
      ratio <= 1.001
        ? "good"
        : ratio <= 1.15
          ? "fair"
          : ratio <= 1.4
            ? "high"
            : "predatory";
    return { cents: c.totalCents, rating };
  });

  const spreadCents =
    cheapest != null && priciest != null ? priciest - cheapest : 0;

  return { columns, rows, totals, spreadCents, cheapestIndex };
}

export const RATING_LABEL: Record<CellRating, string> = {
  good: "At or below fair range",
  fair: "Within fair range",
  high: "Above fair — push back",
  predatory: "Predatory — decline or substitute",
  unrated: "No reference price",
};

/** Tailwind background tint per rating — used in the cell and the legend. */
export const RATING_BG: Record<CellRating, string> = {
  good: "bg-emerald-50 text-emerald-900",
  fair: "bg-surface text-ink",
  high: "bg-amber-50 text-amber-900",
  predatory: "bg-rose-50 text-rose-900",
  unrated: "bg-surface-soft text-ink-muted",
};
