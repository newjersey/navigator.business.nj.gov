/**
 * Renders the hero section for the landing page.
 *
 * This module maps hero labels and CTA data from localized content into NJWDS
 * hero markup.
 */

import type { LandingHeroContent } from "@/domain/landing/types";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Describes props used by the hero section component.
 *
 * This type defines a stable shape for related data.
 */
export interface HeroSectionProps {
  /** Localized hero content. */
  readonly content: LandingHeroContent;
}

/**
 * Maps hero content into NJWDS hero markup.
 *
 * @param props Component props.
 * @param props.content Localized labels, text, and CTA link for the hero.
 * @returns The hero section element.
 * @example
 * ```tsx
 * <HeroSection content={landing.hero} />
 * ```
 */
export const HeroSection = ({ content }: HeroSectionProps) => {
  return (
    <section aria-label={content.sectionAriaLabel} className="usa-hero">
      <div className="grid-container">
        <div className="usa-hero__callout">
          <h1 className="usa-hero__heading">
            <span className="usa-hero__heading--alt">{content.callout}</span>
            {content.title}
          </h1>
          <p>{content.paragraph}</p>
          <LocalizedLink className="usa-button" link={content.callToActionLink} />
        </div>
      </div>
    </section>
  );
};
