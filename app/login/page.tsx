"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";
import { FEATURES } from "@/lib/env";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabaseSet = FEATURES.supabase();

  async function handleGoogle() {
    setError(null);
    setInfo(null);
    if (!supabaseSet) return;
    setGoogleBusy(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Couldn't start Google sign-in.");
      setGoogleBusy(false);
    }
  }

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!supabaseSet) {
      setError(
        "Supabase isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      return;
    }
    setBusy(true);
    try {
      const sb = createClient();
      if (mode === "signup") {
        // Try sign-in first. If the email already has an account and
        // the password matches, log them in instead of bouncing with a
        // "user already exists" error. Common case: returning user typed
        // their existing credentials into the create-account form.
        const trySignIn = await sb.auth.signInWithPassword({ email, password });
        if (!trySignIn.error && trySignIn.data?.user) {
          router.push(next);
          router.refresh();
          return;
        }

        // Not an existing user (or password didn't match) — proceed with
        // signup. If Supabase reports the email already exists, surface
        // a helpful suggestion to switch to sign in.
        const { error: signUpError } = await sb.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (signUpError) {
          const msg = signUpError.message?.toLowerCase() ?? "";
          if (
            msg.includes("already registered") ||
            msg.includes("already exists") ||
            msg.includes("user already")
          ) {
            setError(
              "That email already has an account. The password you entered doesn't match — try signing in instead.",
            );
            setMode("signin");
          } else {
            throw signUpError;
          }
          return;
        }
        setInfo(
          "Check your inbox for a confirmation link from Honest Funeral. Click it to finish creating your account. You can close this tab — we'll bring you back here.",
        );
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-12">
          <Card>
            <CardTitle>
              {mode === "signup" ? "Save your progress" : "Welcome back"}
            </CardTitle>
            <p className="text-ink-soft mb-6 text-[15px]">
              {mode === "signup"
                ? "An account lets us hold your work while you step away. Every tool is free; we charge a flat $49 only when you choose a funeral home we found for you — refundable in 14 days if we don't save you anything."
                : "Sign in to pick up where you left off."}
            </p>
            {mode === "signup" && (
              <div className="mb-5 text-xs text-ink-muted bg-surface-soft rounded-xl px-4 py-3 border border-border">
                We use your email to save your progress and send you
                updates on any funeral-home outreach you start. We
                don&rsquo;t sell email addresses. Ever.
              </div>
            )}

            {!supabaseSet ? (
              <>
                <div className="mb-5 p-4 rounded-xl bg-warn-soft border border-warn/30 text-sm text-ink">
                  <strong className="block mb-1">Setup required</strong>
                  Add your Supabase URL and anon key to{" "}
                  <code className="text-xs">.env.local</code> to enable accounts.
                  The free tier (price lookup, prep kit, calculators) works
                  without an account.
                </div>
                <LinkButton href="/where" className="w-full">
                  Continue without an account →
                </LinkButton>
              </>
            ) : (
            <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleBusy || busy}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-white text-ink font-medium text-[15px] hover:bg-surface-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              {googleBusy ? "Opening Google…" : "Continue with Google"}
            </button>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-ink-muted">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <form onSubmit={handle} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  hint={mode === "signup" ? "At least 8 characters." : undefined}
                >
                  {mode === "signup" ? "Create password" : "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 px-3 text-xs text-ink-muted hover:text-ink-soft"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              {info && (
                <div className="text-sm text-good bg-good-soft border border-good/30 rounded-xl px-4 py-3">
                  {info}
                </div>
              )}

              <Button type="submit" disabled={busy || googleBusy} className="w-full">
                {busy
                  ? "Working…"
                  : mode === "signup"
                    ? "Create account with email"
                    : "Sign in with email"}
              </Button>
            </form>
            </>
            )}

            {supabaseSet && (
              <>
                <p className="mt-6 text-sm text-ink-muted text-center">
                  {mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        className="text-primary-deep underline"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      New here?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-primary-deep underline"
                      >
                        Create an account
                      </button>
                    </>
                  )}
                </p>

                <p className="mt-3 text-xs text-ink-muted text-center">
                  <Link href="/prices">Continue without an account →</Link>
                </p>
              </>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5 py-10 max-w-md mx-auto text-ink-muted">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
