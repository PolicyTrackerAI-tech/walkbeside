import { ImageResponse } from "next/og";

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
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const title =
    url.searchParams.get("title") ?? "Quiet help when someone important dies.";
  const eyebrow = url.searchParams.get("eyebrow") ?? "Honest Funeral";

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
            Honest Funeral
          </div>
          {eyebrow && eyebrow !== "Honest Funeral" && (
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
