import Link from "next/link";

/**
 * The data-tier chip that sits under any user-facing price figure.
 *
 *   verified  — aggregated from n≥5 real local price lists
 *   community — reported by families in the area, n≥5
 *   modeled   — national benchmarks × regional cost index (the fallback)
 *
 * Tier semantics come from lib/benchmarks-store (tierForZip). Purely
 * presentational — no "use client" so it renders in server and client
 * components alike; callers fetch the tier and pass it in.
 */

const TIER_CHIP: Record<Props["tier"], string> = {
  verified: "bg-good-soft text-primary-deep",
  community: "bg-primary-soft text-primary-deep",
  modeled: "bg-surface-soft text-ink-muted border border-border",
};

interface Props {
  tier: "verified" | "community" | "modeled";
  n?: number | null;
  lastUpdated?: string | null;
  /** Local data covered only some of the benchmarked items — the label must
   * not claim the whole figure is verified/community (guardrail #4). */
  partial?: boolean;
  className?: string;
}

export function DataTierBadge({ tier, n, lastUpdated, partial, className }: Props) {
  const label =
    tier === "verified"
      ? partial
        ? "Verified — partial"
        : n
          ? `Verified — ${n} price lists`
          : "Verified data"
      : tier === "community"
        ? partial
          ? "Community — partial"
          : "Community data"
        : "Modeled estimate";
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span
        className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded-full ${TIER_CHIP[tier]}`}
      >
        {label}
      </span>
      {lastUpdated && (
        <span className="text-xs text-ink-muted">Updated {lastUpdated}</span>
      )}
      <Link href="/methodology" className="text-xs underline text-ink-muted">
        methodology
      </Link>
    </span>
  );
}
