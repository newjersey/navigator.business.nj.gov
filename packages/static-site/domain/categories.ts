/**
 * Maps each learn category to its ordered list of page slugs.
 *
 * Slugs are derived from CMS page content by grouping on the `category` field.
 */

import {
  HOUSING_DEVELOPER_RESOURCES_SLUG,
  isHousingDeveloperResourcesEnabled,
} from "@/domain/content/housingDeveloperResourcesFlag";
import { loadPages } from "@/domain/content/loadContent";
import type { PageItem } from "@/domain/content/types";

export interface CategoryHierarchy {
  /** page slugs belonging to this category. */
  readonly children: PageItem[];
}

/** the expected category strings are plan/start/operate/grow but this is generic to avoid hardcoding that */
export const buildCategoryHierarchy = (
  pages: PageItem[],
): Readonly<Record<string, CategoryHierarchy>> => {
  const result: Record<string, CategoryHierarchy> = {};

  for (const page of pages) {
    if (!page.slug) throw new Error(`Page "${page.name}" is missing a slug`);
    if (!page.category) continue;
    result[page.category] ??= { children: [] };
    result[page.category].children.push(page);
  }

  return result;
};

/** Input for {@link filterFlaggedPages}. */
export interface FilterFlaggedPagesParams {
  /** Whether `NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED` is on. */
  readonly housingDeveloperResourcesEnabled: boolean;
}

/**
 * Removes pages gated by a disabled feature flag before building the
 * category hierarchy, so a disabled page never appears in navigation,
 * `generateStaticParams`, or the sitemap.
 *
 * @param pages Every page loaded from content.
 * @param params Flag state controlling which pages are kept.
 * @param params.housingDeveloperResourcesEnabled Whether the Housing
 *   Developer Resources page is enabled for this build.
 * @returns `pages` with any disabled flag-gated pages removed.
 */
export const filterFlaggedPages = (
  pages: PageItem[],
  { housingDeveloperResourcesEnabled }: FilterFlaggedPagesParams,
): PageItem[] => {
  if (housingDeveloperResourcesEnabled) return pages;
  return pages.filter((page) => page.slug !== HOUSING_DEVELOPER_RESOURCES_SLUG);
};

export const CATEGORY_HIERARCHY = buildCategoryHierarchy(
  filterFlaggedPages(loadPages(), {
    housingDeveloperResourcesEnabled: isHousingDeveloperResourcesEnabled(),
  }),
);
