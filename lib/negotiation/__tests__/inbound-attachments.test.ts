import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  summarizeAttachments,
  withoutAttachmentBytes,
} from "@/lib/negotiation/inbound-attachments";

const PDF = {
  Name: "General Price List.pdf",
  ContentType: "application/pdf",
  ContentLength: 1_200_000,
  Content: "JVBERi0xLjQK".repeat(1000),
  ContentID: "",
};

describe("withoutAttachmentBytes (A8-06)", () => {
  it("drops every attachment's bytes and keeps its name, type and size", () => {
    const stored = withoutAttachmentBytes({ TextBody: "See attached.", Attachments: [PDF] });
    expect(stored.TextBody).toBe("See attached.");
    expect(stored.Attachments).toEqual([
      { Name: "General Price List.pdf", ContentType: "application/pdf", ContentLength: 1_200_000, ContentID: "" },
    ]);
    expect(JSON.stringify(stored)).not.toContain("JVBERi0");
  });

  it("leaves a payload without attachments untouched", () => {
    const payload = { TextBody: "Direct cremation is $1,895." };
    expect(withoutAttachmentBytes(payload)).toBe(payload);
  });

  it("never mutates the payload it was given", () => {
    const payload = { Attachments: [{ ...PDF }] };
    withoutAttachmentBytes(payload);
    expect(payload.Attachments[0].Content).toBe(PDF.Content);
  });
});

describe("summarizeAttachments", () => {
  it("names each attachment for the founder alert, tolerating junk entries", () => {
    expect(
      summarizeAttachments({ Attachments: [PDF, null, { ContentType: "image/png" }] }),
    ).toEqual([
      { name: "General Price List.pdf", contentType: "application/pdf", bytes: 1_200_000 },
      { name: "(unnamed)", contentType: "image/png", bytes: null },
    ]);
    expect(summarizeAttachments({})).toEqual([]);
  });
});

describe("the inbound webhook uses both (A8-06 tripwire)", () => {
  const src = readFileSync(join(process.cwd(), "app/api/inbound/email/route.ts"), "utf8");

  it("stores the payload without attachment bytes", () => {
    expect(src).toMatch(/raw_payload:\s*withoutAttachmentBytes\(payload\)/);
    expect(src).not.toMatch(/raw_payload:\s*payload\b/);
  });

  it("reads bodies large enough to carry a price-list PDF, under Vercel's 4.5MB ceiling", () => {
    const kb = Number(src.match(/INBOUND_MAX_KB = (\d+)/)?.[1]);
    expect(kb).toBeGreaterThanOrEqual(2048);
    expect(kb * 1024).toBeLessThan(4.5 * 1024 * 1024);
    expect(src).toMatch(/readLimitedJson<PostmarkInbound>\(req, INBOUND_MAX_KB\)/);
  });
});

describe("no page or email tells a home an attachment reaches the family", () => {
  it("the outreach email and /for-funeral-homes ask for prices in the body", () => {
    for (const p of ["lib/negotiation/email-body.ts", "app/for-funeral-homes/page.tsx"]) {
      const src = readFileSync(join(process.cwd(), p), "utf8");
      expect(src).not.toMatch(/PDF (?:works|attachment is) fine/);
      expect(src).toMatch(/prices in the body of your reply/);
    }
  });
});
