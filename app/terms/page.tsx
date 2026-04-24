import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Terms",
  description:
    "The terms for using Funerose. Free tools are free. The flat $249 advocate fee only applies if you choose a funeral home we present.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backLabel="Home" />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-6 text-ink-soft">
          <h1 className="font-serif text-3xl text-ink">Terms of Service</h1>
          <p className="text-sm text-ink-muted">Last updated: April 2026</p>

          <p>
            These terms govern your use of Funerose (the &ldquo;Service&rdquo;),
            operated by Funerose Inc. (&ldquo;we,&rdquo; &ldquo;us&rdquo;). By
            using the Service you agree to these terms. If you do not agree,
            do not use the Service.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            1. What Funerose is &mdash; and is not
          </h2>
          <p>
            Funerose is a consumer-facing information and advocacy service
            built to help families navigate funeral arrangements and
            post-death administration. Funerose is <strong>not</strong> a
            funeral home, not a law firm, not a licensed financial advisor,
            and not a medical or mental-health provider. Nothing on the
            Service constitutes legal, financial, medical, or therapeutic
            advice. If you need advice of that kind, consult a licensed
            professional.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            2. Price estimates are informational
          </h2>
          <p>
            Price ranges, benchmarks, and deal comparisons shown in the
            Service are informational and are based on aggregated regional
            data, publicly available General Price Lists, and submissions
            from users. Actual prices vary by firm and by date. Funerose does
            not guarantee any specific savings, outcome, or price.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            3. The advocate outreach service
          </h2>
          <p>
            If you authorize our advocate outreach feature, Funerose will
            contact funeral homes on your behalf and identify itself as your
            authorized advocate. We do not impersonate you. We collect
            General Price Lists and quotes from homes that respond and
            present them to you for your decision. You make the final
            selection and contact the selected home directly. Funerose does
            not control how funeral homes respond, whether they respond, or
            whether they honor any quote they provide.
          </p>
          <p>
            The advocate fee is a flat $249, charged via Stripe only when you
            affirmatively select a funeral home that Funerose presented to
            you as part of this outreach. If you do not select a presented
            home, you are not charged. If the selected home refuses to
            honor its quoted price within 14 days of your selection, we will
            refund the fee upon request.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            4. Referrals and compensation
          </h2>
          <p>
            Where we show third-party referrals (for example, insurance,
            financing, or legal services) we disclose on the same screen if
            we receive compensation for the referral. Our recommendations
            are based on stated criteria, not on compensation amount. You
            are under no obligation to use any referral.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            5. Obituary, price list analyzer, and AI-generated content
          </h2>
          <p>
            AI-generated drafts (obituaries, line-item analyses, outreach
            emails) are drafts. You are responsible for reviewing them for
            accuracy before publishing or relying on them. Funerose is not
            liable for errors, omissions, or consequences arising from
            published obituaries or relied-upon analyses.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            6. Accounts and acceptable use
          </h2>
          <p>
            You agree not to misuse the Service, including by submitting
            false information, attempting to circumvent security, or using
            the advocate outreach feature for any purpose other than
            arranging services for a specific deceased person (or
            preplanning for yourself or an identified individual). You are
            responsible for activity under your account.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            7. Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by law, Funerose&rsquo;s total
            liability to you for any claim arising out of or relating to the
            Service is limited to the fees you paid to Funerose in the
            twelve months preceding the claim. Funerose is not liable for
            indirect, incidental, consequential, or punitive damages.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            8. Dispute resolution and arbitration
          </h2>
          <p>
            Any dispute between you and Funerose arising out of or relating
            to the Service shall be resolved by binding individual
            arbitration administered by a reputable arbitration provider in
            the United States, and not in court. You and Funerose waive the
            right to a jury trial and the right to participate in a class
            action. You may opt out of this arbitration clause within 30
            days of first accepting these terms by emailing
            legal@funerose.com.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            9. Indemnification
          </h2>
          <p>
            You agree to indemnify and hold Funerose harmless from claims
            arising out of your use of the Service in violation of these
            terms or in violation of applicable law.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            10. Changes
          </h2>
          <p>
            We may update these terms. Material changes will be posted on
            this page with an updated date. Continued use of the Service
            after changes take effect constitutes acceptance.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            11. Contact
          </h2>
          <p>
            Questions about these terms: hello@funerose.com.
          </p>
        </article>
      </section>

    </main>
  );
}
