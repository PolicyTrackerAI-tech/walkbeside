import Link from "next/link";

/**
 * Tile for the dashboard's free-tools grid. Card-shaped, hover state,
 * right-aligned arrow. Matches the visual rhythm of other dashboard cards.
 *
 * Model A: every tool is free, so there is no locked/paywalled state.
 */
export function ToolTile({
  href,
  eyebrow,
  title,
  blurb,
}: {
  href: string;
  eyebrow?: string;
  title: string;
  blurb: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border bg-surface hover:border-primary hover:bg-primary-soft transition-colors p-5 shadow-[0_1px_2px_rgba(20,35,28,0.04)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className="text-[11px] uppercase tracking-wider text-ink-muted font-medium mb-1">
              {eyebrow}
            </div>
          )}
          <div className="font-serif text-lg text-ink group-hover:text-primary-deep leading-snug">
            {title}
          </div>
          <div className="text-sm text-ink-soft mt-1.5 leading-relaxed">
            {blurb}
          </div>
        </div>
        <span
          className="text-primary text-lg leading-none pt-1 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}
