"use client";

import { useState } from "react";

export function DeleteAccount() {
  const [confirm, setConfirm] = useState(false);

  return (
    <form action="/api/account/delete" method="post">
      <label className="flex items-start gap-2 text-sm text-ink-soft mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          I understand this permanently deletes my account and all my data, and
          can&rsquo;t be undone.
        </span>
      </label>
      <button
        type="submit"
        disabled={!confirm}
        className="inline-flex items-center justify-center font-semibold rounded-2xl bg-bad text-on-primary hover:bg-bad/90 disabled:opacity-50 disabled:cursor-not-allowed px-7 py-4 text-base min-h-11"
      >
        Delete my account
      </button>
    </form>
  );
}
