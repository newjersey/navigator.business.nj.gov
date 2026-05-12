/**
 * Renders a USWDS side navigation menu for section-level wayfinding.
 *
 * Supports up to three levels: top-level items, child links, and grandchild
 * links. Active state is indicated via the `isCurrent` flag on each item.
 */

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
}

/**
 * Describes props accepted by the SideNav component.
 */
export interface SideNavProps {
  /** Accessible label for the nav landmark. */
  readonly ariaLabel: string;
  /** Top-level navigation items to render. */
  readonly items: readonly SideNavItem[];
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
export const SideNav = ({ ariaLabel, items }: SideNavProps) => {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="usa-sidenav">
        {items.map((item) => (
          <li key={item.link.href} className="usa-sidenav__item">
            <LocalizedLink
              link={item.link}
              className={item.isCurrent ? "usa-current" : undefined}
            />
            {item.children && item.children.length > 0 && (
              <ul className="usa-sidenav__sublist">
                {item.children.map((child) => (
                  <li key={child.link.href} className="usa-sidenav__item">
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
        ))}
      </ul>
    </nav>
  );
};
