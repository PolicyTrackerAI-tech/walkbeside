import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { callClaude, claudeAvailable } from "@/lib/claude";
import {
  priceListAnalysisSystem,
  priceListAdvocacySummarySystem,
} from "@/lib/negotiation/prompts";
import {
  classifyAgainst,
  adjustedRange,
  regionMultiplier,
} from "@/lib/pricing-data";
import {
  matchLineItem,
  cleanItemName,
  naiveExtract,
  stripCodeFence,
  type RawItem,
} from "@/lib/negotiation/price-list-parse";
import { reconcileTotalQuoted } from "@/lib/analyzer-totals";
import { benchmarksForZip } from "@/lib/benchmarks-store";
import {
  extractionConfidence,
  NAIVE_EXTRACTION_CONFIDENCE,
} from "@/lib/extraction-confidence";
import { redactContact } from "@/lib/redact";
import {
  fallbackAdvocacySummary,
  assessCoverage,
  savingsBreakdown,
} from "@/lib/analyzer-display";
import { runRules } from "@/lib/bundling-detection/rules";
import { FEATURES, PUBLIC, requireServer } from "@/lib/env";
import { readLimitedJson } from "@/lib/http-guards";
import { normalizeReferralCode } from "@/lib/referral-codes";

const Body = z.object({
  text: z.string().min(20).max(20000),
  zip: z.string().min(3).max(10).optional(),
  serviceTypeHint: z.string().max(64).optional(),
  // Optional referral attribution (HF-XXXXXX) remembered on-device from a
  // ?ref= visit. Reporting-only; validated + resolved server-side.
  referralCode: z.string().max(20).optional(),
  // Explicit "add my de-identified prices to the public fair-price data"
  // opt-in (D8). Optional so callers without the checkbox (compare-quotes,
  // the portal coordinator check) keep working — absent is treated as false
  // below: no checkbox shown means no consent given, and only true or a
  // provably pre-consent NULL row ever feeds the benchmark aggregation.
  contributed: z.boolean().optional(),
  // Eval-harness knobs (scripts/eval-analyzer.mjs). Honored ONLY on a dev
  // server (NODE_ENV !== "production") — a production build silently ignores
  // both, so no public caller can pick our model or re-tag our cost ledger.
  // evalRun tags the run's Claude calls "eval" in api_cost_events and adds
  // extractionMethod to the response; evalModel additionally overrides the
  // model for this request (the harness's --model comparison flag).
  evalRun: z.boolean().optional(),
  evalModel: z.string().max(64).optional(),
});

interface ItemOut {
  name: string;
  cents: number;
  matchedItemId?: string;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
  /** Selection-range item (caskets, vaults, urns shown as $low-$high). */
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
  /** Quantity for per-unit items (e.g. 10 death certificates); cents is the total. */
  qty?: number;
}

interface AdvocacyMove {
  title: string;
  detail: string;
}

interface AdvocacySummary {
  bottomLine: string;
  moves: AdvocacyMove[];
  reassurance: string;
}

