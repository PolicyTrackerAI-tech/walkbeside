"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HelpFooter } from "@/components/HelpFooter";

/**
 * Root error boundary. Catches runtime errors thrown anywhere below the root
 * layout and shows a calm, on-brand page instead of Next's raw error screen —
 * because the person seeing it is likely grieving and at their worst moment.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for debugging (Vercel client logs / browser console). The
    // digest correlates to the server-side stack without exposing it here.
    console.error("[app-error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col">
      <section className="flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-16 text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
            Something went wrong
          </p>
          <h1 className="font-serif text-3xl text-ink mb-4">
            This page hit a snag.
          </h1>
          <p className="text-ink-soft mb-8">
            It&rsquo;s on our end, not anything you did. Try again, or head back
            home. If it keeps happening, call us &mdash; a real person will help.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center font-semibold rounded-2xl bg-primary-deep text-on-primary hover:bg-ink px-7 py-4 text-base min-h-11"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center font-semibold rounded-2xl bg-surface text-ink border border-border hover:border-primary hover:text-primary-deep px-7 py-4 text-base min-h-11 no-underline"
            >
              Go home
            </Link>
          </div>
          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
