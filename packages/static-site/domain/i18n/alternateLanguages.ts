/**
 * Builds hreflang alternate metadata linking a page's locale variants.
 *
 * Search engines treat localized pages as linked variants when each page
 * advertises `<link rel="alternate" hreflang>` entries (and an `x-default`).
 * This pure helper produces the Next.js `Metadata["alternates"]` shape from a
 * single unprefixed pathname; relative paths resolve against `metadataBase`.
 */

import type { Metadata } from "next";

import { addLocalePrefix } from "./localePath";
import { ENABLED_LOCALES } from "./locales";

/**
 * Describes input for building alternate-language metadata.
 *
 * This type defines a stable shape for related data.
 */
export interface BuildAlternateLanguagesParams {
  /** Page pathname without any locale prefix, starting with `/`. */
  readonly pathnameWithoutLocale: string;
}

/**
 * Builds canonical and hreflang alternate metadata for a page.
 *
 * The canonical URL points at the unprefixed (default-locale) path. Each
 * supported locale gets an entry keyed by its BCP-47 tag, plus an `x-default`
 * pointing at the unprefixed path.
 *
 * @param params Build input.
 * @param params.pathnameWithoutLocale Unprefixed page pathname.
 * @returns Alternate metadata for the page `<head>`.
 * @example
 * ```ts
 * buildAlternateLanguages({ pathnameWithoutLocale: "/learn" });
 * // { canonical: "/learn", languages: { "en-US": "/learn", "es-US": "/es-US/learn", "x-default": "/learn" } }
 * ```
 */
export const buildAlternateLanguages = ({
  pathnameWithoutLocale,
}: BuildAlternateLanguagesParams): NonNullable<Metadata["alternates"]> => {
  const canonical = addLocalePrefix({ pathnameWithoutLocale, locale: "en-US" });

  const languages: Record<string, string> = {};

  for (const locale of ENABLED_LOCALES) {
    languages[locale] = addLocalePrefix({ pathnameWithoutLocale, locale });
  }

  languages["x-default"] = canonical;

  return { canonical, languages };
};
