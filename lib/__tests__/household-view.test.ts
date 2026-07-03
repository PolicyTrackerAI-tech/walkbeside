import { describe, it, expect } from "vitest";
import { parseHouseholdView } from "@/lib/household-view";

/**
 * The viewer renders whatever a device published under an unguessable slug —
 * treat the payload as hostile. These tests pin: no crash on malformed JSON,
 * caps enforced, legacy value migration, and non-strings dropped.
 */

describe("parseHouseholdView", () => {
  it("parses a well-formed payload", () => {
    const v = parseHouseholdView({
      "honestfuneral.vault.v1": JSON.stringify([
        { id: "1", type: "Will", description: "safe", location: "desk", status: "have-it" },
      ]),
      "honestfuneral.notifications.v1": JSON.stringify([
        { id: "1", name: "Aunt Carol", relationship: "sister", channel: "phone", status: "called" },
      ]),
      "honestfuneral.next30.v1": JSON.stringify({ "w1-employer": "done", "w2-mail": "skipped", "w2-dmv": "todo" }),
      "hf-decide:recommendedServiceType": "direct-cremation",
    });
    expect(v.vaultDocs).toEqual([
      { type: "Will", description: "safe", location: "desk", status: "have-it" },
    ]);
    expect(v.contacts[0].name).toBe("Aunt Carol");
    expect(v.taskProgress).toEqual({ "w1-employer": "done", "w2-mail": "skipped" });
    expect(v.recommendedServiceType).toBe("direct-cremation");
  });

  it("never throws on hostile or malformed payloads", () => {
    const v = parseHouseholdView({
      "honestfuneral.vault.v1": "{not json",
      "honestfuneral.notifications.v1": JSON.stringify({ evil: "object-not-array" }),
      "honestfuneral.next30.v1": JSON.stringify([1, 2, 3]),
    });
    expect(v.vaultDocs).toEqual([]);
    expect(v.contacts).toEqual([]);
    expect(v.taskProgress).toEqual({});
  });

  it("drops entries without the identifying field and non-string values", () => {
    const v = parseHouseholdView({
      "honestfuneral.vault.v1": JSON.stringify([
        { type: "", description: "x" },
        { type: 42, description: "y" },
        { type: "Deed", description: null, location: undefined, status: 9 },
      ]),
    });
    expect(v.vaultDocs).toEqual([
      { type: "Deed", description: "", location: "", status: "need-to-find" },
    ]);
  });

  it("migrates legacy boolean next-30 values to done", () => {
    const v = parseHouseholdView({
      "honestfuneral.next30.v1": JSON.stringify({ "w1-certs": true, "w1-ssa": false }),
    });
    expect(v.taskProgress).toEqual({ "w1-certs": "done" });
  });

  it("caps list sizes against a bloated payload", () => {
    const many = JSON.stringify(
      Array.from({ length: 500 }, (_, i) => ({ id: String(i), name: `Person ${i}`, relationship: "", channel: "", status: "todo" })),
    );
    const v = parseHouseholdView({ "honestfuneral.notifications.v1": many });
    expect(v.contacts).toHaveLength(200);
  });

  it("handles an empty payload", () => {
    const v = parseHouseholdView({});
    expect(v.vaultDocs).toEqual([]);
    expect(v.contacts).toEqual([]);
    expect(v.taskProgress).toEqual({});
    expect(v.recommendedServiceType).toBeUndefined();
  });
});
