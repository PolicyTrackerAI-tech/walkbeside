import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS: { href: string; label: string }[] = [
  { href: "/where", label: "Start here — what to do first" },
  { href: "/prices", label: "Look up fair funeral prices" },
  { href: "/guides", label: "Read the guides" },
  { href: "/prep", label: "The prep kit" },
];

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-16 text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
            404
          </p>
          <h1 className="font-serif text-3xl text-ink mb-4">
            We couldn&rsquo;t find that page.
          </h1>
          <p className="text-ink-soft mb-8">
            The link may be old or mistyped. Here are good places to pick back up.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <LinkButton href="/where">Start here</LinkButton>
            <LinkButton href="/" variant="secondary">
              Home
            </LinkButton>
          </div>
          <ul className="space-y-2 text-left inline-block">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-primary-deep underline-offset-2 hover:underline"
                >
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
