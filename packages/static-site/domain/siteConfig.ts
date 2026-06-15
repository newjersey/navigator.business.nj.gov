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
export const SITE_BASE_URL = "https://next.business.nj.gov";

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
