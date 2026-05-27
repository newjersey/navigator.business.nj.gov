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
export const hasSameStructure = (base: unknown, other: unknown): boolean => {
  if (Array.isArray(base)) {
    if (!Array.isArray(other)) return false;
    if (base.length !== other.length) return false;
    return base.every((item, index) => hasSameStructure(item, other[index]));
  }

  if (typeof base === "object" && base !== null) {
    if (typeof other !== "object" || other === null || Array.isArray(other)) return false;
    const baseRecord = base as Record<string, unknown>;
    const otherRecord = other as Record<string, unknown>;
    const allKeysInBasePresentInOther = Object.keys(baseRecord).every(
      (key) => key in otherRecord && hasSameStructure(baseRecord[key], otherRecord[key]),
    );
    const allKeysInOtherPresentInBase = Object.keys(otherRecord).every(
      (key) => key in baseRecord && hasSameStructure(baseRecord[key], otherRecord[key]),
    );
    return allKeysInBasePresentInOther && allKeysInOtherPresentInBase;
  }

  return typeof base === typeof other;
};

interface DiffParams {
  base: unknown;
  other: unknown;
  path?: string;
}

const collectArrayDiffs = ({ base, other, path = "" }: DiffParams): string[] => {
  const baseArr = base as unknown[];
  if (!Array.isArray(other)) {
    return [`${path}: expected array, got ${typeof other}`];
  }
  if (baseArr.length !== other.length) {
    return [`${path}: array length mismatch (base: ${baseArr.length}, other: ${other.length})`];
  }
  return baseArr.flatMap((item, index) =>
    collectStructureDiffs({ base: item, other: other[index], path: `${path}[${index}]` }),
  );
};

const collectObjectDiffs = ({ base, other, path = "" }: DiffParams): string[] => {
  if (typeof other !== "object" || other === null || Array.isArray(other)) {
    return [`${path}: expected object, got ${Array.isArray(other) ? "array" : typeof other}`];
  }
  const baseRecord = base as Record<string, unknown>;
  const otherRecord = other as Record<string, unknown>;
  const missingOrChanged = Object.keys(baseRecord).flatMap((key) => {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in otherRecord)) return [`${childPath}: missing in other locale`];
    return collectStructureDiffs({
      base: baseRecord[key],
      other: otherRecord[key],
      path: childPath,
    });
  });
  const extra = Object.keys(otherRecord)
    .filter((key) => !(key in baseRecord))
    .map((key) => `${path ? `${path}.${key}` : key}: extra key not in base locale`);
  return [...missingOrChanged, ...extra];
};

/**
 * Collects paths where `other` diverges structurally from `base`.
 */
export const collectStructureDiffs = ({ base, other, path = "" }: DiffParams): string[] => {
  if (Array.isArray(base)) return collectArrayDiffs({ base, other, path });
  if (typeof base === "object" && base !== null) return collectObjectDiffs({ base, other, path });
  if (typeof base !== typeof other) {
    return [`${path}: type mismatch (base: ${typeof base}, other: ${typeof other})`];
  }
  return [];
};

/**
 * Asserts that a locale payload has the same structure as en-US.
 *
 * @param locale Locale associated with the payload, used in error messages.
 * @param payload Unknown payload imported from a locale JSON file.
 * @throws {Error} Thrown when the payload structure diverges from en-US.
 */
const ensureMatchingStructure = (locale: AppLocale, payload: unknown): void => {
  const diffs = collectStructureDiffs({ base: enUsMessagesData, other: payload });
  if (diffs.length > 0) {
    throw new Error(
      `Message payload for locale "${locale}" does not match en-US structure:\n${diffs.join("\n")}`,
    );
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
