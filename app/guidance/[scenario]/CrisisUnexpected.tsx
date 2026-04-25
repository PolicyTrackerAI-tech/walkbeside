import { SiteHeader } from "@/components/SiteHeader";
import { CrisisResources } from "@/components/CrisisResources";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkButton } from "@/components/ui/Button";

const schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What to do after an unexpected death at home",
  description:
    "You're not in trouble. Here's what happens when 911 comes, and what you can and can't do while you wait.",
  datePublished: "2026-01-01",
  author: {
    "@type": "Organization",
    name: "Honest Funeral",
    url: "https://honestfuneral.co",
  },
  publisher: {
    "@type": "Organization",
    name: "Honest Funeral",
    url: "https://honestfuneral.co",
  },
};

/**
 * Unexpected-death-at-home crisis screen. Full commercial suppression:
 * no pricing, no funeral home listings, no comparison, no account prompts.
 * 988 is above the fold. Minimal brand header so the wordmark click-back
 * to home is the one escape hatch a crisis user can rely on without a
 * busy nav distracting them.
 */
export function CrisisUnexpected() {
  return (
    <main className="flex-1 flex flex-col bg-bg">
      <JsonLd data={schema} />
      <SiteHeader showBack={false} />
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

          <blockquote className="my-8 border-l-4 border-primary-deep pl-5 py-1 text-ink font-serif text-xl leading-snug">
            &ldquo;You don&rsquo;t have to figure this out alone, and you
            don&rsquo;t have to figure it out right now.&rdquo;
          </blockquote>

          <CrisisResources />

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

          <div className="rounded-2xl border border-border bg-surface-soft p-6 space-y-3">
            <h2 className="font-serif text-xl text-ink">
              We&rsquo;ll be here when you&rsquo;re ready.
            </h2>
            <p className="text-ink-soft">
              First responders will take one to four hours. During that time,
              you don&rsquo;t have to do anything on this site. We&rsquo;ve
              saved your place &mdash; everything you see here will be here
              when you come back.
            </p>
            <p className="text-ink-soft">
              If you want something to do with your hands while you wait, you
              could read about what comes after:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <LinkButton href="/rights" variant="secondary">
                The rights families have that most never hear about →
              </LinkButton>
              <LinkButton href="/after" variant="secondary">
                The paperwork that will matter in the next week →
              </LinkButton>
            </div>
            <p className="text-ink-soft text-sm pt-1">
              None of it is urgent. Come back when you&rsquo;re ready.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
