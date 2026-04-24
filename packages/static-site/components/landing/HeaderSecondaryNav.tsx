/**
 * Renders the secondary navigation area inside the site header.
 *
 * This module maps secondary links from header content into NJWDS navigation
 * markup and skips render when no links exist.
 */

import type { LandingHeaderContent } from "@/domain/landing/types";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Describes props used by the secondary header navigation component.
 *
 * This type defines a stable shape for related data.
 */
export interface HeaderSecondaryNavProps {
  /** Header content containing secondary links and search labels. */
  readonly header: LandingHeaderContent;
}

/**
 * Describes input used to render one secondary navigation link.
 *
 * This type defines a stable shape for related data.
 */
interface RenderSecondaryLinkParams {
  /** Secondary link content and index metadata. */
  readonly link: LandingHeaderContent["secondaryLinks"][number];
  /** Positional index for React key generation fallback. */
  readonly index: number;
}

/**
 * Renders one item in the secondary navigation list.
 *
 * @param params Render parameters.
 * @param params.link Secondary link data.
 * @param params.index Position used for fallback key composition.
 * @returns One secondary navigation list item.
 * @example
 * ```tsx
 * renderSecondaryLink({ link: header.secondaryLinks[0], index: 0 });
 * ```
 */
const renderSecondaryLink = ({ link, index }: RenderSecondaryLinkParams) => {
  return (
    <li className="usa-nav__secondary-item" key={`${link.href}-${index}`}>
      <LocalizedLink link={link} />
    </li>
  );
};

/**
 * Renders the full secondary navigation block.
 *
 * @param props Component props.
 * @param props.header Header content with secondary links.
 * @returns The secondary navigation block, or `null` when no links exist.
 * @example
 * ```tsx
 * <HeaderSecondaryNav header={landing.header} />
 * ```
 */
export const HeaderSecondaryNav = ({ header }: HeaderSecondaryNavProps) => {
  if (header.secondaryLinks.length === 0) {
    return null;
  }

  return (
    <div className="usa-nav__secondary">
      <ul className="usa-nav__secondary-links">
        {header.secondaryLinks.map((secondaryLink, index) => {
          return renderSecondaryLink({ link: secondaryLink, index });
        })}
      </ul>
    </div>
  );
};
