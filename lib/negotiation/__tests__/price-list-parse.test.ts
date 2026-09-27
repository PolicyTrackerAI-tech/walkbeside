import { describe, it, expect } from "vitest";
import {
  naiveExtract,
  matchLineItem,
  cleanItemName,
  stripCodeFence,
  extractQty,
} from "@/lib/negotiation/price-list-parse";
import {
  LINE_ITEMS,
  classifyAgainst,
  adjustedRange,
  regionMultiplier,
} from "@/lib/pricing-data";

describe("stripCodeFence", () => {
  it("strips a ```json fence", () => {
    expect(stripCodeFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it("strips a bare ``` fence", () => {
    expect(stripCodeFence("```\nhello\n```")).toBe("hello");
  });
  it("leaves unfenced text untouched", () => {
    expect(stripCodeFence('{"a":1}')).toBe('{"a":1}');
  });
});

describe("naiveExtract (deterministic fallback parser)", () => {
  it("parses a single price with a thousands comma", () => {
    expect(naiveExtract("Basic services fee $2,195").items).toEqual([
      { name: "Basic services fee", cents: 219500 },
    ]);
  });

  it("parses a decimal price", () => {
    expect(naiveExtract("Death certificate $24.00").items[0]).toEqual({
      name: "Death certificate",
      cents: 2400,
    });
  });

  it("parses a selection range with hyphen or en-dash", () => {
    expect(naiveExtract("Caskets $1,200-$10,000").items[0]).toEqual({
      name: "Caskets",
      cents_low: 120000,
      cents_high: 1000000,
    });
    expect(naiveExtract("Urns $200 – $2,000").items[0]).toEqual({
      name: "Urns",
      cents_low: 20000,
      cents_high: 200000,
    });
  });

  it("routes a 'total' line to total_cents, not items", () => {
    const out = naiveExtract("Embalming $900\nTotal $7,000");
    expect(out.total_cents).toBe(700000);
    expect(out.items).toEqual([{ name: "Embalming", cents: 90000 }]);
  });

  it("skips lines with no trailing price", () => {
    expect(naiveExtract("This price list is provided on request").items).toEqual(
      [],
    );
  });
});

describe("matchLineItem (name → benchmarked item)", () => {
  it("matches an exact name", () => {
    expect(matchLineItem("Embalming")?.id).toBe("embalming");
  });

  it("matches a '/'-separated synonym", () => {
    expect(matchLineItem("Limousine for the family")?.id).toBe("limo");
  });

  it("drops a parenthetical qualifier so generic words don't false-match", () => {
    // "Death certificates (each)" → synonym "death certificates"
    expect(matchLineItem("Certified death certificates")?.id).toBe("death-cert");
  });

  it("uses word boundaries: 'urn' matches but 'return' does not", () => {
    expect(matchLineItem("Cremation urn")?.id).toBe("urn");
    expect(matchLineItem("Return transport of cremated remains")?.id).not.toBe(
      "urn",
    );
  });

  it("returns undefined for an item we don't benchmark", () => {
    expect(matchLineItem("Catering and sandwiches")).toBeUndefined();
  });

  it("matches the FTC's standard wording for the non-declinable fee", () => {
    expect(matchLineItem("Basic services of funeral director and staff")?.id).toBe(
      "basic-services",
    );
    expect(matchLineItem("Basic Services of Staff")?.id).toBe("basic-services");
    expect(matchLineItem("Non-declinable basic services")?.id).toBe("basic-services");
  });

  it("a package line that mentions basic services keeps its package match", () => {
    expect(
      matchLineItem("Direct cremation (includes basic services of funeral director and staff)")?.id,
    ).toBe("direct-cremation-fee");
  });
});

describe("matchLineItem — Wave 1 expansion items (2026-06-26)", () => {
  const id = (s: string) => matchLineItem(s)?.id;

  it("matches the new logistics / cremation / stationery line items", () => {
    expect(id("Forwarding of remains to another funeral home")).toBe("forwarding-remains");
    expect(id("Receiving remains from another home")).toBe("receiving-remains");
    expect(id("Refrigeration")).toBe("refrigeration-shelter");
    expect(id("Sheltering of remains")).toBe("refrigeration-shelter");
    expect(id("Crematory fee")).toBe("cremation-process-fee");
    expect(id("Witness cremation")).toBe("witness-cremation-fee");
    expect(id("Thank-you cards")).toBe("acknowledgement-cards");
    expect(id("Guest book")).toBe("register-book");
    expect(id("Direct cremation")).toBe("direct-cremation-fee");
  });

  it("routes a rental casket to rental-casket, NOT the plain metal casket (order-sensitivity)", () => {
    expect(id("Rental casket")).toBe("rental-casket");
    expect(id("Ceremonial casket")).toBe("rental-casket");
    // ...and a plain casket is unaffected by the new rental synonyms.
    expect(id("Metal casket")).toBe("casket-metal");
    expect(id("18-gauge metal casket")).toBe("casket-metal");
  });

  it("never benchmarks a casket add-on as a casket (both demo lines read 'good' before)", () => {
    // Handling fees for a casket bought elsewhere: the FTC Funeral Rule bars
    // them; the casket-handling-fee rule is what surfaces them.
    expect(id("Outside casket handling fee (casket bought elsewhere)")).toBeUndefined();
    expect(
      id("Outside casket handling fee (caskets not purchased from Canyon Rim Memorial Chapel)"),
    ).toBeUndefined(); // hit the "chapel" synonym before
    expect(id("Casket handling fee")).toBeUndefined();
    expect(id("Fee for caskets purchased elsewhere")).toBeUndefined();
    expect(id("Third-party casket charge")).toBeUndefined();
    // Upgrades priced on top of a casket are an upsell delta, not a casket.
    expect(id("Protective sealer casket upgrade")).toBeUndefined();
    expect(id("Casket gasket add-on")).toBeUndefined();
  });

  it("the add-on guard leaves real caskets, rentals, and non-casket handling lines alone", () => {
    expect(id("Rental casket")).toBe("rental-casket");
    expect(id("Ceremonial casket")).toBe("rental-casket");
    expect(id("Rental casket fee")).toBe("rental-casket");
    // (An oak casket is a wood casket; it read as metal until the J.B.
    // Jenkins 2024 review.)
    expect(id("Casket — \"Homestead\" solid oak")).toBe("casket-wood");
    expect(id("Protective casket — 18 gauge steel")).toBe("casket-metal");
    expect(id("Sealer casket")).toBe("casket-metal");
    // "handling" without a casket is not the guard's business.
    expect(id("Death certificates (handling)")).toBe("death-cert");
  });

  it("never prices a fee for a customer- or purchaser-provided casket as a casket", () => {
    expect(id("Acceptance charge for customer-provided casket")).toBeUndefined();
    expect(id("Fee for casket provided by the purchaser")).toBeUndefined();
    expect(id("Purchaser-provided casket surcharge")).toBeUndefined();
    expect(id("Casket furnished by the family — acceptance fee")).toBeUndefined();
    // …while another service's fee keeps its own benchmark, and a plain
    // "provided by family" casket line (no fee) is still a casket.
    expect(id("Graveside service fee (casket provided by family)")).toBe("graveside");
    expect(id("Casket provided by family")).toBe("casket-metal");
  });

  it("never prices a fee for an urn or vault bought elsewhere as the urn or vault", () => {
    // The urn lines hit the "urn" synonym before and read against an urn's
    // range; the urn-vault-handling-fee rule surfaces them instead.
    expect(id("Handling fee for urn provided by the family")).toBeUndefined();
    expect(id("Outside urn handling fee (urn purchased elsewhere)")).toBeUndefined();
    expect(id("Outside burial vault handling fee")).toBeUndefined();
    expect(id("Third-party grave liner charge")).toBeUndefined();
  });

  it("the urn/vault guard leaves real urns, vaults, and legitimate services alone", () => {
    expect(id("Urn (basic)")).toBe("urn");
    expect(id("Keepsake urn — bronze")).toBe("urn");
    expect(id("Grave liner")).toBe("vault");
    expect(id("Burial vault — Guardian")).toBe("vault");
    // A fee word with no bought-elsewhere signal is not this guard's business.
    expect(id("Urn engraving fee")).toBe("urn");
  });

  it("does not let a new item steal an existing line", () => {
    expect(id("Transfer of remains")).toBe("transfer");
    expect(id("Cremation container")).toBe("cremation-container");
    expect(id("Memorial programs")).toBe("programs");
  });
});

// The FTC Funeral Rule makes every GPL price direct cremation and immediate
// burial as packages, one line per variant. The synonym pass read the
// merchandise after "with" instead, so a $1,790 package was judged against a
// $100–$300 container range and read "predatory".
describe("matchLineItem — FTC package wordings", () => {
  const id = (s: string) => matchLineItem(s)?.id;

  it("benchmarks a direct-cremation package as the package, not its container (the repro)", () => {
    expect(id("Direct cremation with container provided by purchaser")).toBe("direct-cremation-fee");
    expect(id("Direct cremation with alternative container")).toBe("direct-cremation-fee");
    expect(id("Direct cremation with container provided by the consumer")).toBe(
      "direct-cremation-fee",
    );
  });

  it("never benchmarks an immediate-burial package as a casket (there is no burial-package benchmark)", () => {
    expect(id("Immediate burial with minimum casket")).toBeUndefined();
    expect(id("Immediate burial with casket provided by purchaser")).toBeUndefined();
    expect(id("Immediate Burial with 20 gauge metal casket")).toBeUndefined();
    expect(id("Immediate Burial (with casket provided by customer)")).toBeUndefined();
    expect(id("Direct burial with casket provided by family")).toBeUndefined();
    expect(id("Immediate burial")).toBeUndefined();
  });

  it("reads the variant wordings real price lists use", () => {
    expect(id("• Direct cremation with cardboard container")).toBe("direct-cremation-fee");
    expect(id("* Direct Cremation (with Maryland state required cardboard container)")).toBe(
      "direct-cremation-fee",
    );
    expect(
      id("*Direct Cremation with casket provided by funeral home (plus cost of casket)"),
    ).toBe("direct-cremation-fee");
    expect(id("Direct cremation with trayview - cardboard container - cremation oriented")).toBe(
      "direct-cremation-fee",
    );
    expect(id("A direct cremation where the purchaser provides the container")).toBe(
      "direct-cremation-fee",
    );
    expect(id("A. Direct cremation with alternative container")).toBe("direct-cremation-fee");
    expect(id("Direct cremation w/ alternative container")).toBe("direct-cremation-fee");
    expect(id("Immediate cremation with alternative container")).toBe("direct-cremation-fee");
  });

  it("reads a package variant folded under its own header", () => {
    expect(id("Direct cremation — With container provided by purchaser")).toBe(
      "direct-cremation-fee",
    );
    expect(id("Direct cremation: container provided by purchaser")).toBe("direct-cremation-fee");
    expect(id("Immediate burial — casket provided by purchaser")).toBeUndefined();
    expect(id("DIRECT CREMATION — Direct cremation with alternative container")).toBe(
      "direct-cremation-fee",
    );
  });

  it("never benchmarks a cremation package with services (the FTC's direct cremation has none)", () => {
    // Before: read as viewing / embalming / urn and judged against that item.
    expect(id("• Direct Cremation with private family viewing (Within 48 hours)")).toBeUndefined();
    expect(id("• Direct Cremation with Embalming")).toBeUndefined();
    expect(id("DIRECT CREMATION WITH VISITATION")).toBeUndefined();
    expect(id("Direct Cremation with Memorial Service (Urn Package)")).toBeUndefined();
    expect(id("Immediate cremation with chapel service, visitation prior")).toBeUndefined();
    expect(id("Direct cremation with no viewing Memorial Service (2 hours)")).toBeUndefined();
    expect(id("Direct Cremation with ID viewing (no embalming)")).toBeUndefined();
  });

  it("never benchmarks a cremation package whose price includes a casket", () => {
    expect(id("Direct cremation with clifton hardwood casket")).toBeUndefined();
    expect(id("Direct Cremation with highest priced casket acceptable for cremation")).toBeUndefined();
    expect(id("Direct cremation with casket (describe casket)")).toBeUndefined();
    // A casket that costs extra, or that the purchaser provides, leaves the package price.
    expect(
      id("C. Direct Cremation with casket of choice (in addition to the cost of the casket)"),
    ).toBe("direct-cremation-fee");
    expect(id("Direct cremation with casket provided by funeral home (plus cost of casket)")).toBe(
      "direct-cremation-fee",
    );
    expect(id("Direct cremation with container or casket provided by purchaser")).toBe(
      "direct-cremation-fee",
    );
    expect(id("Direct Cremation with Casket - (*Add Casket Price)")).toBe("direct-cremation-fee");
    expect(id("Direct cremation with casket from funeral home (additional costs)")).toBe(
      "direct-cremation-fee",
    );
  });

  it("a service the line rules out does not make it a service package", () => {
    expect(id("DIRECT CREMATION (NO Service or Viewing)")).toBe("direct-cremation-fee");
    expect(id("DIRECT CREMATION (no service of viewing)")).toBe("direct-cremation-fee");
    expect(id("Immediate cremation with no other services/merchandise")).toBe(
      "direct-cremation-fee",
    );
    expect(id("Direct cremation (without ceremony, viewing, or embalming)")).toBe(
      "direct-cremation-fee",
    );
    expect(
      id("Direct cremation (without ceremony) includes basic services of funeral director and staff"),
    ).toBe("direct-cremation-fee");
  });

  it("leaves containers, caskets, and headers folded over their own item alone", () => {
    expect(id("Cremation container")).toBe("cremation-container");
    expect(id("Direct cremation container")).toBe("cremation-container");
    expect(id("Alternative cremation container (fiberboard container)")).toBe(
      "cremation-container",
    );
    expect(id("Direct cremation — Cremation container")).toBe("cremation-container");
    expect(id("20 gauge metal casket")).toBe("casket-metal");
    expect(id("Direct cremation — Basic services fee")).toBe("basic-services");
    expect(id("Direct cremation arrangement — Basic services fee")).toBe("basic-services");
    expect(cleanItemName("Direct cremation arrangement — Basic services fee")).toBe(
      "Basic services fee",
    );
    // A bare "direct cremation" folded under another item is that item.
    expect(id("Transfer of remains — Direct cremation")).toBe("transfer");
  });

  it("a package priced as a package no longer reads 'predatory'", () => {
    const national = (itemId: string, dollars: number) => {
      const li = LINE_ITEMS.find((i) => i.id === itemId)!;
      const [lo, hi] = adjustedRange(li.fairLow, li.fairHigh, "");
      return classifyAgainst(dollars, lo, hi, li.predatoryAt);
    };
    const pkg = "Direct cremation with container provided by purchaser";
    expect(id(pkg)).toBe("direct-cremation-fee");
    expect(national("direct-cremation-fee", 1790)).toBe("fair");
    // What the same line read before, judged as a container.
    expect(national("cremation-container", 1790)).toBe("predatory");
  });

  it("naiveExtract + matchLineItem benchmark the package lines of a real-shaped GPL", () => {
    const { items } = naiveExtract(
      [
        "DIRECT CREMATION ........................ $1,790.00 to $3,145.00",
        "• Direct cremation with container provided by purchaser ........ $1,790.00",
        "• Direct cremation with alternative container ................... $1,895.00",
        "*Direct Cremation with container provided by the consumer         $3,145.00",
        "Alternative Cremation Container (fiberboard container)            $30.00",
        "Immediate Burial (with casket provided by customer)               $3,400.00",
        "Immediate Burial with 20 gauge metal casket                       $5,595.00",
      ].join("\n"),
    );
    const matched = items
      .filter((i) => i.cents != null)
      .map((i) => [i.cents, matchLineItem(cleanItemName(i.name))?.id ?? null]);
    expect(matched).toEqual([
      [179000, "direct-cremation-fee"],
      [189500, "direct-cremation-fee"],
      [314500, "direct-cremation-fee"],
      [3000, "cremation-container"],
      [340000, null],
      [559500, null],
    ]);
  });
});

describe("cleanItemName (strip folded section headers)", () => {
  it("strips a header folded onto a benchmarked item (the repro)", () => {
    // GPL has "Direct cremation arrangement" header above "Basic services fee
    // $4,200"; Claude folds them into one name. We want just the item.
    const cleaned = cleanItemName(
      "Direct cremation arrangement — Basic services fee",
    );
    expect(cleaned).toBe("Basic services fee");
    // The cleaned name still matches the same benchmark.
    expect(matchLineItem(cleaned)?.id).toBe("basic-services");
  });

  it("strips ALL-CAPS GPL section headers", () => {
    expect(cleanItemName("PROFESSIONAL SERVICES — Basic services fee")).toBe(
      "Basic services fee",
    );
    expect(
      cleanItemName("CASH ADVANCE ITEMS — Death certificates (each)"),
    ).toBe("Death certificates (each)");
    expect(cleanItemName("MERCHANDISE — Embalming")).toBe("Embalming");
  });

  it("handles a colon-style header separator", () => {
    expect(cleanItemName("Professional services: Basic services fee")).toBe(
      "Basic services fee",
    );
  });

  it("leaves a meaningful fold intact (trailing part isn't benchmarked)", () => {
    // "Type A (per 25)" is meaningless without its header — keep the fold.
    const name = "Acknowledgement cards — Type A (per 25)";
    expect(cleanItemName(name)).toBe(name);
  });

  it("leaves a benchmarked item whose own name has an em-dash untouched", () => {
    // "Casket — 18-gauge metal" is itself the line-item name; "18-gauge metal"
    // isn't a benchmark on its own, so nothing is stripped.
    expect(cleanItemName("Casket — 18-gauge metal")).toBe(
      "Casket — 18-gauge metal",
    );
  });

  it("does not strip when prefix and trailing map to different benchmarks", () => {
    // Stripping here could change the classification, so leave it alone.
    const name = "Hearse — Family car / limousine";
    expect(cleanItemName(name)).toBe(name);
  });

  it("leaves a plain self-describing name alone", () => {
    expect(cleanItemName("Basic services fee")).toBe("Basic services fee");
  });

  it("does not treat an intra-word hyphen as a header separator", () => {
    expect(cleanItemName("18-gauge metal casket")).toBe("18-gauge metal casket");
  });
});

describe("extractQty", () => {
  it("reads a parenthetical count and strips it from the name", () => {
    expect(extractQty("Death certificates (10)")).toEqual({
      name: "Death certificates",
      qty: 10,
    });
  });

  it("reads x-notation, qty:, and copy phrasing", () => {
    expect(extractQty("Death certificates x10").qty).toBe(10);
    expect(extractQty("Certified copies qty: 8").qty).toBe(8);
    expect(extractQty("12 certified copies").qty).toBe(12);
  });

  it("ignores a quantity of 1 or none", () => {
    expect(extractQty("Basic services fee")).toEqual({
      name: "Basic services fee",
    });
    expect(extractQty("Death certificates (1)").qty).toBeUndefined();
  });

  it("naiveExtract attaches qty to the parsed item", () => {
    const { items } = naiveExtract("Death certificates (10) $250");
    expect(items[0]).toEqual({
      name: "Death certificates",
      cents: 25000,
      qty: 10,
    });
  });

  it("reads per-day counts for refrigeration/shelter and cleans the name", () => {
    // So a multi-day total divides to a daily rate (refrigeration is perUnit).
    expect(extractQty("Refrigeration (5 days)")).toEqual({
      name: "Refrigeration",
      qty: 5,
    });
    expect(extractQty("Sheltering of remains 3 nights").qty).toBe(3);
    expect(extractQty("Refrigeration (1 day)").qty).toBeUndefined(); // 1 day = the rate
    const { items } = naiveExtract("Refrigeration (5 days) $425");
    expect(items[0]).toEqual({ name: "Refrigeration", cents: 42500, qty: 5 });
  });

  it("never reads a grace period as a day count", () => {
    expect(extractQty("Holding Remains in facility after 7 days (per day)")).toEqual({
      name: "Holding Remains in facility after 7 days (per day)",
    });
    expect(extractQty("Shelter of remains, first 3 days free, per day").qty).toBeUndefined();
    expect(extractQty("Storage fee applied after 5 days at $25 a day").qty).toBeUndefined();
    expect(extractQty("Refrigeration beyond 3 days").qty).toBeUndefined();
    expect(extractQty("Refrigeration 3 days free").qty).toBeUndefined();
    // ...while a real multi-day total still divides to a daily rate.
    expect(extractQty("Refrigeration (5 days)").qty).toBe(5);
    expect(extractQty("Sheltering of remains 3 nights").qty).toBe(3);
  });
});

// OCR-robustness pass: real GPL formats that used to be hard misses (the price
// regex required the dollar amount at the literal end of line) now parse, and a
// matching set of precision guards proves the broadened matching never
// fabricates an item from structural noise (years, addresses, totals, phones).
describe("naiveExtract — OCR robustness (recovered misses)", () => {
  const only = (text: string) => naiveExtract(text).items;

  it("strips a trailing footnote / marker after a price", () => {
    expect(only("Embalming $895*")).toEqual([{ name: "Embalming", cents: 89500 }]);
    expect(only("Embalming $895 (1)")).toEqual([{ name: "Embalming", cents: 89500 }]);
    expect(only("Embalming $895 †")).toEqual([{ name: "Embalming", cents: 89500 }]);
  });

  it("treats 'and up' / '+' as a single floor value", () => {
    expect(only("Cremation $895 and up")).toEqual([{ name: "Cremation", cents: 89500 }]);
    expect(only("Direct cremation $1,295+")).toEqual([
      { name: "Direct cremation", cents: 129500 },
    ]);
  });

  it("handles dot/colon/dash leaders and glued separators, cleaning the name", () => {
    expect(only("Basic services fee .......... $2,195")).toEqual([
      { name: "Basic services fee", cents: 219500 },
    ]);
    expect(only("Embalming:$895")).toEqual([{ name: "Embalming", cents: 89500 }]);
    expect(only("Embalming — $895")).toEqual([{ name: "Embalming", cents: 89500 }]);
    // word-internal hyphen preserved
    expect(only("Set-up fee $300")).toEqual([{ name: "Set-up fee", cents: 30000 }]);
  });

  it("reads a per-unit price carried by a trailing unit word", () => {
    expect(only("Death certificates $25 each")).toEqual([
      { name: "Death certificates", cents: 2500 },
    ]);
    expect(only("Certified copies $25/copy")).toEqual([
      { name: "Certified copies", cents: 2500 },
    ]);
    expect(only("Additional staff $150 per hour")).toEqual([
      { name: "Additional staff", cents: 15000 },
    ]);
  });

  it("reads a floor ('from'/'starting at') as a single price, not a phantom $0", () => {
    expect(only("Direct cremation from $1,295")).toEqual([
      { name: "Direct cremation", cents: 129500 },
    ]);
    expect(only("Caskets starting at $895")).toEqual([
      { name: "Caskets", cents: 89500 },
    ]);
  });

  it("reads a closed range stated in words", () => {
    expect(only("Caskets between $800 and $10,000")).toEqual([
      { name: "Caskets", cents_low: 80000, cents_high: 1000000 },
    ]);
    expect(only("Urns $95 to $1,200")).toEqual([
      { name: "Urns", cents_low: 9500, cents_high: 120000 },
    ]);
  });

  it("keeps a dash-range intact even with a trailing marker", () => {
    expect(only("Caskets $800-$10,000*")).toEqual([
      { name: "Caskets", cents_low: 80000, cents_high: 1000000 },
    ]);
  });
});

describe("naiveExtract — precision guards (structural noise stays skipped)", () => {
  const run = (text: string) => naiveExtract(text);
  const only = (text: string) => run(text).items;

  it("never fabricates an item from a bare year, address, or hours", () => {
    expect(only("Established 1962")).toEqual([]);
    expect(only("Suite 200")).toEqual([]);
    expect(only("123 Main St, Suite 200")).toEqual([]);
    expect(only("Open 9-5")).toEqual([]); // not a $9–$5 range
    expect(only("Phone: 801-555-1234")).toEqual([]);
  });

  it("skips accounting / payment lines but keeps a real charge with a similar word", () => {
    expect(only("Sales tax $42.50")).toEqual([]);
    expect(only("Balance due $9,500")).toEqual([]);
    expect(only("Tax preparation $200")).toEqual([
      { name: "Tax preparation", cents: 20000 },
    ]);
  });

  it("routes totals, preferring a grand total over a subtotal", () => {
    const r = run("Embalming $900\nSubtotal $8,000\nGrand Total $9,500");
    expect(r.items).toEqual([{ name: "Embalming", cents: 90000 }]);
    expect(r.total_cents).toBe(950000);
  });

  it("does not invent a range from a bare-number 'to'/'and' pair", () => {
    expect(only("Lots 100 to 200")).toEqual([]);
    expect(only("Sections 1 and 2")).toEqual([]);
  });

  it("still parses an ordinary $-priced item", () => {
    expect(only("Honorarium $250")).toEqual([{ name: "Honorarium", cents: 25000 }]);
  });
});

// Deploy #11 deferred two wrong-NAME formats: a quantity in its own column
// (leading/middle), and two items collapsed onto one OCR line. Both now parse,
// and the matching guards prove the broadened matching never reads a stray
// number as a quantity or splits a single name that contains a "$" figure.
describe("naiveExtract — quantity columns (leading / middle / @)", () => {
  const only = (text: string) => naiveExtract(text).items;

  it("reads a LEADING quantity column and cleans the name", () => {
    expect(only("10  Death certificates  $250")).toEqual([
      { name: "Death certificates", cents: 25000, qty: 10 },
    ]);
  });

  it("reads a MIDDLE / trailing quantity column (3-column layout)", () => {
    expect(only("Death certificates  10  $250")).toEqual([
      { name: "Death certificates", cents: 25000, qty: 10 },
    ]);
    expect(only("Certified copies   12   $300")).toEqual([
      { name: "Certified copies", cents: 30000, qty: 12 },
    ]);
  });

  it("reads a 'Qty N' label column", () => {
    expect(only("Qty 10  Certified copies  $250")).toEqual([
      { name: "Certified copies", cents: 25000, qty: 10 },
    ]);
  });

  it("reads 'N @ $unit' and keeps cents as the TOTAL (qty × unit), not the unit", () => {
    // FOOTGUN: the stated $125 is per-copy; the line total is 2 × $125 = $250.
    // Storing the unit ($125 -> 12500) where the total belongs breaks the
    // subtotal — cents must be 25000.
    expect(only("Certified copies 2 @ $125")).toEqual([
      { name: "Certified copies", cents: 25000, qty: 2 },
    ]);
  });

  it("keeps cents as the line TOTAL so the per-unit math reads per-copy as fair", () => {
    const it = naiveExtract("10  Death certificates  $250").items[0];
    expect(it.cents).toBe(25000); // the TOTAL, not the $25 unit
    expect(it.qty).toBe(10);
    const di = LINE_ITEMS.find((i) => i.id === "death-cert")!;
    const perUnitDollars = it.cents! / it.qty! / 100; // 25 — the per-certificate price
    expect(perUnitDollars).toBe(25);
    // Mirrors the route: per-unit items benchmark against the NATIONAL flat
    // range. $25/cert sits at the fair ceiling — never high/predatory.
    expect(
      classifyAgainst(perUnitDollars, di.fairLow, di.fairHigh, di.predatoryAt),
    ).not.toBe("predatory");
    expect(["good", "fair"]).toContain(
      classifyAgainst(perUnitDollars, di.fairLow, di.fairHigh, di.predatoryAt),
    );
  });

  it("does NOT read a leading/middle number as a quantity without a cert/copy noun", () => {
    // The gate (death certificates / certified copies / copies) protects these.
    expect(only("24 hour visitation $300")).toEqual([
      { name: "24 hour visitation", cents: 30000 },
    ]);
    expect(only("1 hour viewing $200")).toEqual([
      { name: "1 hour viewing", cents: 20000 },
    ]);
    // A real leading count on a non-benchmarked item is left untouched (no qty)
    // rather than mis-attributed — conservative.
    expect(only("10 acknowledgement cards $50")).toEqual([
      { name: "10 acknowledgement cards", cents: 5000 },
    ]);
    expect(only("Suite 200")).toEqual([]);
  });

  it("a quantity of 1 is not attached", () => {
    expect(only("1  Death certificate  $25")).toEqual([
      { name: "1 Death certificate", cents: 2500 },
    ]);
  });
});

describe("naiveExtract — two items collapsed onto one OCR line", () => {
  const only = (text: string) => naiveExtract(text).items;

  it("splits two 'name $price' columns into two items", () => {
    expect(only("Embalming $895   Dressing $250")).toEqual([
      { name: "Embalming", cents: 89500 },
      { name: "Dressing", cents: 25000 },
    ]);
  });

  it("splits even with dot leaders and routes each half normally", () => {
    expect(only("Refrigeration ... $200    Sales tax $42.50")).toEqual([
      { name: "Refrigeration", cents: 20000 }, // tax half recognized + skipped
    ]);
  });

  it("each split half still runs the full pipeline (a qty column inside a half)", () => {
    expect(only("10 Death certificates $250    Embalming $895")).toEqual([
      { name: "Death certificates", cents: 25000, qty: 10 },
      { name: "Embalming", cents: 89500 },
    ]);
  });

  it("does NOT split a single name that contains a '$' figure (single-spaced)", () => {
    expect(only("Casket (a $2,000 value) $1,500")).toEqual([
      { name: "Casket (a $2,000 value)", cents: 150000 },
    ]);
  });

  it("does NOT split a reference / sale price even across a column gap", () => {
    // name1 ends in 'retail' / name2 starts with 'sale' → one item, last price.
    const items = only("Casket retail $2,000  sale $1,500");
    expect(items).toHaveLength(1);
    expect(items[0].cents).toBe(150000);
  });

  it("does NOT steal a selection range that has spaces around its dash", () => {
    expect(only("Caskets $800 - $10,000")).toEqual([
      { name: "Caskets", cents_low: 80000, cents_high: 1000000 },
    ]);
  });

  it("leaves a three-price line for the single-price path (no garbled split)", () => {
    // Exactly-two-$ guard: a 3-column collapse is not force-split into junk.
    const items = only("A $1   B $2   C $3");
    expect(items.every((i) => typeof i.cents === "number")).toBe(true);
  });
});

// The bug this guards against: the result could display a zip-adjusted fair
// range yet stamp the same item "high" because the verdict compared against
// NATIONAL thresholds. The fix classifies against the SAME adjusted thresholds
// the range is shown from. These tests lock that invariant across every item
// and a spread of regional multipliers.
describe("verdict never contradicts the displayed fair range (regression)", () => {
  const ZIPS = ["", "10001", "94110", "84101", "39201"];

  it("a price within the displayed fair range is never flagged high/predatory", () => {
    for (const item of LINE_ITEMS) {
      for (const zip of ZIPS) {
        const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
        const predatory = Math.round(item.predatoryAt * regionMultiplier(zip));
        for (const p of [lo, Math.round((lo + hi) / 2), hi]) {
          const c = classifyAgainst(p, lo, hi, predatory);
          expect(
            ["good", "fair"],
            `${item.id} @ ${zip || "national"}: price ${p} inside range [${lo}, ${hi}] classified "${c}"`,
          ).toContain(c);
        }
      }
    }
  });

  it("classifies the range edges and above-range prices correctly", () => {
    for (const item of LINE_ITEMS) {
      for (const zip of ZIPS) {
        const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
        const predatory = Math.round(item.predatoryAt * regionMultiplier(zip));
        expect(classifyAgainst(lo, lo, hi, predatory)).toBe("good");
        if (predatory > hi) {
          if (hi + 1 < predatory) {
            expect(classifyAgainst(hi + 1, lo, hi, predatory)).toBe("high");
          }
          expect(classifyAgainst(predatory, lo, hi, predatory)).toBe(
            "predatory",
          );
        }
      }
    }
  });

  it("reproduces the original bug scenario, now consistent", () => {
    // A price at the top of the zip-adjusted range must read "fair", not "high".
    const embalming = LINE_ITEMS.find((i) => i.id === "embalming");
    expect(embalming).toBeDefined();
    const zip = "94110"; // high cost-of-living metro
    const [lo, hi] = adjustedRange(
      embalming!.fairLow,
      embalming!.fairHigh,
      zip,
    );
    const predatory = Math.round(embalming!.predatoryAt * regionMultiplier(zip));
    expect(classifyAgainst(hi, lo, hi, predatory)).toBe("fair");
  });
});

describe("matchLineItem — wordings from the DC harvest (John T. Rhines 2026 GPL)", () => {
  const id = (s: string) => matchLineItem(s)?.id;

  it("'Prof. Services of Funeral Director, Staff, and Overhead' is the basic services fee", () => {
    expect(id("Prof. Services of Funeral Director, Staff, and Overhead")).toBe("basic-services");
    expect(id("Professional services of the funeral director and staff")).toBe("basic-services");
  });

  it("a line that names embalming only to rule it out is not embalming", () => {
    expect(id("Washing and Disinfecting Remains (no embalming)")).toBeUndefined();
    expect(id("Shelter of remains without embalming")).toBe("refrigeration-shelter");
    expect(id("Refrigeration of Un-embalmed Remains")).toBe("refrigeration-shelter");
    expect(id("Embalming")).toBe("embalming");
  });

  it("cosmetics with dressing or hairstyling is body preparation; dressing and casketing alone, or hair coloring, is not", () => {
    expect(id("Cosmetics, Dressing, and Hairstyling")).toBe("body-prep");
    expect(id("Dressing and cosmetics")).toBe("body-prep");
    expect(id("Dressing and casketing")).toBeUndefined();
    expect(id("Coloring of Hair (additional to hairstyling)")).toBeUndefined();
  });

  it("a committal service is the graveside service", () => {
    expect(id("Funeral Director for Committal Service")).toBe("graveside");
  });

  it("a certified death certificate priced per copy is the death-certificate benchmark; filing one is not", () => {
    expect(id("Certified Death Certificate, District of Columbia (per copy)")).toBe("death-cert");
    expect(id("Certified copies of death certificate")).toBe("death-cert");
    expect(id("Filing of death certificate")).toBeUndefined();
  });

  it("casket hardware is never priced as a casket", () => {
    expect(id("Casket Panel Inserts")).toBeUndefined();
    expect(id("Casket corners")).toBeUndefined();
    expect(id("Casket engraving")).toBeUndefined();
    expect(id("Casket - 18 gauge steel")).toBe("casket-metal");
  });

  it("a storage fee for the remains is the per-day shelter fee; storing cremains is not", () => {
    expect(id("Daily Storage Fee (every 24 hours)")).toBe("refrigeration-shelter");
    expect(id("Storage of remains (per day)")).toBe("refrigeration-shelter");
    expect(id("Cremains storage fee (after 30 days)")).toBeUndefined();
    expect(id("Storage fee for cremated remains")).toBeUndefined();
  });

  it("an immediate-burial package joined with a slash is a package, not a graveside fee", () => {
    expect(id("Immediate Burial/Graveside Service (casket not included)")).toBeUndefined();
    expect(id("Direct cremation/alternative container")).toBe("direct-cremation-fee");
    expect(id("Graveside service")).toBe("graveside");
  });
});

describe("matchLineItem — wordings from the Maryland harvest (J.B. Jenkins 2024 GPL)", () => {
  const id = (s: string) => matchLineItem(s)?.id;

  it("a direct-cremation package named before its variant is the direct-cremation package, not a container", () => {
    expect(id("Direct Cremation Package (minimum alternative container)")).toBe("direct-cremation-fee");
    expect(id("Direct Cremation Package")).toBe("direct-cremation-fee");
    expect(id("Direct cremation package with memorial service")).toBeUndefined();
    expect(id("Immediate Burial Package")).toBeUndefined();
    expect(id("Minimum Cardboard Cremation Container")).toBe("cremation-container");
  });

  it("'Professional/Basic Service Fee' is the basic services fee", () => {
    expect(id("Professional/Basic Service Fee (Non-declinable)")).toBe("basic-services");
    expect(id("Basic service fee")).toBe("basic-services");
    expect(id("Professional service charge")).toBe("basic-services");
  });

  it("a funeral ceremony line is the ceremony fee, unless it is a cremation or burial package", () => {
    expect(id("Funeral Ceremony (per hour)")).toBe("service-facility");
    expect(id("Cremation with funeral ceremony")).toBeUndefined();
    expect(id("Funeral ceremony package")).toBeUndefined();
  });

  it("holding remains per day is the shelter fee", () => {
    expect(id("Holding Remains in facility after 7 days (per day)")).toBe("refrigeration-shelter");
  });

  it("certified copies are death certificates", () => {
    expect(id("Maryland Certified Copies (first copy)")).toBe("death-cert");
    expect(id("District of Columbia Certified Copies (each copy)")).toBe("death-cert");
  });

  it("personalization for a casket or an urn is never priced as the casket or urn", () => {
    expect(id("Casket Applique Personalization")).toBeUndefined();
    expect(id("Urn Applique Personalization")).toBeUndefined();
    expect(id("Urn Emblems")).toBeUndefined();
    expect(id("Urn (basic)")).toBe("urn");
    expect(id("Keepsake urn — bronze")).toBe("urn");
  });

  it("a wood casket is judged as wood, a metal casket as metal", () => {
    expect(id("24\" Doeskin Casket (cloth-covered wood casket)")).toBe("casket-wood");
    expect(id("Wood casket")).toBe("casket-wood");
    expect(id("Casket - solid poplar")).toBe("casket-wood");
    expect(id("Casket - 18 gauge steel")).toBe("casket-metal");
    expect(id("Stainless steel casket with oak interior trim")).toBe("casket-metal");
    expect(id("Casket")).toBe("casket-metal");
    expect(id("Rental casket (hardwood)")).toBe("rental-casket");
  });
});

describe("naiveExtract — DC price-list formatting (Stewart 2024 GPL)", () => {
  const only = (text: string) => naiveExtract(text).items;

  it("reads a price after '…' leaders and a spaced '$', and cleans the name", () => {
    expect(only("Basic Services of Funeral Director and Staff and Overhead…………………. $ 2,075.00")).toEqual([
      { name: "Basic Services of Funeral Director and Staff and Overhead", cents: 207500 },
    ]);
    expect(only("Use of Facilities and Staff for Viewing…… (1 hour) ……………………. $ 225.00")).toEqual([
      { name: "Use of Facilities and Staff for Viewing (1 hour)", cents: 22500 },
    ]);
    expect(only("Transfer of Remains to Funeral Home (within 25-mile radius) ……………$   425.00")).toEqual([
      { name: "Transfer of Remains to Funeral Home (within 25-mile radius)", cents: 42500 },
    ]);
  });

  it("reads '$995.00 to $ 35,000.00' after leaders as a range, not a $35,000 price", () => {
    expect(only("Caskets………………………………………………………$995.00 to $ 35,000.00")).toEqual([
      { name: "Caskets", cents_low: 99500, cents_high: 3500000 },
    ]);
  });

  it("keeps a price followed by a period", () => {
    expect(only("Forwarding of Remains to Another Funeral Home…………….…………$ 2,150.00.")).toEqual([
      { name: "Forwarding of Remains to Another Funeral Home", cents: 215000 },
    ]);
  });

  it("never reads a zip (or any bare number) as a price", () => {
    expect(only("Washington, D.C. 20019")).toEqual([]);
    expect(only("Suite 100000")).toEqual([]);
    expect(only("Casket $12500")).toEqual([{ name: "Casket", cents: 1250000 }]);
    // A spaced "$" still marks a price, so a bare amount after it is kept.
    expect(only("Casket $ 12500")).toEqual([{ name: "Casket", cents: 1250000 }]);
  });

  it("recovers every single-price observation from the real Stewart list", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const rec = JSON.parse(
      readFileSync(join(process.cwd(), "supabase/seed/gpl/dmv/stewart-2024.json"), "utf8"),
    ) as { text: string; items: Array<{ name: string; cents: number; matchedItemId?: string; isRange?: boolean }> };
    const got = only(rec.text);
    const pointsById = new Map<string, number[]>();
    for (const it of got) {
      const id = matchLineItem(it.name)?.id;
      if (id && it.cents != null) pointsById.set(id, [...(pointsById.get(id) ?? []), it.cents]);
    }
    // The document prints direct cremation as a range ($2,316.50 to
    // $2,416.50); the reviewer's DC price is a judgment, not a printed point.
    const expected = rec.items.filter(
      (i) => i.matchedItemId && !i.isRange && i.matchedItemId !== "direct-cremation-fee",
    );
    for (const i of expected) expect(pointsById.get(i.matchedItemId!), i.name).toContain(i.cents);
    // Nothing structural becomes a price (the DC zip once read as $20,019).
    expect(got.filter((it) => it.cents != null && it.cents >= 1_000_000)).toEqual([]);
  });
});
