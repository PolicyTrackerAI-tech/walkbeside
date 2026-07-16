import { NextResponse } from "next/server";
import { z } from "zod";
import {
  client as anthropic,
  MODEL,
  claudeAvailable,
  recordUsage,
  textOf,
} from "@/lib/claude";
import { priceListImageExtractionSystem } from "@/lib/negotiation/prompts";
import { readLimitedJson } from "@/lib/http-guards";

/**
 * Vision-OCR a photographed General Price List into plain-text line items
 * suitable for the analyzer textarea. "AI assists, never replaces" — this
 * endpoint only populates the textarea; the family confirms the extracted
 * items before the existing /api/analyze-price-list runs the actual
 * fair-price matching and FTC violation checks.
 *
 * Input  JSON: { image: <base64 or "data:..." URL>, mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }
 * Output JSON: { text: "Item  $X,XXX.XX\n..." }  or  { error: "..." }
 *
 * Body size is bounded by Zod (~8MB base64). Clients should downscale to
 * roughly 2048px on the long edge / ≤2MB raw before posting — see the
 * Analyzer.tsx `downscaleImage` helper.
 */

const Body = z.object({
  image: z.string().min(100).max(8_000_000),
  mediaType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
});

export async function POST(req: Request) {
  if (!claudeAvailable()) {
    return NextResponse.json(
      {
        error:
          "Photo reading isn't available right now — type or paste the price list below instead.",
      },
      { status: 503 },
    );
  }

  const limited = await readLimitedJson(req, 8500);
  if (!limited.ok)
    return NextResponse.json(
      {
        error:
          limited.status === 413
            ? "That image is too large — downscale it and try again, or paste the prices below."
            : "Couldn't process that image. Try a clearer photo, or paste the prices below.",
      },
      { status: limited.status },
    );
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Couldn't process that image. Try a clearer photo, or paste the prices below.",
      },
      { status: 400 },
    );
  }

  const { image, mediaType } = parsed.data;
  // Accept either a raw base64 string or a "data:image/jpeg;base64,..." URL.
  const data = image.includes(",") ? image.split(",", 2)[1] : image;

  try {
    const msg = await anthropic().messages.create({
      model: MODEL,
      // Same explicit config as callClaude: sonnet-5 runs ADAPTIVE thinking
      // when the param is omitted, spending thinking tokens inside
      // max_tokens. max_tokens re-baselined 2000→2700 (sonnet-5 tokenizer,
      // ~1.35x like every other call site).
      thinking: { type: "disabled" },
      max_tokens: 2700,
      system: priceListImageExtractionSystem(),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data,
              },
            },
            {
              type: "text",
              text: "Extract every priced line item from this General Price List.",
            },
          ],
        },
      ],
    });
    // Vision content blocks don't fit the string-only callClaude wrapper —
    // this site keeps its direct client() call and cost-tags via recordUsage.
    recordUsage("extract-price-list-image", msg);

    const extracted = textOf(msg).trim();

    if (!extracted || extracted === "UNREADABLE") {
      return NextResponse.json(
        {
          error:
            "Couldn't read that image clearly. Try a better-lit photo, hold the camera steady, or type the prices below instead.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ text: extracted });
  } catch (err) {
    console.error(
      "[extract-price-list-image] failed",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      {
        error:
          "Couldn't read that image — try again with a clearer photo, or paste the prices below.",
      },
      { status: 502 },
    );
  }
}
