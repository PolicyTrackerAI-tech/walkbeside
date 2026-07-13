/**
 * Four-stage "where you are" indicator for the negotiate flow, shown on
 * every page from the intake wizard through confirmation so the sense of
 * progress never disappears between pages. Same visual language as
 * components/ProgressBar.tsx (the dashboard's phase bar), keyed to the
 * negotiation journey instead of the after-death phases.
 *
 * "compare" renders at the same index as "results" — it's a sub-view of
 * choosing, not a fifth stage.
 */

export type CaseStage =
  | "started"
  | "contacting"
  | "results"
  | "compare"
  | "closed";

const ORDER: { key: CaseStage; label: string }[] = [
  { key: "started", label: "Tell us" },
  { key: "contacting", label: "We reach out" },
  { key: "results", label: "You choose" },
  { key: "closed", label: "Confirmed" },
];

function indexFor(stage: CaseStage): number {
  if (stage === "compare") stage = "results";
  return ORDER.findIndex((s) => s.key === stage);
}

/**
 * Maps a negotiations.status value to the stage the family is actually in,
 * so the dashboard snapshot and the live status page always show the same
 * stage language. "preparing" is the (transient) initial status; unknown/
 * legacy statuses ("started", "pending_payment") fall back to the earliest
 * sensible stage rather than throwing.
 */
export function stageForNegotiationStatus(status: string): CaseStage {
  switch (status) {
    case "closed":
      return "closed";
    case "received":
      return "results";
    case "contacting":
    case "no_homes_available":
      return "contacting";
    case "preparing":
    default:
      return "started";
  }
}

export function CaseStepper({ stage }: { stage: CaseStage }) {
  const idx = indexFor(stage);
  return (
    <div className="flex items-stretch gap-1" aria-label="Case progress">
      {ORDER.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <div key={s.key} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                done ? "bg-primary" : current ? "bg-primary/70" : "bg-border"
              }`}
            />
            <div
              className={`mt-1.5 text-[11px] uppercase tracking-wider ${
                current
                  ? "text-primary-deep font-medium"
                  : done
                    ? "text-ink-soft"
                    : "text-ink-muted"
              }`}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
