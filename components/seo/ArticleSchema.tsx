import { JsonLd } from "./JsonLd";
import { articleSchema, type ArticleSchemaInput } from "@/lib/article-schema";

/**
 * Convenience wrapper. Drop into a page (typically just inside the
 * <main>) with the page's slug, title, description, and category
 * eyebrow. Emits a <script type="application/ld+json"> with valid
 * Article schema for Google.
 */
export function ArticleSchema(props: ArticleSchemaInput) {
  return <JsonLd data={articleSchema(props)} />;
}
