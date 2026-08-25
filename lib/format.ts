/**
 * Display formatting helpers. fmtCents moved here from lib/stripe.ts in
 * audit A9 — family surfaces were importing "stripe" just to print a price,
 * which read as payment-era noise on every guardrail-#2 grep.
 */
export function fmtCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
