/**
 * Centralizes site-wide configuration constants for the static site.
 *
 * Keeping these values in one module lets metadata, alternate-language helpers,
 * the sitemap, and client components share a single source of truth instead of
 * duplicating literals.
 */

/**
 * Canonical production origin used to resolve absolute URLs.
 *
 * Metadata, hreflang alternates, and the sitemap all resolve relative paths
 * against this origin so every emitted URL points at the same host.
 */
export const SITE_BASE_URL = "https://business.nj.gov";

/**
 * Brand suffix appended to every page's browser title.
 *
 * Mirrors `titlePostfix` in `content/src/page-metadata/page-metadata.json`,
 * which the `web` app's `getNextSeoTitle` already uses, so both apps brand
 * page titles identically.
 */
export const SITE_TITLE_SUFFIX = "Business.NJ.gov";

/**
 * Social preview image shared by Open Graph and Twitter card metadata.
 */
export const SOCIAL_PREVIEW_IMAGE = {
  url: "/assets/njwds/dist/img/nj-logo-gray-20.png",
  width: 144,
  height: 144,
  alt: "State of New Jersey logo",
};

/**
 * Cookie name recording that a visitor dismissed the language prompt.
 *
 * Once set, the preferred-language modal stays hidden so a returning visitor is
 * not prompted again after choosing to stay or switch.
 */
export const LANGUAGE_PROMPT_DISMISSED_COOKIE = "njLanguagePromptDismissed";

/**
 * Cookie name that next-intl writes when a visitor explicitly picks a locale
 * via a language link. When this cookie matches the current page locale the
 * visitor deliberately chose that locale, so the language prompt is suppressed.
 */
export const NEXT_LOCALE_COOKIE_NAME = "NEXT_LOCALE";
