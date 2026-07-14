import Link from "next/link";

/**
 * Identity + navigation row for the SIGNED-IN partner portal (/portal).
 * Same visual system as the token-gated PartnerPortalNav so the two ways in
 * feel like one product. Every tab is a native /portal route behind
 * requirePartnerMember — the report_token quick links remain a separate,
 * parallel way in. Team and Settings render for owners only (their pages
 * and APIs enforce the role server-side regardless).
 */

export type SessionTab =
  | "overview"
  | "links"
  | "check"
  | "team"
  | "materials"
  | "settings";

export function PortalSessionNav({
  partnerName,
  active,
  role,
}: {
  partnerName: string;
  active: SessionTab;
  role: "owner" | "member";
}) {
  const tabs: {
    key: SessionTab;
    label: string;
    href: string;
    ownerOnly?: boolean;
  }[] = [
    { key: "overview", label: "Overview", href: "/portal" },
    { key: "links", label: "Referral links", href: "/portal/links" },
    { key: "check", label: "Quote check", href: "/portal/check" },
    { key: "materials", label: "Materials", href: "/portal/materials" },
    { key: "team", label: "Team", href: "/portal/team", ownerOnly: true },
    {
      key: "settings",
      label: "Settings",
      href: "/portal/settings",
      ownerOnly: true,
    },
  ];
  const visible = tabs.filter((t) => !t.ownerOnly || role === "owner");
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
        {visible.map((t) => {
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
