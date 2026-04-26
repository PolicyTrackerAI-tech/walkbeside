"use client";

import { useEffect, useState } from "react";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";
import { FAITH_TRADITIONS, type FaithKey } from "@/lib/faith-traditions";

const STORAGE_KEY = "hf-worksheet-v1";

type YesNoUnsure = "yes" | "no" | "unsure";
type Embalming = "no-pref" | "decline" | "open";
type Casket =
  | "simple-wood"
  | "plain-pine"
  | "metal"
  | "premium-wood"
  | "third-party"
  | "none-cremation";
type ViewingChoice = "private" | "public" | "none";
type ServiceLocation = "funeral-home" | "our-church" | "graveside-only" | "no-service";
type Officiant = "our-clergy" | "fh-staff" | "family-member" | "none";
type ProgramsChoice = "diy" | "fh" | "none";
type FlowersChoice = "florist-direct" | "through-fh" | "none";
type ObituaryChoice = "online" | "online-and-print" | "none";
type CemeteryStatus = "own-plot" | "need-plot" | "tbd";

interface WorksheetState {
  deceasedName: string;
  dateContext: string;
  serviceType: ServiceType | "";
  faith: FaithKey | "";
  bodyAtService: YesNoUnsure;
  embalming: Embalming;
  cosmetology: YesNoUnsure;
  viewing: ViewingChoice;
  casket: Casket | "";
  bringingOwnCasket: boolean;
  ownUrn: boolean;
  vaultMinimumOnly: boolean;
  serviceLocation: ServiceLocation;
  officiant: Officiant;
  musicByFamily: boolean;
  programs: ProgramsChoice;
  flowers: FlowersChoice;
  obituary: ObituaryChoice;
  cemeteryStatus: CemeteryStatus;
  headstoneDirectFromMonument: boolean;
  hardNoes: string[];
  notes: string;
  questions: string;
}

const DEFAULTS: WorksheetState = {
  deceasedName: "",
  dateContext: "",
  serviceType: "",
  faith: "",
  bodyAtService: "unsure",
  embalming: "no-pref",
  cosmetology: "unsure",
  viewing: "none",
  casket: "",
  bringingOwnCasket: false,
  ownUrn: false,
  vaultMinimumOnly: true,
  serviceLocation: "funeral-home",
  officiant: "fh-staff",
  musicByFamily: false,
  programs: "diy",
  flowers: "florist-direct",
  obituary: "online",
  cemeteryStatus: "tbd",
  headstoneDirectFromMonument: true,
  hardNoes: [],
  notes: "",
  questions: "",
};

const HARD_NOE_OPTIONS = [
  "Embalming",
  "Premium / metal casket",
  "Family limousine",
  "Vault upgrade above cemetery's minimum",
  "Funeral home cosmetology / preparation",
  "Funeral home flowers (we'll order direct)",
  "Funeral home headstone (we'll buy from a monument company)",
  "Newspaper obituary printing",
];

const CASKET_LABELS: Record<Casket, string> = {
  "simple-wood": "Simple wood (low cost)",
  "plain-pine": "Plain pine (kosher / traditional)",
  "metal": "Metal",
  "premium-wood": "Premium wood (oak, mahogany)",
  "third-party": "Bringing our own from a third-party vendor",
  "none-cremation": "None — cremation, combustible container only",
};

const VIEWING_LABELS: Record<ViewingChoice, string> = {
  private: "Private (family only)",
  public: "Public viewing / visitation",
  none: "No viewing",
};

const LOCATION_LABELS: Record<ServiceLocation, string> = {
  "funeral-home": "Funeral home chapel",
  "our-church": "Our church / place of worship",
  "graveside-only": "Graveside only",
  "no-service": "No service at the funeral home",
};

const OFFICIANT_LABELS: Record<Officiant, string> = {
  "our-clergy": "Our own clergy / officiant",
  "fh-staff": "Funeral home staff officiant",
  "family-member": "Family member or friend",
  "none": "No officiant",
};

const PROGRAMS_LABELS: Record<ProgramsChoice, string> = {
  diy: "We'll print our own (Canva / Word)",
  fh: "Funeral home prints them",
  none: "No programs",
};

