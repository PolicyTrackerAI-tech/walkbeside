import { BRAND } from "./brand";
import { ogQueryString } from "./og";
/**
 * Build an Article JSON-LD object for a content page. Wraps the
 * canonical schema.org Article type with sensible defaults for
 * Honest Funeral content pages.
 *
 * Used via the <ArticleSchema /> component, which renders this into
 * a <script type="application/ld+json"> tag. Helps Google understand
 * pages as articles and qualify them for rich results.
 */

const SITE_URL = "https://honestfuneral.co";

export interface ArticleSchemaInput {
  /** Path slug (e.g. "grief" or "talking-to-kids"). No leading slash. */
  slug: string;
  /** Page title. Becomes the article headline. */
  title: string;
  /** Page description. */
  description: string;
  /** Category eyebrow (e.g. "Grief", "After", "Planning"). */
  eyebrow?: string;
  /**
   * ISO date string for when this content was first published. Only emitted
   * when a page provides its REAL date (audit A6-05: the old hardcoded
   * 2026-05-14 default stamped one identical fabricated date across ~23
   * pages — absent is honest, uniform-wrong is a citability liability).
   */
  datePublished?: string;
  /**
   * ISO date string for last meaningful content update.
   * Default: same as datePublished.
   */
  dateModified?: string;
}

export function articleSchema({
  slug,
  title,
  description,
  eyebrow,
  datePublished,
  dateModified,
}: ArticleSchemaInput): Record<string, unknown> {
  const pageUrl = `${SITE_URL}/${slug.replace(/^\//, "")}`;

  // Shared signed builder (lib/og.ts) so the JSON-LD image URL carries
  // the same sig as the og:image tags; stays absolute for schema.org.
  const imageUrl = `${SITE_URL}/og?${ogQueryString(title, eyebrow)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: imageUrl,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ?? datePublished
      ? { dateModified: dateModified ?? datePublished }
      : {}),
    author: {
      "@type": "Organization",
      name: BRAND.name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    ...(eyebrow ? { articleSection: eyebrow } : {}),
    inLanguage: "en-US",
    isAccessibleForFree: true,
  };
}
