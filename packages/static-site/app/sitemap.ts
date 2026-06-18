/**
 * Generates the XML sitemap with hreflang alternates for every route.
 *
 * Each entry lists its absolute default-locale URL plus a `languages` map so
 * search engines treat the localized variants as linked. Routes are enumerated
 * from the same content sources the pages render from, so the sitemap stays in
 * sync with the actual route tree.
 */

import type { MetadataRoute } from "next";

import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { addLocalePrefix } from "@/domain/i18n/localePath";
import { ENABLED_LOCALES } from "@/domain/i18n/locales";
import { SITE_BASE_URL } from "@/domain/siteConfig";

/**
 * Builds an absolute URL for a locale-prefixed pathname.
 *
 * @param pathnameWithoutLocale Unprefixed pathname starting with `/`.
 * @param locale Locale to apply before resolving against the site origin.
 * @returns The absolute URL for the locale variant.
 */
const toAbsoluteUrl = (pathnameWithoutLocale: string, locale: (typeof ENABLED_LOCALES)[number]) => {
  return new URL(addLocalePrefix({ pathnameWithoutLocale, locale }), SITE_BASE_URL).toString();
};

/**
 * Builds one sitemap entry with per-locale alternate URLs.
 *
 * @param pathnameWithoutLocale Unprefixed pathname for the route.
 * @returns A sitemap entry for the default-locale URL plus language alternates.
 */
const buildSitemapEntry = (pathnameWithoutLocale: string): MetadataRoute.Sitemap[number] => {
  const languages: Record<string, string> = {};

  for (const locale of ENABLED_LOCALES) {
    languages[locale] = toAbsoluteUrl(pathnameWithoutLocale, locale);
  }

  return {
    url: toAbsoluteUrl(pathnameWithoutLocale, "en-US"),
    alternates: { languages },
  };
};

/**
 * Lists every unprefixed pathname the site exposes.
 *
 * @returns Unprefixed pathnames for the home, learn, category, and content pages.
 */
const collectRoutePathnames = (): readonly string[] => {
  const categoryPathnames = Object.keys(CATEGORY_HIERARCHY).map((category) => `/${category}`);
  const contentPathnames = Object.values(CATEGORY_HIERARCHY).flatMap((category) => {
    return category.children.map((page) => `/pages/${page.slug}`);
  });

  return ["/", "/learn", ...categoryPathnames, ...contentPathnames];
};

/**
 * Generates the localized sitemap for the static site.
 *
 * @returns The sitemap with hreflang alternates for every route.
 * @example
 * ```ts
 * const entries = sitemap();
 * ```
 */
const sitemap = (): MetadataRoute.Sitemap => {
  return collectRoutePathnames().map(buildSitemapEntry);
};

export default sitemap;
