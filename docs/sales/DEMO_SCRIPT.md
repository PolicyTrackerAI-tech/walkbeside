# Honest Funeral — Family-Experience Demo Script (Discovery / Pitch Call)

**A tight ~10-minute live walkthrough for hospice discovery and pitch calls.** This is the *show*, not the *tell*. You are walking the bereavement coordinator (and, ideally, the Executive Director) through exactly what one of their grieving families experiences — then turning every screen back to *their* ROI: referrals, reputation, the unfunded 13-month mandate, and staff hours saved.

> **Before you dial:** Have the live product open in a browser, logged in, on a second monitor or a screen you can share. Have one realistic test case staged (a fictional family, a city in their service area, a sample price list to paste into the analyzer). Pull *their* Care Compare "emotional and spiritual support" score so you can reference it by number. Confirm screen-share works.
>
> **Route note (read before your first demo):** the outcome-capture and proof-sheet beats (Beat 5 + Beat 6) use `/admin/outcomes`, which is **not yet deployed** on this branch. Until it ships, run those two beats on a **mock/printed proof sheet**, not the live URL — don't navigate to it live or you'll hit a 404. The family-facing beats (1–4) are all live.
>
> **The one rule:** Lead with *their* reputation and referral engine, not our features. Every beat ends by handing the value back to them.

---

## The 60-second frame before you share your screen

**SAY:**
> "Before I show you anything — the reason I built this is simple. When a family has a great experience with [Hospice] in the hardest week of their life, that's where your referrals come from. The hospitals, the SNFs, the discharge planners, the physicians who send you patients — they're listening to those families. A family who felt *taken care of*, all the way through the funeral and the paperwork after, is your best marketing. A family who got overcharged $4,000 on a funeral the week after you discharged them — that lands on you too, fairly or not.
>
> So what I'm going to show you is the experience your families would actually have. It's free to them, we take zero money from funeral homes, and at the end you get a report that proves you delivered it. Give me about ten minutes and stop me anytime."

**SHOW:** Nothing yet — eye contact / camera. **TRANSITION:** "Let me share my screen."

---

## Beat 1 — The free fair-price lookup (≈90 sec)

**The pain you're naming:** Families have no idea what a funeral *should* cost, so they accept the first number. That confusion happens in *your* bereavement window, and your counselors aren't resourced to fix it.

**SAY:**
> "Here's the very first thing a family can do — no account, no email, nothing. They tell us where they are and what they're considering, and we show them what a funeral *should* cost in their area, line by line. This is the page a family lands on after one of your social workers hands them a card."

**SHOW / CLICK:**
- Go to **`/prices`**.
- Read the headline aloud — *"See what you should expect to pay."*
- Enter **their** local city / ZIP in the calculator. Let the fair-price range render.
- Point at the itemized breakdown: *"This is the cremation fee, this is the basic services fee, this is what's reasonable here — and this is what's often padded."*

**TRANSITION (back to their ROI):**
> "Notice there's no upsell, no funeral home being pushed. That's deliberate — and it's the whole reason you can hand this to a family. For you, this is the first ten minutes of bereavement support your counselors don't have to staff."

---

## Beat 2 — "Is this quote fair?" — the analyzer (≈90 sec)

**The pain you're naming:** A family already has a quote in hand and no way to tell if they're being taken advantage of. That's the single most exploitative moment in the whole process.

**SAY:**
> "Now — say the family already walked into a funeral home and came out with a price list. This is where it gets real. They paste in or upload that price list, and we flag the overcharges and, just as importantly, the items they can *legally decline* — things the FTC Funeral Rule says no one can force on them."

