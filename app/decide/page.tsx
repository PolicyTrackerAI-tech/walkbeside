import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { DecideFlow } from "./DecideFlow";

export const metadata: Metadata = {
  title: "What kind of service fits?",
  description:
    "A short, no-pressure walkthrough that recommends the type of service that fits your faith, your budget, and what you actually want.",
};

export default function DecidePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/planning" defaultLabel="← Planning" />} />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            What kind of service fits?
          </h1>
          <p className="text-ink-soft mb-8">
            Four short questions. We&rsquo;ll recommend a type of service so you
            can move on to comparing prices. No account, nothing saved.
          </p>

          <DecideFlow />
        </div>
      </section>
    </main>
  );
}
