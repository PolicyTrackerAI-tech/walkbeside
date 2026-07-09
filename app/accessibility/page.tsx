import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "Our accessibility target, what works today, known limitations, and how to ask for help or accommodation — including language assistance.",
  alternates: { canonical: "/accessibility" },
};

/**
 * The public accessibility statement (roadmap Phase 5). Deliberately states
 * a conformance TARGET, not a claim of achieved compliance — an honest
 * statement de-risks a hospice's own Section 1557 concern about referring
 * patients here better than an overclaim ever could.
 */
export default function AccessibilityPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Accessibility
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              This site is for people having the worst week of their lives —
              it has to work for everyone.
            </h1>
            <p className="text-lg text-ink-soft">
              Many of the people we serve are 65 or older, grieving, tired,
              and on a phone. Accessibility here isn&rsquo;t a legal checkbox;
              it&rsquo;s the product working.
            </p>
          </div>

          <Card>
            <CardTitle>Our target</CardTitle>
            <p className="text-sm text-ink-soft mt-2">
              We aim for <strong className="text-ink">WCAG 2.1 Level AA</strong>{" "}
              across the site. That is a target we work toward and test
              against — not a certification we claim to have achieved. When we
              find a gap (or you do), fixing it goes ahead of new features.
            </p>
          </Card>

          <Card>
            <CardTitle>What works today</CardTitle>
            <ul className="mt-2 space-y-2 text-sm text-ink-soft list-disc pl-5">
              <li>
                A persistent <strong className="text-ink">&ldquo;Larger text&rdquo;</strong>{" "}
                button (bottom-left of every page): bigger type, higher
                contrast, single-column layout — your choice is remembered on
                your device.
              </li>
              <li>Keyboard navigation with a skip-to-content link and visible focus styles.</li>
              <li>Semantic headings and labeled form fields for screen readers.</li>
              <li>Print-friendly versions of every worksheet, plan, and checklist — paper is an accessibility feature here.</li>
              <li>No autoplaying media, no flashing content, no time limits on anything.</li>
            </ul>
          </Card>

          <Card>
            <CardTitle>Known limitations</CardTitle>
            <ul className="mt-2 space-y-2 text-sm text-ink-soft list-disc pl-5">
              <li>
                <strong className="text-ink">Language:</strong> the site is
                currently English-only. A human-reviewed Spanish version of
                the core tools is in progress. Until then, a bilingual
                relative can use the family tools on your behalf — and if you
                email us in any language, we&rsquo;ll find a way to respond.
              </li>
              <li>
                Photo upload in the price checker requires vision or a helper;
                the same check works by typing or pasting the price list text.
              </li>
              <li>
                Some older guide pages have not yet had a full screen-reader
                pass. Report anything that reads badly — it jumps the queue.
              </li>
            </ul>
          </Card>

          <Card tone="primary">
            <CardTitle>Ask for help or accommodation</CardTitle>
            <p className="text-sm text-ink mt-2">
              Email{" "}
              <a href="mailto:help@honestfuneral.co" className="underline">
                help@honestfuneral.co
              </a>{" "}
              or call <strong>+1 (385) 553-1141</strong> and a person will
              help you use any tool, read a result to you, or send a paper
              copy. There is no wrong way to ask, and it costs nothing.
            </p>
          </Card>

          <p className="text-xs text-ink-muted">
            This statement was last reviewed July 2026. Related:{" "}
            <Link href="/methodology" className="text-primary-deep underline">
              how the checker works
            </Link>{" "}
            ·{" "}
            <Link href="/corrections" className="text-primary-deep underline">
              corrections &amp; accuracy
            </Link>
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