export async function POST(req: Request) {
  const limited = await readLimitedJson(req, 200);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { text, zip, serviceTypeHint, referralCode, contributed } = parsed.data;
  const isEvalRun =
    process.env.NODE_ENV !== "production" && parsed.data.evalRun === true;
  const evalModel = isEvalRun ? parsed.data.evalModel : undefined;

  let extracted: { items: RawItem[]; total_cents?: number } = {
    items: [],
  };
  // Which parser produced the items — persisted with the analysis so the
  // benchmark pipeline can weigh naive-regex rows differently from Claude rows.
  let extractionMethod: "claude" | "naive" = "naive";

  if (claudeAvailable()) {
    try {
      const out = await callClaude({
        feature: isEvalRun ? "eval" : "analyzer-extract",
        system: priceListAnalysisSystem(),
        user: text,
        maxTokens: 2000, // re-baselined 1500→2000 for the sonnet-5 tokenizer (~30% more tokens/text)
        cacheSystem: true,
        ...(evalModel ? { model: evalModel } : {}),
      });
      const parsedOut = JSON.parse(stripCodeFence(out)) as {
        items?: unknown;
        total_cents?: number;
      };
      // Valid JSON but not the expected shape (a bare array, an {error}
      // object, a quoted string) must degrade to the regex parser exactly
      // like a parse throw — .map on undefined would 500 the family instead.
      if (!Array.isArray(parsedOut.items)) throw new Error("unexpected shape");
      extracted = parsedOut as { items: RawItem[]; total_cents?: number };
      extractionMethod = "claude";
    } catch {
      extracted = naiveExtract(text);
    }
  } else {
    extracted = naiveExtract(text);
  }

  // Founder-promoted local overrides (regional_benchmarks, n≥5 per row) for
  // this zip — empty Map when none match or the table isn't applied yet, so
  // the modeled path below runs unchanged. All override amounts are CENTS.
  const overrides = await benchmarksForZip(zip ?? "");
  // The overrides actually APPLIED to an item below — they decide the tier
  // label on the verdict, so it reflects this analysis, not just the zip.
  const appliedOverrides: { tier: "verified" | "community"; n: number }[] = [];
  // Items judged against a benchmark an override COULD cover — the denominator
  // for honest coverage reporting ("verified data covers X of Y items").
  // Per-unit items (death certificates) are excluded from both the numerator
  // and this denominator: they're judged against flat state-fee ranges and no
  // local override ever applies, so counting them would misstate coverage.
  let itemsBenchmarked = 0;

  const items: ItemOut[] = extracted.items.map((raw) => {
    // The extractor may fold a non-priced section header into the name
    // ("Direct cremation arrangement — Basic services fee"). Strip it back to
    // the self-describing item where it's safe to do so (cosmetic only).
    const name = cleanItemName(raw.name);
    // Selection-range item (caskets, vaults, urns): keep the range and don't
    // classify it against a single fair price — the family hasn't picked one.
    if (raw.cents_low != null && raw.cents_high != null) {
      return {
        name,
        cents: raw.cents_low,
        isRange: true,
        centsLow: raw.cents_low,
        centsHigh: raw.cents_high,
      };
    }
    const cents = raw.cents ?? 0;
    const matched = matchLineItem(name);
    if (!matched) return { name, cents };
    // Classify against the SAME zip-adjusted thresholds we display, including
    // an adjusted predatory cutoff — otherwise the verdict can contradict the
    // shown range (e.g. "$300, fair range $143–$285, verdict: Fair").
    const m = regionMultiplier(zip ?? "");
    // Per-unit items (e.g. death certificates) are a fixed government/state fee,
    // NOT metro-cost-of-living sensitive — a certificate costs the same state
    // fee in rural Utah as in San Francisco — so benchmark them against the
    // NATIONAL range, not a COLA-adjusted one (and never a local override).
    // Everything else is zip-adjusted — unless a regional_benchmarks override
    // covers the item, in which case the real local range replaces the model.
    const override = matched.perUnit ? undefined : overrides.get(matched.id);
    if (!matched.perUnit) itemsBenchmarked += 1;
    if (override) appliedOverrides.push({ tier: override.tier, n: override.n });
    const [lo, hi, predatory] = matched.perUnit
      ? [matched.fairLow, matched.fairHigh, matched.predatoryAt]
      : override
        ? [
            override.fairLowCents / 100,
            override.fairHighCents / 100,
            // When a local override has no predatory line, the COLA-adjusted
            // national ceiling is still the best available — clamped so the
            // predatory cutoff always clears the local fair-high (otherwise a
            // price a dollar above a verified fair range would read predatory).
            override.predatoryAtCents != null
              ? override.predatoryAtCents / 100
              : Math.max(
                  Math.round(matched.predatoryAt * m),
                  Math.ceil(override.fairHighCents / 100) + 1,
                ),
          ]
        : [
            ...adjustedRange(matched.fairLow, matched.fairHigh, zip),
            Math.round(matched.predatoryAt * m),
          ];
    // Per-unit items are quoted as a total for N copies; judge the PER-UNIT
    // price against the per-each range, so $250 for 10 certificates ($25 each)
    // reads as fair, not a $225 overcharge.
    const qty = matched.perUnit && raw.qty && raw.qty > 1 ? raw.qty : undefined;
    const perUnitDollars = (qty ? cents / qty : cents) / 100;
    return {
      name,
      cents,
      matchedItemId: matched.id,
      classification: classifyAgainst(perUnitDollars, lo, hi, predatory),
      // Override cents pass through exactly (lo/hi were derived from them, and
      // float ÷100·×100 can drift a fraction of a cent on odd amounts).
      fairCentsLow: override ? override.fairLowCents : lo * 100,
      fairCentsHigh: override ? override.fairHighCents : hi * 100,
      ...(qty ? { qty } : {}),
    };
  });

  // The data tier THIS verdict was computed with: verified beats community
  // when both applied; modeled when no override touched an item. n is the
  // MINIMUM n across the winning tier's applied overrides — the most
  // conservative count, the only one we can defend (guardrail #4). The same
  // guardrail forces coverage reporting: one verified item among twenty modeled
  // ones must not label the whole verdict "verified", so itemsCovered counts
  // only the winning tier's applied overrides and itemsBenchmarked is the
  // denominator the UI states it against.
  const usedVerified = appliedOverrides.filter((o) => o.tier === "verified");
  const usedWinning = usedVerified.length
    ? usedVerified
    : appliedOverrides.filter((o) => o.tier === "community");
  const dataTier: {
    tier: "verified" | "community" | "modeled";
    n: number | null;
    itemsCovered: number;
    itemsBenchmarked: number;
  } = usedWinning.length
    ? {
        tier: usedWinning[0].tier,
        n: Math.min(...usedWinning.map((o) => o.n)),
        itemsCovered: usedWinning.length,
        itemsBenchmarked,
      }
    : { tier: "modeled", n: null, itemsCovered: 0, itemsBenchmarked };

  // Range/selection items (caskets, vaults, urns) are excluded from the quoted
  // subtotal and savings math — there's no single price to sum or benchmark
  // until the family picks one. They surface in the item table with their
  // range, alongside the third-party-purchase-rights flag from runRules.
  const priced = items.filter((i) => !i.isRange);

  // A model-extracted stated total is only trusted when it's consistent with
  // the items we parsed — see reconcileTotalQuoted for the failure mode this
  // guards (a hallucinated total below the item sum clamping the fair total
  // to $0 on screen).
  const pricedSumCents = priced.reduce((s, i) => s + (i.cents || 0), 0);
  const totalQuoted = reconcileTotalQuoted(extracted.total_cents, pricedSumCents);

  // Extraction provenance (persisted with the analysis below): naive regex
  // rows carry a fixed low score; Claude rows are scored on item count +
  // stated-total consistency — the same heuristic the inbound reply parser
  // uses (lib/extraction-confidence.ts).
  const confidence =
    extractionMethod === "claude"
      ? extractionConfidence({
          itemCount: extracted.items.length,
          statedTotalCents: extracted.total_cents ?? null,
          itemSumCents: pricedSumCents,
        })
      : NAIVE_EXTRACTION_CONFIDENCE;

  // The headline "$X above fair" MUST equal the sum of the per-item overcharge
  // badges the family sees in the table — never `totalQuoted - totalFairMid`,
  // which would also charge un-benchmarked pass-through lines, OCR-dropped or
  // home-padded gaps in the stated total, casket/urn/vault ranges, and the full
  // per-COPY quantity of a fairly-priced per-unit item (10 death certs at $25)
  // as "overcharge" — an indefensible number that contradicts the item table.
  // savingsBreakdown sums overchargeCents (qty-aware, range-excluding, only
  // high/predatory, clamped ≥0), which is exactly the visible badge total.
  const potentialSavings = savingsBreakdown(items, []).negotiateCents;
  // Fair total = what THIS bill would cost if the overpriced items came down to
  // fair (everything else, including correctly-fair per-unit items, stays at the
  // quoted price). Derived from the headline so the three summary stats always
  // reconcile: Quoted − Above-fair = Fair total.
  const totalFairMid = Math.max(0, totalQuoted - potentialSavings);
  const totalFairLow = totalFairMid;
  const totalFairHigh = totalFairMid;

  // How much of the bill we can stand behind. If OCR dropped lines, or we
  // parsed items we don't benchmark, the headline number is built on a partial
  // read — say so plainly rather than projecting false confidence.
  const coverage = assessCoverage(text, items);

  // Run the bundling-detection rules engine against the raw text + parsed
  // items. Returns FTC violations, suspicious upsells, and informational
  // flags. Margaret refactor — the moat.
  const violations = runRules({
    rawText: text,
    items,
    serviceTypeHint,
    totalCents: totalQuoted,
  });

  // Optional: persist if logged in
  if (FEATURES.supabase()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const row = {
        user_id: user.id,
        // Stored text is contact-redacted (emails/phones/SSNs/account runs →
        // "[redacted]") — the benchmark pipeline needs prices, not contacts.
        // The in-memory `text` used for extraction/rules above stays raw.
        raw_text: redactContact(text).slice(0, 5000),
        total_quoted_cents: totalQuoted,
        total_fair_cents: totalFairMid,
        potential_savings_cents: potentialSavings,
        items,
      };
      // zip drives the benchmark pipeline's regional aggregation (column from
      // 2026-07-02-benchmark-zip.sql); confidence/extraction_method are the
      // provenance columns from 2026-07-13-portal-identity.sql; contributed is
      // the consent flag from 2026-07-20-hospices-consent.sql (absent in the
      // body → false: no checkbox shown means no consent given). All ride the
      // first attempt only — if that fails on a pre-migration schema, fall
      // back to the legacy shape rather than silently losing the analysis.
      // The fallback lands contributed NULL even for a NEW submission with an
      // unchecked box — acceptable only because the fallback exists solely
      // for pre-migration schemas, where the consent column (and the filter
      // that reads it) doesn't exist yet either. Persistence stays
      // best-effort: if both inserts fail, the analysis response still
      // returns.
      let insertedId: string | null = null;
      const { data: inserted, error: insertError } = await supabase
        .from("price_list_analyses")
        .insert({
          ...row,
          zip: zip ?? null,
          confidence,
          extraction_method: extractionMethod,
          contributed: contributed ?? false,
        })
        .select("id")
        .single();
      if (insertError) {
        const { data: legacyInserted } = await supabase
          .from("price_list_analyses")
          .insert(row)
          .select("id")
          .single();
        insertedId = legacyInserted?.id ?? null;
      } else {
        insertedId = inserted?.id ?? null;
      }

      // Referral attribution — reporting label ONLY (never read by choose/
      // outreach/ranking; anti-steering is structural). Best-effort: an
      // invalid, revoked, or unknown code — or the partner columns migration
      // not being applied yet — must never fail the family's own flow.
      // Service role because partner tables are RLS-deny-all. Only the
      // family-facing Analyzer sends referralCode; the portal coordinator
      // check never does, so staff test checks stay out of the org's report.
      const code = normalizeReferralCode(referralCode);
      if (insertedId && code) {
        try {
          const svc = createServiceClient(
            PUBLIC.supabaseUrl,
            requireServer("SUPABASE_SERVICE_ROLE_KEY"),
          );
          const { data: codeRow } = await svc
            .from("partner_codes")
            .select("code, partner_id, active")
            .eq("code", code)
            .maybeSingle();
          // Partner staff carry their org's ?ref= memory from testing their
          // own links; their checks must not inflate the org's engagement
          // numbers, so any active portal member is excluded here.
          let isPartnerStaff = false;
          if (codeRow?.active) {
            const { data: memberRow } = await svc
              .from("partner_members")
              .select("id")
              .eq("user_id", user.id)
              .is("deactivated_at", null)
              .limit(1)
              .maybeSingle();
            isPartnerStaff = !!memberRow;
          }
          if (codeRow?.active && !isPartnerStaff) {
            await svc
              .from("price_list_analyses")
              .update({
                partner_id: codeRow.partner_id,
                partner_code: codeRow.code,
              })
              .eq("id", insertedId);
          }
        } catch {
          // attribution is never worth failing a family's analysis over
        }
      }
    }
  }

  // Advocacy synthesis — turn the deterministic findings into a calm,
  // prioritized "what we'd do" for the family. Grounded ONLY in the findings
  // (no invented prices). Always present: if Claude is down or returns malformed
  // JSON, a deterministic fallback summary is built from the findings.
  const summary = await buildAdvocacySummary({
    items,
    violations,
    totalQuoted,
    potentialSavings,
    isEvalRun,
    evalModel,
  });

  return NextResponse.json({
    items,
    totalQuoted,
    totalFairLow,
    totalFairHigh,
    totalFairMid,
    potentialSavings,
    violations,
    summary,
    coverage,
    dataTier,
    // Dev-only eval runs need to know whether the model or the naive regex
    // fallback produced the items — a naive row isn't measuring the model.
    ...(isEvalRun ? { extractionMethod } : {}),
  });
}

