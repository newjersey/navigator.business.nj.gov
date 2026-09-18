/**
 * Gates the Housing Developer Resources page behind a build-time flag.
 *
 * The page has its own route at {@link HOUSING_DEVELOPER_RESOURCES_PATHNAME}
 * rather than being served under `/pages/<slug>`. When disabled, that route
 * 404s and the page is excluded from category navigation,
 * `generateStaticParams`, the sitemap, and the legacy redirect that points at
 * it — see `domain/categories.ts`, `domain/content/pagePaths.ts`, and
 * `domain/redirects/legacyRedirects.ts`.
 */

/** Slug of the flag-gated Housing Developer Resources page. */
export const HOUSING_DEVELOPER_RESOURCES_SLUG = "housing-developer-resources";

/** Canonical pathname of the Housing Developer Resources page, without a locale prefix. */
export const HOUSING_DEVELOPER_RESOURCES_PATHNAME = "/housingprograms";

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
