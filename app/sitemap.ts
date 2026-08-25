import type { MetadataRoute } from "next";
import { FAITH_TRADITIONS } from "@/lib/faith-traditions";
import { listStateSlugs } from "@/lib/probate-by-state";
import { listSlugs as listGlossarySlugs } from "@/lib/glossary";
import { listCitySlugs } from "@/lib/city-pages";
import { US_STATES } from "@/lib/us-states";
import { PRICING_LAST_UPDATED } from "@/lib/pricing-data";

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
  // lastModified honesty (audit A6-03): stamping request-time on every URL
  // made the freshness signal pure noise (every crawl saw "modified now").
  // Price-bearing surfaces carry the catalog's real review date; everything
  // else omits lastModified — absent is honest, fabricated is not.
  const pricingDate = new Date(PRICING_LAST_UPDATED);

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: `${SITE}/`, priority: 1.0, changeFrequency: "weekly" },
      { url: `${SITE}/where`, priority: 0.9, changeFrequency: "monthly" },
      // The wedge product itself — absent from the sitemap until audit
      // A6-01 flagged it (the one page the whole funnel points at).
      { url: `${SITE}/analyzer`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/prices`, priority: 0.9, changeFrequency: "weekly" },
      { url: `${SITE}/fair-price-index`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/bill-check`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/cash-advance-check`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/compare-quotes`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/plan-now`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/decide`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/worksheet`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/how-it-works`, priority: 0.8, changeFrequency: "monthly" },
      // Audit A6-03: real pages that were missing while /briefing (empty to
      // crawlers) and the /after redirect stub were present.
      { url: `${SITE}/rights`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/our-role`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/next-30-days`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/tell-your-hospice`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/eulogy`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/for-funeral-homes`, priority: 0.5, changeFrequency: "monthly" },
      { url: `${SITE}/where/just-happened`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/methodology`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/corrections`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/accessibility`, priority: 0.5, changeFrequency: "monthly" },
      { url: `${SITE}/faq`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/about`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/prep`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/obituary`, priority: 0.6, changeFrequency: "monthly" },
      // /after itself is a redirect stub to /next-30-days — its topic pages
      // below stay; the stub does not (A6-03).
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
      { url: `${SITE}/reverse-mortgage`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/medicaid-estate-recovery`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/partners`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/employers`, priority: 0.8, changeFrequency: "monthly" },
      { url: `${SITE}/partners/apply`, priority: 0.6, changeFrequency: "monthly" },
      { url: `${SITE}/glossary`, priority: 0.7, changeFrequency: "monthly" },
      { url: `${SITE}/guides`, priority: 0.9, changeFrequency: "weekly" },
      { url: `${SITE}/funeral-costs`, priority: 0.9, changeFrequency: "weekly" },
      { url: `${SITE}/average-funeral-cost`, priority: 0.9, changeFrequency: "monthly" },
      { url: `${SITE}/terms`, priority: 0.3, changeFrequency: "yearly" },
      { url: `${SITE}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    ] as const
  ).map((r) => {
    const priceSurfaces = [
      `${SITE}/prices`,
      `${SITE}/analyzer`,
      `${SITE}/fair-price-index`,
      `${SITE}/average-funeral-cost`,
      `${SITE}/funeral-costs`,
      `${SITE}/funeral-homes`,
      `${SITE}/how-to-pay`,
    ];
    return priceSurfaces.includes(r.url)
      ? { ...r, lastModified: pricingDate }
      : { ...r };
  });

  const scenarioRoutes: MetadataRoute.Sitemap = SCENARIOS.map((s) => ({
    url: `${SITE}/guidance/${s}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const afterRoutes: MetadataRoute.Sitemap = AFTER_TOPICS.map((t) => ({
    url: `${SITE}/after/${t}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const faithRoutes: MetadataRoute.Sitemap = FAITH_TRADITIONS.map((t) => ({
    url: `${SITE}/faith/${t.key}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const estateRoutes: MetadataRoute.Sitemap = listStateSlugs().map((slug) => ({
    url: `${SITE}/estate/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const glossaryRoutes: MetadataRoute.Sitemap = listGlossarySlugs().map(
    (slug) => ({
      url: `${SITE}/glossary/${slug}`,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  const cityRoutes: MetadataRoute.Sitemap = listCitySlugs().map((slug) => ({
    url: `${SITE}/funeral-costs/${slug}`,
    lastModified: pricingDate,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // The hospice directory: the index + the 51 state pages ONLY. Facility
  // pages (/hospices/[state]/[ccn]) are noindexed and must NEVER appear here
  // — a sitemap entry contradicting robots is a crawler smell.
  const hospiceRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/hospices`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...US_STATES.map((s) => ({
      url: `${SITE}/hospices/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    ...staticRoutes,
    ...scenarioRoutes,
    ...afterRoutes,
    ...faithRoutes,
    ...estateRoutes,
    ...glossaryRoutes,
    ...cityRoutes,
    ...hospiceRoutes,
  ];
}
