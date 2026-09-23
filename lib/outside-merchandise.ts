/**
 * Detects a price-list line that charges the family for using merchandise
 * (a casket, urn, or vault) bought somewhere else.
 *
 * The FTC Funeral Rule lets a family buy funeral merchandise from any outside
 * seller, and bars a funeral provider from charging a fee as a condition of
 * furnishing its goods or services other than the fees the Rule permits
 * (16 CFR §453.4(b)(1)(ii)). A "handling fee" for an outside casket is the
 * textbook case.
 *
 * Shared by the line-item matcher (such a line must never be benchmarked as a
 * casket: a $625 fee reads "good" next to a casket's price range) and the
 * rules engine (which flags the fee itself).
 */

const ELSEWHERE =
  /\b(?:outside|third[- ]party|(?:purchased|bought|supplied|provided)\s+(?:elsewhere|by\s+(?:the\s+)?(?:family|customer|purchaser))|not\s+(?:purchased|bought)\s+(?:from|here|through)|(?:family|customer)[- ](?:supplied|provided))\b/;
const MERCHANDISE =
  /\b(?:caskets?|coffins?|urns?|vaults?|outer\s+burial\s+containers?|merchandise)\b/;
const FEE = /\b(?:handling|fee|charge|surcharge|acceptance|receiving)\b/;

export function isOutsideMerchandiseFee(name: string): boolean {
  const n = name.toLowerCase();
  return ELSEWHERE.test(n) && MERCHANDISE.test(n) && FEE.test(n);
}
