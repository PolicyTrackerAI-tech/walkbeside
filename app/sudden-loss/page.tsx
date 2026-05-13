import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Sudden death — what happens in the first 72 hours when there was no warning",
  description:
    "When someone dies suddenly — heart attack, accident, unwitnessed death at home — the medical examiner takes custody, the death certificate may say 'pending,' and the family waits. Honest guide to what happens, when, and what to do.",
};

/**
 * /sudden-loss — public, indexable companion to /guidance/home-unexpected
 * (the urgent moment-of-death page). This is the longer informational
 * page: what the medical-examiner process looks like, ID-ing the body,
 * autopsy, when the body is released, life-insurance pending issues,
 * and grief specific to no-warning loss.
 */
export default function SuddenLossPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>When death comes without warning</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              No hospice. No goodbye. The next 72 hours, in order.
            </h1>
            <p className="text-lg text-ink-soft">
              About 1 in 4 US deaths is sudden &mdash; cardiac, stroke,
              accident, unwitnessed at home. There is no warning, no
              hospice handoff, and (almost always) a medical examiner
              involved. This page is what to expect when no one had a
              chance to prepare.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>If you are reading this in real time</CardEyebrow>
            <CardTitle>You are not in trouble.</CardTitle>
            <p className="text-ink-soft mt-3">
              If you found the body and called 911, paramedics and
              police are on the way. The police presence is a
              jurisdictional requirement &mdash; they have to rule out
              foul play before the medical examiner takes custody.
              You are not being investigated for a crime. Most of
              what happens in the next hour is procedural.{" "}
              <Link
                href="/guidance/home-unexpected"
                className="text-primary-deep underline"
              >
                The immediate-action checklist is here.
              </Link>
            </p>
          </Card>

          <Card>
            <CardEyebrow>The first hour</CardEyebrow>
            <CardTitle>Who arrives, and in what order.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Paramedics arrive first.</strong>{" "}
                Their job is to confirm death. In most jurisdictions
                they cannot legally pronounce death without orders
                from a physician (which they get by radio), and they
                cannot move the body once pronouncement is made. They
                may attempt resuscitation depending on circumstances;
                if death is obvious (rigor, lividity, prolonged
                interval), they often confirm without intervention.
              </p>
              <p>
                <strong className="text-ink">Police arrive next or with them.</strong>{" "}
                A patrol officer takes a brief statement and walks
                through the scene. In sudden deaths at home, the
                officer's job is to rule out foul play &mdash; they
                are looking for signs of struggle, intruders, or
                medication misuse. You will be asked routine
                questions: when did you last see them alive, what was
                their health like, what medications were they on, was
                there anyone else in the home. Answer plainly. This
                is procedural.
              </p>
              <p>
                <strong className="text-ink">The medical examiner's office is notified.</strong>{" "}
                Once police clear the scene of foul play, the medical
                examiner or coroner takes custody of the body. An
                investigator (sometimes the ME themselves, more often
                a deputy) arrives within 1&ndash;6 hours. The body is
                photographed, identified, and transported to the
                medical examiner's facility. From this point the
                body is not at the home and is not at the funeral
                home &mdash; it is in the ME's custody.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Identifying the body</CardEyebrow>
            <CardTitle>What "ID" actually involves.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                When the deceased had ID on them and was found in
                their home, identification is often resolved at the
                scene through visual confirmation and documents in
                the home. The family is not asked to view the body.
              </p>
              <p>
                When ID is uncertain &mdash; accidents away from
                home, no documents present, or condition that
                prevents visual identification &mdash; the medical
                examiner's office contacts next of kin and arranges
                ID. Most US medical examiners now use photographic
                identification (a photo taken at the ME's office,
                shown to next of kin via secure email or in a
                viewing room) rather than in-person body viewing.
                Dental records, fingerprints, or DNA are used when
                visual ID is not possible.
              </p>
              <p>
                Many families ask to see the body before any further
                steps. Most medical examiner offices accommodate this
                request when condition allows, sometimes after the
                body has been moved to the funeral home. Asking is
                always reasonable.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The autopsy decision</CardEyebrow>
            <CardTitle>When it happens, when it doesn&rsquo;t, what it tells you.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The medical examiner decides whether to perform an
                autopsy &mdash; the family does not choose. Autopsy
                is mandatory in most jurisdictions for: deaths in
                custody, deaths under suspicious circumstances, deaths
                of unidentified persons, and deaths suggesting an
                infectious-disease public-health risk. Autopsy is
                common but not always mandatory for sudden deaths
                under age 40, accidents, and overdoses.
              </p>
              <p>
                Many sudden deaths at home in people with known
                cardiac or other underlying conditions are released
                without autopsy if the family physician will sign the
                death certificate with a cause they can support
                medically. The medical examiner will sometimes ask
                the family's preference.{" "}
                <Link
                  href="/glossary/autopsy"
                  className="text-primary-deep underline"
                >
                  More on what an autopsy involves.
                </Link>
              </p>
              <p>
                Full autopsy results take 6 to 12 weeks. Toxicology
                takes the longest. The death certificate is usually
                filed before results are complete, with cause listed
                as &ldquo;pending&rdquo; and amended later.
              </p>
            </div>
          </Card>

          <Card tone="warn">
            <CardEyebrow>The "pending" death certificate problem</CardEyebrow>
            <CardTitle>Life insurance and accounts often pause until cause is final.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A death certificate marked &ldquo;pending&rdquo; can
                cause real problems for the family. Some life
                insurance companies will not pay the claim until the
                cause is final. Some banks will not release joint
                accounts. Some employers will not pay out group life
                insurance benefits. The funeral itself can usually
                proceed &mdash; the funeral home accepts a pending
                certificate to release the body &mdash; but the
                financial settlement waits.
              </p>
              <p>
                If money is tight in the meantime, the family has
                options: most life insurance policies will pay an
                interim partial benefit on a documented pending
                death; some employers will advance bereavement pay;
                the deceased's bank accounts can sometimes release
                funds for funeral costs with the death certificate
                even before cause is final.
              </p>
              <p>
                When the cause is final, the medical examiner files
                an amended certificate with the county. The family
                does not need to do anything to trigger this. New
                certified copies will reflect the final cause; older
                copies marked &ldquo;pending&rdquo; are still valid
                for most purposes that don't require the final
                cause.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The body release</CardEyebrow>
            <CardTitle>When the funeral home can take custody.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most bodies are released by the medical examiner
                within 24&ndash;72 hours. If an autopsy is performed,
                release usually follows the autopsy by a day or two.
                The medical examiner's office calls the funeral home
                the family has chosen and arranges transport. The
                funeral home picks up the body and the personal
                effects (clothing, jewelry, anything in pockets).
              </p>
              <p>
                <strong className="text-ink">Choosing a funeral home under shock:</strong>{" "}
                the medical examiner's office will often ask the
                family which funeral home to release the body to,
                sometimes within hours of death. You do not have to
                answer immediately. Saying &ldquo;I'll call you back
                in two hours&rdquo; is normal and accepted. Use those
                two hours to compare prices at two or three homes
                in the area.{" "}
                <Link
                  href="/prices"
                  className="text-primary-deep underline"
                >
                  Current price ranges.
                </Link>
              </p>
              <p>
                <strong className="text-ink">Personal effects:</strong>{" "}
                items on the body (wallet, watch, ring, phone,
                clothing) travel with the body. The funeral home
                returns them to the family at the arrangement
                meeting. Items in the home or vehicle at the time of
                death are not in the ME's custody &mdash; they
                remain wherever they were.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The emotional aftermath</CardEyebrow>
            <CardTitle>Shock is a real physical state.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Shock after sudden loss is not just an emotional
                metaphor. It includes physical symptoms: the inability
                to sleep, the inability to eat, racing thoughts,
                intrusive replaying of the scene or the phone call,
                a sense of unreality, and sometimes physical
                sensations of cold or numbness. These are
                stress-response symptoms and they are normal in the
                first two weeks. They typically lessen between weeks
                2 and 6.
              </p>
              <p>
                Common reactions specific to sudden loss:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Replaying.</strong>{" "}
                  Going over the last conversation, the last day, the
                  warning signs in retrospect, the moment of finding
                  out. The brain is trying to make sense of something
                  with no narrative structure.
                </li>
                <li>
                  <strong className="text-ink">Intrusive imagery.</strong>{" "}
                  If you witnessed the death or found the body, you
                  may experience involuntary flashbacks for weeks
                  or months. This is common and not a sign of
                  weakness or pathology. If flashbacks are still
                  intense at 3 months or interfering with daily
                  functioning, a trauma-focused therapist can help.
                </li>
                <li>
                  <strong className="text-ink">Anger at the absence of warning.</strong>{" "}
                  Many sudden-loss survivors describe anger at the
                  person who died (for not going to the doctor, for
                  driving while tired, for not saying goodbye), at
                  medical providers, or at themselves. This is
                  normal and does not need to be resolved on a
                  timeline.
                </li>
                <li>
                  <strong className="text-ink">Delayed grief.</strong>{" "}
                  The practical urgency of the first weeks &mdash;
                  funeral, paperwork, insurance &mdash; can postpone
                  the emotional impact. Some sudden-loss survivors
                  describe being functional through the funeral and
                  falling apart at week 6 or week 12.
                </li>
              </ul>
              <p>
                The 6-month mark is one of the hardest. Initial
                support has tapered off, the practical urgency is
                gone, and the person is still dead. Plan in advance:
                a check-in with a therapist or a grief support group
                near month 4 is worth scheduling now.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The 30-day list</CardEyebrow>
            <CardTitle>The practical work that has to happen.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  Pick a funeral home (compare 2&ndash;3 GPLs).{" "}
                  <Link
                    href="/glossary/gpl"
                    className="text-primary-deep underline"
                  >
                    What a GPL is.
                  </Link>
                </li>
                <li>
                  Order 10&ndash;15 certified death certificates.
                </li>
                <li>
                  File life insurance claims (with pending cert if
                  necessary &mdash; ask for interim partial benefit
                  if cause is still pending).
                </li>
                <li>
                  Notify employer (bereavement leave, group life
                  insurance, retirement-account beneficiary).
                </li>
                <li>
                  Notify Social Security; apply for{" "}
                  <Link
                    href="/survivor-benefits"
                    className="text-primary-deep underline"
                  >
                    survivor benefits
                  </Link>
                  .
                </li>
                <li>
                  Notify banks, brokerages, retirement administrators.
                  Check beneficiary designations on each.{" "}
                  <Link
                    href="/glossary/beneficiary-designation"
                    className="text-primary-deep underline"
                  >
                    Why these matter more than the will.
                  </Link>
                </li>
                <li>
                  Begin probate if there are non-beneficiary assets.{" "}
                  <Link
                    href="/estate"
                    className="text-primary-deep underline"
                  >
                    State-by-state probate basics.
                  </Link>
                </li>
                <li>
                  Memorialize digital accounts.{" "}
                  <Link
                    href="/digital-legacy"
                    className="text-primary-deep underline"
                  >
                    The digital-legacy checklist.
                  </Link>
                </li>
                <li>
                  Cancel subscriptions, forward mail, change utility
                  accounts.{" "}
                  <Link
                    href="/after/accounts-to-close"
                    className="text-primary-deep underline"
                  >
                    Accounts-to-close.
                  </Link>
                </li>
                <li>
                  Set up grief support before the 6-month wall hits.
                </li>
              </ol>
            </div>
          </Card>

          <Card tone="primary">
            <CardTitle>Our toolkit handles the next 30 days.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Sudden loss compresses everything into the same week
              &mdash; arrangements, paperwork, accounts, insurance,
              grief. The toolkit was built for exactly this. Start
              with whichever piece is most urgent right now.
            </p>
            <LinkButton href="/decide" size="lg">
              See what fits your situation →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical,
            legal, or financial advice. Medical-examiner procedures,
            insurance company rules, and state-specific laws vary.
            For a binding answer about a specific situation, contact
            the medical examiner's office, your insurance company,
            and a local probate attorney as appropriate.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
