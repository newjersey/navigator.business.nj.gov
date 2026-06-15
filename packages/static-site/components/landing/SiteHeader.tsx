/**
 * Renders the landing page header with primary and secondary navigation.
 *
 * This module composes the header shell and delegates menu detail rendering to
 * dedicated navigation subcomponents.
 */

import type {
  LayoutHeaderContent,
  LayoutLanguageSwitcherContent,
} from "@/domain/content/messageTypes";
import { HeaderLanguageSwitcher } from "./HeaderLanguageSwitcher";
import { HeaderPrimaryNav } from "./HeaderPrimaryNav";
import { HeaderSecondaryNav } from "./HeaderSecondaryNav";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Describes props used by the site header component.
 *
 * This type defines a stable shape for related data.
 */
export interface SiteHeaderProps {
  /** Localized content used by header subcomponents. */
  readonly content: LayoutHeaderContent;
  /** Localized language switcher chrome shown in the utility area. */
  readonly languageSwitcher: LayoutLanguageSwitcherContent;
}

/**
 * Renders the site header and its navigation regions.
 *
 * @param props Component props.
 * @param props.content Localized header content.
 * @param props.languageSwitcher Localized language switcher chrome.
 * @returns The full extended header markup.
 * @example
 * ```tsx
 * <SiteHeader content={landing.header} languageSwitcher={landing.languageSwitcher} />
 * ```
 */
export const SiteHeader = ({ content, languageSwitcher }: SiteHeaderProps) => {
  return (
    <>
      <div className="usa-overlay" />
      <header className="usa-header usa-header--extended">
        <div className="usa-navbar">
          <div className="usa-logo" id="extended-logo">
            <em className="usa-logo__text">
              <LocalizedLink
                ariaLabel={content.homeLinkAriaLabel}
                link={content.homeLink}
                title={content.homeLinkTitle}
              >
                <bdi dir="ltr">{content.siteTitle}</bdi>
              </LocalizedLink>
            </em>
          </div>
          <button className="usa-menu-btn" type="button">
            {content.menuButtonLabel}
          </button>
        </div>
        <nav aria-label={content.primaryNavigationAriaLabel} className="usa-nav">
          <div className="usa-nav__inner">
            <HeaderPrimaryNav header={content} />
            <HeaderSecondaryNav header={content} />
            <div className="usa-nav__secondary nj-inset-inline-end-2">
              <HeaderLanguageSwitcher content={languageSwitcher} />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
