import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "All guides — Honest Funeral",
  description:
    "Every guide we've written, organized. Crisis-moment help, arrangement decisions, post-funeral paperwork, estate, grief, and a plain-language glossary of funeral industry terms.",
  openGraph: { images: [ogImage("Every guide we've written, in one place", "Reference")] },
};

type GuideCategory =
  | "right-now"
  | "decisions"
  | "after"
  | "estate"
  | "grief"
  | "money"
  | "vendors"
  | "plan-ahead"
  | "reference";

interface Guide {
  href: string;
  title: string;
  description: string;
  category: GuideCategory;
}

const CATEGORY_LABELS: Record<GuideCategory, string> = {
  "right-now": "If it just happened",
  decisions: "Decisions and arrangements",
  after: "After the funeral — the first 30 days",
  estate: "Estate settlement (long term)",
  grief: "Grief and family",
  money: "Paying for it",
  vendors: "Buying outside the funeral home",
  "plan-ahead": "Plan ahead — no death yet",
  reference: "Reference",
};

const CATEGORY_ORDER: GuideCategory[] = [
  "right-now",
  "decisions",
  "after",
  "money",
  "estate",
  "grief",
  "vendors",
  "plan-ahead",
  "reference",
];

const GUIDES: Guide[] = [
  // Right now
  {
    href: "/where",
    title: "Where are you in this?",
    description: "Pick a path. Just happened, arranging, planning ahead.",
    category: "right-now",
  },
  {
    href: "/final-days",
    title: "Caring for someone who is dying",
    description:
      "The last weeks and the last hours. What dying looks like, what helps, what hurts, care of the caregiver.",
    category: "right-now",
  },
  {
    href: "/sudden-loss",
    title: "Sudden death",
    description:
      "Paramedics, police, the medical examiner. What happens in the first 72 hours when there was no warning.",
    category: "right-now",
  },
  {
    href: "/after-hospice",
    title: "When someone dies in hospice",
    description:
      "Don't call 911. What to expect in the final days and the hour of death.",
    category: "right-now",
  },
  {
    href: "/out-of-state-death",
    title: "Death away from home",
    description:
      "Out-of-state, international, at sea. The two-funeral-home model, transport options, and the cheaper option most families miss.",
    category: "right-now",
  },

  // Decisions and arrangements
  {
    href: "/decide",
    title: "What type of service fits?",
    description:
      "Four questions about faith, body, and budget. We recommend a service type.",
    category: "decisions",
  },
  {
    href: "/prices",
    title: "Fair prices in your zip",
    description:
      "What funeral services should cost in your area, by line item. Free. No account.",
    category: "decisions",
  },
  {
    href: "/funeral-costs",
    title: "Funeral costs by city",
    description:
      "Fair-price ranges for major US metros. Direct cremation, traditional burial, green burial — what each service type should cost locally.",
    category: "decisions",
  },
  {
    href: "/average-funeral-cost",
    title: "How much does a funeral cost?",
    description:
      "2026 national averages by service type, what drives the cost, and the line items you can legally decline.",
    category: "decisions",
  },
  {
    href: "/rights",
    title: "What you can decline",
    description:
      "Nine line items most families don't know they can refuse — embalming, vault upgrades, family limo, more.",
    category: "decisions",
  },
  {
    href: "/funeral-home-tactics",
    title: "How the funeral industry’s sales floor works",
    description:
      "Specific scripts, room layouts, and pricing psychology. Red flags vs green flags. Where to file a complaint.",
    category: "decisions",
  },
  {
    href: "/home-funeral",
    title: "Family-led home funerals",
    description:
      "The family cares for the body at home. Legal in 41 states. What it is, what it isn't.",
    category: "decisions",
  },
  {
    href: "/body-donation",
    title: "Whole-body donation",
    description:
      "Free, supports medical research, skips the funeral home. Plus a backup plan when programs decline.",
    category: "decisions",
  },

  // After the funeral
  {
    href: "/next-30-days",
    title: "The 30-day checklist",
    description:
      "Death certificates, Social Security, banks, insurance, accounts to close — in the right order.",
    category: "after",
  },
  {
    href: "/survivor-benefits",
    title: "Social Security survivor benefits",
    description:
      "$255 lump-sum, monthly survivor benefits, divorced-spouse rules, the three traps families fall into.",
    category: "after",
  },
  {
    href: "/veterans",
    title: "Veterans burial benefits",
    description:
      "What the family of a veteran qualifies for at the VA. Most families miss at least one.",
    category: "after",
  },
  {
    href: "/digital-legacy",
    title: "Digital legacy",
    description:
      "Facebook, Apple, Google, password vaults, crypto, subscriptions still billing.",
    category: "after",
  },

  // Money
  {
    href: "/how-to-pay",
    title: "How to pay when you can't afford it",
    description:
      "County indigent burial, FEMA, Medicaid, charitable aid, crowdfunding done right.",
    category: "money",
  },

  // Estate
  {
    href: "/estate",
    title: "Estate settlement",
    description:
      "Probate by state, the small-estate threshold, when you actually need a lawyer.",
    category: "estate",
  },

  // Grief
  {
    href: "/grief",
    title: "Grief, month by month",
    description:
      "Why month 6 is often the hardest. Finding a grief therapist. Support groups by type of loss.",
    category: "grief",
  },
  {
    href: "/talking-to-kids",
    title: "Talking to children about death",
    description:
      "Age-by-age scripts (3-5, 6-10, 11-15). The euphemisms that backfire. When to get professional help.",
    category: "grief",
  },
  {
    href: "/disenfranchised-grief",
    title: "When the world doesn't recognize your loss",
    description:
      "Miscarriage, ex-spouses, estranged family, unmarried partners, chosen family, pet loss. Grief that other content silently leaves out.",
    category: "grief",
  },
  {
    href: "/pet-loss",
    title: "When the animal you loved dies",
    description:
      "The euthanasia decision, in-home options, disposition paths, and resources for grief that isn’t 'just a pet.'",
    category: "grief",
  },
  {
    href: "/suicide-loss",
    title: "Suicide loss",
    description:
      "For people grieving someone who died by suicide. Why the grief is its own thing, AFSP and Alliance of Hope, the elevated risk for survivors, 988.",
    category: "grief",
  },
  {
    href: "/overdose-loss",
    title: "Overdose loss",
    description:
      "Addiction is a disease. GRASP and SAMHSA. The relationship before death, the stigma, the children, the family members who still use.",
    category: "grief",
  },
  {
    href: "/death-of-a-child",
    title: "Death of a child",
    description:
      "For bereaved parents of any-age children. The marriage strain reality (the 80% myth is false), surviving siblings, grandparents, The Compassionate Friends.",
    category: "grief",
  },
  {
    href: "/funeral-etiquette",
    title: "Funeral etiquette for attendees",
    description:
      "What to say (almost nothing), what to wear, whether to bring kids, flowers vs donations, the casserole rules, and how to actually help.",
    category: "grief",
  },

  // Vendors
  {
    href: "/headstone-vendors",
    title: "Monument company directory",
    description:
      "Buy the headstone direct. Typically 30–60% less than funeral-home pricing for the same stone.",
    category: "vendors",
  },

  // Plan ahead
  {
    href: "/plan-ahead",
    title: "Pre-need planning playbook",
    description:
      "Death folder, advance directives, beneficiaries, written funeral preferences. The four-pillar weekend project.",
    category: "plan-ahead",
  },
  {
    href: "/end-of-life",
    title: "End of life — when you're the one dying",
    description:
      "For people with a terminal diagnosis. Palliative vs hospice, MAID where legal, treatment decisions, what to actually do with the time.",
    category: "plan-ahead",
  },
  {
    href: "/planning",
    title: "Planning for yourself or an aging parent",
    description:
      "The non-crisis entry point. Free cheat sheet, fair-price lookup, the conversation to have now.",
    category: "plan-ahead",
  },

  // Reference
  {
    href: "/glossary",
    title: "Glossary of funeral terms",
    description:
      "Plain-English definitions of every industry term — GPL, basic services fee, FTC Funeral Rule, more.",
    category: "reference",
  },
  {
    href: "/faq",
    title: "FAQ",
    description:
      "How we make money, what we do, what the $199 fee covers, what we won't do.",
    category: "reference",
  },
  {
    href: "/how-it-works",
    title: "How the toolkit works",
    description:
      "What the $199 unlocks, step by step. The funeral-home outreach process explained.",
    category: "reference",
  },
];

