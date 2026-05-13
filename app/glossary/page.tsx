import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import {
  GLOSSARY,
  CATEGORY_LABELS,
  groupByCategory,
  type GlossaryCategory,
} from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Funeral glossary — plain-language definitions of the words funeral homes use",
  description:
    "What does 'GPL' mean? What is a 'non-declinable basic services fee'? Honest, plain-English definitions of the funeral industry's vocabulary, so families can read a price list without a translator.",
};

const CATEGORY_ORDER: GlossaryCategory[] = [
  "services",
  "body",
  "items",
  "money",
  "paperwork",
  "after",
  "timing",
  "people",
];

export default function GlossaryIndexPage() {
  const grouped = groupByCategory();

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Glossary</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The words funeral homes use, in plain English.
            </h1>
            <p className="text-lg text-ink-soft">
              The funeral industry has its own vocabulary, and a lot of
              it is designed to be hard to compare. This is a
              translator. {GLOSSARY.length} terms so far, more being
              added. If a word you ran into isn&rsquo;t here yet, the
              FAQ may cover it, or call us.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>How to use this.</CardTitle>
            <p className="text-ink-soft mt-3">
              Before any conversation with a funeral home, skim the{" "}
              <strong className="text-ink">Pricing and consumer rights</strong>{" "}
              section below. Knowing what a{" "}
              <Link href="/glossary/gpl" className="text-primary-deep underline">
                GPL
              </Link>
              ,{" "}
              <Link
                href="/glossary/basic-services-fee"
                className="text-primary-deep underline"
              >
                non-declinable basic services fee
              </Link>
              , and{" "}
              <Link
                href="/glossary/cash-advance"
                className="text-primary-deep underline"
              >
                cash advance item
              </Link>{" "}
              are turns a one-sided sales pitch into a real conversation.
            </p>
          </Card>

          {CATEGORY_ORDER.map((cat) => {
            const entries = grouped[cat];
            if (!entries || entries.length === 0) return null;
            return (
              <section key={cat} id={cat}>
                <h2 className="font-serif text-2xl text-ink mb-4">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <ul className="space-y-3">
                  {entries.map((e) => (
                    <li
                      key={e.slug}
                      className="rounded-xl border border-border bg-surface px-5 py-4"
                    >
                      <Link
                        href={`/glossary/${e.slug}`}
                        className="font-medium text-ink underline-offset-2 hover:underline"
                      >
                        {e.term}
                      </Link>
                      {e.alsoKnownAs && e.alsoKnownAs.length > 0 && (
                        <span className="text-sm text-ink-muted ml-2">
                          ({e.alsoKnownAs.join(", ")})
                        </span>
                      )}
                      <p className="text-sm text-ink-soft mt-1.5">
                        {e.short}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <p className="text-xs text-ink-muted">
            Definitions are general consumer information, not legal,
            medical, or financial advice. Industry practices and US
            regulations change occasionally; verify before relying on
            anything here for a specific decision.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
