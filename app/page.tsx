import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Brand } from "@/components/Brand";

/**
 * Screen 1 — Crisis entry.
 * One message. One button. Nothing else.
 */
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="px-5 pt-6">
        <Brand />
      </div>

      <section className="flex-1 flex items-center">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl leading-tight text-ink mb-6">
            <span className="block whitespace-nowrap">
              Someone important has died.
            </span>
            <span className="block text-primary-deep">
              You&rsquo;re not alone.
            </span>
          </h1>
          <p className="text-lg text-ink-soft max-w-md mx-auto mb-10">
            Take a breath. We&rsquo;ll walk through this with you, one step at a
            time. The first one matters more than you think.
          </p>

          <LinkButton href="/where" size="lg" className="w-full sm:w-auto">
            Get started — it&rsquo;s free
          </LinkButton>

          <p className="mt-10 text-sm text-ink-muted">
            Built by a licensed funeral director to protect families like yours.
          </p>

          <p className="mt-2 text-xs text-ink-muted">
            <Link href="/dashboard" className="underline-offset-2 hover:underline">
              Already have an account? Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
