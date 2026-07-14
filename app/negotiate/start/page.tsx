import type { Metadata } from "next";
import { requireSignedIn } from "@/lib/require-signed-in";
import { Wizard } from "./Wizard";

export const metadata: Metadata = {
  title: "Have us contact funeral homes — free",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Free to families — outreach is sent at no charge (dry_run until
  // OUTREACH_LIVE is enabled).
  //
  // Preserve the analyzer/decide prefill params (?zip/&svc/&home/&q) through
  // the sign-in redirect so a family who lands here signed out — including
  // via a new tab from an email-confirmation link, where the sessionStorage
  // handoff can't follow — still arrives prefilled.
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const key of ["zip", "svc", "home", "q", "ref"]) {
    const raw = sp[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) qs.set(key, value.slice(0, 120));
  }
  const suffix = qs.size > 0 ? `?${qs.toString()}` : "";
  await requireSignedIn(`/negotiate/start${suffix}`);
  return <Wizard />;
}
