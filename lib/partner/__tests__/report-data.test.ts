import { describe, it, expect } from "vitest";
import { mergeCheckerUsers } from "@/lib/partner/report-data";

/**
 * The merge of the two checker-engagement signals is a pure set union — the
 * legacy user-existence join (pre-attribution rows) and directly-attributed
 * analyses must both count, and a family present in both must count once.
 * buildPartnerReportData itself is service-role query plumbing and is not
 * mocked here.
 */

describe("mergeCheckerUsers", () => {
  it("unions both signals", () => {
    const merged = mergeCheckerUsers(
      new Set(["legacy-1", "legacy-2"]),
      new Set(["attr-1"]),
    );
    expect(merged).toEqual(new Set(["legacy-1", "legacy-2", "attr-1"]));
  });

  it("dedupes a family present in both signals", () => {
    const merged = mergeCheckerUsers(
      new Set(["both", "legacy-only"]),
      new Set(["both", "attr-only"]),
    );
    expect(merged.size).toBe(3);
    expect(merged).toEqual(new Set(["both", "legacy-only", "attr-only"]));
  });

  it("works when the legacy join found nothing (pre-migration fallback empty)", () => {
    expect(mergeCheckerUsers(new Set(), new Set(["attr-1"]))).toEqual(
      new Set(["attr-1"]),
    );
  });

  it("works when there are no attributed rows yet (column unmigrated)", () => {
    expect(mergeCheckerUsers(new Set(["legacy-1"]), new Set())).toEqual(
      new Set(["legacy-1"]),
    );
  });

  it("returns an empty set for two empty signals", () => {
    expect(mergeCheckerUsers(new Set(), new Set()).size).toBe(0);
  });

  it("does not mutate its inputs", () => {
    const legacy = new Set(["a"]);
    const attributed = new Set(["b"]);
    mergeCheckerUsers(legacy, attributed);
    expect(legacy).toEqual(new Set(["a"]));
    expect(attributed).toEqual(new Set(["b"]));
  });
});
