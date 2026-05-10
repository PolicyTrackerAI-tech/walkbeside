/**
 * Task data for /next-30-days.
 *
 * Each task carries:
 * - id, title, body (the existing fields)
 * - applicableWhen: optional predicate against UserContext. If returns false,
 *   the task is hidden entirely. (E.g. "pick out clothes" hidden when there's
 *   no viewing.) When undefined, the task is always applicable.
 * - contextNote: optional. Returns a sentence shown above the task body when
 *   the task is being recommended *because* of an earlier answer. (E.g. VA
 *   benefits when isVeteran=yes.)
 * - help: optional. What the "Help me with this →" button does. Different
 *   shapes: internal links, external links, phone scripts, inline expanders,
 *   or "more help coming" placeholder.
 */

import type { ServiceType } from "@/lib/pricing-data";

export type IsVeteran = "yes" | "no" | "unsure";

export interface UserContext {
  /** Recommended service type from /decide. Undefined if user hasn't run /decide. */
  serviceType?: ServiceType;
  /** Body present at the service: "yes" | "no" | "unsure". */
  bodyAtService?: "yes" | "no" | "unsure";
  /** Veteran status. */
  isVeteran?: IsVeteran;
}

export type HelpAction =
  | {
      kind: "internal-link";
      label: string;
      href: string;
      description: string;
    }
  | {
      kind: "external-link";
      label: string;
      href: string;
      description: string;
    }
  | {
      kind: "phone";
      label: string;
      number: string;
      description: string;
    }
  | {
      kind: "expander";
      label: string;
      description: string;
      details: string;
    }
  | {
      kind: "coming-soon";
      label: string;
      description: string;
    };

export interface Task {
  id: string;
  title: string;
  body: string;
  applicableWhen?: (ctx: UserContext) => boolean;
  contextNote?: (ctx: UserContext) => string | null;
  help?: HelpAction;
}

export interface Phase {
  id: string;
  label: string;
  whenLabel: string;
  heading: string;
  intro: string;
  tasks: Task[];
}

const NO_VIEWING_TYPES: ServiceType[] = [
  "direct-cremation",
  "body-donation",
  "memorial-no-body",
];

