import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { EmailCapture } from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Digital legacy — handling a deceased person's online accounts, passwords, and devices",
  description:
    "Facebook memorialization, Google inactive account, Apple legacy contact, password managers, crypto wallets, and the subscriptions still billing the dead person's credit card. The practical checklist most families miss.",
  openGraph: { images: [ogImage("Digital legacy — handling online accounts after death", "After")] },
};

/**
 * /digital-legacy — public, indexable page covering the deceased's
 * digital footprint. Major platform-by-platform with current process
 * URLs. No sister voice; factual and procedural.
 */
export default function DigitalLegacyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="digital-legacy"
        title="Digital legacy — handling online accounts after death"
        description="Facebook memorialization, Google Inactive Account Manager, Apple Legacy Contact, password managers, crypto, and the subscriptions still billing the dead person's card."
        eyebrow="After"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Digital legacy</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The accounts, passwords, and devices the deceased left behind.
            </h1>
            <p className="text-lg text-ink-soft">
              The average American adult has 100+ online accounts. After
              a death, most of those accounts keep running &mdash;
              still billing the credit card, still sending emails,
              still posting birthday reminders on Facebook. This is
              the platform-by-platform checklist for handling them,
              and the pre-death steps that make it dramatically easier.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>Before you do anything</CardEyebrow>
            <CardTitle>Do not log in as the deceased.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                It is tempting to just sign in with their password
                and handle the accounts directly. In most US states
                this violates the platform's terms of service and
                may violate the federal Computer Fraud and Abuse Act.
                In practice no one is prosecuted for a family
                member's account access, but the bigger problem is
                practical: logging in can lock the account, trigger
                fraud detection, or invalidate the formal closure
                process you actually want to use.
              </p>
              <p>
                Use the platforms' bereavement processes. They are
                designed for this and they work. Each major platform
                is below.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Facebook & Instagram (Meta)</CardEyebrow>
            <CardTitle>Memorialize or delete. The family chooses.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Facebook offers two paths after a death: memorialize
                the account (it stays online but no one can log in,
                profile shows &ldquo;Remembering&rdquo;, friends can
                still post on the timeline) or delete it permanently.
              </p>
              <p>
                <strong className="text-ink">Memorialize:</strong>{" "}
                anyone can request memorialization at{" "}
                <a
                  href="https://www.facebook.com/help/contact/234739086860192"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  facebook.com/help/contact/234739086860192
                </a>
                . Facebook requires proof of death (death certificate,
                obituary, or news article). Processing takes 2 to 4
                weeks.
              </p>
              <p>
                <strong className="text-ink">Legacy contact:</strong>{" "}
                if the deceased set a Legacy Contact while alive,
                that person can manage the memorialized account
                (post a final message, change the profile photo,
                respond to friend requests, download an archive).
                The legacy contact cannot read messages or log in as
                the deceased.
              </p>
              <p>
                <strong className="text-ink">Permanent deletion:</strong>{" "}
                immediate family can request full deletion at the
                same URL. Requires proof of death and proof of
                relationship (birth certificate, marriage
                certificate, or court letter). Deletion is permanent
                and removes everything &mdash; photos, comments, the
                profile itself.
              </p>
              <p>
                <strong className="text-ink">Instagram:</strong> same
                two options (memorialize or delete) through{" "}
                <a
                  href="https://help.instagram.com/contact/1474899482730688"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  help.instagram.com/contact/1474899482730688
                </a>
                . Same documentation requirements.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Google (Gmail, YouTube, Photos, Drive)</CardEyebrow>
            <CardTitle>If they set up Inactive Account Manager, it is already handled.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Inactive Account Manager (set during life):</strong>{" "}
                Google's standing offer to act on the user's
                instructions after a defined period of inactivity
                (typically 3&ndash;18 months). The deceased can
                designate up to 10 trusted contacts to receive
                copies of specific Google data (Gmail archive, Drive
                files, Photos) and can choose whether the account
                gets deleted automatically. If your loved one set
                this up, your job is mostly to wait for the email.
              </p>
              <p>
                <strong className="text-ink">Bereavement process (no Inactive Account Manager):</strong>{" "}
                request access at{" "}
                <a
                  href="https://support.google.com/accounts/troubleshooter/6357590"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  support.google.com/accounts/troubleshooter/6357590
                </a>
                . Google reviews requests case by case and may
                provide a download of Gmail archives, Drive files,
                or Photos. Account closure is a separate request at
                the same URL. Processing can take 1 to 3 months.
              </p>
              <p>
                Google is more conservative than most platforms about
                releasing data. They typically grant funds in Google
                Pay or AdSense balances, photo archives, and
                Drive files. They are more reluctant to release
                email contents unless there's a court order.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Apple</CardEyebrow>
            <CardTitle>Legacy Contact is the only easy path.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Legacy Contact (set during life):</strong>{" "}
                introduced in 2021. The Apple ID owner names a Legacy
                Contact in iCloud settings on any device. After death,
                the Legacy Contact requests access at{" "}
                <a
                  href="https://digital-legacy.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  digital-legacy.apple.com
                </a>{" "}
                with a 16-character access key (provided to the
                contact at setup time) and a death certificate. The
                Legacy Contact then has 3 years to download iCloud
                data &mdash; photos, files, messages, notes, contacts.
              </p>
              <p>
                <strong className="text-ink">Without Legacy Contact:</strong>{" "}
                without the Legacy Contact setup, Apple requires a
                court order to release iCloud data. This is the
                single biggest pain point in digital-legacy work
                because Apple is the most locked-down major platform.
                A probate court order for access to a specific Apple
                ID's data costs $300&ndash;$1,500 in legal fees plus
                court costs and typically takes 2&ndash;6 months.
              </p>
              <p>
                <strong className="text-ink">Device passcodes:</strong>{" "}
                if you know the iPhone or Mac passcode, you can use
                the device. If you don't, Apple cannot unlock it
                regardless of court order &mdash; the encryption is
                device-side. The data on the device is permanently
                inaccessible unless iCloud backups exist.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Microsoft (Outlook, OneDrive, Xbox)</CardEyebrow>
            <CardTitle>Custodian-of-Record process.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Microsoft has a Next-of-Kin process to release account
                contents. Request at{" "}
                <a
                  href="https://account.microsoft.com/security/account-deceased"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  account.microsoft.com/security/account-deceased
                </a>
                . Microsoft requires the deceased's email address,
                proof of death, proof of relationship, and a notarized
                affidavit. Processing typically takes 6 to 8 weeks.
                They deliver contents on a DVD by physical mail (yes,
                still).
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Password managers</CardEyebrow>
            <CardTitle>1Password, LastPass, Bitwarden &mdash; the master key changes everything.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                If the deceased used a password manager and you have
                the master password (or they recorded it somewhere
                accessible to family), the rest of the digital legacy
                work becomes dramatically easier. The vault contains
                logins to every online account, often with security
                questions, recovery emails, and notes.
              </p>
              <p>
                <strong className="text-ink">1Password:</strong> has
                a built-in &ldquo;family organizer&rdquo; that can
                recover member accounts. For individual accounts
                without an organizer, recovery requires the Emergency
                Kit (PDF given at signup with the secret key).
              </p>
              <p>
                <strong className="text-ink">Bitwarden:</strong>{" "}
                offers Emergency Access &mdash; the user pre-designates
                a trusted contact who can request access after a
                waiting period. Best set up while alive.
              </p>
              <p>
                <strong className="text-ink">LastPass:</strong>{" "}
                offers Emergency Access with a similar pre-designation
                model. Without it, LastPass cannot recover an
                account; the master password is the only way in.
              </p>
              <p>
                Without the master password and without an emergency
                contact pre-configured, the vault is generally
                irrecoverable. Plan for this in advance.
              </p>
            </div>
          </Card>

          <Card tone="bad">
            <CardEyebrow>Crypto wallets</CardEyebrow>
            <CardTitle>Almost always irrecoverable without the keys.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Self-custodied cryptocurrency (Bitcoin, Ethereum,
                most others) is protected by a private key or seed
                phrase. Without it, the funds are mathematically
                inaccessible. No exchange, no court order, and no
                amount of legal work can recover them. The estate
                must treat the loss as permanent.
              </p>
              <p>
                <strong className="text-ink">Exchange-held crypto:</strong>{" "}
                cryptocurrency on a regulated exchange (Coinbase,
                Kraken, Gemini, Binance.US) is recoverable through
                the exchange's bereavement process &mdash; the
                exchange holds the keys. Requirements typically:
                death certificate, probate documents (letters
                testamentary), and a request from the executor. Most
                US exchanges have published procedures.
              </p>
              <p>
                <strong className="text-ink">Self-custody (hardware wallets, software wallets):</strong>{" "}
                check physical locations the deceased might have
                stored a seed phrase &mdash; safes, fireproof boxes,
                envelopes labeled &ldquo;in case of emergency&rdquo;,
                a piece of paper with 12 or 24 words on it. Some
                people split a seed phrase across multiple locations
                using Shamir's Secret Sharing. If after exhaustive
                search the seed phrase cannot be found, the funds
                are gone.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Subscriptions still billing</CardEyebrow>
            <CardTitle>The credit-card audit.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The single most useful action in the first month is
                a credit-card statement review. Pull the last 12
                months of statements for the deceased's primary
                cards. Every recurring charge is an account that
                needs to be canceled. Common entries: Netflix,
                Spotify, Amazon Prime, Apple One, Hulu, Adobe
                Creative Cloud, gym memberships, magazine
                subscriptions, dating apps, mobile apps with
                in-app subscriptions, domain registrations, cloud
                storage, VPN services, news sites, identity-theft
                protection, and donations to causes.
              </p>
              <p>
                Most subscriptions cancel with the death certificate
                and an email to support. Some refund the unused
                portion; many do not. The credit-card company can
                also dispute charges that post after the death date
                with the certificate as evidence; the issuer will
                refund and the merchant will absorb the loss.
              </p>
              <p>
                Closing the credit card itself stops all future
                charges and is the cleanest approach. Notify the
                issuer with a death certificate; they freeze the
                account and zero out the balance from the estate.
                Joint cards stay open for the surviving cardholder
                but the deceased's name is removed.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The smaller accounts</CardEyebrow>
            <CardTitle>Loyalty, frequent flyer, store credit.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most loyalty and rewards programs allow transfer of
                points to a spouse or estate with a death
                certificate. Each program has its own rules and
                deadlines. The big ones:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Airline miles:</strong>{" "}
                  Delta, American, United, Southwest all allow
                  transfer to next of kin with a death certificate.
                  Most require a written request and may charge a
                  transfer fee.
                </li>
                <li>
                  <strong className="text-ink">Hotel points:</strong>{" "}
                  Marriott, Hilton, IHG allow transfer with death
                  certificate. Time-sensitive &mdash; some expire
                  points 12 months after the account holder's
                  death.
                </li>
                <li>
                  <strong className="text-ink">Credit card points:</strong>{" "}
                  Chase, Amex, Capital One typically allow transfer
                  with death certificate, often time-limited (90
                  days or less from notification). Some require the
                  estate to take the points in cash equivalent at a
                  reduced rate.
                </li>
                <li>
                  <strong className="text-ink">Store gift cards:</strong>{" "}
                  generally transferable to whoever holds the card.
                  No formal process.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Domain names and online businesses</CardEyebrow>
            <CardTitle>Renew before they expire.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                If the deceased owned domain names, they need to be
                transferred to the estate or to a beneficiary before
                they expire. Domain expiration triggers loss of the
                domain (with a short recovery window). Most
                registrars have a deceased-owner transfer process
                requiring a death certificate and proof of authority
                (letters testamentary).
              </p>
              <p>
                Active online businesses (Etsy shops, eBay seller
                accounts, Patreon, Substack, YouTube monetization)
                generally require similar documentation and the
                executor's involvement. Earnings continue accruing
                in many cases and are part of the estate.
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The pre-death checklist</CardEyebrow>
            <CardTitle>If you are reading this for yourself, four things to do now.</CardTitle>
            <ol className="space-y-3 mt-4 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">Set up a password manager and add one trusted emergency contact.</strong>{" "}
                Bitwarden (free) and 1Password are the standards.
                Configure Emergency Access in the settings.
              </li>
              <li>
                <strong className="text-ink">Add a Legacy Contact in iCloud.</strong>{" "}
                Settings → your Apple ID → Sign-In & Security →
                Legacy Contact. Print the access key. Give it to the
                person you named.
              </li>
              <li>
                <strong className="text-ink">Configure Google Inactive Account Manager.</strong>{" "}
                Visit{" "}
                <a
                  href="https://myaccount.google.com/inactive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  myaccount.google.com/inactive
                </a>{" "}
                and name your trusted contacts.
              </li>
              <li>
                <strong className="text-ink">Set Facebook and Instagram Legacy Contacts.</strong>{" "}
                Settings → Memorialization Settings on each.
              </li>
            </ol>
            <p className="text-ink-soft mt-4">
              Each step takes under 10 minutes. Together they save
              the family weeks of effort and, in the Apple case,
              hundreds of dollars in legal fees.
            </p>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not legal
            advice. Platform processes change frequently; verify the
            current procedure with each platform directly before
            relying on the steps here. URL paths above were accurate
            at time of writing. We are not affiliated with any
            platform mentioned.
          </p>

          <EmailCapture
            source="digital-legacy"
            title="Save this checklist."
            subtitle="Working through digital accounts takes weeks. We'll email this guide so you can do it at your own pace."
            buttonLabel="Email me the checklist"
            successMessage="It's in your inbox. Take your time."
          />

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
