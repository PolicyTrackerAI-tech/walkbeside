/**
 * Document-scope detection: is this price list from a funeral home, or from a
 * cemetery / monument dealer?
 *
 * Why it matters: the FTC Funeral Rule (16 CFR Part 453) covers "funeral
 * providers" — businesses that sell BOTH funeral goods and funeral services.
 * Cemeteries and monument dealers generally are not covered. Running the
 * violation rules against a cemetery price list can produce a confident
 * "FTC Funeral Rule violation" against an entity the Rule doesn't govern —
 * an indefensible claim, the same failure class as the false "required by
 * law" positives (checker invariant: under-claim).
 *
 * Direction of caution: we only reclassify to "cemetery-monument" when
 * cemetery signals are present AND no funeral-home signal is. A combined
 * funeral-home-and-cemetery list (those combos ARE covered by the Rule when
 * they sell goods + services) keeps full FTC checking. "unknown" also keeps
 * full checking — the status quo wins every tie.
 */

export type DocScope = "funeral-home" | "cemetery-monument" | "unknown";

export interface DocScopeResult {
  scope: DocScope;
  /** Distinct cemetery/monument concepts found (human-readable labels). */
  cemeteryHits: string[];
  /** Distinct funeral-home concepts found (human-readable labels). */
  funeralHits: string[];
}

// Each entry is one CONCEPT — multiple mentions of the same concept count
// once, so a plot-heavy cemetery list doesn't outvote a single "embalming".
const CEMETERY_SIGNALS: Array<{ label: string; re: RegExp }> = [
  { label: "interment rights", re: /\binterment right/i },
  { label: "grave space / plot", re: /\bgrave\s?(?:space|plot)s?\b|\bburial plot|\bcemetery plot/i },
  { label: "opening and closing", re: /\bopening\s+(?:and|&)\s+closing\b|\bgrave opening/i },
  { label: "niche / columbarium", re: /\bniche\b|\bcolumbarium/i },
  { label: "mausoleum / crypt", re: /\bmausoleum|\bcrypt\b/i },
  { label: "perpetual / endowment care", re: /\bperpetual care|\bendowment care|\bendowed care/i },
  {
    label: "monument / marker",
    re: /\bmonument\b|\bheadstone|\bgrave marker|\bmemorial marker|\bmarker (?:setting|installation)|\bfoundation (?:fee|setting|charge)/i,
  },
  { label: "grave liner", re: /\bgrave liner/i },
];

const FUNERAL_SIGNALS: Array<{ label: string; re: RegExp }> = [
  { label: "embalming", re: /\bembalm/i },
  {
    label: "basic services of funeral director",
    re: /\bbasic services?\s+(?:of|fee)|\bfuneral director/i,
  },
  {
    label: "transfer / removal of remains",
    re: /\b(?:transfer|removal) of (?:the )?(?:remains|deceased)\b/i,
  },
  { label: "hearse / funeral coach", re: /\bhearse\b|\bfuneral coach|\bcasket coach/i },
  { label: "direct cremation / immediate burial", re: /\bdirect cremation|\bimmediate burial/i },
  { label: "visitation / viewing", re: /\bvisitation\b|\bviewing\b/i },
  { label: "funeral ceremony", re: /\bfuneral (?:ceremony|service)\b/i },
  // Cemetery lists use "casket" adjectivally ("opening and closing — casket",
  // "casket lowering device", "casket burial section") and "cremation" the
  // same way ("cremation niche", "cremation garden"). Those are interment
  // concepts, not funeral goods/services — only casket-as-merchandise and
  // cremation-as-service count as funeral-home signals.
  {
    label: "casket",
    re: /\bcaskets?\b(?!\s*(?:burial|interment|grave|space|section|lowering))|\bcoffin\b/i,
  },
  {
    label: "cremation service / crematory fee",
    re: /\bcremat(?:ion|ory)\s+(?:fee|charge|process)s?\b|\bcrematory operated\b/i,
  },
  { label: "general price list", re: /\bgeneral price list\b/i },
  { label: "funeral home / mortuary", re: /\bfuneral home\b|\bmortuary\b/i },
];

export function detectDocScope(rawText: string, itemNames: string[] = []): DocScopeResult {
  const text = `${rawText}\n${itemNames.join("\n")}`;
  const cemeteryHits = CEMETERY_SIGNALS.filter((s) => s.re.test(text)).map((s) => s.label);
  const funeralHits = FUNERAL_SIGNALS.filter((s) => s.re.test(text)).map((s) => s.label);
  if (funeralHits.length > 0) return { scope: "funeral-home", cemeteryHits, funeralHits };
  // Two distinct cemetery concepts with zero funeral-home signals — confident
  // enough to relabel. One lone hit ("marker" on a stray receipt) is not.
  if (cemeteryHits.length >= 2) return { scope: "cemetery-monument", cemeteryHits, funeralHits };
  return { scope: "unknown", cemeteryHits, funeralHits };
}
