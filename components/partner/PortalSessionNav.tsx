import Link from "next/link";

/**
 * Identity + navigation row for the SIGNED-IN partner portal (/portal).
 * Same visual system as the token-gated PartnerPortalNav so the two ways in
 * feel like one product. Referral links and the quote-check tool still live
 * on their token routes until their /portal-native pages land (Day 2) — the
 * member's session context carries the org's report_token, so linking there
 * grants nothing the member doesn't already have.
 */

export type SessionTab = "overview" | "links" | "check";

export function PortalSessionNav({
  token,
  partnerName,
  active,
}: {
  token: string;
  partnerName: string;
  active: SessionTab;
}) {
  const tabs: { key: SessionTab; label: string; href: string }[] = [
    { key: "overview", label: "Overview", href: "/portal" },
    { key: "links", label: "Referral links", href: `/partner/r/${token}/links` },
    { key: "check", label: "Quote check", href: `/partner/r/${token}/check` },
  ];
  return (
    <div className="print:hidden">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="text-xs uppercase tracking-wider text-ink-muted">
          {partnerName} · partner portal
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-xs text-ink-muted underline hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
      <nav aria-label="Partner portal" className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const current = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.href}
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
