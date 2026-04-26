import type { MetadataRoute } from "next";
import { FAITH_TRADITIONS } from "@/lib/faith-traditions";

const SITE = "https://honestfuneral.co";

const SCENARIOS = [
  "hospital",
  "home-expected",
  "home-unexpected",
  "elsewhere",
] as const;

const AFTER_TOPICS = [
  "death-certificates",
  "accounts-to-close",
  "estate-basics",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: `${SITE}/`, priority: 1.0, changeFrequency: "weekly" },
      { url: `${SITE}/where`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/prices`, priority: 0.9, changeFrequency: "weekly" },
      { url: `${SITE}/planning`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/decide`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/worksheet`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/how-it-works`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/faq`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/about`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/prep`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/obituary`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/after`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/terms`, priority: 0.3, changeFrequency: "yearly" },
      { url: `${SITE}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    ] as const
  ).map((r) => ({ ...r, lastModified: now }));

  const scenarioRoutes: MetadataRoute.Sitemap = SCENARIOS.map((s) => ({
    url: `${SITE}/guidance/${s}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const afterRoutes: MetadataRoute.Sitemap = AFTER_TOPICS.map((t) => ({
    url: `${SITE}/after/${t}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const faithRoutes: MetadataRoute.Sitemap = FAITH_TRADITIONS.map((t) => ({
    url: `${SITE}/faith/${t.key}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...scenarioRoutes, ...afterRoutes, ...faithRoutes];
}
