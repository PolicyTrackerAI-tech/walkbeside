"use client";
import { useState } from "react";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — silently fail.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`text-xs uppercase tracking-wider text-primary-deep border border-primary/30 rounded-full px-3 py-1 hover:bg-primary-soft transition-colors ${className}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
