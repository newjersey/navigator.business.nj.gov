/**
 * Renders the learn section side navigation with active state derived from
 * the current route segment.
 */

"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SideNavChildItem } from "@/components/SideNav";
import { SideNav } from "@/components/SideNav";
import type { LearnPageContent } from "@/domain/content/messageTypes";

/**
 * Describes props accepted by the LearnSideNav component.
 */
export interface LearnSideNavProps {
  /** Ordered list of pages to render in the side navigation. */
  readonly content: LearnPageContent;
  /** Pre-computed child items keyed by category key. */
  readonly categoryChildren: Readonly<Record<string, readonly SideNavChildItem[]>>;
}

const VISIBILITY_ICON = "/assets/njwds/dist/img/usa-icons/visibility.svg";
const VISIBILITY_OFF_ICON = "/assets/njwds/dist/img/usa-icons/visibility_off.svg";

/**
 * Renders a side navigation for the learn section, marking the current page
 * based on the active route segment below the learn layout.
 *
 * @param props Component props.
 * @param props.pages Ordered nav pages sourced from localized messages.
 * @returns A side navigation element with the current item highlighted.
 */
export const LearnSideNav = ({ content, categoryChildren }: LearnSideNavProps) => {
  const pathname = usePathname();
  const [showFullMenu, setShowFullMenu] = useState(false);
  const pathWithoutLocale = pathname.replace(/^\/[^/]+/, "");

  const sideNavCategories = [content.sideNav.learnCategory, ...content.categories];
  const items = sideNavCategories.map((category) => {
    const children = categoryChildren[category.key] ?? [];

    const currentChildIndex = children.findIndex((child) => child.link.href === pathWithoutLocale);
    const hasCurrentChild = currentChildIndex !== -1;

    const isCategoryCurrent =
      (pathWithoutLocale === "/learn" && category.key === "learn") ||
      (pathWithoutLocale === category.link.href && !hasCurrentChild) ||
      hasCurrentChild;

    const childrenWithCurrent = children.map((child, i) => ({
      ...child,
      isCurrent: hasCurrentChild && i === currentChildIndex,
      isCollapsible: !hasCurrentChild || i !== currentChildIndex,
    }));

    return {
      link: { ...category.link, label: category.title },
      isCurrent: isCategoryCurrent,
      children: childrenWithCurrent,
      isCollapsible: !isCategoryCurrent,
    };
  });

  return (
    <div className={showFullMenu ? "" : "sidenav--collapsed"}>
      <SideNav
        ariaLabel={content.sideNav.ariaLabel}
        items={items}
        onItemSelect={() => setShowFullMenu(false)}
      />
      <button
        type="button"
        className="usa-button usa-button--outline sidenav-toggle-button tablet:display-none"
        aria-expanded={showFullMenu}
        onClick={() => setShowFullMenu((prev) => !prev)}
      >
        <Image
          src={showFullMenu ? VISIBILITY_OFF_ICON : VISIBILITY_ICON}
          alt=""
          width={20}
          height={20}
          aria-hidden="true"
        />
        {showFullMenu ? content.sideNav.hideFullMenuLabel : content.sideNav.showFullMenuLabel}
      </button>
    </div>
  );
};
