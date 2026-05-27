/**
 * Renders the hero section for the landing page.
 */

import Image from "next/image";

import type { LandingHeroContent } from "@/domain/content/messageTypes";
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
 * Maps hero content into hero markup.
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
    <section aria-label={content.sectionAriaLabel} className="usa-hero hero-gradient">
      <div className="grid-container">
        <div className="grid-row grid-gap flex-align-center">
          <div className="tablet:grid-col-6">
            <h1 className="usa-hero__heading dark-blue">{content.title}</h1>
            <p className="usa-hero__text">{content.paragraph}</p>
            <LocalizedLink className="usa-button" link={content.callToActionLink} />
          </div>
          <div className="tablet:grid-col-6">
            <section className="hero-carousel" aria-label="carousel">
              {content.carouselImages.map((image, index) => (
                <Image
                  key={[image.src, index].join()}
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="480"
                  className={`hero-carousel__image hero-carousel__image--${index + 1}`}
                  priority={index === 0}
                />
              ))}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};
