export default function Loading() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center px-5 py-20">
        <div
          className="inline-block h-8 w-8 rounded-full border-2 border-border border-t-primary-deep animate-spin"
          aria-hidden
        />
        <p className="mt-4 text-sm text-ink-soft">Loading…</p>
      </div>
    </main>
  );
}
