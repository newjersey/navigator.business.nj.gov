/**
 * Defines the search feature flag for the static-site package.
 *
 * This module is the single place that reads `NEXT_PUBLIC_SEARCH_ENABLED`.
 * Callers should use `isSearchEnabled()` rather than reading the raw env var
 * directly, so the flag has one typed read site.
 */

const readSearchEnabled = (): boolean => {
  // biome-ignore lint/style/noProcessEnv: NEXT_PUBLIC_ vars are inlined at build time.
  return process.env.NEXT_PUBLIC_SEARCH_ENABLED === "true";
};

/**
 * Checks whether the search feature is enabled for this build.
 *
 * This flag is independent of `NEXT_PUBLIC_MULTILINGUAL_ENABLED`: search
 * visibility and language behavior are orthogonal. Search UI is
 * multilingual-aware when the multilingual flag is on, regardless of whether
 * search itself is enabled.
 *
 * @returns `true` when `NEXT_PUBLIC_SEARCH_ENABLED` is `"true"`.
 */
export const isSearchEnabled = (): boolean => readSearchEnabled();
