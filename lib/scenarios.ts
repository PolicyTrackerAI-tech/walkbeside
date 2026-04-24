/**
 * Scenario routing — the answer to "Where did they pass away?"
 * determines the immediate-guidance steps for the next 2 hours.
 */

export type Scenario = "hospital" | "home-expected" | "home-unexpected" | "elsewhere";

export const SCENARIO_LABELS: Record<Scenario, string> = {
  hospital: "Hospital or nursing home",
  "home-expected": "At home — expected (hospice or illness)",
  "home-unexpected": "At home — unexpected",
  elsewhere: "Somewhere else",
};

export interface GuidanceStep {
  title: string;
  body: string;
  tone?: "calm" | "urgent" | "info";
}

export interface ScenarioGuidance {
  headline: string;
  subhead: string;
  steps: GuidanceStep[];
  /** True if we should aggressively gate them to the price comparison before they call any funeral home. */
  showPriceCompareGate: boolean;
  priceGateText?: string;
}

export const SCENARIO_GUIDANCE: Record<Scenario, ScenarioGuidance> = {
  hospital: {
    headline: "You're in the hospital scenario.",
    subhead:
      "The hospital will ask you to choose a funeral home soon — usually within a few hours. Take a breath. You have more time than they're suggesting.",
    showPriceCompareGate: true,
    priceGateText:
      "Before you call anyone, spend three minutes here. It could save you thousands.",
    steps: [
      {
        title: "Tell the hospital you'll be back to them within a few hours.",
        body:
          "You don't have to choose a funeral home in the next 30 minutes. Hospitals have temporary holding for exactly this reason. Saying \"I need a few hours\" is normal and they will accept it.",
        tone: "calm",
      },
      {
        title: "Do not commit to the first funeral home anyone recommends.",
        body:
          "Hospitals sometimes have informal partnerships. Once a body is moved to a funeral home, you are practically committed to that home. Compare prices first.",
        tone: "info",
      },
      {
        title: "Notify your closest family members — but slow down.",
        body:
          "You don't have to call everyone in the first hour. Pick two or three people. Let them help with the rest of the calls.",
        tone: "calm",
      },
    ],
  },
  "home-expected": {
    headline: "You're in the at-home, expected scenario.",
    subhead:
      "If hospice was involved, a hospice nurse will pronounce death. You have a little more time than the hospital scenario, but body removal is still same-day.",
    showPriceCompareGate: true,
    priceGateText:
      "While you're waiting on the hospice nurse, take three minutes to see what funeral costs should look like in your area.",
    steps: [
      {
        title: "Call hospice (if they aren't already on their way).",
        body:
          "The hospice nurse will pronounce death officially and handle the immediate paperwork. You don't need to call 911 in this scenario.",
        tone: "info",
      },
      {
        title: "You don't have to choose a funeral home until hospice asks.",
        body:
          "When hospice asks which funeral home to call for transport, that's the moment that matters. Be ready with one you've actually compared — not just the first name on Google.",
        tone: "calm",
      },
      {
        title: "Sit with them as long as you need.",
        body:
          "There is no rush in this scenario. Hospice will not pressure you. If you want time before the funeral home arrives, ask for it.",
        tone: "calm",
      },
    ],
  },
  "home-unexpected": {
    headline: "You're in the at-home, unexpected scenario.",
    subhead:
      "Call 911 first if you haven't. Then come back — we'll walk through the rest with you.",
    showPriceCompareGate: false,
    steps: [
      {
        title: "Call 911 right now if you haven't.",
        body:
          "A medical professional has to legally pronounce the death. This is required. Police and possibly a coroner will come — that is normal in any unexpected death and does not mean anything is wrong.",
        tone: "urgent",
      },
      {
        title: "Do not move anything until police arrive.",
        body:
          "This is procedure. They'll take a brief look around. Nothing about this is an accusation — it's how every unexpected death is handled.",
        tone: "info",
      },
      {
        title: "Once they've left, come back here for what's next.",
        body:
          "When the body has been released and you have a little time, we'll help you compare funeral homes and walk through the next 24 hours.",
        tone: "calm",
      },
    ],
  },
  elsewhere: {
    headline: "Tell us a little more.",
    subhead:
      "We can guide most situations. While we sort out the specifics, here are the universal first steps for the next two hours.",
    showPriceCompareGate: true,
    priceGateText:
      "Whatever the situation, knowing fair funeral prices in your area is a five-minute investment that often saves thousands.",
    steps: [
      {
        title: "Make sure death has been legally pronounced.",
        body:
          "A medical professional, hospice nurse, or first responder needs to confirm the death. Until that happens, no one can move the body and no funeral home can act.",
        tone: "info",
      },
      {
        title: "Identify the closest one or two people to call.",
        body:
          "You don't need to notify the whole family yet. Find your point person and let them help.",
        tone: "calm",
      },
      {
        title: "Slow down before calling a funeral home.",
        body:
          "The first call to a funeral home starts the sales process. A few minutes of preparation before that call routinely saves families thousands.",
        tone: "info",
      },
    ],
  },
};

