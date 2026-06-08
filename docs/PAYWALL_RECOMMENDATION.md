# What belongs in front of vs behind the paywall (2026-05-21)

You asked whether the obituary helper, analyzer, worksheet, veterans checker,
and after-funeral checklist should be paid. Short answer: **no — those should
all be free.** This doc explains why, what I changed, and the one bigger
decision only you can make.

## The model the code is actually running

The gating split (once you decode it):

- **Outreach** (`/negotiate/*` — we contact funeral homes, collect quotes,
  show them side by side) → requires **login only**. Free.
- **Tools** (obituary, analyzer, worksheet, veterans, checklist, eulogy,
  certificates, memorial, timeline, vault, etc.) → required **$49 "toolkit"
  unlock**.

So today: **the outreach is free; the $49 unlocks the tools.**

## Why that's backwards

The single most valuable thing Honest Funeral does — contacting homes and
getting comparison quotes that save a family **$2,000–$5,000** — is free. The
$49 sits in front of *secondary* tools (a program builder, a checklist, a
document tracker). That's pricing misaligned with value, and it puts a paywall
in front of exactly the tools that should be pulling grieving families *in*.

The free tools are your **acquisition engine**: "write an obituary," "VA burial
benefits," "is this funeral quote fair" are high-intent searches. Gating them
kills SEO reach and the trust that earns the paid conversion. The original
brief had this right: **free tools drive acquisition; the outreach is the paid
product.**

## What I changed (the 5 you named + eulogy)

Freed (removed the $49 gate; they now render as public static pages):

| Tool | Why free |
|---|---|
| Obituary helper | Huge search term; classic free lead magnet; near-zero AI cost |
| Eulogy helper | Obituary's twin — inconsistent to free one and not the other |
| Price-list analyzer | The value *demo* — proves overpayment, which motivates the paid step. Also captures real price data (the moat) |
| Pre-meeting worksheet | Zero marginal cost; pure trust-builder; its page was even titled "free" |
| Veterans benefits checker | Info tool; its own metadata literally said "Free checker" while gated; bad PR to charge veterans' families |
| After-funeral checklist (`/next-30-days`) | Core "walk beside you" mission; basic "what do I do now" guidance |

Dashboard tiles for these no longer show the "Unlock with toolkit" badge.

## Recommended full split

**FREE (acquisition / trust / SEO / info — low marginal cost):**
obituary, eulogy, analyzer, worksheet, veterans, after-funeral checklist,
certificate calculator, subscription finder, estate/probate guides,
headstone-vendor directory — plus the already-free prices, decide, prep,
faith, glossary, rights, guidance.

**Reasonable to keep in a paid tier (genuine "do-work-for-you" / premium /
ongoing-cost):**
notifications hub (AI auto-notifies accounts), document vault (storage),
family collaboration — and, if you adopt the recommendation below, the
funeral-home outreach itself.

## The one decision only you can make: what is the $49 *for*?

Freeing the tools leaves the "$49 toolkit" with little worth selling. So pick
the model:

- **Model A — Outreach is the paid product (matches the brief, my
  recommendation).** All tools free. $49 (or your chosen price) buys the
  funeral-home outreach + side-by-side comparison — the thing that saves
  thousands. Clean story: "everything to *learn* is free; you pay only when we
  do the *work* of getting you quotes." Requires flipping `/negotiate/*` from
  login-gated to paid-gated, and rewriting the paywall/dashboard/FAQ copy
  (currently "outreach is free, toolkit is $49").

- **Model B — Keep outreach free, sell a smaller premium toolkit.** Outreach
  stays free; $49 unlocks only the premium tools (notifications, vault, family,
  memorial/timeline/livestream). Weaker monetization — you're charging for
  secondary tools while giving away the crown jewel.

I recommend **Model A.** It aligns price with value, maximizes the free-tool
acquisition funnel, and is the validated model from the original brief. But
reversing the outreach gating + all the surrounding copy is a real change, so
I'm surfacing it rather than guessing.
