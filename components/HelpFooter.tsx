/**
 * HelpFooter — a small, persistent component on every spine screen
 * saying "need a person? call us." Older users freeze when they feel
 * trapped in software. The escape hatch matters more than the app.
 *
 * Phone number reads from NEXT_PUBLIC_HELP_PHONE. Set that env var
 * (in Vercel → Project Settings → Environment Variables) to your
 * real number in E.164 format, e.g. +15551234567. If the env var is
 * missing, falls back to a placeholder so dev/preview doesn't break.
 *
 * Hours read from NEXT_PUBLIC_HELP_HOURS. Optional. Defaults to a
 * sensible range when missing.
 */

function formatDisplay(e164: string): string {
  // Format US numbers as (XXX) XXX-XXXX. Anything else, return as-is.
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (m) return `(${m[1]}) ${m[2]}-${m[3]}`;
  return e164;
}

export function HelpFooter() {
  const rawPhone = process.env.NEXT_PUBLIC_HELP_PHONE ?? "+15555555555";
  const hours = process.env.NEXT_PUBLIC_HELP_HOURS ?? "9am–9pm ET, every day.";
  const phoneDisplay = formatDisplay(rawPhone);
  const phoneHref = `tel:${rawPhone}`;

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
      <p className="mt-1 text-xs text-ink-muted">{hours}</p>
      <p className="mt-3 text-xs text-ink-muted">
        Prefer email?{" "}
        <a
          href="mailto:support@honestfuneral.co"
          className="text-primary-deep underline-offset-2 hover:underline"
        >
          support@honestfuneral.co
        </a>
      </p>
    </div>
  );
}
