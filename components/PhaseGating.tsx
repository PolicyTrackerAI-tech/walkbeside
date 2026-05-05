"use client";

import type { ReactNode } from "react";
import { usePhase } from "./PhaseContext";
import type { Phase } from "@/lib/phase-detector";

/**
 * Renders children only when current phase is in the allow-list.
 */
export function ShowInPhase({
  phases,
  children,
}: {
  phases: Phase[];
  children: ReactNode;
}) {
  const current = usePhase();
  if (!phases.includes(current)) return null;
  return <>{children}</>;
}

/**
 * Renders children only when current phase is NOT in the deny-list.
 */
export function HideInPhase({
  phases,
  children,
}: {
  phases: Phase[];
  children: ReactNode;
}) {
  const current = usePhase();
  if (phases.includes(current)) return null;
  return <>{children}</>;
}
