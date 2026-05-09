"use client";

import type { ReactNode } from "react";

/**
 * Small pill-style toggle button for status switching in lists
 * (notifications hub, document vault). Compact, clear active state.
 */
export function StatusPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        active
          ? "bg-primary-deep text-on-primary"
          : "bg-surface border border-border text-ink-soft hover:border-primary hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
