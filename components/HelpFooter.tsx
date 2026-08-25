/**
 * HelpFooter — a small, persistent component on every spine screen
 * saying "need a person? call us." Older users freeze when they feel
 * trapped in software. The escape hatch matters more than the app.
 *
 * Phone number reads from NEXT_PUBLIC_HELP_PHONE. Set that env var
 * (in Vercel → Project Settings → Environment Variables) to a real,
 * staffed number in E.164 format, e.g. +15551234567. When the env var
 * is missing, no phone is shown at all — we never print a number a
 * grieving reader can call and reach nothing.
 *
 * Hours read from NEXT_PUBLIC_HELP_HOURS. Optional; only rendered
 * when set.
 */

function formatDisplay(e164: string): string {
  // Format US numbers as (XXX) XXX-XXXX. Anything else, return as-is.
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (m) return `(${m[1]}) ${m[2]}-${m[3]}`;
  return e164;
}

export function HelpFooter() {
  const rawPhone = process.env.NEXT_PUBLIC_HELP_PHONE;
  const hours = process.env.NEXT_PUBLIC_HELP_HOURS;

  if (!rawPhone) {
    return (
      <div className="mt-12 mb-6 text-center print:hidden">
        <p className="text-xs text-ink-muted">
          Stuck or have a question?{" "}
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

  return (
    <div className="mt-12 mb-6 text-center print:hidden">
      <p className="text-sm text-ink-soft">
        Stuck or just need to hear a human voice?
      </p>
      <a
        href={`tel:${rawPhone}`}
        className="inline-block mt-1 text-base font-medium text-primary-deep underline-offset-2 hover:underline"
      >
        Call {formatDisplay(rawPhone)}
      </a>
      {hours && <p className="mt-1 text-xs text-ink-muted">{hours}</p>}
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
