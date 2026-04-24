/**
 * Unexpected-death-at-home crisis screen. Full commercial suppression:
 * no pricing, no funeral home listings, no comparison, no account prompts.
 * 988 is above the fold. Brand header intentionally omitted on this route.
 */
export function CrisisUnexpected() {
  return (
    <main className="flex-1 flex flex-col bg-bg">
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-10 space-y-7">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              You&rsquo;re not alone in this.
            </h1>
            <p className="text-lg text-ink-soft">
              The first responders will take one to four hours. While
              they&rsquo;re there, you don&rsquo;t have to do anything except
              answer their questions. We&rsquo;re here when you&rsquo;re ready
              &mdash; we&rsquo;ve saved your place.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-primary-deep bg-primary-soft p-6 space-y-3">
            <h2 className="font-serif text-xl text-primary-deep">
              If you&rsquo;re struggling right now
            </h2>
            <p className="text-ink">
              <a
                href="tel:988"
                className="font-semibold text-primary-deep underline underline-offset-2"
              >
                988
              </a>{" "}
              &mdash; call or text, 24/7, free, confidential.
            </p>
            <p className="text-ink-soft">
              This is a moment many people don&rsquo;t get through alone. Reach
              out.
            </p>
          </div>

          <ol className="space-y-5">
            <li className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-ink-muted text-sm font-semibold">1.</span>
                <h3 className="font-serif text-xl text-ink">
                  Call 911 if you haven&rsquo;t.
                </h3>
              </div>
              <p className="text-ink-soft">
                A medical professional has to legally pronounce the death.
                Police and possibly a coroner will come. That is procedural in
                any unexpected death &mdash; it does not mean anything is
                wrong.
              </p>
            </li>
            <li className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-ink-muted text-sm font-semibold">2.</span>
                <h3 className="font-serif text-xl text-ink">
                  You are not in trouble.
                </h3>
              </div>
              <p className="text-ink-soft">
                First responders will ask questions. Answering honestly is the
                fastest way through. You do not need to make any decisions
                about funeral homes, paperwork, or family notifications while
                they are there.
              </p>
            </li>
            <li className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-ink-muted text-sm font-semibold">3.</span>
                <h3 className="font-serif text-xl text-ink">
                  There is nothing you have to do on the internet right now.
                </h3>
              </div>
              <p className="text-ink-soft">
                No calls. No forms. No funeral home decisions. Those can wait
                hours or days &mdash; not minutes.
              </p>
            </li>
          </ol>

          <div className="rounded-2xl border border-border bg-surface-soft p-6 space-y-2">
            <h2 className="font-serif text-xl text-ink">
              We&rsquo;ll be here whenever you&rsquo;re ready.
            </h2>
            <p className="text-ink-soft">
              Nothing on this page expires. Close the tab, put the phone down,
              sit with someone. Come back when the house is quiet.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
