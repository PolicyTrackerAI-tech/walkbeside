"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  defaultHref?: string;
  defaultLabel?: string;
}

export function BackLink({ defaultHref = "/", defaultLabel = "← Back" }: Props) {
  const [href, setHref] = useState(defaultHref);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const ref = document.referrer;
      if (!ref) return;
      const url = new URL(ref);
      if (
        url.origin === window.location.origin &&
        url.pathname !== window.location.pathname
      ) {
        setHref(url.pathname + url.search);
      }
    } catch {}
  }, []);

  return (
    <Link href={href} className="text-sm text-ink-muted hover:text-ink-soft">
      {defaultLabel}
    </Link>
  );
}
