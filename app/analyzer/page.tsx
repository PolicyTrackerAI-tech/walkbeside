import type { Metadata } from "next";
import { Analyzer } from "./Analyzer";

export const metadata: Metadata = {
  title: "Price-list analyzer",
};

function titleize(slug: string): string {
  const t = slug.replace(/[-_]+/g, " ").trim();
  return t ? t.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}

/**
 * `?ref=` / `?for=` lets a partner (a hospice, an employer's HR team) hand
 * families a co-branded link — "provided free by <Name>". The proof report at
 * /partner/[code] is the other half of that relationship; this is the
 * family-facing entry. Purely cosmetic — the checker itself is identical.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.ref ?? sp.for ?? sp.partner;
  const ref = Array.isArray(raw) ? raw[0] : raw;
  const partner = ref ? titleize(decodeURIComponent(ref)).slice(0, 60) : undefined;
  return <Analyzer partner={partner || undefined} />;
}
