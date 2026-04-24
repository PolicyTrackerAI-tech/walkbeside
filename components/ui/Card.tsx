import * as React from "react";

export function Card({
  children,
  className = "",
  tone = "surface",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "surface" | "soft" | "primary" | "good" | "warn" | "bad";
}) {
  const tones: Record<string, string> = {
    surface: "bg-surface border-border",
    soft: "bg-surface-soft border-border",
    primary: "bg-primary-soft border-primary/20",
    good: "bg-good-soft border-good/30",
    warn: "bg-warn-soft border-warn/30",
    bad: "bg-bad-soft border-bad/30",
  };
  return (
    <div
      className={`rounded-2xl border ${tones[tone]} p-6 shadow-[0_1px_2px_rgba(20,35,28,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`font-serif text-xl text-ink mb-2 ${className}`}>
      {children}
    </h3>
  );
}

export function CardEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-3">
      {children}
    </div>
  );
}
