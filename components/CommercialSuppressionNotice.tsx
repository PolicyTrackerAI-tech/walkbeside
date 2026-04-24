import Link from "next/link";

/**
 * Soft interstitial shown on /prices and /negotiate when the commercial
 * suppression cookie is active (user recently visited /guidance/home-unexpected).
 * Respects user agency: "Go anyway" clears the cookie and proceeds.
 */
export function CommercialSuppressionNotice({ returnTo }: { returnTo: string }) {
  return (
    <main className="flex-1 flex flex-col bg-bg">
      <section className="flex-1 flex items-center">
        <div className="max-w-xl mx-auto w-full px-5 py-16 space-y-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight">
            We&rsquo;ve saved your place.
          </h1>
          <p className="text-lg text-ink-soft">
            When you&rsquo;re ready, the pricing tool will be here. There&rsquo;s
            nothing you have to do right now.
          </p>
          <div className="rounded-2xl border-2 border-primary-deep bg-primary-soft p-6 space-y-2">
            <p className="text-ink">
              <a
                href="tel:988"
                className="font-semibold text-primary-deep underline underline-offset-2"
              >
                988
              </a>{" "}
              &mdash; call or text, 24/7, free, confidential.
            </p>
            <p className="text-ink-soft text-sm">
              If you&rsquo;re struggling right now, reach out.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
            <Link
              href="/guidance/home-unexpected"
              className="text-ink-soft hover:text-ink underline-offset-2 hover:underline"
            >
              ← Back to guidance
            </Link>
            <span className="hidden sm:inline text-ink-muted">&middot;</span>
            <form method="POST" action="/api/suppression/clear">
              <input type="hidden" name="next" value={returnTo} />
              <button
                type="submit"
                className="text-ink-muted hover:text-ink-soft underline-offset-2 hover:underline text-sm"
              >
                Go anyway
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
