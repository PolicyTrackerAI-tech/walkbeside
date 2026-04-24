export type Phase =
  | "first-steps"
  | "funeral"
  | "service"
  | "documents"
  | "estate"
  | "done";

const ORDER: { key: Phase; label: string }[] = [
  { key: "first-steps", label: "First steps" },
  { key: "funeral", label: "Funeral" },
  { key: "service", label: "Service" },
  { key: "documents", label: "Documents" },
  { key: "estate", label: "Estate" },
  { key: "done", label: "Done" },
];

export function ProgressBar({ phase }: { phase: Phase }) {
  const idx = ORDER.findIndex((p) => p.key === phase);
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
        Where you are
      </div>
      <div className="flex items-stretch gap-1">
        {ORDER.map((p, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <div key={p.key} className="flex-1">
              <div
                className={`h-1.5 rounded-full ${
                  done
                    ? "bg-primary"
                    : current
                      ? "bg-primary/70"
                      : "bg-border"
                }`}
              />
              <div
                className={`mt-2 text-[11px] uppercase tracking-wider ${
                  current
                    ? "text-primary-deep font-medium"
                    : done
                      ? "text-ink-soft"
                      : "text-ink-muted"
                }`}
              >
                {p.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
