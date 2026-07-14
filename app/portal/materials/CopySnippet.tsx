"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * A copy-paste block for /portal/materials: the snippet rendered as plain
 * text (no textarea) with a one-click copy button. Same "Copied ✓" feedback
 * pattern as LinksClient.
 */
export function CopySnippet({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this text:", text);
    }
  }

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <p className="text-sm text-ink-soft whitespace-pre-wrap break-words">
        {text}
      </p>
      <div className="mt-3">
        <Button variant="secondary" onClick={copy}>
          {copied ? "Copied ✓" : "Copy"}
        </Button>
      </div>
    </Card>
  );
}
