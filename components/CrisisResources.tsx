/**
 * Suicide & Crisis Lifeline card. Shown on scenarios where the survivor
 * risk is elevated — unexpected home deaths and deaths outside the home.
 * Not shown on expected deaths (hospital, home-expected) where the framing
 * is different.
 */
export function CrisisResources() {
  return (
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
        This is a moment many people don&rsquo;t get through alone. Reach out.
      </p>
    </div>
  );
}
