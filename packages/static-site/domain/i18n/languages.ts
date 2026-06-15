/**
 * Describes display metadata for each supported locale.
 *
 * Autonyms (a language's name in its own language) are locale-independent, so
 * they live here in config rather than in per-locale message files. This module
 * is the single extension point when adding a new supported language.
 */

import { type AppLocale, DEFAULT_LOCALE } from "./locales";

/**
 * Display metadata for one selectable language.
 *
 * Add a new entry here (and a matching message file) to support another locale.
 */
export interface LanguageDescriptor {
  /** Locale tag; also the BCP-47 value for `lang` and `hrefLang` attributes. */
  readonly locale: AppLocale;
  /** Language name written in its own language (autonym), e.g. "Español". */
  readonly nativeName: string;
  /** Language name written in English, e.g. "Spanish". Used for the submenu format "Español (Spanish)". */
  readonly englishName: string;
  /** Region name written in the language itself, e.g. "Estados Unidos". */
  readonly regionName: string;
  /** Writing direction for the language, used for the document `dir` attribute. */
  readonly textDirection: "ltr" | "rtl";
}

/**
 * Every selectable language, declared in a readable locale order.
 *
 * Display order is not taken from this array — `LANGUAGE_DESCRIPTORS` sorts it
 * by native name. Extend this list to offer additional locales over time.
 */
const LANGUAGE_DESCRIPTORS_BY_LOCALE: readonly LanguageDescriptor[] = [
  {
    locale: "en-US",
    nativeName: "English",
    englishName: "English",
    regionName: "United States",
    textDirection: "ltr",
  },
  {
    locale: "es-US",
    nativeName: "Español",
    englishName: "Spanish",
    regionName: "Estados Unidos",
    textDirection: "ltr",
  },
];

/**
 * Every selectable language, ordered alphabetically by native name.
 *
 * NJWDS specifies that a 3+ language selector orders options "alphabetically by
 * the common, native language name", so the display order is derived here
 * rather than hand-maintained. The order controls how options appear in the
 * language switcher.
 */
export const LANGUAGE_DESCRIPTORS: readonly LanguageDescriptor[] = [
  ...LANGUAGE_DESCRIPTORS_BY_LOCALE,
].sort((a, b) => a.nativeName.localeCompare(b.nativeName));

/**
 * Resolves the writing direction for a locale from its descriptor.
 *
 * @param locale Locale whose writing direction is needed.
 * @returns The locale's `dir` value, defaulting to the default locale's
 *   direction when no descriptor matches.
 * @example
 * ```ts
 * textDirectionForLocale("ar-US"); // "rtl"
 * textDirectionForLocale("en-US"); // "ltr"
 * ```
 */
export const textDirectionForLocale = (locale: AppLocale): "ltr" | "rtl" => {
  const descriptor = LANGUAGE_DESCRIPTORS.find((entry) => entry.locale === locale);

  return (
    descriptor?.textDirection ??
    LANGUAGE_DESCRIPTORS.find((entry) => entry.locale === DEFAULT_LOCALE)?.textDirection ??
    "ltr"
  );
};
