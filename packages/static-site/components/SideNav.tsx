/**
 * Renders a USWDS side navigation menu for section-level wayfinding.
 *
 * Supports up to three levels: top-level items, child links, and grandchild
 * links. Active state is indicated via the `isCurrent` flag on each item.
 * Top-level items with children render as expandable sections.
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import { LocalizedLink } from "@/components/landing/LocalizedLink";
import type { ContentLink } from "@/domain/content/messageTypes";

/**
 * A grandchild-level navigation item with no further nesting.
 */
export interface SideNavGrandchildItem {
  /** Link metadata for the grandchild item. */
  readonly link: ContentLink;
  /** Marks this item as the current page. */
  readonly isCurrent?: boolean;
}

/**
 * A child-level navigation item that may contain grandchild links.
 */
export interface SideNavChildItem {
  /** Link metadata for the child item. */
  readonly link: ContentLink;
  /** Marks this item as the current page. */
  readonly isCurrent?: boolean;
  /** Optional grandchild links rendered as a nested sublist. */
  readonly children?: readonly SideNavGrandchildItem[];
  /** When true, this item can be hidden in collapsed mobile mode. */
  readonly isCollapsible?: boolean;
}

/**
 * A top-level navigation item that may contain child links.
 */
export interface SideNavItem {
  /** Link metadata for the top-level item. */
  readonly link: ContentLink;
  /** Marks this item as the current page. */
  readonly isCurrent?: boolean;
  /** Optional child links rendered as a nested sublist. */
  readonly children?: readonly SideNavChildItem[];
  /** When true, this item can be hidden in collapsed mobile mode. */
  readonly isCollapsible?: boolean;
}

/**
 * Describes props accepted by the SideNav component.
 */
export interface SideNavProps {
  /** Accessible label for the nav landmark. */
  readonly ariaLabel: string;
  /** Top-level navigation items to render. */
  readonly items: readonly SideNavItem[];
  /** Called when a navigation item is selected. */
  readonly onItemSelect?: () => void;
}

/**
 * Renders a USWDS `usa-sidenav` navigation component.
 *
 * @param props Component props.
 * @param props.ariaLabel Accessible label for the nav landmark.
 * @param props.items Top-level navigation items to render.
 * @returns A side navigation element with up to three levels of nesting.
 * @example
 * ```tsx
 * <SideNav
 *   ariaLabel="Secondary navigation"
 *   items={[
 *     { link: { label: "Parent", href: "/parent", isInternal: true, opensInNewTab: false } },
 *     { link: { label: "Current", href: "/current", isInternal: true, opensInNewTab: false }, isCurrent: true, children: [...] },
 *   ]}
 * />
 * ```
 */
export const SideNav = ({ ariaLabel, items, onItemSelect }: SideNavProps) => {
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(() => {
    const initial = new Set<string>();
    for (const item of items) {
      if (item.isCurrent && item.children && item.children.length > 0) {
        initial.add(item.link.href);
      }
    }
    return initial;
  });

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <nav aria-label={ariaLabel}>
      <ul className="usa-sidenav">
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedKeys.has(item.link.href);

          return (
            <li
              key={item.link.href}
              className={`usa-sidenav__item${item.isCollapsible ? " sidenav-collapsible-item" : ""}`}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className={`sidenav-category-button${item.isCurrent ? " usa-current" : ""}`}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpanded(item.link.href)}
                >
                  <span className="sidenav-item-label">
                    {item.link.label}
                    <Image
                      src="/img/chevron-down.svg"
                      alt=""
                      width={16}
                      height={16}
                      className={`sidenav-chevron${isExpanded ? " sidenav-chevron--expanded" : ""}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              ) : (
                <LocalizedLink
                  link={item.link}
                  className={item.isCurrent ? "usa-current" : undefined}
                />
              )}
              {hasChildren && isExpanded && (
                <ul className="usa-sidenav__sublist">
                  {item.children.map((child) => (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: Because these are links, the browser will fire an onClick for "enter". Key event hook is redundant.
                    <li
                      key={child.link.href}
                      className={`usa-sidenav__item${child.isCollapsible ? " sidenav-collapsible-item" : ""}`}
                      onClick={onItemSelect}
                    >
                      <LocalizedLink
                        link={child.link}
                        className={child.isCurrent ? "usa-current" : undefined}
                      />
                      {child.children && child.children.length > 0 && (
                        <ul className="usa-sidenav__sublist">
                          {child.children.map((grandchild) => (
                            <li key={grandchild.link.href} className="usa-sidenav__item">
                              <LocalizedLink
                                link={grandchild.link}
                                className={grandchild.isCurrent ? "usa-current" : undefined}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
