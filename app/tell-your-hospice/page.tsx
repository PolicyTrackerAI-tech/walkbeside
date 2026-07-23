import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { CardEyebrow } from "@/components/ui/Card";
import { BRAND } from "@/lib/brand";
import { displayHospiceName } from "@/lib/hospice-display";
import { TellYourHospice } from "./TellYourHospice";

export const metadata: Metadata = {
  title: {
    absolute: `Tell your hospice about ${BRAND.name} — free for every family`,
  },
  description: `Ask your hospice to offer ${BRAND.name}'s free funeral-price help to every family it serves. A short note you send from your own email — ${BRAND.name} sends nothing automatically and contacts a hospice only when a family asks it to.`,
  alternates: { canonical: "/tell-your-hospice" },
};

/**
 * Loop #1's page: a family asks their own hospice to offer the tools. The
 * default path is the family's OWN email client (mailto with an empty
 * recipient); the optional form below is the consented founder-intro path.
 * Channel-survival: nothing on this page ever emails a hospice or a family —
 * see /api/partner/nominate for the only (internal) send.
 */
export default async function TellYourHospicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = (key: string) => {
    const v = sp[key];
    return typeof v === "string" ? v.slice(0, 160) : "";
  };
  // Finder-prefilled values arrive verbatim from the CMS directory —
  // display-case them; whatever ends up in the field is what the lead takes.
  const hospice = raw("hospice") ? displayHospiceName(raw("hospice")) : "";
  const city = raw("city") ? displayHospiceName(raw("city")) : "";
  const state = raw("state");

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>For hospice families</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mt-1 mb-4">
              Tell your hospice about {BRAND.name}
            </h1>
            <p className="text-ink-soft mb-3">
              If a hospice is caring for someone you love &mdash; or cared for
              them &mdash; you can ask them to offer {BRAND.name} to every
              family they serve. Below is a short note for your bereavement
              coordinator or social worker, already written.
            </p>
            <p className="text-ink-soft">
              It sends from your own email, in your own name &mdash; nothing
              on this page goes out from {BRAND.name}{" "}
              on its own. We reach out
              to a hospice only when a family asks us to below, and we contact
              you only if you check the box. None of this is required &mdash;
              everything here is already free for you, with or without a
              hospice.
            </p>
          </div>

          <TellYourHospice
            initialHospice={hospice}
            initialCity={city}
            initialState={state}
          />
        </div>
      </section>
    </main>
  );
}
