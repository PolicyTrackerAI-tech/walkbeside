import Link from "next/link";

/**
 * Shared identity + navigation row for the token-gated partner portal
 * (/partner/r/[token] and its sub-pages). Gives the three coordinator pages
 * one visual home — "you are in your organization's portal, not the public
 * family site" — and real navigation between them, so a coordinator never
 * has to hand-edit the URL to move around. Active/inactive tab styling
 * mirrors the selected/unselected pattern used across the app's choice
 * grids.
 */

export type PortalTab = "report" | "links" | "check";

const TABS: { key: PortalTab; label: string; path: string }[] = [
  { key: "report", label: "Report", path: "" },
  { key: "links", label: "Referral links", path: "/links" },
  { key: "check", label: "Quote check", path: "/check" },
];

export function PartnerPortalNav({
  token,
  partnerName,
  active,
}: {
  token: string;
  partnerName: string;
  active: PortalTab;
}) {
  return (
    <div className="print:hidden">
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">
        {partnerName} · partner portal
      </div>
      <nav aria-label="Partner portal" className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const current = t.key === active;
          return (
            <Link
              key={t.key}
              href={`/partner/r/${token}${t.path}`}
              aria-current={current ? "page" : undefined}
              className={`rounded-xl border-2 px-4 py-2 text-sm no-underline transition-colors ${
                current
                  ? "border-primary bg-primary-soft text-primary-deep font-medium"
                  : "border-border bg-surface text-ink hover:border-primary"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
