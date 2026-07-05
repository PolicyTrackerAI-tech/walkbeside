import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import type { Severity, Violation } from "./types";

const SEVERITY_LABEL: Record<Severity, string> = {
  violation: "Likely FTC violation",
  suspicious: "Suspicious upsell",
  info: "Worth checking",
};

export function ViolationsPanel({ violations }: { violations: Violation[] }) {
  // Sort by severity: violation > suspicious > info.
  const order: Severity[] = ["violation", "suspicious", "info"];
  const sorted = [...violations].sort(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
  );
  const violationCount = sorted.filter((v) => v.severity === "violation")
    .length;
  const suspiciousCount = sorted.filter((v) => v.severity === "suspicious")
    .length;

  return (
    <Card tone={violationCount > 0 ? "bad" : "warn"}>
      <CardEyebrow>FTC compliance + bundling check</CardEyebrow>
      <CardTitle>
        {violationCount > 0
          ? `${violationCount} likely FTC violation${violationCount === 1 ? "" : "s"}${
              suspiciousCount > 0
                ? ` + ${suspiciousCount} suspicious item${suspiciousCount === 1 ? "" : "s"}`
                : ""
            }`
          : suspiciousCount > 0
            ? `${suspiciousCount} suspicious item${suspiciousCount === 1 ? "" : "s"} flagged`
            : "Worth a closer look"}
      </CardTitle>
      <p className="text-ink-soft mt-3 mb-5 text-sm">
        We scanned the price list against the FTC Funeral Rule (16 CFR
        Part 453) and known industry upsell patterns. Each finding
        below comes with a script you can quote back.
      </p>
      <ul className="space-y-3">
        {sorted.map((v) => (
          <ViolationRow key={v.ruleId} v={v} />
        ))}
      </ul>
    </Card>
  );
}

function ViolationRow({ v }: { v: Violation }) {
  const toneClass =
    v.severity === "violation"
      ? "border-bad/40 bg-bad-soft/60"
      : v.severity === "suspicious"
        ? "border-warn/40 bg-warn-soft/60"
        : "border-border bg-surface";
  const labelClass =
    v.severity === "violation"
      ? "text-bad"
      : v.severity === "suspicious"
        ? "text-warn"
        : "text-ink-muted";

  return (
    <li className={`rounded-xl border p-4 ${toneClass}`}>
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${labelClass}`}>
        {SEVERITY_LABEL[v.severity]}
        {v.ftcReference && (
          <span className="ml-2 text-ink-muted font-normal">
            · {v.ftcReference}
          </span>
        )}
      </div>
      <div className="font-serif text-base text-ink mt-1">{v.title}</div>
      {v.evidence && (
        <div className="mt-1 text-xs text-ink-muted italic">
          Evidence: &ldquo;{v.evidence}&rdquo;
        </div>
      )}
      <p className="text-sm text-ink-soft mt-2 leading-relaxed">
        {v.description}
      </p>
      {v.whatToSay && (
        <div className="mt-3 rounded-lg bg-surface border border-border px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            What to say to the funeral home
          </div>
          <p className="text-sm text-ink leading-relaxed">
            &ldquo;{v.whatToSay}&rdquo;
          </p>
        </div>
      )}
    </li>
  );
}
