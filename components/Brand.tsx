import Link from "next/link";

export function RoseMark({
  className = "",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 36"
      width={size}
      height={(size * 36) / 32}
      aria-hidden="true"
      className={className}
    >
      {/* Outer petals */}
      <path
        d="M16 4
           C 21.5 4 25 7 25 11
           C 25 14.5 22.5 17 19 17.5
           L 19 18 L 13 18 L 13 17.5
           C 9.5 17 7 14.5 7 11
           C 7 7 10.5 4 16 4 Z"
        fill="var(--primary-deep)"
      />
      {/* Inner spiral suggesting petal layers */}
      <path
        d="M16 7
           C 19 7 20.5 9 20.5 11
           C 20.5 13 18.5 14.5 16 14.5
           C 14 14.5 12.8 13.3 13 11.5
           C 13.2 10 14.5 9.5 15.7 10
           C 16.7 10.4 17 11 17 11.8"
        stroke="var(--primary-soft)"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Stem */}
      <path
        d="M16 18 L 16 33"
        stroke="var(--primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Right leaf (upper) */}
      <path
        d="M16 21
           C 19 19.5 22 20.5 23 23
           C 20.5 24 17.5 23 16 21 Z"
        fill="var(--primary)"
      />
      {/* Left leaf (lower) */}
      <path
        d="M16 26
           C 12.5 24.5 9.5 25.5 8.5 28
           C 11.5 29 14.5 28 16 26 Z"
        fill="var(--primary)"
      />
    </svg>
  );
}

export function Brand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const mark = size === "lg" ? 34 : size === "sm" ? 22 : 28;
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-serif ${text} text-ink hover:no-underline`}
    >
      <RoseMark size={mark} />
      <span className="leading-none">Honest Funeral</span>
    </Link>
  );
}

export function Header({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="w-full border-b border-border bg-surface/70 backdrop-blur">
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <Brand />
        {!minimal && (
          <nav className="flex items-center gap-5 text-sm text-ink-soft">
            <Link href="/prices">Fair prices</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-soft">
      <div className="max-w-3xl mx-auto px-5 py-8 text-sm text-ink-muted space-y-3">
        <p>
          Built by a licensed funeral director and her brother. Always free to
          start. Flat $249 only if you choose a home we present to you.
        </p>
        <p className="text-xs">
          Honest Funeral is not a law firm, not a funeral home, and not a medical or
          financial advisor. Information here is general guidance, not legal,
          medical, or financial advice. Price estimates are informational and
          based on regional data; actual prices vary.
        </p>
        <div className="flex flex-wrap gap-4 text-xs pt-2">
          <Link href="/" className="hover:text-ink-soft">
            Home
          </Link>
          <Link href="/how-it-works" className="hover:text-ink-soft">
            How it works
          </Link>
          <Link href="/about" className="hover:text-ink-soft">
            About
          </Link>
          <Link href="/obituary" className="hover:text-ink-soft">
            Obituary helper
          </Link>
          <Link href="/faq" className="hover:text-ink-soft">
            FAQ
          </Link>
          <Link href="/after" className="hover:text-ink-soft">
            After the funeral
          </Link>
          <Link href="/terms" className="hover:text-ink-soft">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-ink-soft">
            Privacy Policy
          </Link>
        </div>
        <p className="text-xs pt-2">&copy; 2026 Honest Funeral</p>
      </div>
    </footer>
  );
}
