/**
 * Cash-advance markup verification (roadmap Phase 1) — the proven-number
 * version of the checker's fuzzy "cash advance" flags.
 *
 * Cash-advance items are things the funeral home buys from a third party on
 * the family's behalf: flowers, the newspaper obituary, clergy honorarium,
 * death certificates, the crematory fee. The FTC Funeral Rule (16 CFR
 * 453.3(f)) doesn't forbid marking these up — it requires the provider to
 * DISCLOSE that it adds a charge. So the defensible output here is never
 * "illegal": it is the exact dollar difference between what the vendor's own
 * receipt says and what the funeral home billed, plus the disclosure question
 * to ask. If the GPL said "billed at cost", the number becomes provable
 * overbilling; otherwise it's a documented markup they should have disclosed.
 *
 * All math is integer cents. No server involvement — rows live on-device.
 */

export interface MarkupRow {
  /** What the item is, e.g. "Flowers — casket spray". */
  name: string;
  /** What the funeral home billed for it. */
  chargedCents: number;
  /** What the vendor's own receipt/invoice shows. */
  vendorCents: number;
}

export interface RowVerdict extends MarkupRow {
  /** chargedCents − vendorCents, clamped at 0 for the markup reading. */
  markupCents: number;
  /** Markup as a percentage of the vendor's price (null when vendor is $0). */
  markupPct: number | null;
  /** True when the home billed no more than the vendor charged. */
  atCost: boolean;
}

export interface MarkupSummary {
  rows: RowVerdict[];
  totalChargedCents: number;
  totalVendorCents: number;
  /** Sum of positive markups only — refunds/discounts never offset it. */
  totalMarkupCents: number;
  /** Rows with a real markup, largest first. */
  markedUp: RowVerdict[];
}

/** True for a row that is filled in enough to judge. */
export function rowComplete(r: MarkupRow): boolean {
  return r.name.trim().length > 0 && r.chargedCents > 0 && r.vendorCents > 0;
}

export function markupSummary(input: MarkupRow[]): MarkupSummary {
  const rows: RowVerdict[] = input.filter(rowComplete).map((r) => {
    const diff = r.chargedCents - r.vendorCents;
    const markupCents = Math.max(0, diff);
    return {
      ...r,
      name: r.name.trim(),
      markupCents,
      markupPct:
        r.vendorCents > 0 ? Math.round((markupCents / r.vendorCents) * 100) : null,
      atCost: diff <= 0,
    };
  });
  return {
    rows,
    totalChargedCents: rows.reduce((s, r) => s + r.chargedCents, 0),
    totalVendorCents: rows.reduce((s, r) => s + r.vendorCents, 0),
    totalMarkupCents: rows.reduce((s, r) => s + r.markupCents, 0),
    markedUp: rows
      .filter((r) => r.markupCents > 0)
      .sort((a, b) => b.markupCents - a.markupCents),
  };
}

/**
 * The message the family can send, grounded ONLY in their own numbers. Names
 * the documented difference and asks the two questions that matter: was the
 * added charge disclosed, and will they adjust it. Never claims illegality.
 */
export function markupLetter(s: MarkupSummary, homeName?: string): string {
  const home = homeName?.trim() || "your funeral home";
  const lines = s.markedUp.map(
    (r) =>
      `- ${r.name}: billed ${fmtC(r.chargedCents)}, vendor's receipt shows ${fmtC(r.vendorCents)} — a ${fmtC(r.markupCents)} difference`,
  );
  return [
    `Hello,`,
    ``,
    `Reviewing our statement from ${home} against the third-party receipts for the cash-advance items, we found the following differences:`,
    ``,
    ...lines,
    ``,
    `Total documented difference: ${fmtC(s.totalMarkupCents)}.`,
    ``,
    `Could you help us understand these? Specifically: (1) was a service charge on cash-advance items disclosed to us in writing, as the FTC Funeral Rule requires when a provider adds a charge to these items, and (2) if the price list described these as billed at cost, we'd ask that the difference be adjusted.`,
    ``,
    `Thank you — we'd like to resolve this simply.`,
  ].join("\n");
}

function fmtC(cents: number): string {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toLocaleString("en-US")}` : `$${d.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
