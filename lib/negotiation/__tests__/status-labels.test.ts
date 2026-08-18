import { describe, expect, it } from "vitest";
import { anyOutreachSent, outreachStatusLabel } from "../status-labels";

describe("outreachStatusLabel", () => {
  it("maps every known status to family-safe English", () => {
    expect(outreachStatusLabel("pending")).toBe("Preparing");
    expect(outreachStatusLabel("sent")).toBe("Sent — waiting on their reply");
    expect(outreachStatusLabel("replied")).toBe("Replied");
    expect(outreachStatusLabel("no-reply")).toBe("No reply yet");
    expect(outreachStatusLabel("declined")).toBe("Declined");
    expect(outreachStatusLabel("dry_run")).toBe("Prepared — not sent");
  });

  it("never claims a dry_run row was sent", () => {
    expect(outreachStatusLabel("dry_run").toLowerCase()).not.toContain("sent —");
    expect(outreachStatusLabel("dry_run")).toContain("not sent");
  });

  it("never echoes an unknown enum back to the family", () => {
    for (const raw of ["dry_run_v2", "queued", "BOUNCED", "wat"]) {
      const label = outreachStatusLabel(raw);
      expect(label).toBe("In progress");
      expect(label).not.toContain(raw);
    }
  });

  it("keeps internal jargon out of every label", () => {
    const all = [
      "pending",
      "sent",
      "replied",
      "no-reply",
      "declined",
      "dry_run",
      "unknown_future_status",
    ].map(outreachStatusLabel);
    for (const label of all) {
      expect(label).not.toMatch(/dry|_|test mode|enum/i);
    }
  });
});

describe("anyOutreachSent", () => {
  it("is false for prepared/dry-run-only cases", () => {
    expect(anyOutreachSent([])).toBe(false);
    expect(anyOutreachSent([{ status: "pending" }, { status: "dry_run" }])).toBe(
      false,
    );
    // declined = we skipped them (denylist), not a send
    expect(anyOutreachSent([{ status: "declined" }])).toBe(false);
  });

  it("is true once any email actually left", () => {
    expect(anyOutreachSent([{ status: "dry_run" }, { status: "sent" }])).toBe(
      true,
    );
    expect(anyOutreachSent([{ status: "replied" }])).toBe(true);
    expect(anyOutreachSent([{ status: "no-reply" }])).toBe(true);
  });
});
