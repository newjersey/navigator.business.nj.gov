/**
 * Configures request-time locale and message loading for `next-intl`.
 *
 * This module resolves locale input and returns validated message payloads for
 * each request.
 */

import { getRequestConfig } from "next-intl/server";

import { resolveAppLocale } from "./locales";
import { getApplicationMessagesForUnknownLocale } from "./messages";

/**
 * Configures locale and messages for each incoming `next-intl` request.
 *
 * This file bridges route locale detection with validated static message data.
 * It ensures each request gets a supported locale and the matching messages.
 */
const requestConfig = getRequestConfig(async ({ locale, requestLocale }) => {
  const routeLocale = await requestLocale;
  const resolvedLocale = resolveAppLocale({ locale: locale ?? routeLocale });

  return {
    locale: resolvedLocale,
    messages: getApplicationMessagesForUnknownLocale({ locale: resolvedLocale }),
  };
});

/**
 * Exports the request config consumed by `next-intl`.
 *
 * Keep this as the default export so the framework can discover it without
 * extra wiring.
 */
export default requestConfig;
