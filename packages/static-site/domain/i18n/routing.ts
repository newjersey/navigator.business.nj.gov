/**
 * Defines locale routing behavior for static-site pages.
 *
 * This module centralizes locale prefixes and default locale configuration.
 */

import { defineRouting } from "next-intl/routing";

import { APP_LOCALES, DEFAULT_LOCALE } from "./locales";

/**
 * Builds locale-aware route settings for `next-intl`.
 *
 * This module keeps route locale behavior in one place so navigation and
 * middleware use the same rules.
 */
export const routing = defineRouting({
  locales: APP_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});
