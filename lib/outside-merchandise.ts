/**
 * A priced line that charges the family for using an urn or a burial vault
 * they bought somewhere else.
 *
 * The FTC Funeral Rule lets a family buy funeral merchandise from any outside
 * seller, and bars a funeral provider from charging any fee as a condition of
 * furnishing its goods or services beyond the fees the Rule permits
 * (16 CFR §453.4(b)(1)(ii)). That text is general, not limited to caskets, and
 * the FTC's own consumer guidance names urns: "The funeral provider cannot
 * refuse to handle a casket or urn you bought online, at a local casket store,
 * or somewhere else — or charge you a fee to do it" (consumer.ftc.gov, "The
 * FTC Funeral Rule"). #207 covers caskets (the casket-handling-fee rule and
 * isCasketAddOn in the matcher); this is the same fee for urns and vaults.
 *
 * Stricter than the casket check on purpose. A bare "urn handling fee" or
 * "vault handling" can be a real service (mailing cremated remains, a
 * cemetery setting the vault), so this needs an explicit bought-elsewhere
 * signal, and it never fires on shipping, delivery, or installation lines or
 * on a cemetery charge passed through. A false "FTC violation" costs more
 * trust than a miss.
 *
 * Shared by the matcher (such a line must never be priced as an urn or a
 * vault) and the rules engine (which flags the fee itself).
 *
 * outsideCasketFee() applies the same signals to caskets. It widens #207's
 * casket-handling-fee, which missed "customer-provided", "purchaser-provided"
 * and "provided by the purchaser" phrasings, and namesAnotherService() keeps
 * any of these checks off a line that prices a different service
 * ("Graveside service fee (casket provided by family)" was a false
 * violation).
 */

const URN = /\burns?\b/;
const VAULT = /\b(?:vaults?|grave liners?|outer burial containers?|burial containers?)\b/;
const PURCHASED_ELSEWHERE =
  /\belsewhere\b|\bnot (?:purchased|bought)\b|\bthird[- ]party\b|\b(?:family|customer|purchaser|consumer)[- ](?:provided|supplied|purchased|owned)\b|\b(?:provided|supplied|furnished|purchased|bought) by (?:the )?(?:family|purchaser|consumer|customer)\b|\boutside (?:caskets?|coffins?|urns?|vaults?|burial|grave|containers?|merchandise)\b/;
const FEE_WORD = /\b(?:handling|fee|charge|surcharge|acceptance)\b/;
const NOT_A_HANDLING_FEE =
  /\bship(?:ping|ment)?\b|\bmail(?:ing)?\b|\bforwarding\b|\bdelivery\b|\btransport(?:ation)?\b|\binstall(?:ation)?\b|\bsetting\b|\bcemetery\b|\bcash advance\b/;
// A line that prices another service and merely mentions the family's own
// merchandise. "Memorial" alone is not here on purpose: home names carry it
// ("…not purchased from Canyon Rim Memorial Chapel").
const ANOTHER_SERVICE =
  /\b(?:direct|immediate)\s+(?:cremation|burial)s?\b|\bgraveside\b|\bviewing\b|\bvisitation\b|\bceremony\b|\bmemorial service\b|\bfuneral service\b|\bembalm\w*|\btransfer\b|\bpackage\b/;
const CASKET = /\b(?:caskets?|coffins?)\b/;
const WAIVED =
  /\bno (?:fee|charge)\b|\bwithout (?:a |any )?(?:fee|charge)\b|\bwaived\b|\bfree\b|\bn\/c\b/;

export type OutsideMerchandise = "urn" | "vault";

/**
 * Which merchandise an outside-purchase fee line is for, or null when the
 * line is not one. A waived or free line still counts (it is not an urn or a
 * vault either); pass `requireCharge` to drop those, as the rule does.
 */
export function outsideUrnOrVaultFee(
  name: string,
  opts: { requireCharge?: boolean } = {},
): OutsideMerchandise | null {
  const n = name.toLowerCase();
  if (!PURCHASED_ELSEWHERE.test(n) || !FEE_WORD.test(n)) return null;
  if (NOT_A_HANDLING_FEE.test(n) || ANOTHER_SERVICE.test(n)) return null;
  if (opts.requireCharge && WAIVED.test(n)) return null;
  if (URN.test(n)) return "urn";
  if (VAULT.test(n)) return "vault";
  return null;
}

/** True when the line prices another service (see ANOTHER_SERVICE). */
export function namesAnotherService(name: string): boolean {
  return ANOTHER_SERVICE.test(name.toLowerCase());
}

/**
 * A fee for accepting a casket the family bought elsewhere, by the same
 * signals as outsideUrnOrVaultFee. Pass `requireCharge` to drop waived or
 * free wording, as the rule does.
 */
export function outsideCasketFee(
  name: string,
  opts: { requireCharge?: boolean } = {},
): boolean {
  const n = name.toLowerCase();
  if (!CASKET.test(n) || !PURCHASED_ELSEWHERE.test(n) || !FEE_WORD.test(n)) return false;
  if (NOT_A_HANDLING_FEE.test(n) || ANOTHER_SERVICE.test(n)) return false;
  return !(opts.requireCharge && WAIVED.test(n));
}
