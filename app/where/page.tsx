import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Where are you in this?",
  description:
    "Pick the path that fits. We help families before, during, and after a death.",
};

/**
 * Screen 2 — Three high-level paths. Kept intentionally short.
 * The "it just happened" path drills into where on the next screen
 * so this page stays uncluttered for a crying user.
 */
const PATHS: {
  href: string;
  title: string;
  sub: string;
  emphasis?: boolean;
}[] = [
  {
    href: "/where/just-happened",
    title: "It just happened",
    sub: "Death in the last few hours or days. We’ll walk through the next 72 hours.",
    emphasis: true,
  },
  {
    href: "/decide",
    title: "We’re arranging the funeral",
    sub: "Decisions need to be made in the next few days. We help pick the service and avoid being overcharged.",
  },
  {
    href: "/next-30-days",
    title: "The funeral already happened",
    sub: "Now the paperwork begins — death certificates, Social Security, accounts to close, estate. We walk through it in order.",
  },
  {
    href: "/planning",
    title: "I’m planning ahead",
    sub: "Nobody has died. Learning what funerals should cost and how to set things up before the day comes.",
  },
];

export default function WherePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Where are you in this?
          </h1>
          <p className="text-ink-soft mb-8">
            Pick the one that fits best. We help at every stage.
          </p>

          <div className="grid gap-4">
            {PATHS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className={`block rounded-2xl p-6 transition-colors group ${
                  p.emphasis
                    ? "bg-primary-soft border-2 border-primary hover:border-primary-deep"
                    : "bg-surface border border-border hover:border-primary hover:bg-primary-soft"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-serif text-xl text-ink group-hover:text-primary-deep mb-1.5">
                      {p.title}
                    </div>
                    <div className="text-sm text-ink-soft">{p.sub}</div>
                  </div>
                  <div className="text-primary text-2xl pt-1" aria-hidden>
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
