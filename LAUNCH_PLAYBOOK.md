# Launch Playbook — making Honest Funeral real

Step-by-step for the brother (you) and the sister (the funeral director). Do these in order. None of this requires touching code.

---

## 1. Supabase — the database (you, ~30 min)

1. Go to https://supabase.com → **New project**. Region: closest to launch city. Save the project password somewhere you won't lose it.
2. Project Settings → **API**. Copy three values into `.env.local` and into Vercel later:
   - `NEXT_PUBLIC_SUPABASE_URL` → "Project URL"
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → "anon / public" key
   - `SUPABASE_SERVICE_ROLE_KEY` → "service_role" key (this one is **secret**, never put in client code)
3. SQL Editor → **New query**. Paste in the contents of `supabase/schema.sql`. Run it. Then paste in `supabase/migrations/2026-04-25-v2-unlock-and-directory.sql`. Run that too.
4. Authentication → Providers → **Email**. Enable "Magic Link". Templates → "Magic Link" — set Subject to "Sign in to Honest Funeral".
5. Authentication → URL Configuration → set **Site URL** to your deployed URL (set later, e.g. `https://honestfuneral.co`). For now `http://localhost:3000` works.

---

## 2. Sister populates the funeral home directory (~2 hours, one-time)

This is the single most important non-code task before launch. Without it, our outreach goes nowhere real.

1. Open `supabase/seed/funeral-homes.example.csv` to see the format.
2. Sister builds a real CSV with 30–60 funeral homes in the launch city. Columns:
   - `name`, `email`, `phone`, `address`, `city`, `state`, `zip` — required
   - `google_rating`, `google_review_count` — fill from a quick Google Maps search per home
   - `notes` — internal only, sister's read on each home (e.g. "SCI affiliate; tends pushy", "small independent; transparent")
3. In Supabase SQL Editor: Table Editor → `funeral_homes` → **Insert** → **Import data from CSV**. Drop the file in.
4. Verify with `select count(*) from funeral_homes where active = true;` — should match your row count.

**When it's time to expand to a second city:** repeat step 2 for that city. The dashboard outreach lookup orders results by exact zip → 3-digit zip prefix → fallback, so adding rows is non-destructive.

---

## 3. Stripe — payments (you, ~15 min)

1. Create a Stripe account at https://stripe.com. Activate it (requires bank info, but you can run in **test mode** indefinitely without activating for real charges).
2. Developers → **API keys**. Copy:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_…` for test mode, `sk_live_…` for production)
3. Developers → **Webhooks** → **Add endpoint**:
   - URL: `https://YOUR-DEPLOYED-URL/api/stripe/webhook` (set after Vercel deploy)
   - Events to listen for: `checkout.session.completed` (just that one)
   - Copy the **Signing secret** (starts with `whsec_…`) → `STRIPE_WEBHOOK_SECRET`
4. **No Product or Price objects to create.** The app builds line items inline ($49 with description "Honest Funeral advocate fee"). When you change the fee, edit `FLAT_FEE_CENTS` in `lib/stripe.ts` and redeploy.
5. To test locally, install the Stripe CLI: `brew install stripe/stripe-cli/stripe`, then `stripe listen --forward-to localhost:3000/api/stripe/webhook`. It prints a `whsec_…` for local use.

---

## 4. Resend — outbound email (you, ~30 min)

This is what sends the GPL-request emails to funeral homes on a family's behalf. **Without this, outreach is silently broken.**

1. Sign up at https://resend.com.
2. **Domains** → Add `honestfuneral.co` (or whatever .com you're using). Resend gives you DNS records to add at your registrar (Cloudflare, Namecheap, etc.). Add them; verification takes 5–60 minutes.
3. API Keys → **Create API key** → name it "production". Copy → `RESEND_API_KEY`.
4. Set `RESEND_FROM=Honest Funeral Advocacy <advocate@honestfuneral.co>` in `.env.local` and Vercel.
5. **Test it:** start the dev server, sign in, run a real outreach with your own email as a test "funeral home" in the directory. You should receive the GPL request email within a minute.

---

## 5. Anthropic — Claude API (you, ~5 min)

This personalizes the GPL-request emails so they don't all read identically.

1. https://console.anthropic.com → API keys → **Create key**. Copy → `ANTHROPIC_API_KEY`.
2. Add a small starter credit ($5 is plenty for hundreds of outreach runs).

---

## 6. Vercel — deployment (you, ~20 min)

1. Push the repo to GitHub (private repo is fine).
2. https://vercel.com → **New Project** → import the GitHub repo.
3. Environment Variables tab — paste in all 7 values from your `.env.local`:
   - `NEXT_PUBLIC_APP_URL` (set to the eventual prod URL, e.g. `https://honestfuneral.co`)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`, `RESEND_FROM`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
4. Deploy. Vercel gives you a `*.vercel.app` URL.
5. Buy your real `.com` (Namecheap, Cloudflare Registrar). Add it as a custom domain in Vercel → Domains. Vercel walks you through DNS records.
6. Update `NEXT_PUBLIC_APP_URL` env var in Vercel to the real URL. Redeploy.
7. Update Supabase → Authentication → URL Configuration → Site URL to the real URL.
8. Update the Stripe webhook endpoint URL to point at the real URL.

---

## 7. First 10 deals — manual mode (both founders, weeks 3–4)

Per the brief Section 12. Don't trust the automation yet. For the first 10 paying families:

- You watch every outreach run as it goes out. If the AI-generated email reads weird for a particular family's situation, you intervene by hand.
- Sister reviews every reply that comes in. She knows immediately whether a home's quote is honest or padded.
- Sister does at least one phone call per family — not because the product needs it, but because you'll learn things in those calls that no analytics will tell you.

After 10 deals you'll know which features matter and which were guesses. Build V2 from there.

---

## What's deliberately not done yet (flag, don't fix)

- **Google Places integration** — out of scope for V1. When you're ready to expand beyond the launch city without sister curating each home by hand, that's the swap. Replace the body of `findHomesFromDirectory()` in `lib/negotiation/sample-homes.ts`.
- **Refund flow** — the $49 is non-refundable in code today even though we tell families it's refundable if no presented home honors their quote. For the first 10 deals, refund manually in Stripe Dashboard. Build the in-product refund button after deal 10.
- **Reply parsing** — the `negotiation_outreach.status` only flips when manually updated. Sister marks "replied" / "no-reply" / "declined" in Supabase Table Editor for now. Auto-classifier comes after deal 10.

---

## Costs at launch (per month)

| Service | Cost at 0 deals | Cost at 30 deals/mo |
|---|---|---|
| Supabase | $0 (free tier) | $0 |
| Vercel | $0 (Hobby) | $0–$20 (Pro if you exceed limits) |
| Stripe | $0 fixed; 2.9% + 30¢ per charge | ~$45 in fees on $1,470 revenue |
| Resend | $0 (3,000 emails/mo free) | $0–$20 |
| Anthropic | ~$1 | ~$5 |
| Domain | ~$12/year | ~$12/year |
| **Total** | **~$1/mo** | **~$70/mo** |

You can launch on a $5/mo budget. Real money only kicks in once Stripe is processing real charges.
