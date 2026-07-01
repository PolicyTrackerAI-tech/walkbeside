"use client";

import { useState } from "react";
import { Label, Textarea } from "@/components/ui/Field";

/**
 * One price-document input: photo(s) via the shared OCR endpoint, or pasted
 * text. Used by /bill-check (quote + bill sides) and /compare-quotes (one per
 * home). Multi-page photos are stitched in order, matching the analyzer.
 */

async function downscaleImage(
  file: File,
  maxDim = 2048,
  quality = 0.85,
): Promise<{ dataUrl: string; mediaType: "image/jpeg" }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read the file."));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Couldn't decode the image."));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable in this browser.");
  ctx.drawImage(img, 0, 0, width, height);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", quality),
    mediaType: "image/jpeg",
  };
}

export function DocInput({
  id,
  label,
  hint,
  photoAriaLabel,
  text,
  setText,
  disabled,
  rows = 8,
}: {
  /** Unique id prefix for the textarea (a11y label pairing). */
  id: string;
  label: string;
  hint: string;
  photoAriaLabel: string;
  text: string;
  setText: (v: string) => void;
  disabled: boolean;
  rows?: number;
}) {
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setReading(true);
    setReadError(null);
    try {
      const pages: string[] = [];
      for (const file of files) {
        const { dataUrl, mediaType } = await downscaleImage(file);
        const r = await fetch("/api/extract-price-list-image", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: dataUrl, mediaType }),
        });
        const d = await r.json().catch(() => ({}));
        const pageText = typeof d?.text === "string" ? d.text.trim() : "";
        if (r.ok && pageText) pages.push(pageText);
      }
      if (!pages.length) {
        setReadError(
          "Couldn't read that photo — try a clearer one, or type the lines below.",
        );
      } else {
        setText(pages.join("\n"));
      }
    } catch {
      setReadError(
        "Couldn't process the image — try again or type the lines below.",
      );
    } finally {
      setReading(false);
      // Allow re-picking the same file after a failed read.
      input.value = "";
    }
  }

  return (
    <div>
      <Label htmlFor={`${id}-text`} hint={hint}>
        {label}
      </Label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        aria-label={photoAriaLabel}
        onChange={handleFile}
        disabled={disabled || reading}
        className="block w-full text-sm text-ink-soft mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-soft file:text-primary-deep hover:file:bg-primary-soft/80 disabled:opacity-60"
      />
      {reading && (
        <p role="status" aria-live="polite" className="text-sm text-ink-soft mb-2">
          Reading the photo…
        </p>
      )}
      {readError && <p className="text-sm text-bad mb-2">{readError}</p>}
      <Textarea
        id={`${id}-text`}
        rows={rows}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Basic services fee   $2,195\nEmbalming            $895\n…`}
      />
    </div>
  );
}