async function buildAdvocacySummary(input: {
  items: ItemOut[];
  violations: { title: string; severity: string; whatToSay?: string }[];
  totalQuoted: number;
  potentialSavings: number;
  isEvalRun?: boolean;
  evalModel?: string;
}): Promise<AdvocacySummary> {
  // Deterministic safety net — the checker must never show a blank "what to do".
  const fallback = () =>
    fallbackAdvocacySummary({
      items: input.items,
      violations: input.violations.map((v) => ({
        title: v.title,
        severity: v.severity as "violation" | "suspicious" | "info",
        whatToSay: v.whatToSay,
      })),
      potentialSavings: input.potentialSavings,
    });
  if (!claudeAvailable()) return fallback();

  // Compact, structured findings — the ONLY ground truth the summary may use.
  const findings = {
    items: input.items.map((i) =>
      i.isRange && i.centsLow != null && i.centsHigh != null
        ? {
            name: i.name,
            range: [i.centsLow / 100, i.centsHigh / 100],
            verdict: "selection-range",
          }
        : {
            name: i.name,
            price: i.cents / 100,
            verdict: i.classification ?? "unbenchmarked",
            fairRange:
              i.fairCentsLow != null && i.fairCentsHigh != null
                ? [i.fairCentsLow / 100, i.fairCentsHigh / 100]
                : null,
          },
    ),
    ftcFindings: input.violations.map((v) => ({
      title: v.title,
      severity: v.severity,
    })),
    fixedItemsSubtotal: Math.round(input.totalQuoted / 100),
    potentialSavingsOnFixedItems: Math.round(input.potentialSavings / 100),
    hasSelectionRanges: input.items.some((i) => i.isRange),
  };

  try {
    const out = await callClaude({
      feature: input.isEvalRun ? "eval" : "advocacy-summary",
      system: priceListAdvocacySummarySystem(),
      user: JSON.stringify(findings),
      maxTokens: 1000, // re-baselined 700→1000 (sonnet-5 tokenizer)
      cacheSystem: true,
      ...(input.evalModel ? { model: input.evalModel } : {}),
    });
    const parsed = JSON.parse(stripCodeFence(out)) as {
      bottomLine?: unknown;
      moves?: unknown;
      reassurance?: unknown;
    };
    if (typeof parsed.bottomLine !== "string" || !Array.isArray(parsed.moves)) {
      return fallback();
    }
    const moves: AdvocacyMove[] = (parsed.moves as unknown[])
      .map((m) => {
        const mm = m as { title?: unknown; detail?: unknown };
        return {
          title: typeof mm.title === "string" ? mm.title : "",
          detail: typeof mm.detail === "string" ? mm.detail : "",
        };
      })
      .filter((m) => m.title)
      .slice(0, 5);
    return {
      bottomLine: parsed.bottomLine,
      moves,
      reassurance:
        typeof parsed.reassurance === "string" ? parsed.reassurance : "",
    };
  } catch {
    return fallback();
  }
}
