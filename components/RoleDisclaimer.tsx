import Link from "next/link";
import { NOT_A_FUNERAL_HOME } from "@/lib/copy";

/**
 * Persistent role disclaimer for the surfaces closest to "arranging" —
 * the negotiate flow and the decide flow — per the product requirements in
 * docs/legal/UTAH_CLEARANCE_DRAFT.md §4 (PR #184). Renders the pinned
 * NOT_A_FUNERAL_HOME sentence from lib/copy.ts; never retype it here.
 * Server-safe (no "use client").
 */
export function RoleDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside aria-label="Our role" className={className}>
      <p className="text-xs text-ink-muted leading-relaxed border border-border rounded-xl bg-surface-soft px-4 py-3">
        {NOT_A_FUNERAL_HOME}{" "}
        <Link
          href="/our-role"
          className="text-ink-soft underline-offset-2 hover:underline whitespace-nowrap"
        >
          More about our role
        </Link>
      </p>
    </aside>
  );
}
