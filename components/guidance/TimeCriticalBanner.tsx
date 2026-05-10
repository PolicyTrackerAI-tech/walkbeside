"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DECIDE_STORAGE_KEYS, readDecide } from "@/lib/faith-storage";
import {
  getFaith,
  type FaithKey,
  type FaithTradition,
} from "@/lib/faith-traditions";

/**
 * Banner shown at the top of /guidance/[scenario] that surfaces
 * time-critical funeral-tradition requirements during the crisis
 * phase. For Jewish, Muslim, Hindu, and Bahá'í families, knowing the
 * 24-hour burial requirement during the first hours is operationally
 * essential — by the time they reach /decide, irreversible decisions
 * may already be made.
 *
 * Behavior:
 * - If user already selected a faith on /decide and that faith has
 *   urgent timing → show an URGENT (warn) banner with the timing
 *   constraint and a CTA to confirm with the funeral home now.
 * - If user has not selected a faith → show a smaller PROMPT banner
 *   ("Is your tradition time-sensitive? Tell us yours →") that links
 *   to /decide.
 * - If user selected a non-urgent faith → render nothing.
 */

function isUrgentTimeline(timelineNorm: string): boolean {
  // Urgency markers we look for in the timelineNorm prose.
  const lower = timelineNorm.toLowerCase();
  return (
    /\b24[ -]?hour/.test(lower) ||
    /\bwithin 24\b/.test(lower) ||
    /\bwithin 1 hour'?s? travel\b/.test(lower) ||
    /\bsame.day burial\b/.test(lower)
  );
}

export function TimeCriticalBanner() {
  const [faith, setFaith] = useState<FaithTradition | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const f = readDecide(DECIDE_STORAGE_KEYS.faith);
      const denom = readDecide(DECIDE_STORAGE_KEYS.faithDenomination);
      // Prefer the most-specific (denomination) profile if set.
      if (denom) {
        const sub = getFaith(denom as FaithKey);
        if (sub) {
          setFaith(sub);
          setHydrated(true);
          return;
        }
      }
      if (f) {
        const top = getFaith(f as FaithKey);
        if (top) setFaith(top);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  // No faith picked yet → small prompt to capture.
  if (!faith) {
    return (
      <div className="rounded-2xl border border-border bg-surface-soft px-5 py-4 mb-6">
        <p className="text-sm text-ink-soft">
          <strong className="text-ink">Some traditions need
          burial within 24 hours.</strong>{" "}
          If yours might (Jewish, Muslim, Hindu, Bahá&rsquo;í, others),{" "}
          <Link
            href="/decide"
            className="text-primary-deep underline-offset-2 hover:underline font-medium"
          >
            tell us so we can adjust this guidance →
          </Link>
        </p>
      </div>
    );
  }

  if (isUrgentTimeline(faith.timelineNorm)) {
    return (
      <div className="rounded-2xl border-2 border-warn/40 bg-warn-soft px-5 py-4 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-warn font-semibold mb-1.5">
          Time-critical · {faith.label}
        </div>
        <p className="text-ink leading-relaxed">
          <strong>{faith.timelineNorm}</strong>
        </p>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">
          When you call the funeral home, lead with this. Not every
          home in the US knows or accommodates {faith.label} timing
          well; some need explicit instruction. Confirm in writing
          that they can meet your tradition&rsquo;s timeline before
          authorizing transport.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/faith/${faith.key}`}
            className="font-medium text-primary-deep underline-offset-2 hover:underline"
          >
            Full {faith.label} guide →
          </Link>
          <Link
            href={`/negotiate/start?tradition=${faith.key}`}
            className="font-medium text-primary-deep underline-offset-2 hover:underline"
          >
            Have us call homes that handle this →
          </Link>
        </div>
      </div>
    );
  }

  // Faith picked, but not urgent — render nothing.
  return null;
}
