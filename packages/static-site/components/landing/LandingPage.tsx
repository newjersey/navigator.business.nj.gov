/**
 * Composes all landing page sections into one localized page layout.
 *
 * This module wires stateless section components in display order. It keeps
 * page structure simple and leaves content decisions to typed props.
 */

import type { Funding } from "@/domain/content/types";
import type { LandingPageContent } from "@/domain/landing/types";
import { CtaSection } from "./CtaSection";
import { GovBanner } from "./GovBanner";
import { GraphicListSection } from "./GraphicListSection";
import { HeroSection } from "./HeroSection";
import { IdentifierSection } from "./IdentifierSection";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SkipNav } from "./SkipNav";
import { TaglineSection } from "./TaglineSection";

export interface LandingPageProps {
  /** Localized content for all landing sections. */
  readonly content: LandingPageContent;
  /** Featured fundings loaded from CMS content. */
  readonly fundings?: Funding[];
}

/**
 * Renders the full localized landing page.
 *
 * @param props Component props.
 * @param props.content Full landing page content payload.
 * @returns The full landing page markup.
 * @example
 * ```tsx
 * <LandingPage content={loadedContent.landing} />
 * ```
 */
export const LandingPage = ({ content, fundings }: LandingPageProps) => {
  return (
    <div>
      <SkipNav label={content.skipNavigationLabel} mainContentId={content.mainContentId} />
      <GovBanner content={content.banner} />
      <SiteHeader content={content.header} />
      <main id={content.mainContentId}>
        <HeroSection content={content.hero} />
        <TaglineSection content={content.tagline} />
        <GraphicListSection content={content.graphicList} />
        {fundings && fundings.length > 0 && (
          <section className="usa-section">
            <div className="grid-container">
              <h2 className="font-heading-xl margin-y-0">Featured Funding Opportunities</h2>
              <ul className="usa-card-group">
                {fundings.map((funding) => (
                  <li key={funding.name} className="usa-card tablet:grid-col-4">
                    <div className="usa-card__container">
                      <div className="usa-card__header">
                        <h3 className="usa-card__heading">{funding.name}</h3>
                      </div>
                      <div className="usa-card__body">
                        <p>{funding.summaryDescriptionMd}</p>
                      </div>
                      <div className="usa-card__footer">
                        <a href={funding.callToActionLink} className="usa-button">
                          {funding.callToActionText}
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        <CtaSection content={content.callToAction} />
      </main>
      <SiteFooter content={content.footer} mainContentId={content.mainContentId} />
      <IdentifierSection content={content.identifier} />
    </div>
  );
};
