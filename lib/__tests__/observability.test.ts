import { describe, it, expect } from "vitest";
import { maskEmail, hashId } from "@/lib/observability";

describe("maskEmail", () => {
  it("keeps the first char + domain, hides the rest", () => {
    expect(maskEmail("jane.doe@gmail.com")).toBe("j***@gmail.com");
  });
  it("handles missing/garbage input safely", () => {
    expect(maskEmail(null)).toBe("(none)");
    expect(maskEmail(undefined)).toBe("(none)");
    expect(maskEmail("notanemail")).toBe("***");
  });
});

describe("hashId", () => {
  it("is stable and short", () => {
    const a = hashId("office@home.com");
    const b = hashId("office@home.com");
    expect(a).toBe(b);
    expect(a).toHaveLength(10);
  });
  it("differs for different inputs and handles null", () => {
    expect(hashId("a@x.com")).not.toBe(hashId("b@x.com"));
    expect(hashId(null)).toBe("(none)");
  });
});
