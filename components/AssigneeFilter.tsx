"use client";

import { StatusPill } from "@/components/ui/StatusPill";
import { UNASSIGNED } from "@/lib/assignees";

/**
 * Filter pills for the assignee field — rendered only once at least one item
 * has a name on it, so the tools stay uncluttered for solo users.
 */
export function AssigneeFilter({
  names,
  active,
  onChange,
}: {
  names: string[];
  active: string;
  onChange: (filter: string) => void;
}) {
  if (names.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2 print:hidden">
      <StatusPill active={active === ""} onClick={() => onChange("")}>
        Everyone
      </StatusPill>
      {names.map((n) => (
        <StatusPill
          key={n.toLowerCase()}
          active={active.toLowerCase() === n.toLowerCase()}
          onClick={() => onChange(n)}
        >
          {n}
        </StatusPill>
      ))}
      <StatusPill
        active={active === UNASSIGNED}
        onClick={() => onChange(UNASSIGNED)}
      >
        Unassigned
      </StatusPill>
    </div>
  );
}
