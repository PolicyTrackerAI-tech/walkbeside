import Link from "next/link";

export function Brand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-serif ${dim} text-ink hover:no-underline`}
    >
      <span
        aria-hidden
        className="inline-block w-3 h-3 rounded-full bg-primary"
      />
      Walk Beside
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
      <div className="max-w-3xl mx-auto px-5 py-8 text-sm text-ink-muted space-y-2">
        <p>
          Built by a licensed funeral director and her brother. Always free to
          start. We only earn if we save you money.
        </p>
        <p className="text-xs">
          Walk Beside is not a law firm or a funeral home. The information here
          is general guidance, not legal or medical advice.
        </p>
      </div>
    </footer>
  );
}
