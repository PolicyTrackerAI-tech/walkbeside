"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HelpFooter } from "@/components/HelpFooter";

/**
 * Error boundary for the money flow. Beyond the generic message, it reassures
 * the family that a payment already made is safe — the single thing they'd
 * panic about if a page broke mid-flow.
 */
export default function NegotiateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[negotiate-error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col">
      <section className="flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-16 text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
            Something went wrong
          </p>
          <h1 className="font-serif text-3xl text-ink mb-4">
            We hit a snag loading this.
          </h1>
          <p className="text-ink-soft mb-3">Try again in a moment.</p>
          <p className="text-ink-soft mb-8">
            <strong className="text-ink">
              If you already paid, your $49 is safe
            </strong>{" "}
            and your requests still go out &mdash; nothing is lost. Call us and
            we&rsquo;ll confirm where things stand.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center font-semibold rounded-2xl bg-primary-deep text-on-primary hover:bg-ink px-7 py-4 text-base min-h-11"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center font-semibold rounded-2xl bg-surface text-ink border border-border hover:border-primary hover:text-primary-deep px-7 py-4 text-base min-h-11 no-underline"
            >
              Go to dashboard
            </Link>
          </div>
          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
