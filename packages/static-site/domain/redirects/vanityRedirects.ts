/**
 * Builds the vanity short-link redirect table.
 *
 * These are current, hand-picked short URLs handed out in print and outreach —
 * not Webflow migration rows — so they stay separate from the legacy table in
 * `legacyRedirects.ts` and get no generated `/es-us` twin. All rules are
 * permanent (Next.js emits a 308 HTTP status code).
 */

/** A single vanity redirect entry consumed by `next.config.ts` `redirects()`. */
export interface VanityRedirect {
  readonly source: string;
  readonly destination: string;
  /** `permanent: true` makes Next.js emit a 308 HTTP status code. */
  readonly permanent: true;
}

/** Input for {@link buildVanityRedirects}. */
export interface BuildVanityRedirectsParams {
  /** Whether `NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED` is on. */
  readonly housingDeveloperResourcesEnabled: boolean;
}

/**
 * Vanity rules whose destination is the flag-gated Housing Developer Resources
 * page. They are emitted only when the flag is on, because the page itself
 * fails closed and the redirect would otherwise land on a 404.
 */
const HOUSING_DEVELOPER_RESOURCES_RULES: readonly VanityRedirect[] = [
  {
    source: "/housingprograms",
    destination: "/pages/housing-developer-resources",
    permanent: true,
  },
];

/**
 * Builds the full vanity redirect table for the given flag state.
 *
 * @param params Flag state controlling which rules are emitted.
 * @param params.housingDeveloperResourcesEnabled Whether
 *   `NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED` is on.
 * @returns Every enabled vanity rule, all permanent (Next.js emits a 308 HTTP
 *   status code).
 */
export const buildVanityRedirects = ({
  housingDeveloperResourcesEnabled,
}: BuildVanityRedirectsParams): VanityRedirect[] => {
  return housingDeveloperResourcesEnabled ? [...HOUSING_DEVELOPER_RESOURCES_RULES] : [];
};
