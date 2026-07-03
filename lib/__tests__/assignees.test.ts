import { describe, it, expect } from "vitest";
import { assigneeNames, matchesAssignee, UNASSIGNED } from "@/lib/assignees";

describe("assigneeNames", () => {
  it("returns distinct trimmed names in first-seen order, case-insensitively deduped", () => {
    expect(
      assigneeNames([
        { assignee: " Sarah " },
        { assignee: "mike" },
        { assignee: "SARAH" },
        { assignee: "" },
        {},
      ]),
    ).toEqual(["Sarah", "mike"]);
  });
});

describe("matchesAssignee", () => {
  const items = [{ assignee: "Sarah" }, { assignee: " sarah " }, { assignee: "Mike" }, {}];

  it("empty filter matches everyone", () => {
    expect(items.filter(matchesAssignee(""))).toHaveLength(4);
  });

  it("matches names case-insensitively with trimming", () => {
    expect(items.filter(matchesAssignee("sarah"))).toHaveLength(2);
  });

  it("UNASSIGNED matches only items without a name", () => {
    expect(items.filter(matchesAssignee(UNASSIGNED))).toEqual([{}]);
  });
});
