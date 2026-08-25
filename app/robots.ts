import type { MetadataRoute } from "next";

const SITE = "https://honestfuneral.co";

/**
 * Audit A6-03 notes:
 * - The Fair-Price Index Dataset JSON-LD advertises two DataDownload URLs
 *   under /api/ — the blanket /api/ disallow contradicted them and undermined
 *   Google Dataset Search ingestion. Longest-match wins, so the explicit
 *   allow below carves the data endpoint (both formats) out of the block.
 * - /signup was a fossil (no such route exists).
 * - /admin and /portal are deliberately NOT disallowed: they carry
 *   noindex,nofollow meta (live-verified), and a robots block would stop
 *   crawlers from ever SEEING that meta — leaving bare URLs indexable if
 *   linked externally. Noindex is the correct tool for private pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/fair-price-index/data"],
        disallow: ["/dashboard", "/login", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