**SHOW / CLICK:**
- Go to **`/analyzer`**.
- Paste the staged sample price list (have this ready — don't fumble live).
- Walk the output: *"Here it's flagging this 'service fee' as well above the local norm. Here it's telling the family this casket-handling charge can be declined. Here's the plain-English explanation of why."*

**TRANSITION (back to their ROI):**
> "This is exactly the conversation your bereavement coordinator gets pulled into — 'Is this normal? Am I being ripped off?' — and it's a conversation you're not funded or staffed to have. We take it off your plate, and the family remembers that it was [Hospice] who handed them the thing that saved them."

---

## Beat 3 — The advocacy flow: request itemized quotes (≈90 sec)

**The pain you're naming:** Calling five funeral homes, asking for itemized prices, and comparing them is exhausting work no grieving family should do — and no counselor has time for.

**SAY:**
> "If the family wants, they don't have to make a single call. They tell us their area and what kind of service they want, and we reach out to the funeral homes *for* them and request itemized, apples-to-apples quotes. A real person on our side does this — it's not a directory dump."

**SHOW / CLICK:**
- Go to **`/negotiate/start`**.
- Walk the wizard a step or two: location, type of service. *"This is all the family fills in."*
- Pause on the framing: *"We contact the homes, we ask for the itemized price list, we do the back-and-forth."*

**TRANSITION (back to their ROI):**
> "Every minute here is a minute your staff isn't spending on funeral logistics that sit outside grief counseling. And it's neutral — we're not sending them to a home we get paid by, because no home pays us. Hold that thought, because it's the next screen."

---

## Beat 4 — The neutral side-by-side: the family chooses (≈90 sec)

**The pain you're naming — and the compliance bar:** This is the anti-steering moment. If anything here looked like a referral to a specific home, you couldn't ethically hand it to a family. It doesn't.

**SAY:**
> "Here's what comes back. Every home that responded, laid side by side, same line items, so the family can actually compare. We don't rank them by who pays us — *nobody* pays us. We present the options, and the family chooses. Always. We never steer."

**SHOW / CLICK:**
- Go to **`/negotiate/[id]/compare`** (or **`/negotiate/[id]/results`**) on your staged case.
- Run your finger across the columns: *"Same service, three homes, here's the price spread — often a couple thousand dollars for the identical thing."*
- Land on the choice action (the **`/negotiate/[id]/closed`** / "choose this home" step): *"The family picks. We notify the home. Done. We never put a thumb on the scale."*

**TRANSITION (back to their ROI — this is the compliance close):**
> "This is the exact reason a hospice can put us in a family's hands and it's *not* steering. We present neutral options, the family decides, and we take no funeral-home or insurer money — ever. That's not a marketing line, it's how the company is built, and it's why this is the one funeral-cost tool you can ethically endorse under anti-steering law."

---

## Beat 5 — Outcome capture (≈45 sec) — *mock until `/admin/outcomes` ships*

**SAY:**
> "Behind the scenes, on every single case, we record what the family was originally quoted, what each home offered, what they ended up paying, any hidden fees we caught, and how satisfied they were. That's not for us to brag — it's so I can hand *you* proof."

**SHOW / CLICK:**
- Briefly show the outcome-capture view (`/admin/outcomes` — your founder/admin view; **use a mock/screenshot until this route is deployed**, don't navigate live). Don't dwell, this isn't the family's screen.
- Point at the captured fields: *"Listed price, negotiated price, savings, satisfaction, time to resolution — one row per family."*

**TRANSITION:**
> "Which brings me to the only screen that's really *for you*."

---

## Beat 6 — The hospice-facing proof report (≈90 sec — the payoff) — *mock until live data exists*

**SAY:**
> "At the end of a pilot, this is what you get. One page. How many of your families we served, average savings per family, total savings, satisfaction score, average time to resolution, and how many hidden fees we caught. Two consented, de-identified family quotes at the bottom."

**SHOW / CLICK:**
- Show the proof-sheet view (hand-built from outcomes data, or your printed mock if the pilot hasn't run yet — this is the [`ROI_RESULTS_TEMPLATE.md`](ROI_RESULTS_TEMPLATE.md) filled in): walk the metrics row by row.
- *"Families served: [N]. Average savings: $[X]. Satisfaction: [X] out of 5."*

**TRANSITION (the three ROI levers, in order):**
> "Here's why this page matters to *you*, in the order it matters:
>
> **One — referrals.** Every one of these families had a good experience attached to [Hospice]'s name. That's the word-of-mouth and the referral-source goodwill that drives your census. This page is the receipt.
>
> **Two — your mandate.** This is documented evidence you supported families through the 13-month bereavement window Medicare requires under 42 CFR 418.64 — the obligation you carry with no extra funding. It goes straight in your compliance file. *(And yes, supporting families in the weeks after a death is exactly what CAHPS asks them about — so it shows up in your reputation there too.)*
>
> **Three — staff hours.** Every case on this sheet is funeral-pricing and after-death admin work your counselors didn't have to do. That's the line we'll come back to when we talk about what it's worth."

> **Note to self — do NOT say CAHPS = more Medicare money.** CAHPS is pay-for-*reporting* and reputation, not reimbursement. Frame it as reputation/scores only. The real ROI is referrals.

---

## The pilot ask (≈45 sec — close every demo here)

**SAY:**
> "So here's what I'd love to do. A **free 60-day pilot** — no cost to you, no cost to your families, no budget conversation. You hand a neutral card to ten or fifteen families; they enroll themselves, so nothing crosses your desk and we never touch your patient records. I run every single case by hand. At the end, I bring you back this exact proof sheet, built on *your* families — and then we decide together whether it's worth a simple annual agreement that costs less than the staff hours it just saved you.
>
> If the numbers don't prove out, we shake hands and you owe nothing. Can we pick ten or fifteen families to start?"

**SHOW:** Stop sharing. Back to camera. Stop talking — let them respond.

---

## Pocket objection answers (keep these next to you on the call)

| If they say… | You say… |
|---|---|
| **"Is this steering / a kickback?"** | "It can't be — we present every option, the family chooses, and we take no funeral-home money. That's precisely *why* a hospice can use us. You saw the side-by-side: nobody's ranked by who pays us, because nobody pays us." |
| **"We have no budget."** | "Then this is perfect — the pilot is free for 60 days, and we're exploring aging and bereavement grant funding that may help cover it afterward. 'No budget' shouldn't be the thing that decides this." |
| **"We already do bereavement."** | "Your counselors do the grief work, and they're good at it. We don't replace them — we handle the *funeral-pricing and after-death admin maze* they aren't resourced for, and we hand you the report. We make your program look more complete, not redundant." |
| **"How do we know the prices are right?"** | "Published methodology and real itemized price-list data — and in the pilot you'll watch it work on *your own* families, not a brochure number. You saw the analyzer flag real overcharges live just now." |
| **"What about our families' privacy?"** | "Families enroll themselves from a card you hand them — no patient data ever comes to us. You get aggregate outcomes only, never anyone's private case. If you ever *want* to share more, we put a BAA in place first." |
| **"Send me something."** | *Good signal.* "Done — I'll send the one-page pilot outline today. Can we hold 15 minutes on [day] to walk through it?" |

---

## Demo logistics checklist (run before every call)

- [ ] Logged into the live product; `/prices`, `/analyzer`, `/negotiate/start`, `/negotiate/[id]/compare`, and `/negotiate/[id]/results` all load.
- [ ] Outcome/proof-sheet beats (5 + 6): mock or printed proof sheet ready — `/admin/outcomes` is **not deployed on this branch yet**, so don't navigate to it live.
- [ ] One staged test case ready (fictional family, **a city in their service area**, sample price list copied to clipboard for the analyzer).
- [ ] **Their** Care Compare emotional-and-spiritual-support score written down — reference it as *reputation*, never as reimbursement.
- [ ] Pilot one-pager attachment ready to send the moment they say "send me something."
- [ ] Screen-share tested; second monitor or clean browser window (no other tabs visible).
- [ ] **Be honest on timeline:** a pilot can start within ~90 days; a *paid* contract is realistically 4–6 months out. Don't promise faster.

> **Total runtime:** ~10 minutes of demo + Q&A. If you're short on time, the two non-skippable beats are **Beat 2 (the analyzer — the "am I being ripped off" moment that lands viscerally)** and **Beat 6 (the proof report — their ROI made concrete)**. Everything else can compress.
