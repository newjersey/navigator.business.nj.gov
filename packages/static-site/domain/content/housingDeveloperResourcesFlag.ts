/**
 * Gates the Housing Developer Resources page behind a build-time flag.
 *
 * When disabled, the page 404s directly and is excluded from category
 * navigation, `generateStaticParams`, the sitemap, and the legacy redirect
 * that points at it — see `domain/categories.ts` and
 * `domain/redirects/legacyRedirects.ts`.
 */

/** Slug of the flag-gated Housing Developer Resources page. */
export const HOUSING_DEVELOPER_RESOURCES_SLUG = "housing-developer-resources";

/**
 * Reads whether the Housing Developer Resources page is enabled for this build.
 *
 * @returns `true` only when `NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED`
 *   is exactly `"true"`. Unset or unrecognized values fail closed.
 */
export const isHousingDeveloperResourcesEnabled = (): boolean => {
  // biome-ignore lint/style/noProcessEnv: NEXT_PUBLIC_ vars are inlined at build time.
  return process.env.NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED === "true";
};
