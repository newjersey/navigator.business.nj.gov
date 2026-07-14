/**
 * Builds the Webflow → static-site legacy redirect table.
 *
 * Every internal rule is emitted twice: once for the English (unprefixed) path
 * and once for the lowercase `/es-us` Spanish path Webflow served. The Spanish
 * route's destination is flag-aware — English path when multilingual is off,
 * `/es-US`-prefixed when on. External (`http`) destinations are never rewritten.
 * When the flag is off, a trailing catch-all strips any remaining `/es-us` path
 * (and the bare `/es-us` root) to its English equivalent; when on, `next-intl`
 * already renders `/es-US` so no catch-all is emitted. All rules are permanent
 * (Next.js emits a 308 HTTP status code) to match the migration's SEO
 * expectations.
 */

/** A single legacy redirect entry consumed by `next.config.ts` `redirects()`. */
export interface LegacyRedirect {
  readonly source: string;
  readonly destination: string;
  /** `permanent: true` makes Next.js emit a 308 HTTP status code. */
  readonly permanent: true;
}

/** An internal rule before Spanish-route expansion. `destination` is an app path. */
interface InternalRule {
  readonly source: string;
  readonly destination: string;
}

const LEGACY_SPANISH_PREFIX = "/es-us";
const APP_SPANISH_LOCALE_PREFIX = "/es-US";

/**
 * Prefix and section rules. Aggregate rules drop the slug; /recent preserves it.
 * A few /recent slugs are legacy article URLs whose content now lives on a topic
 * page, so they are pinned to that page BEFORE the /recent/:slug* prefix — order
 * matters because `redirects()` is first-match-wins.
 */
const PREFIX_RULES: readonly InternalRule[] = [
  { source: "/recent", destination: "/updates" },
  { source: "/recent/disposable-bag-ban", destination: "/pages/plastic-ban-law" },
  { source: "/recent/state-financial-assistance-programs", destination: "/pages/covid19" },
  { source: "/recent/:slug*", destination: "/updates/:slug*" },
  { source: "/license", destination: "/pages/licensing-and-certification-guide" },
  { source: "/license/:slug*", destination: "/pages/licensing-and-certification-guide" },
  { source: "/funding", destination: "/pages/funding" },
  { source: "/funding/:slug*", destination: "/pages/funding" },
  { source: "/starter-kits/:slug*", destination: "/pages/starter-kits" },
];

/** Verified one-off rules with a real INTERNAL destination. Given an /es-us route. */
const ONE_OFF_RULES: readonly InternalRule[] = [
  // impact report
  { source: "/impact", destination: "/impact-report" },
  { source: "/impactreport", destination: "/impact-report" },
  { source: "/page/impactreport", destination: "/impact-report" },
  // learn category hubs
  { source: "/category/grow", destination: "/grow" },
  { source: "/category/operate", destination: "/operate" },
  { source: "/category/plan", destination: "/plan" },
  { source: "/category/start", destination: "/start" },
  // covid cluster
  { source: "/covid", destination: "/pages/covid19" },
  { source: "/covid19", destination: "/pages/covid19" },
  { source: "/COVID", destination: "/pages/covid19" },
  { source: "/reopen", destination: "/pages/covid19" },
  { source: "/covid-19", destination: "/pages/covid19" },
  { source: "/covid-faqs", destination: "/pages/covid19" },
  {
    source: "/covid/check-status-njeda-small-business-emergency-assistance-grant-program",
    destination: "/pages/covid19",
  },
  {
    source: "/covid/required-workplace-health-and-safety-standards",
    destination: "/pages/covid19",
  },
  {
    source: "/covid/small-business-emergency-assistance-grant-program",
    destination: "/pages/covid19",
  },
  { source: "/covid/state-financial-assistance-programs", destination: "/pages/covid19" },
  {
    source: "/pages/covid-19-required-workplace-health-and-safety-standards",
    destination: "/pages/covid19",
  },
  { source: "/(.*)/articles/3835237(.*)", destination: "/pages/covid19" },
  // plastic ban
  { source: "/bags/vendorclearinghouse", destination: "/pages/plastic-ban-law" },
  { source: "/plastic-ban-law", destination: "/pages/plastic-ban-law" },
  { source: "/bags/plastic-ban-law", destination: "/pages/plastic-ban-law" },
  { source: "/bags/vendors", destination: "/pages/plastic-ban-law" },
  { source: "/bagupnj", destination: "/pages/plastic-ban-law" },
  { source: "/vendors", destination: "/pages/plastic-ban-law" },
  { source: "/Vendors", destination: "/pages/plastic-ban-law" },
  // contracting / exporting
  { source: "/contracting", destination: "/pages/government-contracting" },
  { source: "/Contracting", destination: "/pages/government-contracting" },
  { source: "/exporting", destination: "/pages/exporting" },
  { source: "/Exporting", destination: "/pages/exporting" },
  // licensing aggregate synonyms
  { source: "/licensing", destination: "/pages/licensing-and-certification-guide" },
  {
    source: "/licensing-and-certification-guide",
    destination: "/pages/licensing-and-certification-guide",
  },
  // starter-kits aggregate root
  { source: "/starter-kits", destination: "/pages/starter-kits" },
  { source: "/trucking", destination: "/pages/starter-kits" },
  { source: "/page/trucking", destination: "/pages/starter-kits" },
  // faqs → pages
  {
    source:
      "/faqs/how-do-i-contract-with-the-state-as-a-small-business-minority-or-women-owned-business",
    destination: "/pages/mwbe",
  },
  { source: "/faqs/what-are-new-jerseys-principal-industries", destination: "/pages/starter-kits" },
  { source: "/archived/faqs", destination: "/" },
  //Aggregation for "Choose A Business Structure",
  { source: "/faqs/how-do-i-start-a-nonprofit", destination: "/pages/choose-a-business-structure" },
  { source: "/pages/c-corporation-c-corp", destination: "/pages/choose-a-business-structure" },
  { source: "/pages/general-partnership", destination: "/pages/choose-a-business-structure" },
  {
    source: "/pages/limited-liability-company-llc",
    destination: "/pages/choose-a-business-structure",
  },
  { source: "/pages/llp-lp", destination: "/pages/choose-a-business-structure" },
  { source: "/pages/nonprofit", destination: "/pages/choose-a-business-structure" },
  { source: "/pages/s-corporation-s-corp", destination: "/pages/choose-a-business-structure" },
  { source: "/pages/sole-proprietorship", destination: "/pages/choose-a-business-structure" },
  // miscellaneous
  { source: "/ida/impacted-by-ida", destination: "/updates" },
  {
    source: "/pages/transferring-or-exiting-your-business",
    destination: "/pages/closing-your-business",
  },
];

