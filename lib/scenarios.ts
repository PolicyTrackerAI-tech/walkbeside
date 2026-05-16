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
  /**
   * Optional inline affordance for sharing the site with the actual
   * decision-maker. Renders a copy-link button + helper text inside
   * the step body. Used on /elsewhere where the person reading may
   * not be the one who'll plan the funeral.
   */
  shareAffordance?: {
    /** URL the button copies to clipboard. Should be a public crisis-entry page. */
    copyUrl: string;
    /** Label on the copy button. */
    copyLabel: string;
    /** Short prose shown above the button to explain context. */
    helperText: string;
  };
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
    headline: "Hospital or nursing home — what to do first.",
    subhead:
      "Either way, the biggest mistake families make in the first hour is agreeing to the first funeral home anyone recommends. You have more time than they're suggesting. We'll walk through it slowly.",
    showPriceCompareGate: true,
    priceGateText:
      "Before you call anyone, spend three minutes here. It could save you thousands.",
    pullQuote:
      "Hospitals and nursing homes are legally required to release your loved one when you're ready — not when they're ready. You are not causing a problem by taking a few hours.",
    steps: [
      {
        title: "Take a breath. You have more time than they're suggesting.",
        body:
          "The hospital or nursing home will ask you to choose a funeral home quickly — sometimes within an hour. That speed is for their convenience, not a legal requirement. They have to hold your loved one until you're ready. Saying \"I need a few hours to make some calls\" is normal and they will accept it. The single most expensive mistake families make in the first hour is committing to whatever funeral home the staff suggests. Don't. We'll help you compare a few in about ten minutes.",
        tone: "calm",
      },
      {
        title: "How the death gets confirmed.",
        body:
          "In a hospital, a doctor on the floor handles this. In a nursing home, a doctor or in some states a nurse practitioner does it. In a sudden or unexpected death — including some nursing-home deaths — the medical examiner is called instead and there can be a wait. Until the death is officially confirmed, nothing else can move forward. Usually it happens within an hour.",
        tone: "info",
      },
      {
        title: "You pick the funeral home — not the hospital or nursing home.",
        body:
          "Staff might suggest a home or hand you a brochure. They cannot push you toward a specific one. Your loved one goes where you say, when you say. Compare a few homes first — we can call them on your behalf and bring you the prices side by side.",
        tone: "info",
      },
      {
        title: "The one thing you'll sign before transport.",
        body:
          "A release form authorizing the funeral home you chose to take the body. Just that. The hospital or nursing home handles the rest with the funeral home directly. Read it carefully — it names one specific funeral home, and switching after is harder than getting it right the first time.",
        tone: "info",
      },
      {
        title: "Three calls. In order.",
        body:
          "(1) Two or three immediate family — the ones who need to know first. (2) The funeral home you actually compared and chose. (3) Your employer, if bereavement leave matters. That's it for today. Everything else can wait — we'll help you track who's been told later so nothing falls through.",
        tone: "calm",
      },
      {
        title: "When the doctor signs the paperwork.",
        body:
          "The doctor who confirmed the death also signs the official document (the death certificate). This usually happens within 24–72 hours. The funeral home you chose orders certified copies for you through the state vital records office. Most families need 10–15 originals — banks, life insurance, Social Security, and the IRS each want one.",
        tone: "info",
      },
      {
        title: "The rest of family — slowly.",
        body:
          "You don't have to call everyone today. Pick two or three close people. Ask them to help with the next round of calls. There's no prize for telling fifty people in twenty-four hours.",
        tone: "calm",
      },
    ],
  },
  "home-expected": {
    headline: "An expected death at home — what to do first.",
    subhead:
      "If hospice is involved, you have more time than the hospital scenario. A hospice nurse will come to confirm the death. Take a breath. The next few hours are quieter than you might expect.",
    showPriceCompareGate: false,
    pullQuote:
      "Hospice will not pressure you. Take the hour you need before transport. There are people who deeply regret hurrying through this part.",
    steps: [
      {
        title: "Take a breath. They're at peace.",
        body:
          "If hospice has been preparing you, this moment is not an emergency — it's the end of one. No CPR, no 911. If hospice is not involved and the death feels sudden, see the unexpected-death page instead. Otherwise: look for no pulse and no breathing for several minutes before calling the next person.",
        tone: "calm",
      },
      {
        title: "Call hospice — not 911.",
        body:
          "If hospice is involved, call the hospice nurse line. Hospice handles the next several hours: confirming the death, paperwork, helping you decide when transport is right. Calling 911 instead brings an ambulance and police you don't need here, and can make the home transfer harder.",
        tone: "info",
      },
      {
        title: "If hospice wasn't involved.",
        body:
          "Call the doctor who was treating your loved one — their office line or the after-hours number. They can confirm the death and tell you whether the medical examiner needs to be called. In most expected at-home deaths, no police or ambulance is involved.",
        tone: "info",
      },
      {
        title: "Who arrives, and in what order.",
        body:
          "Hospice nurse comes first and officially confirms the death. The funeral home you've chosen sends transport when YOU say you're ready — not on their schedule. Police and the medical examiner are usually not involved in an expected at-home death.",
        tone: "info",
      },
      {
        title: "There is genuinely time. Sit with them.",
        body:
          "Hospice will not pressure you. Take the hour you need before transport. Many families deeply regret hurrying through this part. The body does not need to leave the room in the first hour, or the first three hours.",
        tone: "calm",
      },
      {
        title: "When the funeral home arrives.",
        body:
          "They'll ask you to sign one thing: a transport authorization letting them take your loved one to their facility. That's the only document you have to sign today. Caskets, services, urns, prices — all of that waits until the arrangement meeting a day or two later.",
        tone: "info",
      },
      {
        title: "About choosing the funeral home.",
        body:
          "Hospice will ask which funeral home to call for transport — that's the moment that matters. Be ready with one you've actually compared, not just the first name on Google. We can call two or three for you and bring back their prices in about ten minutes.",
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
    headline: "Somewhere else — we'll walk through it.",
    subhead:
      "Workplace, public place, in transit, assisted living, in a car — the next few hours look slightly different depending on where, but the universal first steps are the same. Take a breath.",
    showPriceCompareGate: true,
    priceGateText:
      "Whatever the situation, knowing fair funeral prices in your area is a five-minute investment that often saves thousands.",
    pullQuote:
      "Slow down before calling a funeral home. The first call starts a sales process you can't easily reverse.",
    steps: [
      {
        title: "Make sure the death has been officially confirmed.",
        body:
          "A medical professional, hospice nurse, or first responder needs to confirm the death. Until that happens, no one can move your loved one and no funeral home can take possession. In most public or in-transit deaths, EMS arrives first and handles this within an hour.",
        tone: "info",
      },
      {
        title: "Find your point person.",
        body:
          "You don't have to call the whole family right now. Find the one or two people who need to know first. Let them help with the rest of the calls. There's no prize for telling fifty people in the first day.",
        tone: "calm",
      },
      {
        title: "Are you the one planning, or someone else?",
        body:
          "Funeral decisions usually fall to one person — a spouse, an adult child, the executor. If that's you, keep going with us: the next step is comparing funeral home prices before any first call (the first call commits you to that home; the move is hard to undo). If the planning falls to someone else — a sibling, a parent who can't deal with this right now — the most useful thing you can do is send them this site. They can pick it up here and we'll walk them through it.",
        tone: "info",
        shareAffordance: {
          copyUrl: "https://honestfuneral.co/where",
          copyLabel: "Copy link to send",
          helperText:
            "If you're not the one planning, share this with whoever is. They can text or email it however works:",
        },
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
