import { describe, it, expect } from "vitest";
import { SHARE_KEYS, SHARE_KEYS_SET, shareKeyTarget } from "../share-keys";

/**
 * Audit A4 tripwires for the share-link hand-off (A4-04 / A4-07).
 *
 * The hydration side (/resume/[id]) writes each key to the store its tool
 * READS. Before A4 every key was hydrated into sessionStorage while the
 * checklist/guidance/notifications/eulogy tools read localStorage — the
 * recipient was told "their answers are saved on this device" and the tools
 * came up empty. These pins hold the key → store mapping to what the tools'
 * own getItem calls do; if a tool migrates stores, update BOTH it and this.
 */

describe("share-keys allowlist", () => {
  it("rejects keys outside the allowlist (the injection boundary)", () => {
    expect(shareKeyTarget("hf-analyzer:handoff")).toBeNull();
    expect(shareKeyTarget("hf-analyzer:pending-save")).toBeNull();
    expect(shareKeyTarget("honestfuneral.household-link.v1")).toBeNull();
    expect(shareKeyTarget("__proto__")).toBeNull();
    expect(shareKeyTarget("")).toBeNull();
  });

  it("gives every allowlisted key a hydration target", () => {
    for (const key of SHARE_KEYS) {
      expect(shareKeyTarget(key), key).toMatch(/^(local|session)$/);
    }
    expect(SHARE_KEYS_SET.size).toBe(SHARE_KEYS.length);
  });

  it("carries the worksheet and plan-now tools (silently dropped before A4)", () => {
    expect(SHARE_KEYS_SET.has("hf-worksheet-v1")).toBe(true);
    expect(SHARE_KEYS_SET.has("honestfuneral.plan-now.v1")).toBe(true);
  });

  it("hydrates each key into the store its tool actually reads", () => {
    // sessionStorage readers: lib/faith-storage.ts (hf-decide:*),
    // lib/negotiate-wizard-state.ts.
    expect(shareKeyTarget("hf-decide:faith")).toBe("session");
    expect(shareKeyTarget("hf-decide:recommendedServiceType")).toBe("session");
    expect(shareKeyTarget("honestfuneral.negotiate-wizard.v1")).toBe("session");
    // localStorage readers: StepList/CrisisUnexpected (guidance),
    // NextThirtyDays, Notifications, Eulogy, Worksheet, lib/plan-now.ts.
    expect(shareKeyTarget("honestfuneral.guidance.hospital.v1")).toBe("local");
    expect(shareKeyTarget("honestfuneral.guidance.home-expected.v1")).toBe(
      "local",
    );
    expect(shareKeyTarget("honestfuneral.guidance.home-unexpected.v1")).toBe(
      "local",
    );
    expect(shareKeyTarget("honestfuneral.guidance.elsewhere.v1")).toBe("local");
    expect(shareKeyTarget("honestfuneral.next30.v1")).toBe("local");
    expect(shareKeyTarget("honestfuneral.next30.expanded.v1")).toBe("local");
    expect(shareKeyTarget("honestfuneral.notifications.v1")).toBe("local");
    expect(shareKeyTarget("honestfuneral.eulogy.draft.v1")).toBe("local");
    expect(shareKeyTarget("hf-worksheet-v1")).toBe("local");
    expect(shareKeyTarget("honestfuneral.plan-now.v1")).toBe("local");
  });
});
