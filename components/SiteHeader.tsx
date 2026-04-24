import Link from "next/link";
import { Brand } from "./Brand";

interface Props {
  /** Href for the right-side back link. Defaults to "/". */
  backHref?: string;
  /** Label for the right-side back link. Defaults to "← Home". */
  backLabel?: string;
  /**
   * Custom content for the right slot. If provided, overrides the back link
   * entirely (used by /dashboard for its sign-out + nav row).
   */
  rightSlot?: React.ReactNode;
  /** Hide the right slot entirely (used on the homepage). */
  showBack?: boolean;
  /** Extra classes on the outer <header>. Used for e.g. `no-print` on /prep. */
  className?: string;
}

export function SiteHeader({
  backHref = "/",
  backLabel = "← Home",
  rightSlot,
  showBack = true,
  className = "",
}: Props) {
  return (
    <header
      className={`border-b border-border bg-surface/70${className ? ` ${className}` : ""}`}
    >
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <Brand />
        {rightSlot ??
          (showBack ? (
            <Link
              href={backHref}
              className="text-sm text-ink-muted hover:text-ink-soft"
            >
              {backLabel}
            </Link>
          ) : null)}
      </div>
    </header>
  );
}
