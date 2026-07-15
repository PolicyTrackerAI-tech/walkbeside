/**
 * Contact-detail redaction for text we store or send to Claude when the
 * feature doesn't need it: price_list_analyses.raw_text (stored for the
 * benchmark pipeline) and the subscription-finder statement text (sent to
 * Claude). Emails, US phone numbers, SSN-shaped numbers, and card/account
 * digit runs become "[redacted]".
 *
 * Deliberately NOT applied to obituary/eulogy inputs (names and personal
 * details are the whole point there) and deliberately conservative about
 * number shapes: a GPL's prices, quantities, and ranges must survive intact
 * (checker-correctness law), so digit-run rules only fire on runs longer
 * than any dollar amount, and space-separated phone forms require a
 * parenthesized area code. Under-redacting an odd phone format is the
 * accepted failure direction; eating a price is not.
 */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// (801) 555-0142 · +1 (801) 555 0142 — paren area code, any/no separator.
const PHONE_PAREN_RE = /(?:\+?1[\s.-]?)?\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}\b/g;

// 801-555-0142 · 801.555.0142 · +1-801-555-0142 — dot/dash separated only.
// Space-separated without parens is skipped on purpose: "100 250 1500" in a
// two-column price table would false-match.
const PHONE_SEP_RE = /\b(?:\+?1[.-]?)?\d{3}[.-]\d{3}[.-]\d{4}\b/g;

const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/g;

// 4111-1111-1111-1111 / 4111 1111 1111 1111 — separated card numbers.
const CARD_SEP_RE = /\b\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{4}\b/g;

// Bare digit runs of 9-19: SSNs without dashes, 10-digit phones, bank
// accounts, 16-digit cards. Dollar amounts never reach 9 consecutive digits
// (commas/decimals split them), so prices are safe.
const DIGIT_RUN_RE = /\b\d{9,19}\b/g;

const MARK = "[redacted]";

export function redactContact(text: string): string {
  return text
    .replace(EMAIL_RE, MARK)
    .replace(CARD_SEP_RE, MARK)
    .replace(SSN_RE, MARK)
    .replace(PHONE_PAREN_RE, MARK)
    .replace(PHONE_SEP_RE, MARK)
    .replace(DIGIT_RUN_RE, MARK);
}
