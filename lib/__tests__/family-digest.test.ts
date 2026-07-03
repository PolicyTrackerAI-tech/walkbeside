import { describe, it, expect } from "vitest";
import {
  buildDigestEmail,
  validDigestItems,
  MAX_DIGEST_ITEMS,
  type DigestItem,
} from "@/lib/family-digest";

const items: DigestItem[] = [
  { kind: "task", title: "Forward their mail" },
  { kind: "contact", title: "Aunt Carol (sister)" },
  { kind: "document", title: "DD-214 (military discharge)", note: "order free at archives.gov" },
];

describe("buildDigestEmail", () => {
  it("groups items by kind and includes every title", () => {
    const { subject, text } = buildDigestEmail({
      assigneeName: "Mike",
      senderName: "Sarah",
      items,
    });
    expect(subject).toBe("Your part of the list, from Sarah — 3 items");
    expect(text).toContain("Hi Mike,");
    expect(text).toContain("On the checklist:");
    expect(text).toContain("Forward their mail");
    expect(text).toContain("People to reach:");
    expect(text).toContain("Documents to find:");
    expect(text).toContain("(order free at archives.gov)");
  });

  it("keeps the quiet-friend tone — no marketing, no pressure, no unsubscribe theater", () => {
    const { text } = buildDigestEmail({ assigneeName: "Mike", items });
    expect(text.toLowerCase()).not.toMatch(/click here|sign up|offer|discount|act now/);
    expect(text).toContain("nothing else is expected of you");
    expect(text).toContain("one-time message");
    // House rule: no FD-credential tagline in transactional email.
    expect(text.toLowerCase()).not.toMatch(/funeral director|licensed/);
  });

  it("works without a sender name", () => {
    const { subject, text } = buildDigestEmail({ assigneeName: "Mike", items: [items[0]] });
    expect(subject).toBe("Your part of the family's list — 1 item");
    expect(text).toContain("The person coordinating things");
  });
});

describe("validDigestItems", () => {
  it("accepts well-formed items and rejects malformed ones", () => {
    expect(validDigestItems(items)).toBe(true);
    expect(validDigestItems([])).toBe(false);
    expect(validDigestItems([{ kind: "task", title: "" }])).toBe(false);
    expect(validDigestItems([{ kind: "evil", title: "x" }])).toBe(false);
    expect(validDigestItems("nope")).toBe(false);
    expect(
      validDigestItems(
        Array.from({ length: MAX_DIGEST_ITEMS + 1 }, () => ({ kind: "task", title: "x" })),
      ),
    ).toBe(false);
  });
});
