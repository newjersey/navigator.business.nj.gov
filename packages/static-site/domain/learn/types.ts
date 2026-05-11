/**
 * Declares typed learn-page content models used across the static site.
 *
 * These interfaces define the contract between localized messages, loaders,
 * and rendered UI sections.
 */

import type { LandingLink } from "@/domain/landing/types";

/**
 * One category card rendered in the learn page grid.
 *
 * This type defines a stable shape for related data.
 */
export interface LearnCategory {
  /** Heading text for the category card. */
  readonly title: string;
  /** Supporting text rendered in the category card. */
  readonly description: string;
  /** Link metadata for the category card CTA. */
  readonly link: LandingLink;
}

/**
 * All localized content needed to render the learn page.
 *
 * This type defines a stable shape for related data.
 */
export interface LearnPageContent {
  /** Navigation name for the learn section. */
  readonly name: string;
  /** Subheading text rendered below the page title. */
  readonly subHeadingText: string;
  /** Secondary heading text rendered above the categories grid. */
  readonly heading2: string;
  /** Category cards rendered in the learn grid. */
  readonly categories: readonly LearnCategory[];
}
