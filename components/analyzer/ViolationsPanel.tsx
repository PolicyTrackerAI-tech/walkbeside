"use client";

import { useState } from "react";
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
      <ExplainToggle v={v} />
    </li>
  );
}

/**
 * "Why does this matter?" — expands into a plain-English, citation-grounded
 * explanation of this one finding (Day 4). Fetched once, then toggled
 * locally; any fetch problem falls back to the finding's own script so the
 * expander never dead-ends.
 */
function ExplainToggle({ v }: { v: Violation }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (explanation || loading) return;
    setLoading(true);
    try {
      const r = await fetch("/api/analyze-price-list/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // No itemName: a finding's evidence is a quoted line (sometimes
        // several item names joined together), not a catalog item name — a
        // lookup keyed on it grounds the wrong fair range. The finding +
        // citation are the grounding. Evidence is clipped to the API's cap
        // so a long joined line can't 400 the request.
        body: JSON.stringify({
          ruleId: v.ruleId,
          title: v.title,
          description: v.description,
          ftcReference: v.ftcReference,
          evidence: v.evidence?.slice(0, 500),
          whatToSay: v.whatToSay,
        }),
      });
      if (r.ok) {
        const d = (await r.json()) as { explanation?: string };
        if (d.explanation) {
          setExplanation(d.explanation);
          return;
        }
      }
      // Rate-limited, offline, or malformed — the finding's own script is
      // always a truthful answer.
      setExplanation(
        v.whatToSay
          ? `If you want to raise it, you can say: “${v.whatToSay}”`
          : v.description,
      );
    } catch {
      setExplanation(
        v.whatToSay
          ? `If you want to raise it, you can say: “${v.whatToSay}”`
          : v.description,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        className="text-xs font-medium text-primary-deep underline underline-offset-2 hover:no-underline"
        aria-expanded={open}
      >
        {open ? "Hide explanation" : "Why does this matter?"}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-surface border border-border px-3 py-2">
          {loading ? (
            <div className="space-y-1.5 animate-pulse" aria-hidden>
              <div className="h-3 rounded bg-border/60 w-11/12" />
              <div className="h-3 rounded bg-border/60 w-4/5" />
              <div className="h-3 rounded bg-border/60 w-2/3" />
            </div>
          ) : (
            <p className="text-sm text-ink-soft leading-relaxed">
              {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
