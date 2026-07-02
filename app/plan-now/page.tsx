import type { Metadata } from "next";
import { PlanNow } from "./PlanNow";

export const metadata: Metadata = {
  title: "Make the plan now, calmly — before the first call | Honest Funeral",
  description:
    "A 20-minute guided plan for families on hospice: understand the options, see what's fair to pay near you, capture what matters, find the benefits you're owed, and decide who makes the first call — before the moment arrives. Free, private (nothing leaves your device), and neutral: no money from funeral homes or insurers.",
  alternates: { canonical: "/plan-now" },
};

function titleize(slug: string): string {
  const t = slug.replace(/[-_]+/g, " ").trim();
  return t ? t.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}

/**
 * The admission-week flow — the one-sitting plan (research opportunity #1).
 * `?ref=` shows the referring hospice's name, same convention as /analyzer:
 * cosmetic co-branding for a family-initiated visit; nothing is transmitted
 * back to the hospice, and the guarded decode can never crash the page.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.ref ?? sp.for ?? sp.partner;
  const ref = Array.isArray(raw) ? raw[0] : raw;
  let partner: string | undefined;
  if (ref) {
    let decoded = ref;
    try {
      decoded = decodeURIComponent(ref);
    } catch {
      // keep the raw value
    }
    partner = titleize(decoded).slice(0, 60) || undefined;
  }
  return <PlanNow partner={partner} />;
}
