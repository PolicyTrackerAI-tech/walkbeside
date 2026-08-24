import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";

export const metadata = {
  title: "Privacy",
  description:
    "How Honest Funeral Co. handles your data. Short version: we never sell it, we never share your details with funeral homes without your say-so, we only ever give a hospice or employer partner anonymous totals, and we delete your account data when you ask.",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-6 text-ink-soft">
          <h1 className="font-serif text-3xl text-ink">Privacy Policy</h1>
          <p className="text-sm text-ink-muted">Last updated: August 2026</p>

          <p>
            This policy describes how Honest Funeral Co. collects, uses, and
            protects your information. We wrote it in plain language on purpose,
            because the people who read it are often in the middle of a loss. We
            treat anything you share with us, including anything you tell us
            about a person who has died, as sensitive, even where health-privacy
            laws do not technically apply.
          </p>
          <p className="text-sm text-ink-muted">
            This describes our current practices. It is not a substitute for
            legal advice, and we update it as the product changes.
          </p>

          <div className="rounded-2xl border border-border bg-surface-soft px-5 py-4 space-y-2">
            <p className="text-ink font-medium">The short version</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>We never sell your data, and we run no advertising.</li>
              <li>
                Families never pay us; any revenue we earn comes from the
                hospices and employers we partner with.
              </li>
              <li>
                A hospice or employer partner only ever sees anonymous totals,
                never your name, your details, your prices, or the funeral home
                you chose.
              </li>
              <li>
                Using a partner&rsquo;s link never changes which funeral homes
                we show you.
              </li>
              <li>
                You can check a quote without an account, and an anonymous check
                saves nothing about you.
              </li>
              <li>You can delete your account data at any time.</li>
            </ul>
          </div>

          <h2 className="font-serif text-xl text-ink pt-4">
            1. We never sell your data
          </h2>
          <p>
            Honest Funeral does not sell, rent, or trade your personal
            information, or any information about the person who died, to anyone.
            We run no advertising and use no ad-tracking networks. This is a
            commitment, not just a legal statement.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">2. What we collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-ink">Account:</span> your email address and a
              password (which we store only in hashed form), or, if you choose to
              sign in with Google, the email address and name Google shares with
              us.
            </li>
            <li>
              <span className="text-ink">Quote checks:</span> when you paste or
              photograph a price list, we read the line items from it. If you are
              signed in, we save the resulting analysis to your account (the
              extracted text with contact details stripped out, the totals, the
              line items, and the ZIP code). If you are not signed in, we save
              nothing about you or your document.
            </li>
            <li>
              <span className="text-ink">Photos:</span> a photo you take of a
              price list is shrunk on your own device, sent to our AI provider to
              read the text, and then discarded. We never store the photo.
            </li>
            <li>
              <span className="text-ink">The funeral-home outreach:</span> if you
              use the feature that contacts funeral homes for you, we collect what
              you enter to run it, such as the ZIP code, the type of service, your
              name, the date of death, and any notes you add, plus any replies the
              homes send back.
            </li>
            <li>
              <span className="text-ink">Reminders you opt into:</span> if you ask
              for text-message reminders, we store the phone number you give us
              and your opt-in.
            </li>
            <li>
              <span className="text-ink">Guides and drafts:</span> if you use the
              obituary helper while signed in, we save your inputs and the draft
              to your account. Some tools, like the eulogy helper and the
              &ldquo;decide what kind of service fits&rdquo; walkthrough, keep
              your answers only on your own device unless you choose to save or
              share them.
            </li>
            <li>
              <span className="text-ink">Email sign-ups:</span> if you ask us to
              email you a guide or planning cheat-sheet, we store your email
              address, the page you asked from, and a one-way hashed form of your
              IP address to prevent abuse.
            </li>
            <li>
              <span className="text-ink">Basic usage analytics:</span> pages
              viewed and features used, in aggregate. We use a privacy-respecting
              analytics service that does not use tracking cookies; it records
              coarse, city-level geography rather than storing your full IP
              address.
            </li>
          </ul>

          <h2 className="font-serif text-xl text-ink pt-4">3. How we use it</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide the features you use.</li>
            <li>To communicate with you about your account and any active case.</li>
            <li>
              To improve our regional price benchmarks, always in aggregated
              form, and only using prices you have chosen to contribute (see the
              next section).
            </li>
            <li>To meet legal and accounting obligations.</li>
          </ul>

          <h2 className="font-serif text-xl text-ink pt-4">
            4. Contributing to the public price data (optional)
          </h2>
          <p>
            When you check a quote, you will see an optional checkbox that lets
            you add your de-identified prices to our public fair-price data. It
            is <strong className="text-ink">unchecked by default</strong>, and we
            never assume your consent. If you leave it unchecked, your prices are
            not added to that public dataset. To be clear about what the checkbox
            does and does not do: it controls only whether your prices join the
            public benchmarks. If you are signed in, the check itself is still
            saved to your own account history either way, so you can come back to
            it.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            5. When you arrive through a hospice or employer
          </h2>
          <p>
            Our tools are free to you, with or without a partner link. Our
            revenue model is institutional: any revenue we earn comes from
            hospices and employers that make these tools available to the
            families and people they serve &mdash; never from you and never
            from funeral homes. If one of them gave you a link or a code, here
            is exactly how that works.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="text-ink">The code is just a label.</span> When you
              arrive through a partner&rsquo;s link, we record that your visit
              came through their program, using a simple referral code. It carries
              no medical or clinical information. The hospice or employer does not
              send us anything about you. You bring the code; they transmit
              nothing.
            </li>
            <li>
              <span className="text-ink">
                It never changes what we show you.
              </span>{" "}
              The referral code is a reporting label only. It never affects which
              funeral homes we show you or the order they appear in. We answer to
              you, and we present neutral options for you to choose from.
            </li>
            <li>
              <span className="text-ink">
                Partners only ever see anonymous totals.
              </span>{" "}
              What a hospice or employer can see about their program is limited to
              aggregate, de-identified statistics: counts and ranges. They never
              see your name, your contact details, your location, your prices, the
              funeral home you chose, or anything you wrote. Dollar and
              satisfaction figures are withheld entirely until at least five
              families in their program have completed cases.
            </li>
            <li>
              <span className="text-ink">In plain terms:</span> a partner can
              see how many people used their link, but a small count shows
              only as &ldquo;fewer than five,&rdquo; never as an exact number.
              A partner who shared a link with just one family could still
              tell that the link was used at all, so we ask partners not to
              make per-family links &mdash; and either way, they never see who
              you are, what you paid, or what you chose.
            </li>
          </ul>

          <h2 className="font-serif text-xl text-ink pt-4">
            6. Sharing a plan with your family
          </h2>
          <p>
            Some tools let you create a private link to hand your progress to a
            family member (for example, &ldquo;save this for my daughter&rdquo;).
            When you do, we store the snapshot you chose to share so the link can
            open it. Anyone who has the link can view what you shared, so only
            send it to people you trust. These links are anonymous and are not
            tied to your account, and the &ldquo;save for my daughter&rdquo;
            snapshot expires on its own after seven days.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            7. The funeral-home outreach: what funeral homes see
          </h2>
          <p>
            If you authorize the funeral-home outreach feature, the emails we send
            to funeral homes identify Honest Funeral as the sender and name the
            family we represent (for example, &ldquo;the Smith family&rdquo; or a
            first name plus city). Funeral homes see that identifying label about
            your family.
          </p>
          <p>
            <strong className="text-ink">
              Your email address and direct contact information are not shared
              with funeral homes through our service.
            </strong>{" "}
            Any pre-meeting questions and scheduling between you and a home you
            select are relayed through our in-app messaging, so only the contents
            you send, and the home&rsquo;s replies, are exchanged. When you attend
            the in-person arrangement meeting, the funeral home collects your
            contact information directly from you for their own records. Honest
            Funeral is not a funeral home or funeral director, does not arrange
            funerals or handle remains, and does not sign anything for you. You
            contract directly with the funeral home you choose.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            8. How we use AI
          </h2>
          <p>
            Some features use AI to read a price list, draft an obituary, or help
            parse a reply. To do that, the text or photo involved is sent to our
            AI provider, Anthropic, to process. We do not store the prompts, the
            photos, or the AI&rsquo;s responses. We keep only the model name and
            usage counts, so we can manage costs. AI drafts are drafts: please
            review anything it produces before you rely on it.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            9. Cookies and similar technology
          </h2>
          <p>
            We keep cookies to a minimum and do not use advertising or
            cross-site-tracking cookies. We use a sign-in cookie to keep you
            logged in. Our analytics does not set tracking cookies. If you read
            certain sensitive guidance pages, we set a short-lived cookie (about
            four hours) so we can avoid interrupting you with commercial prompts
            right afterward. We use your IP address only briefly, to prevent
            abuse of our forms, and we do not store it, except for the one-way
            hashed form saved with an email sign-up.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            10. Data retention and deletion
          </h2>
          <p>
            You can delete your account at any time from your account settings.
            Doing so immediately and permanently removes the data tied to your
            account, including your profile, saved quote checks, negotiations and
            messages, certificate trackers, and obituary drafts. A few things sit
            outside your account and are not removed by an account deletion:
            aggregated, de-identified price benchmarks (which no longer identify
            you), and any anonymous family-sharing links you created (which expire
            on their own). We may keep certain records longer where the law
            requires it. Copies held by the services that send our email and text
            messages, and routine encrypted backups, age out over time.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">11. Your rights</h2>
          <p>
            Wherever you live, you may ask us for a copy of the personal
            information we hold about you, ask us to correct it, ask us to delete
            it, or ask for a portable export. California and European residents
            have additional rights under the CCPA and GDPR, which we honor. Email{" "}
            <a
              href="mailto:privacy@honestfuneral.co"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              privacy@honestfuneral.co
            </a>{" "}
            to exercise any right.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">12. Security</h2>
          <p>
            We use standard safeguards: encryption in transit (TLS), encrypted
            storage, and access controls that limit our team to what they need.
            Information saved to your account is protected by database rules that
            tie it to your account so other users cannot read it. No system is
            perfect. If we learn of a breach affecting your information, we will
            notify you as required by law.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">
            13. Services we rely on
          </h2>
          <p>
            We use a small set of providers to run the service: Supabase
            (database, sign-in, and storage), Vercel (web hosting and the
            privacy-respecting analytics above), Anthropic (the AI that reads text
            and drafts content), Resend (sending our email), Postmark (receiving
            funeral-home replies), and Twilio (sending the text reminders you opt
            into). We also use Stripe for institutional billing only &mdash; the
            hospices and employers we partner with, never families &mdash; and
            because families never pay us, Stripe does not process any family
            payment information. These providers handle limited data on our
            behalf under standard data-processing terms. We do not send your data
            to advertising networks.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">14. Children</h2>
          <p>
            Honest Funeral is not directed to children under 16. If we learn we
            have collected information from a child, we will delete it.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">15. Changes</h2>
          <p>
            We may update this policy. Material changes will be posted here with a
            new date and, where significant, announced by email.
          </p>

          <h2 className="font-serif text-xl text-ink pt-4">16. Contact</h2>
          <p>
            Privacy questions:{" "}
            <a
              href="mailto:privacy@honestfuneral.co"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              privacy@honestfuneral.co
            </a>
            . For misuse of the Service or security reports,{" "}
            <a
              href="mailto:safety@honestfuneral.co"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              safety@honestfuneral.co
            </a>
            .
          </p>
          <p className="text-sm text-ink-muted">
            See also our{" "}
            <Link
              href="/terms"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/accessibility"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              Accessibility Statement
            </Link>
            .
          </p>
        </article>
      </section>
    </main>
  );
}
