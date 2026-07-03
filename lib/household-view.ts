/**
 * Pure parsing for the read-only family view at /household/[id]. The payload
 * is whatever the point person's device published (opaque JSON strings under
 * known keys) — a viewer must never crash on a malformed or hostile payload,
 * so every section parses defensively and drops anything malformed.
 */

export interface ViewVaultDoc {
  type: string;
  description: string;
  location: string;
  status: string;
  assignee?: string;
}

export interface ViewContact {
  name: string;
  relationship: string;
  status: string;
  assignee?: string;
}

export interface ViewTaskProgress {
  /** task id -> "done" | "skipped" (todo omitted — it's the default). */
  [taskId: string]: string;
}

export interface HouseholdView {
  vaultDocs: ViewVaultDoc[];
  contacts: ViewContact[];
  taskProgress: ViewTaskProgress;
  /** task id -> assignee name — sibling division of labor. */
  taskAssignees: Record<string, string>;
  /** From the decide flow, when present. */
  recommendedServiceType?: string;
}

const str = (v: unknown, max = 200): string =>
  typeof v === "string" ? v.slice(0, max) : "";

function parseArray<T>(
  raw: string | undefined,
  map: (item: Record<string, unknown>) => T | null,
  cap: number,
): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map(map)
      .filter((x): x is T => x !== null)
      .slice(0, cap);
  } catch {
    return [];
  }
}

export function parseHouseholdView(
  payload: Record<string, string>,
): HouseholdView {
  const vaultDocs = parseArray<ViewVaultDoc>(
    payload["honestfuneral.vault.v1"],
    (d) => {
      const type = str(d.type, 80);
      if (!type) return null;
      return {
        type,
        description: str(d.description),
        location: str(d.location),
        status: str(d.status, 20) || "need-to-find",
        ...(str(d.assignee, 40) ? { assignee: str(d.assignee, 40) } : {}),
      };
    },
    100,
  );

  const contacts = parseArray<ViewContact>(
    payload["honestfuneral.notifications.v1"],
    (c) => {
      const name = str(c.name, 80);
      if (!name) return null;
      return {
        name,
        relationship: str(c.relationship, 80),
        status: str(c.status, 20) || "todo",
        ...(str(c.assignee, 40) ? { assignee: str(c.assignee, 40) } : {}),
      };
    },
    200,
  );

  let taskProgress: ViewTaskProgress = {};
  try {
    const parsed = JSON.parse(payload["honestfuneral.next30.v1"] ?? "") as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        // Legacy boolean values mean "done"; only done/skipped are worth showing.
        if (v === true || v === "done") taskProgress[k.slice(0, 80)] = "done";
        else if (v === "skipped") taskProgress[k.slice(0, 80)] = "skipped";
      }
    }
  } catch {
    taskProgress = {};
  }

  let taskAssignees: Record<string, string> = {};
  try {
    const parsed = JSON.parse(
      payload["honestfuneral.next30.assignees.v1"] ?? "",
    ) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        const name = str(v, 40).trim();
        if (name) taskAssignees[k.slice(0, 80)] = name;
      }
    }
  } catch {
    taskAssignees = {};
  }

  const svc = payload["hf-decide:recommendedServiceType"];
  return {
    vaultDocs,
    contacts,
    taskProgress,
    taskAssignees,
    recommendedServiceType: svc ? str(svc, 40) : undefined,
  };
}
