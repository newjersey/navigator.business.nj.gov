/**
 * Composes all landing page sections into one localized page layout.
 *
 * This module wires stateless section components in display order. It keeps
 * page structure simple and leaves content decisions to typed props.
 */

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

/**
 * Describes the props used to render the full landing page.
 *
 * The `content` object includes every section payload required by child
 * components.
 */
export interface LandingPageProps {
  /** Localized content for all landing sections. */
  readonly content: LandingPageContent;
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
export const LandingPage = ({ content }: LandingPageProps) => {
  return (
    <div>
      <SkipNav label={content.skipNavigationLabel} mainContentId={content.mainContentId} />
      <GovBanner content={content.banner} />
      <SiteHeader content={content.header} />
      <main id={content.mainContentId}>
        <HeroSection content={content.hero} />
        <TaglineSection content={content.tagline} />
        <GraphicListSection content={content.graphicList} />
        <CtaSection content={content.callToAction} />
      </main>
      <SiteFooter content={content.footer} mainContentId={content.mainContentId} />
      <IdentifierSection content={content.identifier} />
    </div>
  );
};
