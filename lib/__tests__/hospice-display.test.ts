import { describe, it, expect } from "vitest";
import { displayHospiceName } from "@/lib/hospice-display";

describe("displayHospiceName (display-only casing of verbatim CMS strings)", () => {
  it("title-cases an uppercase CMS name with small words lowered", () => {
    expect(displayHospiceName("HOSPICE OF THE VALLEY")).toBe(
      "Hospice of the Valley",
    );
  });

  it("keeps entity suffixes uppercase, including with trailing punctuation", () => {
    expect(displayHospiceName("CANYON HOME HOSPICE, LLC")).toBe(
      "Canyon Home Hospice, LLC",
    );
  });

  it("capitalizes after hyphens but not after possessive apostrophes", () => {
    expect(displayHospiceName("ST. MARY'S HOSPICE-WEST")).toBe(
      "St. Mary's Hospice-West",
    );
  });

  it("capitalizes after a single-letter apostrophe prefix (O'Brien pattern)", () => {
    expect(displayHospiceName("COEUR D'ALENE")).toBe("Coeur D'Alene");
    expect(displayHospiceName("O'BRIEN HOSPICE CARE")).toBe(
      "O'Brien Hospice Care",
    );
  });

  it("keeps a leading small word capitalized", () => {
    expect(displayHospiceName("THE DENVER HOSPICE")).toBe("The Denver Hospice");
  });

  it("handles cities", () => {
    expect(displayHospiceName("SALT LAKE CITY")).toBe("Salt Lake City");
  });
});
