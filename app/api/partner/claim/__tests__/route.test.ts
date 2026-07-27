import { describe, it, expect } from "vitest";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { buildClaimLead } from "../route";

const hospice = {
  ccn: "011500",
  name: "HOSPICE OF THE VALLEY, LLC",
  city: "PHOENIX",
  state: "AZ",
};

describe("buildClaimLead (channel-survival invariants)", () => {
  it("drops the claimant email unless the consent box was checked", () => {
    const withoutConsent = buildClaimLead(hospice, {
      ccn: "011500",
      email: "admin@example.com",
    });
    expect(withoutConsent.email).toBe("");

    const consentFalse = buildClaimLead(hospice, {
      ccn: "011500",
      email: "admin@example.com",
      contactOk: false,
    });
    expect(consentFalse.email).toBe("");

    const consented = buildClaimLead(hospice, {
      ccn: "011500",
      email: "admin@example.com",
      contactOk: true,
    });
    expect(consented.email).toBe("admin@example.com");
  });

  it("falls back to empty-string email (partner_leads.email is NOT NULL)", () => {
    const lead = buildClaimLead(hospice, { ccn: "011500", contactOk: true });
    expect(lead.email).toBe("");
  });

  it("derives the org from the SERVER-resolved row, display-cased — never the body", () => {
    const lead = buildClaimLead(hospice, { ccn: "011500" });
    expect(lead.org).toBe("Hospice of the Valley, LLC");
    expect(lead.source).toBe("hospice_claim");
  });

  it("notes the CCN + verbatim location, with the user note flattened onto one line", () => {
    const lead = buildClaimLead(hospice, {
      ccn: "011500",
      note: "I run\r\nthe bereavement\nprogram.",
    });
    expect(lead.note).toBe(
      "CCN 011500 · PHOENIX, AZ\nI run the bereavement program.",
    );
  });

  it("keeps the note header alone when no user note was given", () => {
    expect(buildClaimLead(hospice, { ccn: "011500" }).note).toBe(
      "CCN 011500 · PHOENIX, AZ",
    );
  });

  it("omits the location clause when the row has no city/state", () => {
    const lead = buildClaimLead(
      { ...hospice, city: null, state: null },
      { ccn: "011500" },
    );
    expect(lead.note).toBe("CCN 011500");
  });

  it("keeps an alphanumeric CCN verbatim (never numeric-cast)", () => {
    const lead = buildClaimLead(
      { ...hospice, ccn: "A01640" },
      { ccn: "A01640" },
    );
    expect(lead.note.startsWith("CCN A01640")).toBe(true);
  });
});

describe("claim rate limiting", () => {
  // The proxy only enforces rules registered by exact pathname — a missing
  // entry means an unthrottled public POST.
  it("is registered in RATE_LIMITS for the proxy to enforce", () => {
    expect(RATE_LIMITS["/api/partner/claim"]).toEqual({
      limit: 5,
      windowMs: 60_000,
    });
  });
});
