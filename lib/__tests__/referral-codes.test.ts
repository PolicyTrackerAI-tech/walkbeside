import { describe, it, expect } from "vitest";
import {
  codeFromBytes,
  normalizeReferralCode,
  CODE_PREFIX,
} from "@/lib/referral-codes";

describe("codeFromBytes", () => {
  it("produces a canonical code from bytes, deterministically", () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const code = codeFromBytes(bytes);
    expect(code).toMatch(/^HF-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    expect(codeFromBytes(bytes)).toBe(code);
    expect(normalizeReferralCode(code)).toBe(code);
  });

  it("never emits ambiguous characters (0, O, 1, I, L)", () => {
    for (let seed = 0; seed < 64; seed++) {
      const bytes = new Uint8Array(6).map((_, i) => (seed * 41 + i * 7) % 256);
      const code = codeFromBytes(bytes);
      expect(code.slice(CODE_PREFIX.length)).not.toMatch(/[01OIL]/);
    }
  });
});

describe("normalizeReferralCode", () => {
  it("canonicalizes case, whitespace, and unicode dashes", () => {
    expect(normalizeReferralCode(" hf-7kq2md ")).toBe("HF-7KQ2MD");
    expect(normalizeReferralCode("HF—7KQ2MD")).toBe("HF-7KQ2MD");
  });

  it("returns null for cosmetic partner names and junk — the two ?ref uses coexist", () => {
    expect(normalizeReferralCode("canyon-home-hospice")).toBeNull();
    expect(normalizeReferralCode("HF-7KQ2M")).toBeNull(); // too short
    expect(normalizeReferralCode("HF-7KQ2MD9")).toBeNull(); // too long
    expect(normalizeReferralCode("HF-7KQ0MD")).toBeNull(); // ambiguous char
    expect(normalizeReferralCode(undefined)).toBeNull();
    expect(normalizeReferralCode(42)).toBeNull();
  });
});
