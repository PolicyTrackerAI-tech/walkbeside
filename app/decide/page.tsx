import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { HelpFooter } from "@/components/HelpFooter";
import {
  PlanningAheadBanner,
  isAheadMode,
} from "@/components/PlanningAheadBanner";
import { DecideFlow } from "./DecideFlow";

export const metadata: Metadata = {
  title: "Let's figure out what kind of service fits.",
  description:
    "A short, no-pressure walkthrough that recommends the type of service that fits your faith, your budget, and what you actually want.",
  alternates: { canonical: "/decide" },
};

export default async function DecidePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const aheadMode = isAheadMode(await searchParams);
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/planning" defaultLabel="← Planning" />} />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Let&rsquo;s figure out what kind of service fits.
          </h1>
          <p className="text-ink-soft mb-8">
            Five short questions. We&rsquo;ll recommend a type of service so you
            can move on to comparing prices. No account, nothing saved.
          </p>

          {aheadMode && (
            <div className="mb-8">
              <PlanningAheadBanner note="Deciding the type of service now — while nothing is urgent — is exactly the right order. Answer for the person you&rsquo;re planning for." />
            </div>
          )}

          <DecideFlow aheadMode={aheadMode} />

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
