import { describe, it, expect } from "vitest";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { buildNominationLead } from "../route";

describe("buildNominationLead (channel-survival invariants)", () => {
  it("drops the submitter email unless the consent box was checked", () => {
    const withoutConsent = buildNominationLead({
      hospice: "Trinity Hospice",
      email: "family@example.com",
    });
    expect(withoutConsent.email).toBe("");

    const consentFalse = buildNominationLead({
      hospice: "Trinity Hospice",
      email: "family@example.com",
      contactOk: false,
    });
    expect(consentFalse.email).toBe("");

    const consented = buildNominationLead({
      hospice: "Trinity Hospice",
      email: "family@example.com",
      contactOk: true,
    });
    expect(consented.email).toBe("family@example.com");
  });

  it("falls back to empty-string email (partner_leads.email is NOT NULL)", () => {
    const lead = buildNominationLead({ hospice: "Trinity Hospice", contactOk: true });
    expect(lead.email).toBe("");
  });

  it("tags the row family_nomination and folds location into the note", () => {
    const lead = buildNominationLead({
      hospice: "  Trinity Hospice  ",
      city: "Provo",
      state: "UT",
      note: "They hand out a paper packet today.",
    });
    expect(lead.source).toBe("family_nomination");
    expect(lead.org).toBe("Trinity Hospice");
    expect(lead.note).toBe("Location: Provo, UT\nThey hand out a paper packet today.");
  });

  it("stores a null note when nothing beyond the hospice was given", () => {
    expect(buildNominationLead({ hospice: "Trinity Hospice" }).note).toBeNull();
  });
});

describe("nominate rate limiting", () => {
  // The proxy only enforces rules registered by exact pathname — a missing
  // entry means an unthrottled public POST.
  it("is registered in RATE_LIMITS for the proxy to enforce", () => {
    expect(RATE_LIMITS["/api/partner/nominate"]).toEqual({
      limit: 5,
      windowMs: 60_000,
    });
  });
});
