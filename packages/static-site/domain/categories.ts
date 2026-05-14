/**
 * Maps each learn category to its ordered list of page slugs.
 *
 * Slugs are derived from CMS page content by grouping on the `category` field.
 */

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

export const CATEGORY_HIERARCHY = buildCategoryHierarchy(loadPages());
