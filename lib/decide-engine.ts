/**
 * Recommendation engine for /decide.
 *
 * Maps a few simple inputs (faith tradition, body present, cost priority,
 * disposition preference) to a recommended ServiceType from pricing-data.
 *
 * This is intentionally rule-based, not weighted. Families in crisis don't need
 * a black box — they need a clear "here's what fits, and here's why."
 */

import type { ServiceType } from "./pricing-data";
import { getFaith, type FaithKey } from "./faith-traditions";

export type CostPriority = "lowest" | "balanced" | "tradition";
export type BodyAtService = "yes" | "no" | "unsure";
export type DispositionPreference = "burial" | "cremation" | "donation" | "no-preference";

export interface DecideInputs {
  faith: FaithKey;
  bodyAtService: BodyAtService;
  costPriority: CostPriority;
  dispositionPreference: DispositionPreference;
}

export interface Recommendation {
  serviceType: ServiceType;
  /** Bullet reasons — surfaced under the recommendation card. */
  reasons: string[];
  /** Single-sentence summary for the headline. */
  oneLiner: string;
  /** True if the recommendation is locked by faith requirements (no override). */
  faithLocked: boolean;
}

export function recommend(inputs: DecideInputs): Recommendation {
  const faith = getFaith(inputs.faith);
  const reasons: string[] = [];

  // Body donation overrides everything else when explicitly chosen.
  if (inputs.dispositionPreference === "donation") {
    reasons.push("You chose whole-body donation as the disposition.");
    if (faith.dispositionNorm === "burial-required") {
      reasons.push(
        `Note: ${faith.label} typically requires burial. Confirm with your community before proceeding.`,
      );
    }
    return {
      serviceType: "body-donation",
      reasons,
      oneLiner:
        "Whole-body donation. Most programs are free and return cremated remains to the family after research.",
      faithLocked: false,
    };
  }

  // Faith-locked dispositions.
  if (faith.dispositionNorm === "burial-required") {
    const svc: ServiceType =
      inputs.bodyAtService === "no" ? "graveside-burial" : "graveside-burial";
    reasons.push(
      `${faith.label} requires burial — cremation isn't an option in mainstream practice.`,
    );
    reasons.push(faith.timelineNorm);
    if (faith.embalmingNorm === "forbidden") {
      reasons.push("Embalming is not part of the tradition — decline it at the funeral home.");
    }
    return {
      serviceType: svc,
      reasons,
      oneLiner: "Graveside burial — the simplest, lowest-cost form that fits the tradition.",
      faithLocked: true,
    };
  }

  if (faith.dispositionNorm === "cremation-required") {
    reasons.push(`${faith.label} calls for cremation.`);
    reasons.push(faith.timelineNorm);
    return {
      serviceType: "cremation-with-service",
      reasons,
      oneLiner:
        "Cremation with a short service — fits the tradition and lets family gather before the cremation.",
      faithLocked: true,
    };
  }

  // Memorial-only path: family explicitly does not want body present at service.
  if (
    inputs.bodyAtService === "no" &&
    inputs.dispositionPreference !== "burial"
  ) {
    reasons.push("You don't want the body present at the service.");
    if (inputs.costPriority === "lowest") {
      reasons.push(
        "Direct cremation first, then a memorial service later. This is the lowest-cost honorable path.",
      );
      return {
        serviceType: "direct-cremation",
        reasons,
        oneLiner:
          "Direct cremation now, memorial later — pair with the memorial-only service when you're ready.",
        faithLocked: false,
      };
    }
    reasons.push(
      "A memorial service without the body present keeps costs low while still creating space to gather.",
    );
    return {
      serviceType: "memorial-no-body",
      reasons,
      oneLiner:
        "Memorial service without the body present — typical cost $500–$1,500 plus disposition.",
      faithLocked: false,
    };
  }

  // Burial preference, body present.
  if (inputs.dispositionPreference === "burial" || faith.dispositionNorm === "burial-preferred") {
    if (inputs.costPriority === "lowest") {
      reasons.push("Graveside-only burial skips the chapel viewing — saves $1,500–$3,000 vs full traditional.");
      return {
        serviceType: "graveside-burial",
        reasons,
        oneLiner: "Graveside burial — the body is buried directly, with a short ceremony at the cemetery.",
        faithLocked: false,
      };
    }
    if (faith.dispositionNorm === "burial-preferred") {
      reasons.push(`${faith.label} prefers burial.`);
    }
    if (inputs.bodyAtService === "yes") {
      reasons.push("Body present at the service is part of what you want.");
    }
    reasons.push("Traditional burial with viewing is the highest-cost path — make sure each line item is one you actually want.");
    return {
      serviceType: "traditional-burial",
      reasons,
      oneLiner: "Traditional burial with viewing — the most expensive form. Comparison-shop carefully.",
      faithLocked: false,
    };
  }

  // Default: cremation with a service.
  if (inputs.bodyAtService === "yes") {
    reasons.push("Body present at the service, then cremation — the middle-cost path.");
    return {
      serviceType: "cremation-with-service",
      reasons,
      oneLiner:
        "Cremation with a service — viewing or memorial first, cremation after. Typical cost $3,500–$6,000.",
      faithLocked: false,
    };
  }

  // Lowest-cost fallback.
  reasons.push("Direct cremation is the lowest-cost honorable path.");
  reasons.push("You can hold a memorial service weeks or months later, anywhere.");
  return {
    serviceType: "direct-cremation",
    reasons,
    oneLiner: "Direct cremation — typical cost $1,000–$2,500. No service at the funeral home.",
    faithLocked: false,
  };
}
