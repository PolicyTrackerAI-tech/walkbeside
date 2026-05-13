import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import {
  getEntry,
  getRelated,
  listSlugs,
  CATEGORY_LABELS,
} from "@/lib/glossary";

export async function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.term} — plain-language definition`,
    description: entry.short,
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const related = getRelated(entry);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/glossary" />} />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>
              Glossary · {CATEGORY_LABELS[entry.category]}
            </CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-2">
              {entry.term}
            </h1>
            {entry.alsoKnownAs && entry.alsoKnownAs.length > 0 && (
              <p className="text-sm text-ink-muted mb-4">
                Also called: {entry.alsoKnownAs.join(", ")}
              </p>
            )}
            <p className="text-lg text-ink-soft">{entry.short}</p>
          </div>

          <Card>
            <div className="text-ink-soft space-y-4">
              {entry.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Card>

          {entry.watchOut && (
            <Card tone="warn">
              <CardEyebrow>Watch out</CardEyebrow>
              <p className="text-ink-soft">{entry.watchOut}</p>
            </Card>
          )}

          {related.length > 0 && (
            <Card tone="soft">
              <CardEyebrow>Related</CardEyebrow>
              <ul className="space-y-2 mt-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/glossary/${r.slug}`}
                      className="text-ink underline-offset-2 hover:underline"
                    >
                      {r.term}
                    </Link>
                    <span className="text-sm text-ink-soft ml-2">
                      &mdash; {r.short}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="text-sm">
            <Link
              href="/glossary"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              ← All glossary terms
            </Link>
          </div>

          <p className="text-xs text-ink-muted">
            This definition is general consumer information, not legal,
            medical, or financial advice. Industry practices and
            regulations change occasionally; verify before relying on
            anything here for a specific decision.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
