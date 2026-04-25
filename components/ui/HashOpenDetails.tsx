"use client";
import { useEffect } from "react";

/**
 * Renders nothing — small client island that opens a <details id={hash}>
 * when the URL hash changes (or on initial load).
 */
export function HashOpenDetails() {
  useEffect(() => {
    function openFromHash() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el && el.tagName.toLowerCase() === "details") {
        (el as HTMLDetailsElement).open = true;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
  return null;
}
