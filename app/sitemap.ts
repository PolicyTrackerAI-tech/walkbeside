import type { MetadataRoute } from "next";
import { FAITH_TRADITIONS } from "@/lib/faith-traditions";
import { listStateSlugs } from "@/lib/probate-by-state";
import { listSlugs as listGlossarySlugs } from "@/lib/glossary";
import { listCitySlugs } from "@/lib/city-pages";

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
      { url: `${SITE}/fair-price-index`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/bill-check`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/compare-quotes`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/plan-now`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/planning`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/decide`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/worksheet`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/how-it-works`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/methodology`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/corrections`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/faq`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/about`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/prep`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/obituary`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/after`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/veterans`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/funeral-homes`, priority: 0.9, changeFrequency: "weekly" },
      { url: `${SITE}/home-funeral`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/body-donation`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/final-days`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/after-hospice`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/sudden-loss`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/survivor-benefits`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/digital-legacy`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/talking-to-kids`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/how-to-pay`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/plan-ahead`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/disenfranchised-grief`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/out-of-state-death`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/end-of-life`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/funeral-home-tactics`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/pet-loss`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/suicide-loss`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/overdose-loss`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/death-of-a-child`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/funeral-etiquette`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/grief`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/estate`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/glossary`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/guides`, priority: 0.9, changeFrequency: "weekly" },
      { url: `${SITE}/funeral-costs`, priority: 0.9, changeFrequency: "weekly" },
      { url: `${SITE}/average-funeral-cost`, priority: 0.9, changeFrequency: "monthly" },
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

  const estateRoutes: MetadataRoute.Sitemap = listStateSlugs().map((slug) => ({
    url: `${SITE}/estate/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const glossaryRoutes: MetadataRoute.Sitemap = listGlossarySlugs().map(
    (slug) => ({
      url: `${SITE}/glossary/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  const cityRoutes: MetadataRoute.Sitemap = listCitySlugs().map((slug) => ({
    url: `${SITE}/funeral-costs/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [
    ...staticRoutes,
    ...scenarioRoutes,
    ...afterRoutes,
    ...faithRoutes,
    ...estateRoutes,
    ...glossaryRoutes,
    ...cityRoutes,
  ];
}
