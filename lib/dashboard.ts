/**
 * Dashboard logic — derives the family's current "three tasks" from their
 * stored state. Hard rule from the brief: NEVER more than three.
 */

import type { Phase } from "@/components/ProgressBar";

export interface Task {
  id: string;
  title: string;
  detail?: string;
  href?: string;
  phase: Phase;
  done?: boolean;
}

export interface DashboardState {
  hasNegotiation: boolean;
  hasClosedDeal: boolean;
  hasUploadedPriceList: boolean;
  hasCertCount: boolean;
  hasObituary: boolean;
}

export function deriveTasks(s: DashboardState): { phase: Phase; tasks: Task[] } {
  const tasks: Task[] = [];

  if (!s.hasNegotiation) {
    tasks.push({
      id: "lookup-prices",
      phase: "first-steps",
      title: "Look up fair funeral prices for your zip code",
      detail:
        "Three minutes. The single most important thing before calling any home.",
      href: "/prices",
    });
  }

  if (!s.hasClosedDeal) {
    tasks.push({
      id: "negotiate",
      phase: "funeral",
      title: "Have us call funeral homes for you",
      detail: "We reach 3–5 as your named advocate. Flat $49, paid upfront — refundable in 14 days.",
      href: "/negotiate/start",
    });
  }

  if (!s.hasUploadedPriceList) {
    tasks.push({
      id: "analyze-list",
      phase: "funeral",
      title: "Send us your price list and we’ll flag every overcharge",
      detail:
        "After your meeting, send the price list. We’ll mark every line that’s above fair range and show you what to push back on.",
      href: "/analyzer",
    });
  }

  if (!s.hasCertCount) {
    tasks.push({
      id: "cert-calc",
      phase: "documents",
      title: "Figure out how many death certificates you actually need",
      detail:
        "Most families order too few and pay rush fees later. Five minutes here saves a week.",
      href: "/certificates",
    });
  }

  if (!s.hasObituary) {
    tasks.push({
      id: "obit",
      phase: "service",
      title: "Draft the obituary",
      detail:
        "Our helper asks a few questions and writes the first draft for you to edit.",
      href: "/obituary",
    });
  }

  // Always exactly three.
  const phase: Phase = !s.hasClosedDeal
    ? "first-steps"
    : !s.hasUploadedPriceList
      ? "funeral"
      : !s.hasObituary
        ? "service"
        : !s.hasCertCount
          ? "documents"
          : "done";

  return { phase, tasks: tasks.slice(0, 3) };
}
