/**
 * Final-bill-vs-original-quote drift detection — pure document arithmetic.
 *
 * Unlike the fair-price checker, this makes NO benchmark judgment at all:
 * every finding derives from the family's own two documents (the quote they
 * were given and the final bill they signed or were handed). That makes each
 * claim provable — "this line is $300 higher than the quote you shared" is a
 * fact the family can put directly in front of the funeral home, not an
 * estimate. Hospice families are often too exhausted from the illness to
 * scrutinize a bill weeks after the funeral; this does the scrutiny for them.
 *
 * Matching is deliberately conservative (guardrail #4 — never claim what we
 * can't defend): two lines pair up only when they match the SAME benchmarked
 * item id, or when their normalized names are identical. Anything we can't
 * confidently pair is reported as "on the bill but not the quote" (or vice
 * versa) with confirm-with-the-home wording — never as a proven overcharge.
 */

import {
  cleanItemName,
  matchLineItem,
  type RawItem,
} from "@/lib/negotiation/price-list-parse";

export type DriftKind =
  | "added" //      on the bill, not on the quote
  | "increased" //  paired line, bill > quote
  | "decreased" //  paired line, bill < quote
  | "unchanged" //  paired line, equal
  | "selected" //   quote showed a range (casket/urn/vault); bill has the pick
  | "removed"; //   on the quote, not on the bill (informational)

export interface DriftItem {
  kind: DriftKind;
  /** Name as it appears on the bill (or the quote, for `removed`). */
  name: string;
  billCents?: number;
  quoteCents?: number;
  /** For `selected`: the range shown on the quote. */
  quoteCentsLow?: number;
  quoteCentsHigh?: number;
  /** billCents - quoteCents for paired lines (positive = increase). */
  deltaCents?: number;
}

export interface DriftResult {
  items: DriftItem[];
  /** Sum of added lines + increases — the headline "above the quote" figure. */
  driftCents: number;
  addedCount: number;
  increasedCount: number;
  /** Lines that decreased or were removed — drift is honest in both directions. */
  savedCents: number;
  billTotalCents: number;
  quoteTotalCents: number;
}

/** Normalize a name for exact pairing: lowercase, collapse whitespace/punct. */
function normName(name: string): string {
  return cleanItemName(name)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A stable pairing key: benchmark id when matched, else the normalized name. */
function pairKey(name: string): string {
  const cleaned = cleanItemName(name);
  // matchLineItem uses whole-word synonyms, so a plural label ("Urns",
  // "Caskets") can miss its singular benchmark ("urn"). Retry once without the
  // trailing "s" — pairing-only leniency; the live checker's matcher is
  // untouched. An unpaired line degrades to added/removed (confirm wording),
  // never a wrong merge, so this stays conservative either way.
  const matched =
    matchLineItem(cleaned) ??
    (/s$/i.test(cleaned) ? matchLineItem(cleaned.replace(/s$/i, "")) : undefined);
  return matched ? `id:${matched.id}` : `nm:${normName(name)}`;
}

interface Fixed {
  name: string;
  cents: number;
}
interface Ranged {
  name: string;
  low: number;
  high: number;
}

function split(items: RawItem[]): { fixed: Fixed[]; ranged: Ranged[] } {
  const fixed: Fixed[] = [];
  const ranged: Ranged[] = [];
  for (const it of items) {
    if (it.cents_low != null && it.cents_high != null) {
      ranged.push({ name: it.name, low: it.cents_low, high: it.cents_high });
    } else if (typeof it.cents === "number") {
      fixed.push({ name: it.name, cents: it.cents });
    }
  }
  return { fixed, ranged };
}

/**
 * Diff the final bill against the original quote. Pairing is 1:1 by key in
 * document order; duplicate keys on one side simply fall through to
 * added/removed rather than guessing which duplicate pairs with which.
 */
export function diffBillAgainstQuote(
  quote: RawItem[],
  bill: RawItem[],
): DriftResult {
  const q = split(quote);
  const b = split(bill);

  // Index the quote's fixed lines and ranges by pairing key (first occurrence
  // wins; duplicates handled conservatively as unpaired).
  const quoteFixed = new Map<string, Fixed>();
  for (const f of q.fixed) {
    const k = pairKey(f.name);
    if (!quoteFixed.has(k)) quoteFixed.set(k, f);
  }
  const quoteRanged = new Map<string, Ranged>();
  for (const r of q.ranged) {
    const k = pairKey(r.name);
    if (!quoteRanged.has(k)) quoteRanged.set(k, r);
  }

  const items: DriftItem[] = [];
  const pairedQuoteKeys = new Set<string>();

  for (const line of b.fixed) {
    const k = pairKey(line.name);
    const qf = !pairedQuoteKeys.has(k) ? quoteFixed.get(k) : undefined;
    if (qf) {
      pairedQuoteKeys.add(k);
      const delta = line.cents - qf.cents;
      items.push({
        kind: delta > 0 ? "increased" : delta < 0 ? "decreased" : "unchanged",
        name: line.name,
        billCents: line.cents,
        quoteCents: qf.cents,
        deltaCents: delta,
      });
      continue;
    }
    const qr = !pairedQuoteKeys.has(k) ? quoteRanged.get(k) : undefined;
    if (qr) {
      // The quote showed a selection range (casket $800–$10,000); the bill has
      // the family's pick. That's a selection, not drift — even above the
      // range's top we only note it, because ranges are catalogs, not promises.
      pairedQuoteKeys.add(k);
      items.push({
        kind: "selected",
        name: line.name,
        billCents: line.cents,
        quoteCentsLow: qr.low,
        quoteCentsHigh: qr.high,
      });
      continue;
    }
    items.push({ kind: "added", name: line.name, billCents: line.cents });
  }

  // Quote lines never paired → removed (informational; often good news).
  for (const [k, f] of quoteFixed) {
    if (!pairedQuoteKeys.has(k)) {
      items.push({ kind: "removed", name: f.name, quoteCents: f.cents });
    }
  }

  let driftCents = 0;
  let savedCents = 0;
  let addedCount = 0;
  let increasedCount = 0;
  for (const it of items) {
    if (it.kind === "added") {
      driftCents += it.billCents ?? 0;
      addedCount++;
    } else if (it.kind === "increased") {
      driftCents += it.deltaCents ?? 0;
      increasedCount++;
    } else if (it.kind === "decreased") {
      savedCents += -(it.deltaCents ?? 0);
    } else if (it.kind === "removed") {
      savedCents += it.quoteCents ?? 0;
    }
  }

  const billTotalCents = b.fixed.reduce((s, f) => s + f.cents, 0);
  const quoteTotalCents = q.fixed.reduce((s, f) => s + f.cents, 0);

  return {
    items,
    driftCents,
    addedCount,
    increasedCount,
    savedCents,
    billTotalCents,
    quoteTotalCents,
  };
}
