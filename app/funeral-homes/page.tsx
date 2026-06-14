import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { ZipSearchForm } from "@/components/funeral-homes/ZipSearchForm";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Funeral home prices by zip code — what fair pricing actually looks like",
  description:
    "Honest, regional fair-price ranges for funeral services — direct cremation, traditional burial, and cremation with memorial — adjusted for your area. Consumer advocacy for families, not a directory or broker.",
};

/**
 * /funeral-homes — public landing page for the directory.
 *
 * Strategy: own the SEO surface for "funeral home prices [city]" and
 * "funeral pricing near me" searches. The page itself is informational
 * (no specific funeral home recommendations yet — that's a later phase,
 * once real homes are vetted); the conversion is the zip-entry form that takes the
 * visitor to /funeral-homes/[zip] for regional fair-pricing data, then
 * to /negotiate/start to have us call homes for them.
 */
export default function FuneralHomesIndexPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-10">
          <div>
            <CardEyebrow>Regional pricing lookup</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              What does a fair funeral cost in your area?
            </h1>
            <p className="text-lg text-ink-soft">
              Funeral home prices vary by 3–10× for the same goods and
              services in the same town. We&rsquo;ll show you what
              fair-range pricing actually looks like in your zip code,
              what each line item should cost, and how to spot the
              upsells before you sign.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>Look up your area</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Enter a zip code to see typical fair-price ranges for the
              three most common funeral types in your region.
            </p>
            <ZipSearchForm />
          </Card>

          <Card>
            <CardEyebrow>What you&rsquo;ll find</CardEyebrow>
            <ul className="space-y-3 text-ink mt-3">
              <li>
                <strong>Real fair-price ranges</strong> for direct
                cremation, traditional burial, and cremation with a
                memorial service — adjusted for your region&rsquo;s
                cost of living.
              </li>
              <li>
                <strong>What each line item should cost.</strong>{" "}
                Basic services fee, embalming, casket, vault, transfer,
                hearse — every charge a funeral home can put in front
                of you, and what fair pricing looks like for each.
              </li>
              <li>
                <strong>The upsells to decline.</strong> &ldquo;Required&rdquo;
                items that aren&rsquo;t actually required by law, the
                line items where bundling lives, and what to say if
                they push back.
              </li>
              <li>
                <strong>The path forward.</strong> If you&rsquo;d
                rather not call funeral homes yourself, we&rsquo;ll
                contact 3–5 in your area on your behalf and bring
                back side-by-side comparison quotes.
              </li>
            </ul>
          </Card>

          <Card tone="soft">
            <CardEyebrow>How we&rsquo;re different</CardEyebrow>
            <CardTitle>Not a directory. Not a broker.</CardTitle>
            <p className="text-ink-soft mt-3">
              Most &ldquo;funeral home finders&rdquo; on the internet
              are ad surfaces — funeral homes pay to appear. We
              don&rsquo;t take a cent from any funeral home, ever. The
              only money we make on your case comes from the family
              directly. That&rsquo;s how we stay accountable to you.
            </p>
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