function groupGuides(): Record<GuideCategory, Guide[]> {
  const out = {} as Record<GuideCategory, Guide[]>;
  for (const c of CATEGORY_ORDER) out[c] = [];
  for (const g of GUIDES) out[g.category].push(g);
  return out;
}

export default function GuidesPage() {
  const grouped = groupGuides();

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <CardEyebrow>All guides</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Every guide we’ve written, in one place.
            </h1>
            <p className="text-lg text-ink-soft">
              Organized by where you are. Start at the top if it just
              happened. Skip to grief or estate if you’re further out.
              {" "}
              <Link
                href="/glossary"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                The glossary
              </Link>{" "}
              is at the bottom — keep it open in another tab if anyone
              uses an unfamiliar word.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>Not sure where to start?</CardTitle>
            <p className="text-ink-soft mt-3">
              Two free things solve most families’ immediate questions
              before they need anything else:{" "}
              <Link
                href="/prices"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                fair prices in your zip
              </Link>{" "}
              (so you know if a quote is reasonable) and{" "}
              <Link
                href="/prep"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                the prep kit
              </Link>{" "}
              (so you know what to ask). No account needed for either.
            </p>
          </Card>

          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="font-serif text-2xl text-ink mb-4">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <ul className="space-y-3">
                  {items.map((g) => (
                    <li key={g.href}>
                      <Link
                        href={g.href}
                        className="block rounded-xl border border-border bg-surface hover:border-primary hover:bg-primary-soft transition-colors px-5 py-4 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium text-ink group-hover:text-primary-deep">
                              {g.title}
                            </div>
                            <p className="text-sm text-ink-soft mt-1">
                              {g.description}
                            </p>
                          </div>
                          <div
                            className="text-primary text-lg pt-0.5"
                            aria-hidden
                          >
                            →
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <Card tone="soft">
            <CardTitle>Don’t see what you need?</CardTitle>
            <p className="text-ink-soft mt-3">
              We’re adding guides every week. If there’s a topic that
              would help your family right now, email{" "}
              <a
                href="mailto:hello@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                hello@honestfuneral.co
              </a>{" "}
              and we’ll prioritize it.
            </p>
          </Card>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
