"use client";

import { useState } from "react";
import type {
  LayoutHeaderContent,
  LayoutLanguageSwitcherContent,
} from "@/domain/content/messageTypes";
import { ACCOUNT_APP_URL } from "@/domain/env";
import { HeaderLanguageSwitcher } from "./HeaderLanguageSwitcher";
import { HeaderPrimaryNav } from "./HeaderPrimaryNav";
import { HeaderSecondaryNav } from "./HeaderSecondaryNav";
import { LocalizedLink } from "./LocalizedLink";
import { MobileAccountDrawerContent } from "./MobileAccountDrawerContent";
import { MobileHeaderBar } from "./MobileHeaderBar";
import { MobileNavDrawer } from "./MobileNavDrawer";

export interface SiteHeaderProps {
  readonly content: LayoutHeaderContent;
  /** Localized language switcher chrome shown in the utility area. */
  readonly languageSwitcher: LayoutLanguageSwitcherContent;
}

export const SiteHeader = ({ content, languageSwitcher }: SiteHeaderProps) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <>
      <MobileHeaderBar
        content={content}
        isAccountOpen={isAccountOpen}
        isNavOpen={isNavOpen}
        onAccountOpen={() => setIsAccountOpen(true)}
        onNavOpen={() => setIsNavOpen(true)}
      />
      <header className="usa-header usa-header--extended">
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
      <MobileNavDrawer
        closeAriaLabel={content.closeDrawerAriaLabel}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        title={content.navDrawerTitle}
      >
        <ul className="usa-mobile-nav-drawer__nav">
          {content.primaryItems
            .filter((item) => item.kind === "link")
            .map((item) => (
              <li className="usa-mobile-nav-drawer__nav-item" key={item.link.href}>
                <LocalizedLink link={item.link}>{item.link.label}</LocalizedLink>
              </li>
            ))}
        </ul>
      </MobileNavDrawer>
      <MobileNavDrawer
        closeAriaLabel={content.closeDrawerAriaLabel}
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        title={content.myAccountLabel}
      >
        <MobileAccountDrawerContent
          accountAppUrl={ACCOUNT_APP_URL}
          getStartedLabel={content.getStartedLabel}
          logInLabel={content.logInLabel}
        />
      </MobileNavDrawer>
    </>
  );
};
