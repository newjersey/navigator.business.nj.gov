/**
 * Loads and validates localized message payloads for the static site.
 *
 * This module is the single boundary between raw JSON imports and typed
 * application messages used by routes and components. Validation ensures
 * all locale files share the same key structure as the base en-US locale.
 */

import type { ApplicationMessages } from "@/domain/content/messageTypes";
import enUsMessagesData from "@/messages/en-US.json";
import esUsMessagesData from "@/messages/es-US.json";
import type { AppLocale } from "./locales";

/**
 * Recursively checks that `other` contains all the same keys as `base`.
 *
 * Arrays are validated by comparing the structure of the first element.
 *
 * @param base Reference value drawn from the en-US payload.
 * @param other Candidate value from another locale payload.
 * @returns `true` when `other` structurally matches `base`.
 */
const hasSameStructure = (base: unknown, other: unknown): boolean => {
  if (Array.isArray(base)) {
    if (!Array.isArray(other)) return false;
    if (base.length === 0) return true;
    return other.length > 0 && hasSameStructure(base[0], other[0]);
  }

  if (typeof base === "object" && base !== null) {
    if (typeof other !== "object" || other === null || Array.isArray(other)) return false;
    const baseRecord = base as Record<string, unknown>;
    const otherRecord = other as Record<string, unknown>;
    return Object.keys(baseRecord).every(
      (key) => key in otherRecord && hasSameStructure(baseRecord[key], otherRecord[key]),
    );
  }

  return typeof base === typeof other;
};

/**
 * Asserts that a locale payload has the same structure as en-US.
 *
 * @param locale Locale associated with the payload, used in error messages.
 * @param payload Unknown payload imported from a locale JSON file.
 * @throws {Error} Thrown when the payload structure diverges from en-US.
 */
const ensureMatchingStructure = (locale: AppLocale, payload: unknown): void => {
  if (!hasSameStructure(enUsMessagesData, payload)) {
    throw new Error(`Message payload for locale "${locale}" does not match en-US structure`);
  }
};

ensureMatchingStructure("es-US", esUsMessagesData);

const APPLICATION_MESSAGES_BY_LOCALE: Readonly<Record<AppLocale, ApplicationMessages>> = {
  "en-US": enUsMessagesData as unknown as ApplicationMessages,
  "es-US": esUsMessagesData as unknown as ApplicationMessages,
};

/**
 * Returns application messages for a validated locale.
 *
 * @param params.locale Locale already validated as `AppLocale`.
 * @returns Localized application messages for the locale.
 * @example
 * ```ts
 * const messages = getApplicationMessages({ locale: "en-US" });
 * ```
 */
export const getApplicationMessages = (params: { locale: AppLocale }): ApplicationMessages => {
  return APPLICATION_MESSAGES_BY_LOCALE[params.locale];
};
