/**
 * Matches a visitor's browser languages to a supported locale.
 *
 * This pure helper takes the already-ordered list of browser language tags
 * (e.g. from `navigator.languages`) and returns the first one whose primary
 * language subtag maps to a supported app locale. It performs no `navigator`
 * access so it stays fully table-testable.
 */

import { type AppLocale, ENABLED_LOCALES } from "./locales";

/**
 * Describes input for resolving a preferred locale.
 *
 * This type defines a stable shape for related data.
 */
export interface ResolvePreferredLocaleParams {
  /** Browser language tags in descending priority order. */
  readonly browserLanguages: readonly string[];
}

/**
 * Maps a primary language subtag to a supported locale.
 *
 * @param languageSubtag Lowercased primary subtag, e.g. "es" or "en".
 * @returns The supported locale sharing that subtag, or `undefined`.
 */
const matchLanguageSubtag = (languageSubtag: string): AppLocale | undefined => {
  return ENABLED_LOCALES.find((locale) => {
    return locale.toLowerCase().split("-")[0] === languageSubtag;
  });
};

/**
 * Resolves the visitor's preferred supported locale.
 *
 * Walks `browserLanguages` in priority order and returns the first entry whose
 * language subtag maps to a supported locale (e.g. `es-ES` and `es` both map to
 * `es-US`). Returns `undefined` when no entry is supported.
 *
 * @param params Resolution input.
 * @param params.browserLanguages Browser language tags in priority order.
 * @returns The preferred supported locale, or `undefined` when none matches.
 * @example
 * ```ts
 * resolvePreferredLocale({ browserLanguages: ["es-ES", "en"] }); // "es-US"
 * resolvePreferredLocale({ browserLanguages: ["fr"] }); // undefined
 * ```
 */
export const resolvePreferredLocale = ({
  browserLanguages,
}: ResolvePreferredLocaleParams): AppLocale | undefined => {
  for (const browserLanguage of browserLanguages) {
    const languageSubtag = browserLanguage.toLowerCase().split("-")[0];
    const matchedLocale = matchLanguageSubtag(languageSubtag);

    if (matchedLocale) {
      return matchedLocale;
    }
  }

  return undefined;
};
