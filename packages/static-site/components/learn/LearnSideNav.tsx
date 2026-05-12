/**
 * Renders the learn section side navigation with active state derived from
 * the current route segment.
 */

"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { SideNav } from "@/components/SideNav";
import type { LearnSideNavContent } from "@/domain/content/messageTypes";

/**
 * Describes props accepted by the LearnSideNav component.
 */
export interface LearnSideNavProps {
  /** Ordered list of pages to render in the side navigation. */
  readonly content: LearnSideNavContent;
}

/**
 * Renders a side navigation for the learn section, marking the current page
 * based on the active route segment below the learn layout.
 *
 * @param props Component props.
 * @param props.pages Ordered nav pages sourced from localized messages.
 * @returns A side navigation element with the current item highlighted.
 */
export const LearnSideNav = ({ content }: LearnSideNavProps) => {
  const pathSegment = useSelectedLayoutSegment();
  const activeKey = pathSegment ?? "learn";

  const items = content.pages.map((page) => ({
    link: page,
    isCurrent: page.key === activeKey,
    children: [],
  }));

  return <SideNav ariaLabel={content.ariaLabel} items={items} />;
};
