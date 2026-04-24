/**
 * Renders the landing page call-to-action section.
 *
 * This module shows the CTA heading, intro text, and action button link.
 */

import type { LandingCallToActionContent } from "@/domain/landing/types";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Describes props used by the CTA section component.
 *
 * This type defines a stable shape for related data.
 */
export interface CtaSectionProps {
  /** Localized CTA section content. */
  readonly content: LandingCallToActionContent;
}

/**
 * Renders the call-to-action section from localized content.
 *
 * @param props Component props.
 * @param props.content Localized CTA labels and link.
 * @returns The CTA section element.
 * @example
 * ```tsx
 * <CtaSection content={landing.callToAction} />
 * ```
 */
export const CtaSection = ({ content }: CtaSectionProps) => {
  return (
    <section className="usa-section" id={content.sectionId}>
      <div className="grid-container">
        <h2 className="font-heading-xl margin-y-0">{content.title}</h2>
        <p className="usa-intro">{content.intro}</p>
        <LocalizedLink className="usa-button usa-button--big" link={content.callToActionLink} />
      </div>
    </section>
  );
};
