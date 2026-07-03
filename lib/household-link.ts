/**
 * The live shared household link (roadmap Phase 2) — client-side half.
 *
 * Honest architecture note: Vault, Notifications, and Next-30-Days live in
 * localStorage on the point person's device BY DESIGN (nothing leaves the
 * browser unless the family says so). So the "live" link is owner-published:
 * whenever the point person uses the tools (or taps "refresh"), their device
 * pushes a fresh snapshot to a stable slug. Relatives always see the latest
 * published state at /household/<id> — read-only, expiring, rotatable.
 *
 * The owner's credentials for the link (slug + owner_secret) live ONLY in
 * this device's localStorage. The secret never appears in the shared URL and
 * is never returned by any read endpoint.
 */

export interface HouseholdLinkRecord {
  id: string;
  ownerSecret: string;
  /** When auto-publish last succeeded (ms epoch) — display only. */
  lastPublishedAt?: number;
}

export const HOUSEHOLD_LINK_KEY = "honestfuneral.household-link.v1";

/** Everything the family view shows. Superset of the /resume snapshot keys — vault included. */
export const HOUSEHOLD_KEYS = [
  "hf-decide:faith",
  "hf-decide:customFaith",
  "hf-decide:faithDenomination",
  "hf-decide:bodyAtService",
  "hf-decide:dispositionPreference",
  "hf-decide:costPriority",
  "hf-decide:isVeteran",
  "hf-decide:recommendedServiceType",
  "honestfuneral.next30.v1",
  "honestfuneral.next30.assignees.v1",
  "honestfuneral.notifications.v1",
  "honestfuneral.vault.v1",
] as const;

export function readHouseholdLink(): HouseholdLinkRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOUSEHOLD_LINK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HouseholdLinkRecord>;
    if (!parsed.id || !parsed.ownerSecret) return null;
    return parsed as HouseholdLinkRecord;
  } catch {
    return null;
  }
}

export function writeHouseholdLink(rec: HouseholdLinkRecord | null): void {
  if (typeof window === "undefined") return;
  try {
    if (rec === null) localStorage.removeItem(HOUSEHOLD_LINK_KEY);
    else localStorage.setItem(HOUSEHOLD_LINK_KEY, JSON.stringify(rec));
  } catch {
    // best-effort
  }
}

/** Snapshot of the household keys as currently stored on this device. */
export function snapshotHousehold(): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof window === "undefined") return out;
  for (const key of HOUSEHOLD_KEYS) {
    try {
      const v = sessionStorage.getItem(key) ?? localStorage.getItem(key);
      if (v != null) out[key] = v;
    } catch {
      // skip unreadable keys
    }
  }
  return out;
}

let publishTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Fire-and-forget re-publish, debounced. Called from the tools' save paths;
 * a no-op unless this device owns a live link. Failures are silent — the
 * next save or the /family "refresh" button retries.
 */
export function maybePublishHousehold(): void {
  if (typeof window === "undefined") return;
  const rec = readHouseholdLink();
  if (!rec) return;
  if (publishTimer) clearTimeout(publishTimer);
  publishTimer = setTimeout(() => {
    publishTimer = null;
    void fetch("/api/household/update", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: rec.id,
        ownerSecret: rec.ownerSecret,
        payload: snapshotHousehold(),
      }),
    })
      .then((r) => {
        if (r.ok) writeHouseholdLink({ ...rec, lastPublishedAt: Date.now() });
        if (r.status === 404 || r.status === 403) writeHouseholdLink(null);
      })
      .catch(() => {
        // offline / transient — next save retries
      });
  }, 2000);
}
