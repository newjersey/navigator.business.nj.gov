/**
 * Renders the landing page footer and contact area.
 *
 * This module maps typed footer content into NJWDS footer markup, including
 * primary links, social links, and contact channels.
 */

import Image from "next/image";

import type { LandingSocialLink, LayoutFooterContent } from "@/domain/content/messageTypes";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Public path for the Business.NJ.gov site logo.
 */
const SITE_LOGO_PATH = "/img/business.NJ.gov-logo.svg";

/**
 * Describes props used by the site footer component.
 *
 * This type defines a stable shape for related data.
 */
export interface SiteFooterProps {
  /** Localized footer content. */
  readonly content: LayoutFooterContent;
  /** Main-content ID used by the return-to-top anchor. */
  readonly mainContentId: string;
}

/**
 * Describes input used to render one footer social link item.
 *
 * This type defines a stable shape for related data.
 */
interface RenderFooterSocialLinkParams {
  /** Social link content and positional metadata. */
  readonly socialLink: LandingSocialLink;
  /** Positional index for React key generation fallback. */
  readonly index: number;
}

/**
 * Renders one social link icon in the footer.
 *
 * @param params Render parameters.
 * @param params.socialLink Social link data.
 * @param params.index Position used for fallback key composition.
 * @returns One social link container element.
 * @example
 * ```tsx
 * renderFooterSocialLink({ socialLink: content.socialLinks[0], index: 0 });
 * ```
 */
const renderFooterSocialLink = ({ socialLink, index }: RenderFooterSocialLinkParams) => {
  const socialClassName = `usa-social-link usa-social-link--${socialLink.modifier}`;

  return (
    <div className="grid-col-auto" key={`${socialLink.link.href}-${index}`}>
      <LocalizedLink className={socialClassName} link={socialLink.link}>
        <Image
          alt={socialLink.iconAlt}
          className="usa-social-link__icon"
          height={24}
          src={socialLink.iconPath}
          width={24}
        />
      </LocalizedLink>
    </div>
  );
};

/**
 * Renders the full footer region.
 *
 * @param props Component props.
 * @param props.content Localized footer content.
 * @param props.mainContentId Main section ID used by the return-to-top link.
 * @returns The full footer markup.
 * @example
 * ```tsx
 * <SiteFooter content={landing.footer} mainContentId={landing.mainContentId} />
 * ```
 */
export const SiteFooter = ({ content, mainContentId }: SiteFooterProps) => {
  return (
    <footer className="usa-footer">
      <div className="grid-container usa-footer__return-to-top">
        <a href={`#${mainContentId}`}>{content.returnToTopLabel}</a>
      </div>
      <div className="usa-footer__secondary-section">
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="usa-footer__logo grid-row mobile-lg:grid-col-6 mobile-lg:grid-gap-2">
              <div className="mobile-lg:grid-col-auto">
                <Image
                  alt={content.agencyLogoAlt}
                  height={50}
                  src={SITE_LOGO_PATH}
                  style={{ height: "auto", maxWidth: "100%" }}
                  unoptimized
                  width={200}
                />
              </div>
            </div>
            <div className="usa-footer__contact-links mobile-lg:grid-col-6">
              <div className="usa-footer__social-links grid-row grid-gap-1">
                {content.socialLinks.map((socialLink, index) => {
                  return renderFooterSocialLink({ socialLink, index });
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
