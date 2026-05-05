/**
 * HelpFooter — a small, persistent component on every spine screen
 * saying "need a person? call us." Older users freeze when they feel
 * trapped in software. The escape hatch matters more than the app.
 *
 * Phone number is currently a placeholder. Wire in the real number
 * via NEXT_PUBLIC_HELP_PHONE before launch.
 */
export function HelpFooter() {
  // TODO-margaret: replace with real number from process.env.NEXT_PUBLIC_HELP_PHONE
  const phoneDisplay = "(555) 555-5555";
  const phoneHref = "tel:+15555555555";

  return (
    <div className="mt-12 mb-6 text-center print:hidden">
      <p className="text-sm text-ink-soft">
        Stuck or just need to hear a human voice?
      </p>
      <a
        href={phoneHref}
        className="inline-block mt-1 text-base font-medium text-primary-deep underline-offset-2 hover:underline"
      >
        Call {phoneDisplay}
      </a>
      <p className="mt-1 text-xs text-ink-muted">
        9am&ndash;9pm ET, every day.
      </p>
    </div>
  );
}
