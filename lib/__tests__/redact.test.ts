import { describe, it, expect } from "vitest";
import { redactContact } from "@/lib/redact";

// The PII-laden fixture from the Day 4 build sheet: contact details of every
// shape we redact, interleaved with the price-list content that MUST survive
// byte-identical (checker-correctness law: never eat a price).
const FIXTURE = [
  "Sunset Memorial Chapel — General Price List",
  "Contact: John Doe, director@sunsetmemorial.com or (801) 555-0142",
  "Cell 801-555-0199, alt 801.555.0100, toll free +1-800-555-0123",
  "Bill to acct 4111111111111111 (Visa 4111-1111-1111-1111 on file)",
  "Owner SSN 123-45-6789 for licensing, bank account 000123456789",
  "Basic services fee .... $2,495.00",
  "Embalming — $895",
  "Caskets  $800-$10,000",
  "Certified death certificates (10) — $250",
  "Refrigeration $85/day",
  "24-hour visitation  $425",
  "Serving zip 84101 since 1974. Open 9-5.",
].join("\n");

describe("redactContact", () => {
  const out = redactContact(FIXTURE);

  it("redacts emails", () => {
    expect(out).not.toContain("director@sunsetmemorial.com");
  });

  it("redacts US phone numbers in every common format", () => {
    expect(out).not.toContain("(801) 555-0142");
    expect(out).not.toContain("801-555-0199");
    expect(out).not.toContain("801.555.0100");
    expect(out).not.toContain("+1-800-555-0123");
  });

  it("redacts SSN-shaped and card/account digit runs", () => {
    expect(out).not.toContain("123-45-6789");
    expect(out).not.toContain("4111111111111111");
    expect(out).not.toContain("4111-1111-1111-1111");
    expect(out).not.toContain("000123456789");
  });

  it("marks each removal", () => {
    expect(out).toContain("[redacted]");
  });

  it("preserves every price-list line byte-identical", () => {
    for (const line of [
      "Basic services fee .... $2,495.00",
      "Embalming — $895",
      "Caskets  $800-$10,000",
      "Certified death certificates (10) — $250",
      "Refrigeration $85/day",
      "24-hour visitation  $425",
      "Serving zip 84101 since 1974. Open 9-5.",
    ]) {
      expect(out).toContain(line);
    }
  });

  it("does not false-match adjacent price columns as a phone", () => {
    // Two-column OCR output: three prices in a row with single spaces —
    // must survive (space-separated phones without parens are not matched).
    const cols = "Transfer 100 250 1500 Casket";
    expect(redactContact(cols)).toBe(cols);
  });

  it("keeps names (obituary/eulogy inputs are out of scope by design)", () => {
    expect(out).toContain("John Doe");
  });
});
