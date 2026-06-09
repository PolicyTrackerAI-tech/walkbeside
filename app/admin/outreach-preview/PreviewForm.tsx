"use client";

import { useState } from "react";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select } from "@/components/ui/Field";

type Mode = "outreach" | "selection";

interface PreviewResult {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  body: string;
  home: {
    name: string;
    email: string;
    source?: "input" | "directory" | "placeholder";
  };
  authorizationIdPlaceholder: string;
}

const SOURCE_LABEL: Record<NonNullable<PreviewResult["home"]["source"]>, string> = {
  input: "from form input",
  directory: "from funeral_homes directory",
  placeholder: "no match in directory — placeholder",
};

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "direct-cremation", label: "Direct cremation" },
  { value: "cremation-with-service", label: "Cremation with service" },
  { value: "traditional-burial", label: "Traditional burial" },
  { value: "graveside-burial", label: "Graveside burial" },
  { value: "green-burial", label: "Green burial" },
  { value: "aquamation", label: "Aquamation" },
  { value: "body-donation", label: "Body donation" },
  { value: "memorial-no-body", label: "Memorial (no body)" },
];

export function PreviewForm() {
  const [mode, setMode] = useState<Mode>("outreach");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreviewResult | null>(null);

  // Outreach inputs
  const [senderFirstName, setSenderFirstName] = useState("Maria");
  const [senderLastName, setSenderLastName] = useState("Alvarez");
  const [timing, setTiming] = useState("within the next week");
  const [zip, setZip] = useState("84101");
  const [outreachHomeName, setOutreachHomeName] = useState("");
  const [outreachHomeEmail, setOutreachHomeEmail] = useState("");

  // Selection inputs
  const [familyLabel, setFamilyLabel] = useState("the Alvarez family");
  const [selHomeName, setSelHomeName] = useState("Cedar Hill Funeral Home");
  const [selHomeEmail, setSelHomeEmail] = useState("office@cedarhill.example");
  const [serviceType, setServiceType] = useState("direct-cremation");
  const [quoteDollars, setQuoteDollars] = useState("1995");

  function switchMode(next: Mode) {
    setMode(next);
    setResult(null);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const url =
        mode === "outreach"
          ? "/api/negotiate/preview"
          : "/api/negotiate/preview-selection";
      const body =
        mode === "outreach"
          ? {
              senderFirstName,
              senderLastName: senderLastName || undefined,
              timing,
              zip: zip || undefined,
              homeName: outreachHomeName || undefined,
              homeEmail: outreachHomeEmail || undefined,
            }
          : {
              familyLabel,
              homeName: selHomeName,
              homeEmail: selHomeEmail,
              serviceType,
              quoteCents: Math.round(parseFloat(quoteDollars || "0") * 100),
            };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.error ? JSON.stringify(data.error) : `HTTP ${res.status}`,
        );
        return;
      }
      const data: PreviewResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col bg-bg">
      <div className="max-w-4xl mx-auto w-full px-5 py-10">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-ink">
            Funeral-home email preview
          </h1>
          <p className="text-ink-soft mt-2">
            Renders the exact email a funeral home will receive. Does not write
            to the database, does not send. Internal tool for refining outbound
            copy.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          <ModeTab
            label="Outreach (initial GPL request)"
            active={mode === "outreach"}
            onClick={() => switchMode("outreach")}
          />
          <ModeTab
            label="Selection (you've been picked)"
            active={mode === "selection"}
            onClick={() => switchMode("selection")}
          />
        </div>

        <form onSubmit={onSubmit} className="grid gap-5">
          {mode === "outreach" ? (
            <>
              <Card>
                <CardEyebrow>Family inputs</CardEyebrow>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      required
                      value={senderFirstName}
                      onChange={(e) => setSenderFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name (optional)</Label>
                    <Input
                      id="lastName"
                      value={senderLastName}
                      onChange={(e) => setSenderLastName(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="timing"
                      hint="Phrase used in the body: 'planning arrangements {timing}'"
                    >
                      Timing
                    </Label>
                    <Input
                      id="timing"
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <CardEyebrow>Target funeral home</CardEyebrow>
                <p className="text-sm text-ink-muted mb-4">
                  Provide a zip to pull the first matching home from the
                  directory, or override with a specific home name + email for
                  ad-hoc testing.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="zip">Zip</Label>
                    <Input
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="oHomeName">Specific home name</Label>
                    <Input
                      id="oHomeName"
                      value={outreachHomeName}
                      onChange={(e) => setOutreachHomeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="oHomeEmail">Specific home email</Label>
                    <Input
                      id="oHomeEmail"
                      type="email"
                      value={outreachHomeEmail}
                      onChange={(e) => setOutreachHomeEmail(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardEyebrow>Selection context</CardEyebrow>
                <p className="text-sm text-ink-muted mb-4">
                  This email goes to a funeral home after the family selects
                  them and pays. It tells the FD they&rsquo;ve been chosen and
                  asks for arrangement-meeting availability.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="familyLabel"
                      hint="As it should read in the body — e.g. 'the Alvarez family'"
                    >
                      Family label
                    </Label>
                    <Input
                      id="familyLabel"
                      value={familyLabel}
                      onChange={(e) => setFamilyLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sHomeName">Chosen home name</Label>
                    <Input
                      id="sHomeName"
                      value={selHomeName}
                      onChange={(e) => setSelHomeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sHomeEmail">Chosen home email</Label>
                    <Input
                      id="sHomeEmail"
                      type="email"
                      value={selHomeEmail}
                      onChange={(e) => setSelHomeEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="svcType">Service type</Label>
                    <Select
                      id="svcType"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="quote"
                      hint="Dollars — e.g. 1995 for $1,995"
                    >
                      Quote amount
                    </Label>
                    <Input
                      id="quote"
                      type="number"
                      step="0.01"
                      min="0"
                      value={quoteDollars}
                      onChange={(e) => setQuoteDollars(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Rendering…" : "Preview email"}
            </Button>
          </div>
        </form>

        {error && (
          <Card tone="bad" className="mt-6">
            <CardTitle>Preview failed</CardTitle>
            <pre className="text-sm text-ink-soft whitespace-pre-wrap">
              {error}
            </pre>
          </Card>
        )}

        {result && (
          <Card className="mt-6">
            <CardEyebrow>Exactly what the funeral home will receive</CardEyebrow>
            <div className="text-sm text-ink-soft space-y-1 mb-4">
              <div>
                <span className="text-ink-muted">From:</span> {result.from}
              </div>
              <div>
                <span className="text-ink-muted">To:</span> {result.to}
                {result.home.source && (
                  <span className="text-ink-muted">
                    {" "}
                    ({SOURCE_LABEL[result.home.source]})
                  </span>
                )}
              </div>
              <div>
                <span className="text-ink-muted">Reply-To:</span> {result.replyTo}
              </div>
              <div>
                <span className="text-ink-muted">Subject:</span>{" "}
                <strong className="text-ink">{result.subject}</strong>
              </div>
            </div>
            <pre className="bg-surface-soft border border-border rounded-xl p-4 text-sm text-ink whitespace-pre-wrap font-mono">
{result.body}
            </pre>
            <p className="text-xs text-ink-muted mt-3">
              The authorization reference is a placeholder ({result.authorizationIdPlaceholder}).
              In production it derives from the real negotiation ID, e.g. WB-A1B2C3D4.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}

function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-primary text-primary-deep"
          : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
