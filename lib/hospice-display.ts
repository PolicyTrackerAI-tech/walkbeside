/**
 * Display casing for CMS hospice names and cities. The `hospices` table
 * stores the CMS directory VERBATIM, and CMS publishes UPPERCASE — rendering
 * "HOSPICE OF THE VALLEY, LLC" in prose reads like shouting. This title-cases
 * for DISPLAY ONLY: data, API queries, and query-param values stay verbatim.
 *
 * Server-safe (pure, no "use client") so server pages and client components
 * share one implementation. Deliberately modest — a readable name, not a
 * perfect one.
 */

/** Tokens kept fully uppercase (entity suffixes, roman numerals, initialisms). */
const KEEP_UPPER = new Set([
  "LLC",
  "LLP",
  "LP",
  "INC",
  "LTD",
  "PC",
  "PA",
  "PLLC",
  "VNA",
  "USA",
  "II",
  "III",
  "IV",
  "VI",
  "VII",
]);

/** Small words lowercased mid-name ("Hospice of the Valley"). */
const SMALL_WORDS = new Set([
  "of",
  "the",
  "and",
  "for",
  "at",
  "in",
  "on",
  "by",
  "a",
  "an",
  "to",
  "de",
  "del",
  "la",
  "las",
  "los",
  "y",
]);

/** Capitalize the first letter and letters after -, /, . and ( — but after an
 * apostrophe only when it follows a single leading letter (O'Brien, D'Alene),
 * so possessives stay lowercase (St. Mary's). */
function capitalizeToken(lower: string): string {
  let out = "";
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    const prev = i > 0 ? lower[i - 1] : "";
    const capitalize =
      i === 0 ||
      prev === "-" ||
      prev === "/" ||
      prev === "." ||
      prev === "(" ||
      (prev === "'" && i === 2);
    out += capitalize ? ch.toUpperCase() : ch;
  }
  return out;
}

export function displayHospiceName(raw: string): string {
  const tokens = raw.trim().split(/\s+/);
  return tokens
    .map((token, i) => {
      // Classify on the token minus surrounding punctuation ("LLC," → "LLC").
      const core = token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
      if (KEEP_UPPER.has(core.toUpperCase())) {
        return token.toUpperCase();
      }
      const lower = token.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(core.toLowerCase())) {
        return lower;
      }
      return capitalizeToken(lower);
    })
    .join(" ");
}
