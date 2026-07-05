export interface AnalyzerItem {
  name: string;
  cents: number;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
  isRange?: boolean;
  centsLow?: number;
  centsHigh?: number;
  qty?: number;
}

export type Severity = "violation" | "suspicious" | "info";

export interface Violation {
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  ftcReference?: string;
  evidence?: string;
  whatToSay?: string;
}

export const TONES: Record<string, { label: string; tone: string }> = {
  good: { label: "Good", tone: "text-good" },
  fair: { label: "Fair", tone: "text-good" },
  high: { label: "High", tone: "text-warn" },
  predatory: { label: "Overpriced", tone: "text-bad" },
};
