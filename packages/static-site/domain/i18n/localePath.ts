/**
 * Provides pure helpers for locale prefix math on pathnames.
 *
 * Under `as-needed` routing the default locale is unprefixed while other
 * locales carry a leading `/<locale>` segment. These side-effect-free helpers
 * convert between the prefixed (external) and unprefixed forms so components and
 * the language switcher can re-target the current page at another locale.
 */

import { APP_LOCALES, type AppLocale, DEFAULT_LOCALE, hasAppLocale } from "./locales";

/**
 * Describes input for building a locale-prefixed pathname.
 *
 * This type defines a stable shape for related data.
 */
export interface AddLocalePrefixParams {
  /** Pathname without any locale prefix, always starting with `/`. */
  readonly pathnameWithoutLocale: string;
  /** Target locale to prefix the pathname with. */
  readonly locale: AppLocale;
}

/**
 * Reads the leading path segment from a pathname.
 *
 * @param pathname Pathname that may begin with a locale segment.
 * @returns The first non-empty segment, or `undefined` when none exists.
 */
const readLeadingSegment = (pathname: string): string | undefined => {
  return pathname.split("/").find((segment) => segment.length > 0);
};

/**
 * Removes a leading locale segment from a pathname.
 *
 * @param pathname External pathname that may include a locale prefix.
 * @returns The pathname without its locale prefix, always starting with `/`.
 * @example
 * ```ts
 * stripLocalePrefix("/es-US/learn"); // "/learn"
 * stripLocalePrefix("/learn"); // "/learn"
 * ```
 */
export const stripLocalePrefix = (pathname: string): string => {
  const leadingSegment = readLeadingSegment(pathname);

  if (leadingSegment && hasAppLocale(leadingSegment)) {
    const remainder = pathname.slice(leadingSegment.length + 1);

    return remainder.startsWith("/") ? remainder : `/${remainder}`;
  }

  return pathname;
};

/**
 * Adds a locale prefix to an unprefixed pathname.
 *
 * The default locale stays unprefixed; every other locale is prefixed. This is
 * the inverse of {@link stripLocalePrefix} and is idempotent when composed.
 *
 * @param params Prefixing input.
 * @param params.pathnameWithoutLocale Pathname without any locale prefix.
 * @param params.locale Target locale to apply.
 * @returns The pathname for the target locale.
 * @example
 * ```ts
 * addLocalePrefix({ pathnameWithoutLocale: "/learn", locale: "es-US" }); // "/es-US/learn"
 * addLocalePrefix({ pathnameWithoutLocale: "/learn", locale: "en-US" }); // "/learn"
 * ```
 */
export const addLocalePrefix = ({
  pathnameWithoutLocale,
  locale,
}: AddLocalePrefixParams): string => {
  if (locale === DEFAULT_LOCALE) {
    return pathnameWithoutLocale;
  }

  if (pathnameWithoutLocale === "/") {
    return `/${locale}`;
  }

  return `/${locale}${pathnameWithoutLocale}`;
};

/**
 * Resolves the locale implied by a pathname's leading segment.
 *
 * @param pathname External pathname that may include a locale prefix.
 * @returns The prefixed locale, or `DEFAULT_LOCALE` when unprefixed.
 * @example
 * ```ts
 * localeOfPathname("/es-US/learn"); // "es-US"
 * localeOfPathname("/learn"); // "en-US"
 * ```
 */
export const localeOfPathname = (pathname: string): AppLocale => {
  const leadingSegment = readLeadingSegment(pathname);

  if (leadingSegment && APP_LOCALES.includes(leadingSegment as AppLocale)) {
    return leadingSegment as AppLocale;
  }

  return DEFAULT_LOCALE;
};
