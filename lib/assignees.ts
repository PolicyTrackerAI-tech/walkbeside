/**
 * Assignee helpers (roadmap Phase 2): free-text "who's on it" across the
 * Vault, Notifications, and Next-30-Days lists. Sibling division of labor is
 * a named pain point — three remote adult children splitting one checklist.
 * Pure and shared so the three tools filter identically.
 */

export interface HasAssignee {
  assignee?: string;
}

/** Distinct, trimmed assignee names in first-seen order. */
export function assigneeNames(items: HasAssignee[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const name = (item.assignee ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/**
 * Filter predicate. "" = everyone; "__unassigned__" = items with no
 * assignee; otherwise case-insensitive name match.
 */
export const UNASSIGNED = "__unassigned__";

export function matchesAssignee(filter: string) {
  return (item: HasAssignee): boolean => {
    if (!filter) return true;
    const name = (item.assignee ?? "").trim().toLowerCase();
    if (filter === UNASSIGNED) return name === "";
    return name === filter.trim().toLowerCase();
  };
}
