import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { HelpFooter } from "@/components/HelpFooter";
import { requirePaid } from "@/lib/require-paid";
import { STATE_GUIDES } from "@/lib/probate-by-state";
import { EstateStatePicker } from "./EstateStatePicker";

export const metadata: Metadata = {
  title: "Estate settlement — start with your state",
  description:
    "Probate basics by state, the small-estate threshold, when you need an attorney. Pick your state to see the rules.",
};

export default async function EstatePage() {
  await requirePaid("/estate");

  const detailedSlugs = STATE_GUIDES.map((s) => s.slug);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Estate settlement
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-3">
              Settling someone’s affairs.
            </h1>
            <p className="text-lg text-ink-soft">
              Most families finish in 6 to 18 months. None of this is
              urgent. One thing at a time.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-primary bg-primary-soft p-6">
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-2">
              Start here
            </p>
            <h2 className="font-serif text-xl text-ink mb-3">
              Pick the state where they lived.
            </h2>
            <p className="text-sm text-ink-soft mb-4">
              Probate rules vary state to state — small-estate threshold,
              whether you need an attorney, timelines, forms.
            </p>
            <EstateStatePicker detailedSlugs={detailedSlugs} />
            <p className="text-xs text-ink-muted mt-3">
              25 states have detailed guides. The rest get general
              guidance plus a route to a local attorney.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-serif text-xl text-ink mb-3">
              The single highest-leverage decision.
            </h2>
            <p className="text-ink-soft">
              Almost every estate benefits from one hour with a local
              estate attorney ($150 to $400). They tell you whether
              probate is required, what forms you need, and where the
              landmines are. Skip this only if the estate is very
              small and very simple.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-serif text-xl text-ink mb-3">
              Probate is usually NOT required when:
            </h2>
            <ul className="space-y-2 text-ink-soft list-disc pl-5">
              <li>Assets are held in a revocable living trust.</li>
              <li>
                Accounts have a named beneficiary (life insurance, IRA,
                401(k), payable-on-death bank account).
              </li>
              <li>
                Property is held jointly with right of survivorship
                (most married couples’ homes and bank accounts).
              </li>
              <li>
                The estate is small (most states have a small-estate
                threshold of $50,000 to $200,000).
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-serif text-xl text-ink mb-3">
              Three things most families miss.
            </h2>
            <ul className="space-y-3 text-ink-soft">
              <li>
                <strong className="text-ink">Unclaimed property.</strong>{" "}
                Free money sitting in state databases — old accounts,
                uncashed checks, safe-deposit-box contents. Search
                every state the deceased ever lived in at{" "}
                <a
                  href="https://www.missingmoney.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  missingmoney.com
                </a>
                . Most families find a few hundred to a few thousand
                dollars.
              </li>
              <li>
                <strong className="text-ink">Inherited retirement accounts.</strong>{" "}
                Under the SECURE Act, most non-spouse inheritors of
                an IRA or 401(k) must drain it within 10 years.
                Getting this wrong triggers a 50% penalty. Talk to a
                CPA before moving the money.
              </li>
              <li>
                <strong className="text-ink">Digital accounts.</strong>{" "}
                Email, password vaults, photos, social media. Most
                require a court order to access without a pre-set
                legacy contact. We have a full guide on this —{" "}
                <a
                  href="/digital-legacy"
                  className="text-primary-deep underline"
                >
                  digital-legacy walkthrough
                </a>
                .
              </li>
            </ul>
          </div>

          <p className="text-xs text-ink-muted">
            This page is general consumer guidance, not legal, tax, or
            financial advice. Rules vary by state. For a binding
            answer, talk to a licensed estate attorney or CPA in your
            state.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
