/**
 * A priced line that charges the family for using an urn or a burial vault
 * they bought somewhere else.
 *
 * The FTC Funeral Rule lets a family buy funeral merchandise from any outside
 * seller, and bars a funeral provider from charging any fee as a condition of
 * furnishing its goods or services beyond the fees the Rule permits
 * (16 CFR §453.4(b)(1)(ii)). #207 covers caskets (the casket-handling-fee rule
 * and isCasketAddOn in the matcher); this is the same fee for urns and vaults.
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
 */

const URN = /\burns?\b/;
const VAULT = /\b(?:vaults?|grave liners?|outer burial containers?|burial containers?)\b/;
const PURCHASED_ELSEWHERE =
  /\belsewhere\b|\bnot (?:purchased|bought)\b|\bthird[- ]party\b|\b(?:family|customer|purchaser|consumer)[- ](?:provided|supplied|purchased|owned)\b|\b(?:provided|supplied|furnished|purchased|bought) by (?:the )?(?:family|purchaser|consumer|customer)\b|\boutside (?:urns?|vaults?|burial|grave|containers?|merchandise)\b/;
const FEE_WORD = /\b(?:handling|fee|charge|surcharge|acceptance)\b/;
const NOT_A_HANDLING_FEE =
  /\bship(?:ping|ment)?\b|\bmail(?:ing)?\b|\bforwarding\b|\bdelivery\b|\btransport(?:ation)?\b|\binstall(?:ation)?\b|\bsetting\b|\bcemetery\b|\bcash advance\b/;
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
  if (NOT_A_HANDLING_FEE.test(n)) return null;
  if (opts.requireCharge && WAIVED.test(n)) return null;
  if (URN.test(n)) return "urn";
  if (VAULT.test(n)) return "vault";
  return null;
}
