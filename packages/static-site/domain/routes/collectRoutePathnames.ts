/**
 * Enumerates every unprefixed pathname the site exposes for indexable
 * content.
 *
 * Shared by the sitemap and the pagefind indexing script so both stay in
 * sync with the actual route tree — neither should hand-roll its own list.
 * Update pages are real, indexable content and belong in both consumers;
 * sharing this list is what put them in `sitemap.xml` for the first time
 * (see `app/sitemap.test.ts`), a deliberate improvement, not a side effect
 * to undo.
 */

import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { loadRecents } from "@/domain/content/loadContent";

/**
 * Lists every unprefixed pathname the site exposes.
 *
 * @returns Unprefixed pathnames for the home, learn, category, content, and
 * update pages.
 */
export const collectRoutePathnames = (): readonly string[] => {
  const categoryPathnames = Object.keys(CATEGORY_HIERARCHY).map((category) => `/${category}`);
  const contentPathnames = Object.values(CATEGORY_HIERARCHY).flatMap((category) => {
    return category.children.map((page) => `/pages/${page.slug}`);
  });
  const updatePathnames = loadRecents().map((recent) => `/updates/${recent.slug}`);

  return [
    "/",
    "/learn",
    "/our-software-and-reuse",
    "/privacy-policy",
    ...categoryPathnames,
    ...contentPathnames,
    ...updatePathnames,
  ];
};
