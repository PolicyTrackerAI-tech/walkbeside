import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { CITIES } from "@/lib/city-pages";

export const metadata: Metadata = {
  title: `Funeral costs by city — fair-price ranges for ${CITIES.length} US metros`,
  description: `What funerals actually cost by city across ${CITIES.length} US metros: direct cremation, traditional burial, green burial. Regional fair-price ranges based on national pricing data adjusted for local cost-of-living.`,
  openGraph: {
    images: [ogImage("Funeral costs by city", "Local pricing")],
  },
};

export default function FuneralCostsIndexPage() {
  const sorted = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="funeral-costs"
        title="Funeral costs by city"
        description={`Regional fair-price ranges for ${CITIES.length} major US metros — what each service type actually costs in your area.`}
        eyebrow="Local pricing"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Funeral costs by city</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              What does a funeral cost in your city?
            </h1>
            <p className="text-lg text-ink-soft">
              Below: fair-price ranges by service type, adjusted for
              local cost-of-living, for{" "}
              {CITIES.length} major US metros. Each page shows what
              direct cremation, traditional burial, green burial, and
              other services{" "}
              <em>should</em> cost in that market &mdash; from an
              honest funeral home.
            </p>
            <p className="text-lg text-ink-soft mt-3">
              Don&rsquo;t see your city? The{" "}
              <Link
                href="/prices"
                className="text-primary-deep underline"
              >
                national fair-price lookup
              </Link>{" "}
              works for every US zip code.
            </p>
          </div>

          <Card>
            <CardEyebrow>{CITIES.length} cities</CardEyebrow>
            <CardTitle>Pick yours.</CardTitle>
            <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-ink-soft">
              {sorted.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/funeral-costs/${c.slug}`}
                    className="text-primary-deep underline-offset-2 hover:underline"
                  >
                    {c.name}, {c.state}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card tone="primary">
            <CardTitle>Want us to call funeral homes for you?</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              We contact homes in your area as your authorized
              advocate, pull written itemized quotes, and put the
              options side by side. Free to families &mdash; we contact homes
              on your behalf at no charge. No commissions, no kickbacks.
            </p>
            <LinkButton href="/where" size="lg">
              Start here →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            Pricing data is based on national fair-price benchmarks
            adjusted for regional cost-of-living. Real quotes vary by
            funeral home and by what&rsquo;s included. Comparison-shopping
            at least two homes is the most reliable way to
            find a fair price.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
