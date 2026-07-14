/**
 * THE family-facing neutrality pledge — the single reviewed wording
 * (COMPLIANCE_ADDENDUM §2.4: identical everywhere a partner name renders to
 * a family). Rendered by the ReferralCoBrand banner (/analyzer, /plan-now,
 * the negotiate wizard) and printed verbatim on the /portal/materials
 * one-pager. Do not fork the wording; edit it here or nowhere.
 *
 * Server-safe on purpose (no "use client") so print/server surfaces can use
 * it directly. Callers own the wrapper styling — this is the pledge text and
 * markup only.
 */
export function NeutralityPledge({ name }: { name: string }) {
  return (
    <>
      <span className="font-medium">Provided to you free by {name}.</span>{" "}
      Honest Funeral is independent: free to families, no money from funeral
      homes or insurers, and nothing here ever steers you to any provider.
      Your choices are never shared with {name} — they see only anonymous
      totals.
    </>
  );
}

/** The same pledge as plain text, for snippets and other unstyled uses. */
export const pledgeText = (name: string) =>
  `Provided to you free by ${name}. Honest Funeral is independent: free to families, no money from funeral homes or insurers, and nothing here ever steers you to any provider. Your choices are never shared with ${name} — they see only anonymous totals.`;
