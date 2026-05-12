/**
 * Defines stable heading IDs for CMS-backed content pages.
 *
 * These IDs are shared by rendered pages and the generated search index so
 * section-level search results link to real anchors.
 */

/**
 * Describes input for building a content page title heading ID.
 */
export interface BuildContentPageTitleHeadingIdParams {
  /** URL slug for the content page. */
  readonly pageSlug: string;
}

/**
 * Describes input for building a content page section heading ID.
 */
export interface BuildContentPageSectionHeadingIdParams {
  /** URL slug for the content page. */
  readonly pageSlug: string;
  /** Numeric section suffix from CMS fields such as `heading-2`. */
  readonly sectionNumber: number;
}

/**
 * Builds a stable anchor ID for a content page title.
 *
 * @param params ID input.
 * @param params.pageSlug URL slug for the content page.
 * @returns Anchor ID for the content page title.
 * @example
 * ```ts
 * const id = buildContentPageTitleHeadingId({ pageSlug: "business-names" });
 * ```
 */
export const buildContentPageTitleHeadingId = ({
  pageSlug,
}: BuildContentPageTitleHeadingIdParams): string => {
  return `${pageSlug}-title`;
};

/**
 * Builds a stable anchor ID for a numbered content page section.
 *
 * @param params ID input.
 * @param params.pageSlug URL slug for the content page.
 * @param params.sectionNumber Numeric section suffix from the CMS field name.
 * @returns Anchor ID for the content page section heading.
 * @example
 * ```ts
 * const id = buildContentPageSectionHeadingId({
 *   pageSlug: "business-names",
 *   sectionNumber: 2,
 * });
 * ```
 */
export const buildContentPageSectionHeadingId = ({
  pageSlug,
  sectionNumber,
}: BuildContentPageSectionHeadingIdParams): string => {
  return `${pageSlug}-section-${sectionNumber}`;
};
