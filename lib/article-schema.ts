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
   * ISO date string for when this content was first published.
   * Default: 2026-05-14 (current content launch date).
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
  datePublished = "2026-05-14",
  dateModified,
}: ArticleSchemaInput): Record<string, unknown> {
  const pageUrl = `${SITE_URL}/${slug.replace(/^\//, "")}`;

  const params = new URLSearchParams();
  params.set("title", title);
  if (eyebrow) params.set("eyebrow", eyebrow);
  const imageUrl = `${SITE_URL}/og?${params.toString()}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: imageUrl,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Organization",
      name: "Honest Funeral",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Honest Funeral",
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