/** The five questions the family should ask any funeral home. Sister's content. */
export const FIVE_QUESTIONS: { q: string; why: string }[] = [
  {
    q: "Can I see your itemized General Price List before we begin?",
    why: "This is your right under the FTC Funeral Rule. Asking it changes the entire meeting — it tells the director you know your rights, and the prices they quote will be more honest from that point on.",
  },
  {
    q: "What is your basic services fee, and what exactly does it cover?",
    why: "This is the only non-declinable charge. Fair range is $1,500–$2,500. Anything over $3,500 is a red flag.",
  },
  {
    q: "Will you accept a casket I purchase from another vendor at no extra fee?",
    why: "Federal law requires them to. If they hesitate or charge a 'handling fee', that's illegal — and tells you exactly what kind of home this is.",
  },
  {
    q: "Is embalming required for the type of service I want?",
    why: "Embalming is NOT legally required in most states. If they say it is, ask them to point to the law. They cannot.",
  },
  {
    q: "What is the total all-in cost in writing, with every fee included?",
    why: "Verbal estimates are useless. A written, itemized total is the only number you can compare across funeral homes.",
  },
];

/** Scripts for declining specific upsells without feeling guilty. Sister's voice. */
export const DECLINE_SCRIPTS: { upsell: string; script: string }[] = [
  {
    upsell: "Premium / 'protective' caskets",
    script:
      "We've decided on a simpler casket. We're not interested in the protective seal — we know it doesn't extend preservation in any meaningful way.",
  },
  {
    upsell: "Embalming",
    script:
      "We're not having embalming. We understand it isn't legally required for the service we're planning.",
  },
  {
    upsell: "Memorial package upgrades",
    script:
      "We're going to handle the programs, flowers, and obituary ourselves. Please leave those off the bill.",
  },
  {
    upsell: "Concrete burial vaults / 'extra protection' grave liners",
    script:
      "We'd like the most basic grave liner that meets the cemetery's requirement. Please show us that option.",
  },
  {
    upsell: "Family limousine",
    script: "We'll be driving ourselves to the cemetery. Please remove the limo.",
  },
  {
    upsell: "Funeral home flower arrangements",
    script:
      "We'll be ordering flowers directly from a florist. Please don't add anything from your own arrangements.",
  },
];

/** Things still negotiable AFTER signing. Most families don't know this. */
export const POST_SIGNING_NEGOTIABLE: { item: string; how: string }[] = [
  {
    item: "Casket substitution",
    how: "If the funeral hasn't happened, you can still bring in a third-party casket. The funeral home must accept it.",
  },
  {
    item: "Add-ons (flowers, programs, obituary)",
    how: "These can always be removed and handled independently up until the day of the service.",
  },
  {
    item: "Embalming",
    how: "If embalming hasn't been performed yet, you can decline it.",
  },
  {
    item: "Cemetery choice",
    how: "Until burial is scheduled, you can switch cemeteries. Compare opening/closing fees independently.",
  },
];
