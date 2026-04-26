import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { VeteransChecker } from "./VeteransChecker";
import { VSO_NOTE } from "@/lib/veterans-benefits";

export const metadata: Metadata = {
  title: "Veterans burial benefits — what your family can claim",
  description:
    "Free checker for VA burial benefits. National cemetery burial, burial allowance, headstone, plot allowance, burial flag. Most families miss at least one — this is the simplest way to find out what you qualify for.",
};

export default function VeteransPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/after" backLabel="← After the funeral" />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Veterans benefits checker</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              VA burial benefits the family probably qualifies for.
            </h1>
            <p className="text-lg text-ink-soft">
              Most families of veterans claim one or two benefits and miss the
              rest. National cemetery burial, plot allowance, government
              headstone, burial flag &mdash; these are real money the VA
              already set aside, and the application is shorter than you
              think.
            </p>
          </div>

          <Card tone="warn">
            <p className="text-sm text-ink">
              <strong>Time-sensitive:</strong> Most VA burial claims must be
              filed within <strong>2 years of burial</strong>. If the death
              was recent, do this in the first month while the funeral home
              is still helping you with paperwork &mdash; they file most of
              these forms for free.
            </p>
          </Card>

          <VeteransChecker />

          <Card tone="primary">
            <CardTitle>The single best move: call a VSO.</CardTitle>
            <p className="text-ink-soft mb-3">{VSO_NOTE}</p>
            <p className="text-sm text-ink-muted">
              Avoid paid &ldquo;veterans claims services&rdquo; that charge a
              fee. By federal law, accredited VSOs cannot charge for filing
              initial claims. They do this work every day and are faster than
              filing on your own.
            </p>
          </Card>

          <Card tone="soft">
            <CardTitle>What you&rsquo;ll need to file</CardTitle>
            <ul className="space-y-2 text-[15px] text-ink-soft list-disc pl-5">
              <li>
                <strong>DD-214</strong> &mdash; Certificate of Release or
                Discharge from Active Duty. The single most important
                document. If you can&rsquo;t find it, request a free copy at{" "}
                <a
                  href="https://www.archives.gov/veterans"
                  className="text-primary-deep underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  archives.gov/veterans
                </a>{" "}
                (form SF-180, takes 2&ndash;4 weeks).
              </li>
              <li>
                <strong>Death certificate</strong> &mdash; one certified copy
                for each VA application.
              </li>
              <li>
                <strong>Itemized funeral bill</strong> &mdash; for the burial
                allowance reimbursement.
              </li>
              <li>
                <strong>Marriage certificate</strong> &mdash; if a surviving
                spouse is claiming.
              </li>
            </ul>
          </Card>

          <Card tone="soft">
            <CardTitle>If you&rsquo;re still planning the funeral</CardTitle>
            <p className="text-ink-soft mb-3">
              Decide about national cemetery burial <strong>before</strong>{" "}
              signing with a private cemetery. Once a private plot is
              purchased, you generally can&rsquo;t recover that money even if
              you later choose a national cemetery instead.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/decide" variant="secondary">
                Help me decide on service type →
              </LinkButton>
              <LinkButton href="/prep" variant="secondary">
                Arrangement prep kit →
              </LinkButton>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general guidance based on publicly available VA
            information. Eligibility decisions are made by the VA, not by us.
            Specific questions go to a Veterans Service Officer or a
            VA-accredited attorney.
          </p>
        </div>
      </section>
    </main>
  );
}
