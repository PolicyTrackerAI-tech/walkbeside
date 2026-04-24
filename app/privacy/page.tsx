import Link from "next/link";
import { Brand, Footer } from "@/components/Brand";

export const metadata = {
  title: "Privacy Policy — Funerose",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link href="/" className="text-sm text-ink-muted hover:text-ink-soft">
            Home
          </Link>
        </div>
      </header>

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-6 text-ink-soft">
          <h1 className="font-serif text-3xl text-ink">Privacy Policy</h1>
          <p className="text-sm text-ink-muted">Last updated: April 2026</p>

          <p>
            This policy describes how Funerose collects, uses, and protects
            your information. We treat information you share with us &mdash;
            including anything you volunteer about a deceased person &mdash;
            as sensitive, even where health-privacy laws do not technically
            apply.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            1. We never sell your data
          </h2>
          <p>
            Funerose does not sell, rent, or trade your personal information
            or any information about the deceased to third parties. This is
            a commitment, not just a legal statement.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            2. What we collect
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Account information you provide: email, password (hashed), and
              optional name.
            </li>
            <li>
              Information you provide about the deceased and your family,
              such as zip code, service type, funeral home names, and
              details for obituary drafting.
            </li>
            <li>
              Submitted documents: photographed General Price Lists,
              contracts, and other files you upload for analysis.
            </li>
            <li>
              Communications you send to funeral homes through our advocate
              outreach feature, and replies we receive.
            </li>
            <li>
              Basic usage analytics (pages viewed, features used). We use
              privacy-respecting analytics and store city-level geography
              only, discarding full IP addresses.
            </li>
          </ul>

          <h2 className="font-serif text-xl text-ink pt-4">
            3. How we use it
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide the features you use (lookups, prep kit, advocate outreach, obituary drafts).</li>
            <li>To communicate with you about your account and your active cases.</li>
            <li>To improve the Service, including improving regional price benchmarks (always in aggregated form).</li>
            <li>To meet legal and accounting obligations.</li>
          </ul>

          <h2 className="font-serif text-xl text-ink pt-4">
            4. Advocate outreach &mdash; what funeral homes see
          </h2>
          <p>
            When you authorize our advocate outreach feature, the emails we
            send to funeral homes identify Funerose as the sender and name
            the family we represent (e.g., &ldquo;the Smith family&rdquo; or
            first name plus city). Funeral homes will see this identifying
            information about your family. Your email address is not shared
            with them unless you contact them directly after selecting one.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            5. Data retention and deletion
          </h2>
          <p>
            You can delete your account at any time from your dashboard. On
            deletion, we remove your personal information and
            case-identifying data within 30 days. We may retain aggregated
            and anonymized price benchmarks derived from your uploads.
            Certain records may be retained longer where required by law
            (e.g., financial records tied to a paid transaction).
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            6. Your rights
          </h2>
          <p>
            Wherever you live, you may request access to the personal
            information we hold about you, request correction, request
            deletion, or request a portable export. California and European
            residents have additional statutory rights under CCPA and GDPR,
            which we honor. Email privacy@funerose.com to exercise any
            right.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            7. Security
          </h2>
          <p>
            We use industry-standard safeguards: encryption in transit
            (TLS), encrypted storage at rest, access controls, and least-
            privilege access for our team. No system is perfect; if we
            learn of a breach affecting your information, we will notify
            you as required by law.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            8. Third-party services
          </h2>
          <p>
            We use Supabase (hosting, database, authentication), Stripe
            (payments), Resend (email delivery), and Anthropic
            (AI-generated text). These providers process limited data on
            our behalf under standard data processing terms. We do not
            send your data to advertising networks.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            9. Children
          </h2>
          <p>
            Funerose is not directed to children under 16. If we learn we
            have collected information from a child, we will delete it.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            10. Changes
          </h2>
          <p>
            We may update this policy. Material changes will be posted here
            with a new date and, where significant, announced by email.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            11. Contact
          </h2>
          <p>Privacy questions: privacy@funerose.com.</p>
        </article>
      </section>

      <Footer />
    </main>
  );
}
