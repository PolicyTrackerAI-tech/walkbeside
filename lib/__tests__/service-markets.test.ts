import { describe, it, expect } from "vitest";
import { SERVICE_MARKETS, marketForZip, serviceAreaZip3s } from "@/lib/service-markets";
import { ZIP_REGIONS } from "@/lib/zip-regions";

describe("service markets", () => {
  it("every market zip3 is a real zip-regions prefix and belongs to exactly one market", () => {
    const seen = new Map<string, string>();
    for (const m of SERVICE_MARKETS) {
      for (const z of m.zip3) {
        expect(z).toMatch(/^\d{3}$/);
        expect(ZIP_REGIONS[z], `${z} missing from ZIP_REGIONS`).toBeDefined();
        expect(seen.has(z), `${z} is in both ${seen.get(z)} and ${m.id}`).toBe(false);
        seen.set(z, m.id);
      }
    }
  });

  it("the DMV market spans DC, Maryland, and Virginia — and stops at Baltimore and Richmond", () => {
    const states = new Set(
      SERVICE_MARKETS.find((m) => m.id === "dmv")!.zip3.map((z) => ZIP_REGIONS[z].state),
    );
    expect(states).toEqual(new Set(["DC", "MD", "VA"]));
    expect(marketForZip("20001")?.id).toBe("dmv");
    expect(marketForZip("20910")?.id).toBe("dmv");
    expect(marketForZip("22201")?.id).toBe("dmv");
    expect(marketForZip("21201")).toBeNull();
    expect(marketForZip("23219")).toBeNull();
  });

  it("outside a market the service area is the family's own zip3", () => {
    expect([...serviceAreaZip3s("84111")]).toEqual(["841"]);
    expect(serviceAreaZip3s("").size).toBe(0);
  });
});
