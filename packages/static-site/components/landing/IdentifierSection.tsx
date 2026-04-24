/**
 * Renders the identifier area shown at the bottom of the landing page.
 *
 * This module maps localized identifier content into NJWDS identifier markup,
 * including required links and U.S. government text.
 */

import Image from "next/image";

import type {
  LandingIdentifierContent,
  LandingIdentifierRequiredLink,
} from "@/domain/landing/types";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Describes props used by the identifier section component.
 *
 * The content payload includes all labels, links, and alt text needed by the
 * section.
 */
export interface IdentifierSectionProps {
  /** Localized identifier content. */
  readonly content: LandingIdentifierContent;
}

/**
 * Describes input used to render one required identifier link list item.
 *
 * This type defines a stable shape for related data.
 */
interface RenderIdentifierRequiredLinkParams {
  /** Required link content and positional metadata. */
  readonly item: LandingIdentifierRequiredLink;
  /** Positional index for React key generation fallback. */
  readonly index: number;
}

/**
 * Renders one required link in the identifier section.
 *
 * @param params Render parameters.
 * @param params.item Identifier link data.
 * @param params.index Position used for fallback key composition.
 * @returns One `<li>` element for the required links list.
 * @example
 * ```tsx
 * renderIdentifierRequiredLink({ item: content.requiredLinks[0], index: 0 });
 * ```
 */
const renderIdentifierRequiredLink = ({ item, index }: RenderIdentifierRequiredLinkParams) => {
  return (
    <li className="usa-identifier__required-links-item" key={`${item.link.href}-${index}`}>
      <LocalizedLink className="usa-identifier__required-link usa-link" link={item.link} />
    </li>
  );
};

/**
 * Renders the full identifier section from typed content.
 *
 * @param props Component props.
 * @param props.content Localized identifier content.
 * @returns The identifier container with masthead, links, and government copy.
 * @example
 * ```tsx
 * <IdentifierSection content={landing.identifier} />
 * ```
 */
export const IdentifierSection = ({ content }: IdentifierSectionProps) => {
  return (
    <div className="usa-identifier">
      <section
        aria-label={content.agencySectionAriaLabel}
        className="usa-identifier__section usa-identifier__section--masthead"
      >
        <div className="usa-identifier__container">
          <div className="usa-identifier__logos">
            <a className="usa-identifier__logo" href="https://nj.gov">
              <Image
                alt={content.stateLogoAlt}
                className="usa-identifier__logo-img"
                height={20}
                src="/vendor/img/nj-logo-gray-20.png"
                unoptimized
                width={20}
              />
            </a>
          </div>
          <div className="usa-identifier__identity">
            <p className="usa-identifier__identity-domain">{content.domain}</p>
            <p className="usa-identifier__identity-disclaimer">
              {content.disclaimerPrefix} <LocalizedLink link={content.disclaimerLink} />
            </p>
          </div>
        </div>
      </section>
      <nav
        aria-label={content.importantLinksAriaLabel}
        className="usa-identifier__section usa-identifier__section--required-links"
      >
        <div className="usa-identifier__container">
          <ul className="usa-identifier__required-links-list">
            {content.requiredLinks.map((item, index) => {
              return renderIdentifierRequiredLink({ item, index });
            })}
          </ul>
        </div>
      </nav>
      <section
        aria-label={content.usGovernmentSectionAriaLabel}
        className="usa-identifier__section usa-identifier__section--usagov"
      >
        <div className="usa-identifier__container">
          <div className="usa-identifier__usagov-description">
            {content.usGovernmentDescription}
          </div>
        </div>
      </section>
    </div>
  );
};
