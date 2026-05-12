/**
 * Defines stable heading IDs for landing-page sections.
 *
 * These IDs are shared by rendered pages and the generated search index so
 * Pagefind section links point to real anchors.
 */

/** Anchor ID for the homepage hero heading. */
export const HOME_HERO_HEADING_ID = "home-introduction";

/** Anchor ID for the homepage tagline heading. */
export const HOME_TAGLINE_HEADING_ID = "home-guidance";

/** Anchor ID for the homepage featured funding heading. */
export const HOME_FEATURED_FUNDING_HEADING_ID = "home-featured-funding";

/** Anchor ID for the homepage call-to-action heading. */
export const HOME_CTA_HEADING_ID = "home-support";

/**
 * Describes input for building a graphic-list heading ID.
 */
export interface BuildLandingGraphicListHeadingIdParams {
  /** Zero-based item position in the graphic-list content array. */
  readonly index: number;
}

/**
 * Builds a stable anchor ID for a homepage graphic-list item heading.
 *
 * @param params ID input.
 * @param params.index Zero-based graphic-list item position.
 * @returns Anchor ID for the graphic-list item heading.
 * @example
 * ```ts
 * const id = buildLandingGraphicListHeadingId({ index: 0 });
 * ```
 */
export const buildLandingGraphicListHeadingId = ({
  index,
}: BuildLandingGraphicListHeadingIdParams): string => {
  return `home-guidance-item-${index + 1}`;
};
