/**
 * AI-generated plain-English digest of a partner's outcomes — the sentence
 * or two a coordinator can literally quote in a renewal conversation, so
 * reading the raw CohortStats numbers isn't required. Same fallback-gated
 * pattern as app/api/analyze-price-list/route.ts's buildAdvocacySummary:
 * deterministic template first, Claude call only if available, and ANY
 * malformed/failed Claude response falls back to the deterministic text —
 * this text is cosmetic copy, never the ground truth (stats.* remain the
 * only numbers ProofSheet renders directly).
 *
 * Callers decide WHETHER to call buildOutcomesDigest at all. Only
 * app/partner/r/[token]/page.tsx (the real, report_token-gated report) may
 * import it — app/partner/[code]/page.tsx (the public sample report) must
 * import only fallbackOutcomesDigest, never this function or anything from
 * lib/claude, so the public route can't reach a real Claude call.
 */
import { client as anthropic, MODEL, claudeAvailable } from "@/lib/claude";
import { partnerOutcomesDigestSystem } from "@/lib/negotiation/prompts";
import { stripCodeFence } from "@/lib/negotiation/price-list-parse";
import { SMALL_SAMPLE_THRESHOLD, type CohortStats, type CohortStatsFull } from "@/lib/partner-report";

/**
 * Deterministic fallback — built ONLY from CohortStatsFull's own fields, no
 * invented numbers. Used when Claude is unconfigured, errors, or returns
 * something we can't validate. Sentence order mirrors ProofSheet's own
 * visual hierarchy (total caught -> FTC issues -> satisfaction -> resolution
 * time) so this text never contradicts the layout above it.
 */
export function fallbackOutcomesDigest(name: string, stats: CohortStatsFull): string {
  const dollars = (cents: number) =>
    `$${Math.round(cents / 100).toLocaleString("en-US")}`;
  const parts: string[] = [
    `${stats.familiesHelped} families referred through ${name} completed cases, and ${stats.familiesWhoSaved} of them caught an overcharge — ${dollars(stats.totalOverchargeCaughtCents)} total, ${dollars(stats.avgOverchargeCaughtCents)} on average.`,
  ];
  if (stats.ftcIssuesFlagged > 0) {
    parts.push(
      `${stats.ftcIssuesFlagged} likely FTC Funeral Rule issue${stats.ftcIssuesFlagged === 1 ? "" : "s"} ${stats.ftcIssuesFlagged === 1 ? "was" : "were"} flagged along the way.`,
    );
  }
  if (stats.avgSatisfaction != null) {
    parts.push(`Families rated their experience ${stats.avgSatisfaction} of 5 on average.`);
  }
  if (stats.medianResolutionDays != null) {
    parts.push(`Typical time to resolution was ${stats.medianResolutionDays} days.`);
  }
  return parts.join(" ");
}

/**
 * Small-sample sentence — CohortStatsSuppressed carries no dollar/satisfaction
 * data to summarize by design, so this is a static line, not a Claude call.
 */
export function smallSampleDigest(): string {
  return `Once a few more families come through (we wait until ${SMALL_SAMPLE_THRESHOLD} to protect anyone's privacy), we'll summarize outcomes here.`;
}

/**
 * The single entry point for the real, live report. Handles both suppression
 * states and the Claude/fallback branch internally, so callers never touch
 * the prompt or the Claude client directly.
 */
export async function buildOutcomesDigest(
  name: string,
  stats: CohortStats,
): Promise<string> {
  if (stats.smallSample) return smallSampleDigest();
  if (!claudeAvailable()) return fallbackOutcomesDigest(name, stats);

  // Compact structured findings — the ONLY ground truth Claude may reference.
  // All-numeric; nothing here is free text from any external party.
  const findings = {
    partnerName: name,
    familiesHelped: stats.familiesHelped,
    familiesWhoSaved: stats.familiesWhoSaved,
    totalOverchargeCaughtDollars: Math.round(stats.totalOverchargeCaughtCents / 100),
    avgOverchargeCaughtDollars: Math.round(stats.avgOverchargeCaughtCents / 100),
    ftcIssuesFlagged: stats.ftcIssuesFlagged,
    avgSatisfaction: stats.avgSatisfaction,
    medianResolutionDays: stats.medianResolutionDays,
    toolEngagement: stats.toolEngagement,
    pilotMetrics: stats.pilotMetrics,
  };

  try {
    const msg = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 300,
      system: partnerOutcomesDigestSystem(),
      messages: [{ role: "user", content: JSON.stringify(findings) }],
    });
    const out = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
    const parsed = JSON.parse(stripCodeFence(out)) as { digest?: unknown };
    if (typeof parsed.digest !== "string" || !parsed.digest.trim()) {
      return fallbackOutcomesDigest(name, stats);
    }
    // Defensive length cap — never let a runaway response reach the page.
    return parsed.digest.trim().slice(0, 600);
  } catch {
    return fallbackOutcomesDigest(name, stats);
  }
}
