import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { requireAdminPage } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * The founder's desk index (audit A9-04): every admin tool, one page —
 * previously nine memorized URLs with no cross-links. Same session gate as
 * every /admin tool; each destination re-checks it independently.
 */
const TOOLS: { href: string; title: string; blurb: string }[] = [
  {
    href: "/admin/ingest-gpl",
    title: "GPL ingest",
    blurb:
      "Paste or photograph a General Price List → parse → review → save to the benchmark feed. The data moat's front door (gpl-harvest/README.md is the runbook).",
  },
  {
    href: "/admin/benchmarks",
    title: "Benchmark promotion",
    blurb:
      "Review consented feeds and promote regional benchmarks (n≥5 re-checked server-side). The only write path to the verified tier.",
  },
  {
    href: "/admin/outcomes",
    title: "Outcomes desk",
    blurb:
      "Every case: chosen home, negotiated vs paid, satisfaction, savings. Headline totals exclude demo orgs. Tag cases to partners here.",
  },
  {
    href: "/admin/partners",
    title: "Partner desk",
    blurb:
      "Approve applications (sends the real onboarding email), pause/archive, assign billing tiers, triage leads (mark handled).",
  },
  {
    href: "/admin/vetting",
    title: "Directory vetting",
    blurb:
      "Vet funeral homes into the contactable directory (active + vetted + email). The outreach gate's human half.",
  },
  {
    href: "/admin/outreach-preview",
    title: "Outreach preview",
    blurb:
      "Dry renders of the outreach + selection emails against a placeholder home. Nothing sends from here.",
  },
  {
    href: "/admin/messages",
    title: "Case messages",
    blurb: "The founder view of family↔home relay threads.",
  },
  {
    href: "/admin/ai-costs",
    title: "AI costs",
    blurb: "api_cost_events ledger — spend by feature and day.",
  },
];

export default async function AdminIndexPage() {
  await requireAdminPage("/admin");

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-5">
          <div>
            <CardEyebrow>Admin</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">The desk.</h1>
            <p className="text-ink-soft mt-2 text-sm">
              Every founder tool in one place. All of these read family data
              through the service role — treat every screen here as private.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="no-underline"
              >
                <Card className="h-full hover:border-primary transition-colors">
                  <div className="font-medium text-ink">{t.title}</div>
                  <p className="text-xs text-ink-soft mt-1">{t.blurb}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
