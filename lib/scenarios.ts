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
  /** Single sentence the scenario should anchor around. Rendered as pull-quote. */
  pullQuote?: string;
}

export const SCENARIO_GUIDANCE: Record<Scenario, ScenarioGuidance> = {
  hospital: {
    headline: "You're in the hospital scenario.",
    subhead:
      "The hospital will ask you to choose a funeral home soon — usually within a few hours. Take a breath. You have more time than they're suggesting.",
    showPriceCompareGate: true,
    priceGateText:
      "Before you call anyone, spend three minutes here. It could save you thousands.",
    pullQuote:
      "The hospital is legally required to release the body when you're ready — not when they're ready. You are not causing a problem by taking a few hours.",
    steps: [
      {
        title: "Tell the hospital you'll be back to them within a few hours.",
        body:
          "You don't have to choose a funeral home in the next 30 minutes. Hospitals have temporary holding for exactly this reason. The hospital is legally required to release the body when you're ready — not when they're ready. Saying \"I need a few hours\" is normal and they will accept it.",
        tone: "calm",
      },
      {
        title: "Do not commit to the first funeral home anyone recommends.",
        body:
          "Hospitals sometimes have informal partnerships. Once a body is moved to a funeral home, you are practically committed to that home. Compare prices first.",
        tone: "info",
      },
      // {{TODO_SARAH_REVIEW}} — please redline the medical/legal specifics
      // in the next four steps before this content ships.
      {
        title: "Who pronounces the death.",
        body:
          "In a hospital, the attending physician (or in some circumstances the medical examiner or coroner) makes the legal pronouncement. Until that happens, the death isn't yet official and no funeral home can take possession.",
        tone: "info",
      },
      {
        title: "The hospital does not choose your funeral home — you do.",
        body:
          "Hospital staff can answer practical questions, but they are not allowed to pressure you toward a specific funeral home. Transport from the hospital to the funeral home of your choice is your decision, not theirs.",
        tone: "info",
      },
      {
        title: "Release of remains paperwork.",
        body:
          "The hospital will ask for a signed release before transferring the body. The funeral home you choose handles most of this with the hospital directly. Read what you sign — you are authorizing transfer to a specific home, and that decision is hard to reverse.",
        tone: "info",
      },
      {
        title: "The first three calls to make.",
        body:
          "(1) Immediate family. (2) The funeral home you've actually chosen — only after you've compared. (3) Your employer if relevant for bereavement leave. The hospital social worker or case manager can help with practicalities, but is not a substitute for a funeral home.",
        tone: "calm",
      },
      {
        title: "When the death certificate gets signed.",
        body:
          "The attending physician typically signs the death certificate within 24–72 hours. The funeral home you choose orders certified copies through the state vital records office. Most families need 5–10 copies to start.",
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
    showPriceCompareGate: false,
    steps: [
      // {{TODO_SARAH_REVIEW}} — please redline the hospice / pronouncement /
      // physician procedure specifics below before this content ships.
      {
        title: "Confirm what you're seeing.",
        body:
          "For an expected death under hospice, no medical intervention is needed — no chest compressions, no 911. If hospice is not involved, look for no pulse and no breathing for several minutes before you call the next person.",
        tone: "calm",
      },
      {
        title: "Call hospice first — not 911.",
        body:
          "If hospice is involved, call the hospice nurse line. Hospice handles pronouncement and the next several hours. Calling 911 will trigger an EMS response that isn't needed in this scenario and can complicate the home transfer.",
        tone: "info",
      },
      {
        title: "If hospice is not involved.",
        body:
          "Call the attending physician's office or the patient's primary care doctor. They can guide you on whether the death can be pronounced at home or whether the medical examiner needs to be called. In most expected-death scenarios at home, EMS and police are not required.",
        tone: "info",
      },
      {
        title: "Who comes to the home and in what order.",
        body:
          "Hospice nurse arrives and pronounces. The funeral home you've chosen sends transport when you're ready. Police and the coroner are typically not involved in an expected at-home death.",
        tone: "info",
      },
      {
        title: "There is genuinely time. Sit with them.",
        body:
          "With an expected death at home, the family does not need to rush. Hospice will not pressure you. Take the hour you need before transport. There are people who deeply regret hurrying through this part.",
        tone: "calm",
      },
      {
        title: "When the funeral home arrives.",
        body:
          "They will ask for a transport authorization to take the body to their facility. That is the only document you are obligated to sign at this stage. Anything about caskets, services, urns, or pricing can wait until the arrangement meeting in a day or two.",
        tone: "info",
      },
      {
        title: "You don't have to choose a funeral home until hospice asks.",
        body:
          "When hospice asks which funeral home to call for transport, that's the moment that matters. Be ready with one you've actually compared — not just the first name on Google.",
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
    pullQuote:
      "Slow down before calling a funeral home. The first call starts the sales process.",
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
    why: "Embalming is not legally required in any state. Some states require embalming OR refrigeration after a time window. If a home says state law requires embalming with no alternative, ask them to point to the specific statute — they cannot, because no such statute exists.",
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