export const PHASES: Phase[] = [
  {
    id: "phase-0",
    label: "Funeral week",
    whenLabel: "Right now, before the service",
    heading: "Between the death and the service",
    intro:
      "The funeral hasn't happened yet. You're holding it together. These are the only things that need to happen before the service — everything else can wait.",
    tasks: [
      {
        id: "p0-certs-count",
        title: "Decide how many death certificates to order",
        body: "Most families need 10–15. Order through the funeral home — it's faster and the home usually passes through the state's base fee.",
        help: {
          kind: "internal-link",
          label: "Open the certificate calculator →",
          href: "/certificates",
          description:
            "Five questions. We tell you how many certificates you'll actually need based on banks, insurance, and what's in their estate.",
        },
      },
      {
        id: "p0-bereavement",
        title: "Tell the deceased's employer",
        body: "Final paycheck, employer life-insurance, bereavement leave for surviving family who work there.",
        help: {
          kind: "expander",
          label: "Show me what to say to HR →",
          description: "A short email/script that asks for everything HR owes the family.",
          details:
            "Subject: Notification of [Name]'s death — [date]\n\nHi [HR contact],\n\nI'm writing to let you know that [Name], [their role], passed away on [date]. I'm reaching out as their [spouse/child/legal next of kin].\n\nCould you please send me a written list of:\n- Their final paycheck and any unused PTO payout\n- Any employer-provided life insurance or AD&D policies and how to claim them\n- Any 401(k) or retirement balance and beneficiary on file\n- COBRA continuation rights for any covered dependents\n- Any pending stock vesting, bonus, or commission payouts\n\nI'd also like to confirm bereavement leave eligibility for [name and role of family member working there, if any].\n\nThank you for handling this with care.\n\n[Your name]\n[Your phone]\n[Your email]",
        },
      },
      {
        id: "p0-obit",
        title: "Draft the obituary",
        body: "Newspapers and online obituaries take 24–72 hours to publish. The funeral home needs the final text.",
        help: {
          kind: "internal-link",
          label: "Open the obituary helper →",
          href: "/obituary",
          description:
            "Answer a few questions about them. We draft the obituary you can edit, then hand to the funeral home.",
        },
      },
      {
        id: "p0-clothes",
        title: "Pick out clothes and personal effects",
        body: "If there will be a viewing or open casket, the funeral home needs an outfit. Glasses, jewelry, dentures — family decisions; can be returned, kept, or buried with the body.",
        applicableWhen: (ctx) =>
          !ctx.serviceType || !NO_VIEWING_TYPES.includes(ctx.serviceType),
        contextNote: (ctx) => {
          if (ctx.serviceType === "traditional-burial") {
            return "Based on your earlier answers (traditional burial with viewing), the funeral home will need an outfit.";
          }
          if (ctx.serviceType === "cremation-with-service") {
            return "Based on your earlier answers (cremation with a service), if there's a viewing the funeral home will need an outfit.";
          }
          if (ctx.serviceType === "graveside-burial") {
            return "Based on your earlier answers (graveside burial), the funeral home may still want an outfit. Confirm with them.";
          }
          return null;
        },
      },
      {
        id: "p0-notification-list",
        title: "Make a list of who needs to be told",
        body: "Two people, three people, ten — start small. Hand the list to a friend or family member who's not too close to the loss to help make calls.",
      },
      {
        id: "p0-officiant",
        title: "Confirm who will lead the service",
        body: "Clergy, celebrant, family member, or no one at all. Pick early so they can prepare. Funeral homes can recommend non-denominational celebrants for $200–$500.",
      },
    ],
  },
  {
    id: "week-1",
    label: "Week 1",
    whenLabel: "After the service, the first seven days",
    heading: "The first seven days",
    intro:
      "The funeral is either imminent or just happened. Two goals this week: stop the financial bleeding, and order enough death certificates.",
    tasks: [
      {
        id: "w1-certs",
        title: "Order 10–15 certified death certificates",
        body: "Every bank, insurer, and government agency wants a certified copy. Order through the funeral home (faster) or your state's vital records office (cheaper).",
        help: {
          kind: "external-link",
          label: "Find your state's vital records office →",
          href: "https://www.cdc.gov/nchs/w2w/index.htm",
          description:
            "CDC's official Where to Write for Vital Records lookup — every state's address, fee, and turnaround.",
        },
      },
      {
        id: "w1-ss",
        title: "Notify Social Security",
        body: "Most funeral homes report this automatically. Confirm they did, then check whether dependents qualify for survivor benefits.",
        help: {
          kind: "phone",
          label: "Call Social Security: 1-800-772-1213",
          number: "+18007721213",
          description:
            "Have these ready: deceased's SSN, date of death, your relationship to them, and whether the funeral home reported the death. Survivor benefits are filed separately — ask about them on the same call.",
        },
      },
      {
        id: "w1-freeze",
        title: "Freeze credit at all three bureaus",
        body: "Identity theft spikes around publicly-posted obituaries. Freezing prevents new credit accounts being opened in their name.",
        help: {
          kind: "expander",
          label: "Help me freeze credit at all three →",
          description: "Direct links and what to say to each bureau.",
          details:
            "You'll need: a certified death certificate, the deceased's SSN, and your relationship to them.\n\n1. Equifax — call 1-800-685-1111 or upload at equifax.com/personal/credit-report-services/credit-freeze. Ask for a 'deceased flag' on the file. They mail confirmation.\n\n2. Experian — mail required: send a certified death certificate + a letter requesting deceased flag to:\n   Experian Consumer Assistance\n   PO Box 4500\n   Allen, TX 75013\n\n3. TransUnion — call 1-800-680-7289 or upload at transunion.com/credit-freeze. Same request: deceased flag.\n\nKeep one death certificate copy per bureau — this is part of why you order 10+.",
        },
      },
      {
        id: "w1-employer",
        title: "Notify their employer (if you haven't yet)",
        body: "If you didn't reach HR during funeral week, do it now. Final paycheck, employer life insurance, retirement account beneficiaries.",
        applicableWhen: () => true,
      },
      {
        id: "w1-will",
        title: "Find the will, trust documents, and advance directives",
        body: "Filing cabinet, safe, safe deposit box, attorney's office. If there's no will, the estate goes through probate under state intestate rules.",
        help: {
          kind: "expander",
          label: "Where to look →",
          description: "Eight common spots people store these.",
          details:
            "1. Their home filing cabinet (look under 'estate', 'will', 'legal', or their last name)\n2. A home safe or fireproof box\n3. A safe deposit box at their bank — note: in many states, this requires a court order to open if you're not a co-signer\n4. With their estate attorney, if they had one (search their email or phone contacts for 'attorney', 'esq', 'law')\n5. With their accountant or CPA\n6. In their primary computer's Documents folder, or in a cloud drive (look for 'will' or 'trust')\n7. In a file with their named executor\n8. With their religious community (some traditions hold copies)\n\nIf you cannot find one, the estate goes through 'intestate' probate — state law decides who gets what. That's the worst case but it's manageable. We cover this in the Month 2+ section.",
        },
      },
    ],
  },
  {
    id: "weeks-2-4",
    label: "Weeks 2–4",
    whenLabel: "The quiet admin middle",
    heading: "The quiet admin middle",
    intro:
      "Most of the phone calls happen here. Pace yourself — nothing on this list is emergency-urgent, but it all adds up.",
    tasks: [
      {
        id: "w2-life-insurance",
        title: "File every life insurance claim you know about — and look for ones you don't",
        body: "Each policy has its own claim form and needs a certified death certificate. The hard part is finding policies the deceased never told you about.",
        help: {
          kind: "external-link",
          label: "Search the NAIC Life Policy Locator →",
          href: "https://eapps.naic.org/life-policy-locator/",
          description:
            "Free service from the National Association of Insurance Commissioners. They send a request to participating life insurers; any matches contact you directly. Most families have no idea this exists. ~10 minutes to submit.",
        },
      },
      {
        id: "w2-banks",
        title: "Notify banks and investment firms",
        body: "They will freeze accounts as soon as notified. Transfer anything you'll need for funeral expenses BEFORE you notify — then notify.",
      },
      {
        id: "w2-va",
        title: "Claim VA burial benefits",
        body: "Up to $2,000 for service-connected death, several hundred otherwise. Plus possible free national cemetery burial, government headstone, burial flag.",
        applicableWhen: (ctx) => ctx.isVeteran !== "no",
        contextNote: (ctx) => {
          if (ctx.isVeteran === "yes") {
            return "Based on your earlier answer (yes, the deceased served), the family qualifies. Most families miss at least one benefit — the checker takes 5 minutes.";
          }
          if (ctx.isVeteran === "unsure") {
            return "You weren't sure earlier. If they ever served (active duty or activated reserves with honorable discharge), the family likely qualifies. Worth 5 minutes to check.";
          }
          return null;
        },
        help: {
          kind: "internal-link",
          label: "Open the veterans benefits checker →",
          href: "/veterans",
          description:
            "Five questions. We tell you which VA benefits the family qualifies for, what each is worth, and link to the right VA forms.",
        },
      },
      {
        id: "w2-medicare",
        title: "Cancel Medicare and Medicaid",
        body: "Medicare is reported via Social Security automatically — but confirm. Medicare Advantage and Part D plans need separate cancellation; otherwise they keep billing.",
      },
      {
        id: "w2-subs",
        title: "Cancel recurring subscriptions",
        body: "Streaming, gym, subscription boxes, software. Most families turn up $30–$200/mo in charges they didn't know about — sometimes more.",
        help: {
          kind: "internal-link",
          label: "Open the subscription finder →",
          href: "/subscriptions",
          description:
            "Paste a bank or credit-card statement. We extract every recurring charge and tell you how to cancel each common service. Saved on your device.",
        },
      },
      {
        id: "w2-mail",
        title: "Forward their mail",
        body: "Prevents an empty-house signal and helps surface accounts you didn't know existed. Set up for six months.",
        help: {
          kind: "external-link",
          label: "USPS mail forwarding →",
          href: "https://moversguide.usps.com/icoa/icoa-main-flow.do?execution=e1s1",
          description:
            "Official USPS site. $1.10 identity verification fee. You'll need: deceased's name and old address, your name and forwarding address, and either a credit card or a phone number for verification.",
        },
      },
      {
        id: "w2-dmv",
        title: "Notify the DMV and cancel auto insurance (if applicable)",
        body: "If they had a vehicle registered in their name, the DMV needs to know. Auto insurance cancels or transfers depending on who owns the car.",
      },
    ],
  },
  {
    id: "month-2-plus",
    label: "Month 2+",
    whenLabel: "Estate work and long-tail items",
    heading: "What comes after the paperwork",
    intro:
      "Estate work stretches out. This list is shorter but higher-stakes. Most families settle in 6–18 months.",
    tasks: [
      {
        id: "m2-probate",
        title: "Start probate, or confirm you don't need to",
        body: "Revocable living trust holding the assets → probate usually not required. Will only or no will → probate is. State rules vary. An estate attorney consult is usually worth an hour of their time.",
      },
      {
        id: "m2-tax",
        title: "File their final income tax return",
        body: "A final 1040 covers the portion of the year they were alive. If the estate earns income after death (dividends, interest), that's a separate 1041 estate return.",
      },
      {
        id: "m2-retirement",
        title: "Handle inherited retirement accounts carefully",
        body: "Inherited IRA rules changed in 2020. Most non-spouse beneficiaries must drain the account within 10 years. Getting this wrong is expensive — talk to a CPA before moving the money.",
      },
      {
        id: "m2-unclaimed",
        title: "Check state unclaimed property databases",
        body: "Every state has a database of dormant accounts, uncashed checks, safe deposit box contents. Free, ~5 minutes per state. Commonly produces a few hundred to a few thousand dollars.",
        help: {
          kind: "external-link",
          label: "Search MissingMoney.com →",
          href: "https://www.missingmoney.com/",
          description:
            "Endorsed by NAUPA (the official state-database association). Searches most US states at once. Search every state the deceased lived in.",
        },
      },
      {
        id: "m2-digital",
        title: "Close or memorialize digital accounts",
        body: "Email, social media, cloud storage, password managers. Facebook and Instagram can be memorialized; Apple and Google have legacy-contact options. Close anything that could be hijacked.",
        help: {
          kind: "expander",
          label: "Direct links to memorialize / close each →",
          description: "Apple, Google, Facebook, Instagram, LinkedIn, X.",
          details:
            "Apple — Legacy Contact: appleid.apple.com/account/manage → Legacy Contact. Without one set before death, you'll need a court order.\n\nGoogle — Inactive Account Manager: myaccount.google.com/inactive. If not set up before death, file at support.google.com/accounts/troubleshooter/6357590.\n\nFacebook — Memorialize: facebook.com/help/contact/234739086860192. You can also request deletion.\n\nInstagram — Memorialize/remove: help.instagram.com/contact/452224988254813.\n\nLinkedIn — Memorialize/close: linkedin.com/help/linkedin/ask/ts-rdmlp.\n\nX (Twitter) — help.x.com/en/forms/account-access/deactivate-or-close-account/deactivate-account-of-deceased.\n\nFor each: you'll typically need the death certificate and proof you're authorized.",
        },
      },
      {
        id: "m2-headstone",
        title: "Order the headstone",
        body: "Headstone markup at funeral homes is among the highest in the industry. We can probably save you 30–60% on this one — or, if buying through the funeral home is easier and the price is fair, that's a fine choice too.",
        help: {
          kind: "expander",
          label: "How we'd help you save →",
          description:
            "What we'll do, and what you'd do yourself. Decide which is easier.",
          details:
            "What we can help with:\n- Tell us your cemetery's name. We confirm their stone requirements (size, material, mounting) and tell you what the funeral home is likely upcharging.\n- Direct-from-monument-company quote: monument companies that service your cemetery sell the same stones for ~half what funeral homes charge. We'll list 2–3 reputable ones in your area.\n- Comparison: we'll show you the funeral home's quote against the direct quote. If the funeral home is within ~15% of direct, the convenience may be worth it. If they're 30–60% above, you're probably overpaying.\n\nWhen the funeral home option is fine:\n- The cemetery has tight installation rules and the funeral home has a working relationship with them.\n- You don't want to coordinate a separate vendor in the middle of grief.\n- The funeral home's quote is within ~15% of direct pricing — that's a fair convenience premium.\n\nWhen direct is better:\n- Funeral home quote is 30%+ above what a monument company would charge.\n- You're comfortable making one extra phone call.\n\nThis is the one purchase where shopping around almost always pays off — but no judgment if you don't have the energy. Either way is okay.",
        },
      },
    ],
  },
];
