/**
 * Renders the landing page footer and contact area.
 *
 * This module maps typed footer content into NJWDS footer markup, including
 * primary links, social links, and contact channels.
 */

import Image from "next/image";

import type {
  LandingFooterContent,
  LandingFooterPrimaryLink,
  LandingSocialLink,
} from "@/domain/landing/types";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Describes props used by the site footer component.
 *
 * This type defines a stable shape for related data.
 */
export interface SiteFooterProps {
  /** Localized footer content. */
  readonly content: LandingFooterContent;
  /** Main-content ID used by the return-to-top anchor. */
  readonly mainContentId: string;
}

/**
 * Describes input used to render one primary footer link item.
 *
 * This type defines a stable shape for related data.
 */
interface RenderFooterPrimaryLinkParams {
  /** Primary link content and positional metadata. */
  readonly item: LandingFooterPrimaryLink;
  /** Positional index for React key generation fallback. */
  readonly index: number;
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
 * Renders one item in the primary footer links row.
 *
 * @param params Render parameters.
 * @param params.item Primary footer link data.
 * @param params.index Position used for fallback key composition.
 * @returns One primary footer link list item.
 * @example
 * ```tsx
 * renderFooterPrimaryLink({ item: content.primaryLinks[0], index: 0 });
 * ```
 */
const renderFooterPrimaryLink = ({ item, index }: RenderFooterPrimaryLinkParams) => {
  return (
    <li
      className="mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content"
      key={`${item.link.href}-${index}`}
    >
      <LocalizedLink className="usa-footer__primary-link" link={item.link} />
    </li>
  );
};

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
      <div className="usa-footer__primary-section">
        <nav aria-label={content.navigationAriaLabel} className="usa-footer__nav">
          <ul className="grid-row grid-gap">
            {content.primaryLinks.map((item, index) => {
              return renderFooterPrimaryLink({ item, index });
            })}
          </ul>
        </nav>
      </div>
      <div className="usa-footer__secondary-section">
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="usa-footer__logo grid-row mobile-lg:grid-col-6 mobile-lg:grid-gap-2">
              <div className="mobile-lg:grid-col-auto">
                <Image
                  alt={content.agencyLogoAlt}
                  className="usa-footer__logo-img"
                  height={80}
                  src="/vendor/img/logo-img.png"
                  unoptimized
                  width={80}
                />
              </div>
              <div className="mobile-lg:grid-col-auto">
                <h3 className="usa-footer__logo-heading">{content.agencyName}</h3>
              </div>
            </div>
            <div className="usa-footer__contact-links mobile-lg:grid-col-6">
              <div className="usa-footer__social-links grid-row grid-gap-1">
                {content.socialLinks.map((socialLink, index) => {
                  return renderFooterSocialLink({ socialLink, index });
                })}
              </div>
              <h3 className="usa-footer__contact-heading">{content.contactHeading}</h3>
              <address className="usa-footer__address">
                <div className="usa-footer__contact-info grid-row grid-gap">
                  <div className="grid-col-auto">
                    <LocalizedLink link={content.phoneLink} />
                  </div>
                  <div className="grid-col-auto">
                    <LocalizedLink link={content.emailLink} />
                  </div>
                </div>
              </address>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
