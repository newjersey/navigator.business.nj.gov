/**
 * Resolves the canonical URL pathname for a content page slug.
 *
 * Most pages are served by the `/pages/[slug]` route, but a few have their own
 * dedicated route and must be linked at that URL instead. Navigation, the
 * category listings, and the sitemap all resolve pathnames through here so they
 * cannot drift from the actual route tree.
 *
 * `/privacy-policy` and `/our-software-and-reuse` are dedicated routes too, but
 * their content carries no `category`, so they never reach the category
 * hierarchy that feeds this resolver — `app/sitemap.ts` lists them directly.
 */

import {
  HOUSING_DEVELOPER_RESOURCES_PATHNAME,
  HOUSING_DEVELOPER_RESOURCES_SLUG,
} from "@/domain/content/housingDeveloperResourcesFlag";

/** Maps a content slug to the pathname of its dedicated route. */
const PAGE_PATHNAME_OVERRIDES: Readonly<Record<string, string>> = {
  [HOUSING_DEVELOPER_RESOURCES_SLUG]: HOUSING_DEVELOPER_RESOURCES_PATHNAME,
};

/**
 * Reports whether a slug is served by its own route instead of `/pages/[slug]`.
 *
 * @param slug Content page slug.
 * @returns `true` when the slug has a dedicated route.
 * @example
 * ```ts
 * hasDedicatedRoute("housing-developer-resources"); // true
 * hasDedicatedRoute("funding"); // false
 * ```
 */
export const hasDedicatedRoute = (slug: string): boolean => {
  // `Object.hasOwn`, not `in` or a `??` fallback: a slug like "constructor"
  // would otherwise resolve to an inherited prototype value.
  return Object.hasOwn(PAGE_PATHNAME_OVERRIDES, slug);
};

/**
 * Resolves the unprefixed pathname a content page is served at.
 *
 * @param slug Content page slug.
 * @returns The slug's dedicated pathname, or its `/pages/<slug>` pathname.
 * @example
 * ```ts
 * resolvePagePathname("housing-developer-resources"); // "/housingprograms"
 * resolvePagePathname("funding"); // "/pages/funding"
 * ```
 */
export const resolvePagePathname = (slug: string): string => {
  return hasDedicatedRoute(slug) ? PAGE_PATHNAME_OVERRIDES[slug] : `/pages/${slug}`;
};
