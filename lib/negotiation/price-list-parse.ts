import { LINE_ITEMS, type LineItem } from "@/lib/pricing-data";

/**
 * A single line item as extracted from a funeral home's General Price List,
 * before it is benchmarked. Either a single `cents` price, or a selection
 * range (`cents_low`/`cents_high`) for items like caskets/vaults/urns.
 */
export interface RawItem {
  name: string;
  cents?: number;
  cents_low?: number;
  cents_high?: number;
}

/** Strip a leading/trailing ```json … ``` fence from an LLM response. */
export function stripCodeFence(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

/**
 * Deterministic fallback parser, used when Claude is unavailable or returns
 * output we can't parse. Tries a range ("name $800-$10,000") before a single
 * price ("name $800"). Lines containing "total" set the total instead of
 * becoming an item. Lines without a trailing price are skipped.
 */
export function naiveExtract(text: string): {
  items: RawItem[];
  total_cents?: number;
} {
  const items: RawItem[] = [];
  const reRange =
    /^(.+?)\s+\$?([\d,]+(?:\.\d{2})?)\s*[-–—]\s*\$?([\d,]+(?:\.\d{2})?)\s*$/;
  const reSingle = /^(.+?)\s+\$?([\d,]+(?:\.\d{2})?)\s*$/;
  let total: number | undefined;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const mr = reRange.exec(line);
    if (mr) {
      const low = Number(mr[2].replace(/,/g, ""));
      const high = Number(mr[3].replace(/,/g, ""));
      if (Number.isFinite(low) && Number.isFinite(high)) {
        items.push({
          name: mr[1].trim(),
          cents_low: Math.round(low * 100),
          cents_high: Math.round(high * 100),
        });
      }
      continue;
    }
    const m = reSingle.exec(line);
    if (!m) continue;
    const name = m[1].trim();
    const dollars = Number(m[2].replace(/,/g, ""));
    if (!Number.isFinite(dollars)) continue;
    const cents = Math.round(dollars * 100);
    if (/total/i.test(name)) total = cents;
    else items.push({ name, cents });
  }
  return { items, total_cents: total };
}

/**
 * Match a free-text line-item name to a benchmarked LINE_ITEM.
 *
 * Synonyms within a LINE_ITEM name are separated by "/" (e.g. "Family car /
 * limousine", "Grave liner / burial vault"). Within each synonym we drop
 * trailing qualifiers in parentheses or after an em-dash ("(each)",
 * "— newspaper") so generic words like "each" / "basic" / "local" can't cause
 * false hits. A synonym matches if it appears as a whole word ("urn" hits
 * "urn" but not "return"), or — for multi-word synonyms — if every word
 * appears somewhere in the name.
 */
export function matchLineItem(name: string): LineItem | undefined {
  const n = name.toLowerCase();
  return LINE_ITEMS.find((it) => {
    const synonyms = it.name
      .toLowerCase()
      .split("/")
      .map((s) => s.split(/[—(]/)[0].trim())
      .filter(Boolean);
    return synonyms.some((key) => {
      const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (re.test(n)) return true;
      const words = key.split(/\s+/);
      return words.length > 1 && words.every((w) => n.includes(w));
    });
  });
}
