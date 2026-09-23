import { describe, it, expect } from "vitest";
import { isEmailDenylisted } from "@/lib/negotiation/denylist";

describe("isEmailDenylisted", () => {
  it("blocks directory, marketplace, broker, and SaaS domains (and their subdomains)", () => {
    expect(isEmailDenylisted("info@parting.com")).toBe(true);
    expect(isEmailDenylisted("Leads@DFSMemorials.com")).toBe(true);
    expect(isEmailDenylisted("support@mail.funeralocity.com")).toBe(true);
    expect(isEmailDenylisted("office@consolidatedfuneralservices.com")).toBe(true);
  });

  it("never blocks a lookalike suffix or a licensed chain's own domain", () => {
    expect(isEmailDenylisted("owner@notparting.com")).toBe(false);
    // SCI's licensed homes use dignitymemorial.com as their own inbox.
    expect(isEmailDenylisted("murphy.arlington@dignitymemorial.com")).toBe(false);
    expect(isEmailDenylisted("arrangements@examplefuneralhome.com")).toBe(false);
  });

  it("treats empty input as not denylisted", () => {
    expect(isEmailDenylisted(null)).toBe(false);
    expect(isEmailDenylisted("")).toBe(false);
  });
});
