/**
 * Whole-service quote rating for /prices — pure math, extracted so the
 * threshold semantics are testable.
 *
 * Every number in the message is one the caller already displays: the
 * zip-adjusted fair range and the zip-adjusted predatory-band floor. The
 * "bad" boundary IS that floor — the same dollar the page labels "what
 * predatory pricing looks like" — so the rating can never contradict the
 * band printed beside it (the analyzer applies the same rule per item via
 * classifyAgainst; guardrail #4).
 */

import { fmtUSD } from "./pricing-data";

export interface QuoteRating {
  label: string;
  tone: "good" | "warn" | "bad";
  message: string;
}

export function rateQuote(
  quoted: number,
  fairLow: number,
  fairHigh: number,
  predatoryLow: number,
): QuoteRating {
  if (!quoted) {
    return {
      label: "—",
      tone: "warn",
      message: "Enter the price they quoted to see how it compares.",
    };
  }
  const median = Math.round((fairLow + fairHigh) / 2);
  const deltaPct = Math.round(((quoted - median) / median) * 100);

  if (quoted <= fairHigh) {
    const position = deltaPct <= 0 ? "within" : "in the upper portion of";
    return {
      label: `${fmtUSD(quoted)}`,
      tone: "good",
      message: `This quote is ${position} the regional fair range (${fmtUSD(fairLow)}–${fmtUSD(fairHigh)}). The regional median is ${fmtUSD(median)}. Ask for the itemized General Price List to verify each line.`,
    };
  }
  if (quoted < predatoryLow) {
    return {
      label: `${fmtUSD(quoted)}`,
      tone: "warn",
      message: `This quote is approximately ${deltaPct}% above the regional median of ${fmtUSD(median)}. Regional fair range is ${fmtUSD(fairLow)}–${fmtUSD(fairHigh)}. You may want to request itemized prices from other firms for comparison.`,
    };
  }
  return {
    label: `${fmtUSD(quoted)}`,
    tone: "bad",
    message: `This quote is approximately ${deltaPct}% above the regional median of ${fmtUSD(median)}. Regional fair range is ${fmtUSD(fairLow)}–${fmtUSD(fairHigh)}. Predatory pricing for this service type begins around ${fmtUSD(predatoryLow)} in your area — comparing other firms is likely to materially change the price.`,
  };
}
