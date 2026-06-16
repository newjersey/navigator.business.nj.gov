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
  // `as-needed` leaves the default locale (en-US) unprefixed (`/page/x`) while
  // prefixing every other locale (`/es-US/page/x`).
  localePrefix: "as-needed",
  // The preferred-language modal handles locale suggestion client-side, so the
  // middleware must never silently redirect based on cookie or accept-language.
  localeDetection: false,
});