/**
 * One-off rules whose source is a specific locale prefix OTHER than the
 * `/es-us` route generator handles (a lone `/es/` legacy row). Emitted verbatim.
 */
const LOCALE_SPECIFIC_ONE_OFF_RULES: readonly InternalRule[] = [
  { source: "/es/pages/funding", destination: "/pages/funding" },
];

/** One-off rules with an EXTERNAL destination. Given an /es-us route, but never locale-rewritten. */
const EXTERNAL_ONE_OFF_RULES: readonly InternalRule[] = [
  { source: "/panel", destination: "https://forms.business.nj.gov/panel/" },
  { source: "/survey", destination: "https://www.surveymonkey.com/r/ZHQZP25" },
  { source: "/navigator", destination: "https://account.business.nj.gov/" },
];

const isExternal = (destination: string): boolean => destination.startsWith("http");

/**
 * Returns the flag-aware Spanish-route destination for an internal destination.
 * External URLs pass through unchanged; internal paths gain the `/es-US` locale
 * prefix only when multilingual is enabled.
 */
const spanishDestination = (destination: string, multilingualEnabled: boolean): string => {
  if (isExternal(destination)) return destination;
  return multilingualEnabled ? `${APP_SPANISH_LOCALE_PREFIX}${destination}` : destination;
};

/**
 * Expands one internal rule into its English rule plus its lowercase `/es-us`
 * Spanish route, both stamped `permanent: true` (Next.js emits a 308 HTTP
 * status code).
 */
const withSpanishRoute = (rule: InternalRule, multilingualEnabled: boolean): LegacyRedirect[] => [
  { source: rule.source, destination: rule.destination, permanent: true },
  {
    source: `${LEGACY_SPANISH_PREFIX}${rule.source}`,
    destination: spanishDestination(rule.destination, multilingualEnabled),
    permanent: true,
  },
];

/**
 * Catches any lowercase `/es-us` request with no specific legacy rule, but only
 * when multilingual is OFF. In that mode Spanish pages do not exist, so the bare
 * `/es-us` root redirects to `/` and any `/es-us/<path>` is stripped to its
 * English equivalent. The `/es-us/:path*` pattern does not match the bare root,
 * so the root needs its own rule. Both must be emitted LAST so the specific
 * `/es-us` rules match first.
 *
 * When multilingual is ON, no catch-all is emitted: `es-US` is a real locale and
 * `next-intl` resolves the prefix case-insensitively, so both `/es-us/<path>`
 * and `/es-US/<path>` already render. A normalizing redirect would be redundant
 * and, because Next.js `redirects()` also matches case-insensitively, the
 * canonical `/es-US/<path>` would match the rule and redirect to itself.
 */
const spanishCatchAll = (multilingualEnabled: boolean): LegacyRedirect[] => {
  if (multilingualEnabled) {
    return [];
  }
  return [
    { source: LEGACY_SPANISH_PREFIX, destination: "/", permanent: true },
    { source: `${LEGACY_SPANISH_PREFIX}/:path*`, destination: "/:path*", permanent: true },
  ];
};

/**
 * Builds the full legacy redirect table for the given multilingual flag state.
 *
 * @param multilingualEnabled Whether `NEXT_PUBLIC_MULTILINGUAL_ENABLED` is on.
 * @returns Every English rule with its Spanish route, all permanent (Next.js
 *   emits a 308 HTTP status code).
 */
export const buildLegacyRedirects = (multilingualEnabled: boolean): LegacyRedirect[] => {
  const withSpanishRoutes = [...PREFIX_RULES, ...ONE_OFF_RULES, ...EXTERNAL_ONE_OFF_RULES].flatMap(
    (rule) => withSpanishRoute(rule, multilingualEnabled),
  );
  const localeSpecific = LOCALE_SPECIFIC_ONE_OFF_RULES.map(
    (rule): LegacyRedirect => ({ ...rule, permanent: true }),
  );
  return [...withSpanishRoutes, ...localeSpecific, ...spanishCatchAll(multilingualEnabled)];
};
