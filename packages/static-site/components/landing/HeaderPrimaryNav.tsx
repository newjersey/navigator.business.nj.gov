/**
 * Renders primary header navigation for the landing page.
 *
 * This module maps primary menu items from localized content into NJWDS
 * navigation markup.
 */

import Image from "next/image";

import type {
  HeaderPrimaryItem,
  HeaderPrimaryLinkItem,
  HeaderPrimarySubmenuItem,
  LandingHeaderContent,
} from "@/domain/landing/types";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Describes props used by the primary header navigation component.
 *
 * This type defines a stable shape for related data.
 */
export interface HeaderPrimaryNavProps {
  /** Header content containing close icon text and primary nav items. */
  readonly header: LandingHeaderContent;
}

/**
 * Describes input used to render one primary link item.
 *
 * This type defines a stable shape for related data.
 */
interface RenderHeaderPrimaryLinkItemParams {
  /** Link item from the primary navigation collection. */
  readonly item: HeaderPrimaryLinkItem;
}

/**
 * Describes input used to render one primary submenu item.
 *
 * This type defines a stable shape for related data.
 */
interface RenderHeaderPrimarySubmenuItemParams {
  /** Submenu item from the primary navigation collection. */
  readonly item: HeaderPrimarySubmenuItem;
}

/**
 * Describes input used to render one generic primary item.
 *
 * This type defines a stable shape for related data.
 */
interface RenderHeaderPrimaryItemParams {
  /** Generic item from the primary navigation collection. */
  readonly item: HeaderPrimaryItem;
}

/**
 * Describes input used to render one submenu link entry.
 *
 * This type defines a stable shape for related data.
 */
interface RenderHeaderSubmenuLinkParams {
  /** Submenu child link and index metadata. */
  readonly item: HeaderPrimarySubmenuItem["links"][number];
  /** Positional index for React key generation fallback. */
  readonly index: number;
}

/**
 * Renders one child link inside a submenu list.
 *
 * @param params Render parameters.
 * @param params.item Submenu link data.
 * @param params.index Position used for fallback key composition.
 * @returns One submenu list item.
 * @example
 * ```tsx
 * renderHeaderSubmenuLink({ item: submenu.links[0], index: 0 });
 * ```
 */
const renderHeaderSubmenuLink = ({ item, index }: RenderHeaderSubmenuLinkParams) => {
  return (
    <li className="usa-nav__submenu-item" key={`${item.link.href}-${index}`}>
      <LocalizedLink link={item.link} />
    </li>
  );
};

/**
 * Renders one top-level primary navigation link item.
 *
 * @param params Render parameters.
 * @param params.item Primary link item data.
 * @returns One primary navigation list item.
 * @example
 * ```tsx
 * renderHeaderPrimaryLinkItem({ item: primaryLinkItem });
 * ```
 */
const renderHeaderPrimaryLinkItem = ({ item }: RenderHeaderPrimaryLinkItemParams) => {
  const linkClassName = item.isCurrent ? "usa-nav__link usa-current" : "usa-nav__link";

  return (
    <li className="usa-nav__primary-item" key={item.link.href}>
      <LocalizedLink className={linkClassName} link={item.link}>
        <span>{item.link.label}</span>
      </LocalizedLink>
    </li>
  );
};

/**
 * Renders one top-level submenu navigation item.
 *
 * @param params Render parameters.
 * @param params.item Primary submenu item data.
 * @returns One primary navigation list item with submenu children.
 * @example
 * ```tsx
 * renderHeaderPrimarySubmenuItem({ item: primarySubmenuItem });
 * ```
 */
const renderHeaderPrimarySubmenuItem = ({ item }: RenderHeaderPrimarySubmenuItemParams) => {
  const buttonClassName = item.isCurrent
    ? "usa-accordion__button usa-nav__link usa-current"
    : "usa-accordion__button usa-nav__link";

  return (
    <li className="usa-nav__primary-item" key={item.submenuId}>
      <button
        aria-controls={item.submenuId}
        aria-expanded="false"
        className={buttonClassName}
        type="button"
      >
        <span>{item.label}</span>
      </button>
      <ul className="usa-nav__submenu" id={item.submenuId}>
        {item.links.map((submenuLinkItem, index) => {
          return renderHeaderSubmenuLink({ item: submenuLinkItem, index });
        })}
      </ul>
    </li>
  );
};

/**
 * Renders one primary navigation item from the discriminated union.
 *
 * @param params Render parameters.
 * @param params.item Primary item that may be a link or submenu.
 * @returns The matching rendered navigation item.
 * @example
 * ```tsx
 * renderHeaderPrimaryItem({ item: header.primaryItems[0] });
 * ```
 */
const renderHeaderPrimaryItem = ({ item }: RenderHeaderPrimaryItemParams) => {
  if (item.kind === "submenu") {
    return renderHeaderPrimarySubmenuItem({ item });
  }

  return renderHeaderPrimaryLinkItem({ item });
};

/**
 * Renders the full primary navigation list.
 *
 * @param props Component props.
 * @param props.header Header content with primary items.
 * @returns Primary navigation markup with close control and item list.
 * @example
 * ```tsx
 * <HeaderPrimaryNav header={landing.header} />
 * ```
 */
export const HeaderPrimaryNav = ({ header }: HeaderPrimaryNavProps) => {
  return (
    <>
      <button className="usa-nav__close" type="button">
        <Image alt={header.closeButtonAlt} height={20} src="/vendor/img/close.svg" width={20} />
      </button>
      <ul className="usa-nav__primary usa-accordion">
        {header.primaryItems.map((primaryItem) => {
          return renderHeaderPrimaryItem({ item: primaryItem });
        })}
      </ul>
    </>
  );
};
