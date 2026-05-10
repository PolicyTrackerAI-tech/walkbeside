"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

/**
 * Zip search form for /funeral-homes (the directory landing page).
 * Pushes the user to /funeral-homes/[zip] on valid 5-digit input.
 */
export function ZipSearchForm({
  defaultZip = "",
  cta = "See pricing & options →",
}: {
  defaultZip?: string;
  cta?: string;
}) {
  const router = useRouter();
  const [zip, setZip] = useState(defaultZip);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (zip.length === 5) router.push(`/funeral-homes/${zip}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 w-full">
        <Label htmlFor="zip" hint="Used to look up regional pricing.">
          Your zip code
        </Label>
        <Input
          id="zip"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          placeholder="78704"
          onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
        />
      </div>
      <Button type="submit" disabled={zip.length !== 5} size="lg">
        {cta}
      </Button>
    </form>
  );
}
