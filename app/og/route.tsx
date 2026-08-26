import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { verifyOgSignature } from "@/lib/og-verify";

export const runtime = "edge";

/**
 * Dynamic OG image generator. Returns a 1200x630 PNG with the
 * Honest Funeral brand template + a per-page title and optional
 * eyebrow tag.
 *
 * Usage in a page's metadata:
 *
 *   openGraph: {
 *     images: [{
 *       url: "/og?title=" + encodeURIComponent("Pet loss") + "&eyebrow=Grief",
 *       width: 1200,
 *       height: 630,
 *     }],
 *   }
 *
 * Or just put plain text in the query string; Next.js will encode.
 * Falls back to a sensible default when params are missing, so the
 * route is safe to hit without args.
 *
 * When OG_SIGNING_SECRET is set, any request carrying title/eyebrow
 * must also carry a valid `sig` (minted by `ogImage()` in lib/og.ts —
 * audit A1-05: unsigned query text would let anyone render arbitrary
 * copy under the brand mark). Missing/invalid sig degrades to the
 * default card (fixed brand copy, safe unsigned) instead of a 403, so
 * old unsigned URLs cached by scrapers still resolve to a brand image.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  let rawTitle = url.searchParams.get("title");
  let rawEyebrow = url.searchParams.get("eyebrow");

  const secret = process.env.OG_SIGNING_SECRET;
  if (secret && (rawTitle !== null || rawEyebrow !== null)) {
    if (!(await verifyOgSignature(url.searchParams, secret))) {
      // Drop the unverified text; the ?? fallbacks below are the single
      // default-card path.
      rawTitle = null;
      rawEyebrow = null;
    }
  }

  const title = rawTitle ?? "Quiet help when someone important dies.";
  // `||` not `??`: a signed no-eyebrow URL with `&eyebrow=` appended still
  // verifies (both canonicalize the same) — the empty string must fall back
  // to the brand name, not blank the eyebrow line.
  const eyebrow = rawEyebrow || BRAND.name;

  // Trim very long titles so they fit. Browsers truncate metadata too
  // but a clean visual is better than letting it overflow.
  const trimmedTitle =
    title.length > 110 ? title.slice(0, 107).trimEnd() + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#fbf9f5",
          color: "#20453a",
          fontFamily: "serif",
        }}
      >
        {/* Top: brand mark + eyebrow */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 28,
              color: "#6f7d75",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {BRAND.name}
          </div>
          {eyebrow && eyebrow !== BRAND.name && (
            <div
              style={{
                fontSize: 22,
                color: "#8a9690",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>
          )}
        </div>

        {/* Middle: the title, large */}
        <div
          style={{
            fontSize: 76,
            lineHeight: 1.15,
            maxWidth: 1000,
            color: "#1a1a1a",
            display: "flex",
          }}
        >
          {trimmedTitle}
        </div>

        {/* Bottom: brand tagline */}
        <div
          style={{
            fontSize: 26,
            color: "#4a5750",
            fontStyle: "italic",
            display: "flex",
          }}
        >
          quiet help after a loss
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
