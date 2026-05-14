/**
 * Maps each learn category to its ordered list of page slugs.
 *
 * Slugs are derived from CMS page content by grouping on the `category` field.
 */

import { loadPages } from "@/domain/content/loadContent";

export interface CategoryHierarchy {
  /** Ordered page slugs belonging to this category. */
  readonly children: string[];
}

/** the expected category strings are plan/start/operate/grow but this is generic to avoid hardcoding that */
export const CATEGORY_HIERARCHY: Readonly<Record<string, CategoryHierarchy>> = (() => {
  const result: Record<string, CategoryHierarchy> = {};

  for (const page of loadPages()) {
    if (!page.category || !page.slug) continue;
    result[page.category] ??= { children: [] };
    result[page.category].children.push(page.slug);
  }

  return result;
})();
