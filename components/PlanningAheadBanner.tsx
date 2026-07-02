import Link from "next/link";

/**
 * The "planning ahead on hospice" entry state (roadmap Phase 0). Rendered when
 * a tool is opened with ?mode=ahead — usually a link out of /plan-now. The
 * person is still alive; the family is preparing calmly, days-not-years ahead.
 * Nothing about the tool changes server-side; this is context so the at-need
 * framing reads right, plus the path back to the family plan.
 */
export function PlanningAheadBanner({ note }: { note?: string }) {
  return (
    <div className="print:hidden rounded-xl border border-primary/30 bg-primary-soft/50 px-4 py-3 text-sm text-ink">
      <span className="font-medium">You&rsquo;re planning ahead.</span>{" "}
      {note ??
        "Nothing has happened yet, and nothing here commits you to anything — this tool works the same before a death. Skip any question that doesn't apply yet."}{" "}
      When you&rsquo;re done, add what you learned to{" "}
      <Link href="/plan-now" className="underline underline-offset-2">
        your family plan
      </Link>
      .
    </div>
  );
}

/** True when the page was opened in planning-ahead mode (?mode=ahead). */
export function isAheadMode(
  sp: Record<string, string | string[] | undefined>,
): boolean {
  const raw = sp.mode;
  const mode = Array.isArray(raw) ? raw[0] : raw;
  return mode === "ahead";
}
