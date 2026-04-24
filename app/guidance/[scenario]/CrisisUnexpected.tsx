import Link from "next/link";

/**
 * Unexpected-death-at-home crisis screen. Full commercial suppression:
 * no pricing, no funeral home listings, no comparison, no account prompts.
 * Includes 988 and explicit permission to leave.
 */
export function CrisisUnexpected() {
  return (
    <main className="flex-1 flex flex-col bg-bg">
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              If this just happened
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              You&rsquo;re not in trouble.
            </h1>
            <p className="text-lg text-ink-soft">
              An unexpected death at home means police and possibly a coroner
              will come. That is how every unexpected death is handled. It is
              procedure &mdash; not an accusation.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
            <h2 className="font-serif text-xl text-ink">
              Right now, in this order
            </h2>
            <ol className="space-y-3 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">Call 911</strong> if you haven&rsquo;t.
                A medical professional has to legally pronounce the death.
              </li>
              <li>
                <strong className="text-ink">Do not move anything</strong> until
                first responders arrive.
              </li>
              <li>
                <strong className="text-ink">Stay with someone</strong> if you
                can. If you&rsquo;re alone, call one person.
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border-2 border-primary-deep bg-primary-soft p-6 space-y-3">
            <h2 className="font-serif text-xl text-primary-deep">
              If you need someone to talk to
            </h2>
            <p className="text-ink-soft">
              Sudden loss can hit hard and fast. If you&rsquo;re in crisis
              yourself, these lines are open right now.
            </p>
            <ul className="space-y-2 text-ink">
              <li>
                <a
                  href="tel:988"
                  className="font-semibold text-primary-deep underline underline-offset-2"
                >
                  988
                </a>{" "}
                &mdash; Suicide &amp; Crisis Lifeline (call or text).
              </li>
              <li>
                <a
                  href="sms:741741?&body=HOME"
                  className="font-semibold text-primary-deep underline underline-offset-2"
                >
                  Text HOME to 741741
                </a>{" "}
                &mdash; Crisis Text Line.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface-soft p-6 space-y-2">
            <h2 className="font-serif text-xl text-ink">
              You don&rsquo;t need to do anything on this site right now.
            </h2>
            <p className="text-ink-soft">
              We&rsquo;ll be here when you&rsquo;re ready. Close this tab, put the
              phone down, sit with someone. Come back when the house is quiet.
            </p>
          </div>

          <div className="pt-4 border-t border-border text-sm text-ink-muted">
            <p className="mb-3">
              When you&rsquo;re ready &mdash; hours from now, tomorrow, next
              week &mdash; we&rsquo;ll walk through what comes next.
            </p>
            <Link
              href="/where"
              className="text-ink-soft hover:text-ink underline-offset-2 hover:underline"
            >
              ← Back
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