const FLOWERS_LABELS: Record<FlowersChoice, string> = {
  "florist-direct": "Direct from a florist (cheaper)",
  "through-fh": "Through the funeral home",
  none: "No flowers",
};

const OBITUARY_LABELS: Record<ObituaryChoice, string> = {
  online: "Online only (free)",
  "online-and-print": "Online + newspaper",
  none: "No obituary",
};

const CEMETERY_LABELS: Record<CemeteryStatus, string> = {
  "own-plot": "Plot already owned",
  "need-plot": "Need to purchase a plot",
  tbd: "Not decided yet",
};

const EMBALMING_LABELS: Record<Embalming, string> = {
  "no-pref": "No strong preference",
  decline: "Decline embalming — refrigeration is fine",
  open: "Open to embalming if needed",
};

export function Worksheet() {
  const [state, setState] = useState<WorksheetState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WorksheetState>;
        setState({ ...DEFAULTS, ...parsed });
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSavedAt(new Date().toLocaleTimeString());
    } catch {
      setSavedAt("(could not save — browser blocked storage)");
    }
  }

  function reset() {
    if (!confirm("Clear all answers and start over?")) return;
    setState(DEFAULTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSavedAt(null);
  }

  function update<K extends keyof WorksheetState>(key: K, value: WorksheetState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function toggleHardNo(label: string) {
    setState((prev) => ({
      ...prev,
      hardNoes: prev.hardNoes.includes(label)
        ? prev.hardNoes.filter((h) => h !== label)
        : [...prev.hardNoes, label],
    }));
  }

  if (!hydrated) {
    return (
      <Card>
        <p className="text-ink-muted text-sm">Loading…</p>
      </Card>
    );
  }

  const showCemeterySection =
    state.serviceType === "traditional-burial" ||
    state.serviceType === "graveside-burial" ||
    state.serviceType === "green-burial";

  return (
    <div className="space-y-6">
      {/* ----- FORM (hidden on print) ----- */}
      <div className="no-print space-y-6">
        <Section title="The basics" eyebrow="Section 1">
          <Field label="Name of the person who has died (or will)">
            <Input
              value={state.deceasedName}
              onChange={(e) => update("deceasedName", e.target.value)}
              placeholder="Full name"
            />
          </Field>
          <Field label="Timeline" hint="e.g. anticipated this week, already passed, planning ahead">
            <Input
              value={state.dateContext}
              onChange={(e) => update("dateContext", e.target.value)}
              placeholder="When"
            />
          </Field>
          <Field label="Type of service we're considering">
            <Select
              value={state.serviceType}
              onChange={(e) => update("serviceType", e.target.value as ServiceType | "")}
            >
              <option value="">— pick one —</option>
              {Object.entries(SERVICE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Faith tradition (optional)">
            <Select
              value={state.faith}
              onChange={(e) => update("faith", e.target.value as FaithKey | "")}
            >
              <option value="">— none / prefer not to say —</option>
              {FAITH_TRADITIONS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
        </Section>

        <Section title="Body and disposition" eyebrow="Section 2">
          <Field label="Body present at the service?">
            <Select
              value={state.bodyAtService}
              onChange={(e) => update("bodyAtService", e.target.value as YesNoUnsure)}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unsure">Not sure yet</option>
            </Select>
          </Field>
          <Field label="Embalming">
            <Select
              value={state.embalming}
              onChange={(e) => update("embalming", e.target.value as Embalming)}
            >
              {Object.entries(EMBALMING_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cosmetology / body preparation by funeral home staff?">
            <Select
              value={state.cosmetology}
              onChange={(e) => update("cosmetology", e.target.value as YesNoUnsure)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="unsure">Decide at the meeting</option>
            </Select>
          </Field>
          <Field label="Viewing">
            <Select
              value={state.viewing}
              onChange={(e) => update("viewing", e.target.value as ViewingChoice)}
            >
              {Object.entries(VIEWING_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
        </Section>

        <Section title="Casket / urn / vault" eyebrow="Section 3">
          <Field label="Casket choice">
            <Select
              value={state.casket}
              onChange={(e) => update("casket", e.target.value as Casket | "")}
            >
              <option value="">— pick one —</option>
              {Object.entries(CASKET_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Checkbox
            checked={state.bringingOwnCasket}
            onChange={(c) => update("bringingOwnCasket", c)}
            label="We're bringing our own casket — funeral home must legally accept it (FTC Funeral Rule)"
          />
          <Checkbox
            checked={state.ownUrn}
            onChange={(c) => update("ownUrn", c)}
            label="We're providing our own urn"
          />
          <Checkbox
            checked={state.vaultMinimumOnly}
            onChange={(c) => update("vaultMinimumOnly", c)}
            label="If a vault is needed, only the cemetery's minimum requirement — no upgrades"
          />
        </Section>

        <Section title="The service" eyebrow="Section 4">
          <Field label="Where">
            <Select
              value={state.serviceLocation}
              onChange={(e) =>
                update("serviceLocation", e.target.value as ServiceLocation)
              }
            >
              {Object.entries(LOCATION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Officiant">
            <Select
              value={state.officiant}
              onChange={(e) => update("officiant", e.target.value as Officiant)}
            >
              {Object.entries(OFFICIANT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Checkbox
            checked={state.musicByFamily}
            onChange={(c) => update("musicByFamily", c)}
            label="Family is arranging music — funeral home doesn't need to"
          />
          <Field label="Programs">
            <Select
              value={state.programs}
              onChange={(e) => update("programs", e.target.value as ProgramsChoice)}
            >
              {Object.entries(PROGRAMS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Flowers">
            <Select
              value={state.flowers}
              onChange={(e) => update("flowers", e.target.value as FlowersChoice)}
            >
              {Object.entries(FLOWERS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Obituary">
            <Select
              value={state.obituary}
              onChange={(e) => update("obituary", e.target.value as ObituaryChoice)}
            >
              {Object.entries(OBITUARY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
        </Section>

        {showCemeterySection && (
          <Section title="Cemetery" eyebrow="Section 5">
            <Field label="Plot">
              <Select
                value={state.cemeteryStatus}
                onChange={(e) =>
                  update("cemeteryStatus", e.target.value as CemeteryStatus)
                }
              >
                {Object.entries(CEMETERY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Checkbox
              checked={state.headstoneDirectFromMonument}
              onChange={(c) => update("headstoneDirectFromMonument", c)}
              label="Headstone purchased direct from a monument company, not the funeral home (massive markup at FH)"
            />
          </Section>
        )}

        <Section title="Hard noes" eyebrow="Section 6">
          <p className="text-sm text-ink-soft mb-3">
            Check anything you have already decided you will <em>not</em> pay
            for. Bring this list to the meeting.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {HARD_NOE_OPTIONS.map((opt) => (
              <Checkbox
                key={opt}
                checked={state.hardNoes.includes(opt)}
                onChange={() => toggleHardNo(opt)}
                label={opt}
              />
            ))}
          </div>
        </Section>

        <Section title="Notes and questions" eyebrow="Section 7">
          <Field label="Notes for ourselves">
            <Textarea
              value={state.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              placeholder="Anything we want to remember when we walk in"
            />
          </Field>
          <Field label="Questions to ask the funeral home">
            <Textarea
              value={state.questions}
              onChange={(e) => update("questions", e.target.value)}
              rows={3}
              placeholder="One per line"
            />
          </Field>
        </Section>

        <Card tone="primary">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={save}>Save to this browser</Button>
            <Button variant="secondary" onClick={() => window.print()}>
              Print preferences
            </Button>
            <Button variant="ghost" onClick={reset}>
              Clear all
            </Button>
            {savedAt && (
              <span className="text-sm text-ink-muted">
                Saved at {savedAt}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-3">
            Saving stores your answers in this browser only. Nothing is sent
            anywhere. If you clear your browser data or use a different device,
            you&rsquo;ll need to fill it in again.
          </p>
        </Card>
      </div>

      {/* ----- PRINT VIEW (always rendered, only visible when printing or via the preview card) ----- */}
      <div>
        <h2 className="font-serif text-2xl text-ink mb-3 no-print">
          Printable summary
        </h2>
        <p className="text-sm text-ink-soft mb-5 no-print">
          This is what the funeral director will see when you bring this in. Hit{" "}
          <strong>Print preferences</strong> above (or Cmd/Ctrl-P) to print
          just this card.
        </p>
        <PrintableSummary state={state} />
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardEyebrow>{eyebrow}</CardEyebrow>
      <CardTitle>{title}</CardTitle>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (c: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-ink cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function PrintableSummary({ state }: { state: WorksheetState }) {
  const faith = FAITH_TRADITIONS.find((t) => t.key === state.faith);
  const lines: { label: string; value: string }[] = [
    { label: "Person", value: state.deceasedName || "—" },
    { label: "Timeline", value: state.dateContext || "—" },
    {
      label: "Service type",
      value: state.serviceType ? SERVICE_LABELS[state.serviceType] : "Not chosen yet",
    },
    { label: "Faith tradition", value: faith?.label ?? "Not specified" },
    { label: "Body present at service", value: ynu(state.bodyAtService) },
    { label: "Embalming", value: EMBALMING_LABELS[state.embalming] },
    { label: "Cosmetology by FH staff", value: ynu(state.cosmetology) },
    { label: "Viewing", value: VIEWING_LABELS[state.viewing] },
    { label: "Casket", value: state.casket ? CASKET_LABELS[state.casket] : "Not chosen yet" },
    {
      label: "Bringing own casket",
      value: state.bringingOwnCasket ? "Yes — FH must accept it" : "No",
    },
    { label: "Providing own urn", value: state.ownUrn ? "Yes" : "No" },
    {
      label: "Vault",
      value: state.vaultMinimumOnly
        ? "Cemetery minimum only — no upgrades"
        : "Open to discussion",
    },
    { label: "Service location", value: LOCATION_LABELS[state.serviceLocation] },
    { label: "Officiant", value: OFFICIANT_LABELS[state.officiant] },
    {
      label: "Music",
      value: state.musicByFamily ? "Family arranging" : "Funeral home arranging",
    },
    { label: "Programs", value: PROGRAMS_LABELS[state.programs] },
    { label: "Flowers", value: FLOWERS_LABELS[state.flowers] },
    { label: "Obituary", value: OBITUARY_LABELS[state.obituary] },
    { label: "Cemetery plot", value: CEMETERY_LABELS[state.cemeteryStatus] },
    {
      label: "Headstone",
      value: state.headstoneDirectFromMonument
        ? "Direct from monument company"
        : "Open to FH options",
    },
  ];

  return (
    <div className="print-page bg-white text-black rounded-2xl border border-border p-8 print:p-0 print:border-0 print:rounded-none">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl">Pre-meeting preferences</h2>
        <span className="text-xs text-ink-muted">honestfuneral.co</span>
      </div>

      <p className="text-sm text-ink-soft mb-5">
        These are the family&rsquo;s decisions, made before the meeting.
        Please base recommendations and quotes on these preferences.
      </p>

      <table className="w-full text-sm border-collapse mb-5">
        <tbody>
          {lines.map((l) => (
            <tr key={l.label} className="border-b border-border/60">
              <td className="py-1.5 pr-3 text-ink-muted whitespace-nowrap align-top w-1/3">
                {l.label}
              </td>
              <td className="py-1.5 text-ink">{l.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {state.hardNoes.length > 0 && (
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">
            Hard noes — items the family will not pay for
          </div>
          <ul className="text-sm space-y-1 list-disc list-inside text-ink">
            {state.hardNoes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {state.notes && (
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
            Notes
          </div>
          <p className="text-sm text-ink whitespace-pre-wrap">{state.notes}</p>
        </div>
      )}

      {state.questions && (
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
            Questions for the funeral home
          </div>
          <p className="text-sm text-ink whitespace-pre-wrap">{state.questions}</p>
        </div>
      )}

      <p className="text-xs text-ink-muted border-t border-border pt-3">
        Under the FTC Funeral Rule, the family has the right to a written
        itemized General Price List, to provide their own casket or urn, and to
        decline any service that is not legally required.
      </p>
    </div>
  );
}

function ynu(v: YesNoUnsure): string {
  switch (v) {
    case "yes":
      return "Yes";
    case "no":
      return "No";
    case "unsure":
      return "Decide at the meeting";
  }
}
