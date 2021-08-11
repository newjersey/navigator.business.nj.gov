import React, { ReactElement, useEffect, useState } from "react";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@material-ui/core";
import { Icon } from "@/components/njwds/Icon";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import analytics from "@/lib/utils/analytics";

interface Props {
  children: React.ReactNode;
  sidebar: ReactElement;
  backButton?: ReactElement;
  pageTitle: string;
}

export const SidebarPageLayout = ({ children, sidebar, backButton, pageTitle }: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isVisible = () => (sidebarIsOpen ? "is-visible" : "");

  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > 108) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  });

  const nav = () => (
    <nav aria-label="Secondary navigation" className={`left-nav ${isVisible()}`}>
      <button
        className="left-nav-close fdr fac fjc"
        onClick={() => {
          analytics.event.mobile_menu_close_button.click.close_mobile_menu();
          close();
        }}
      >
        <Icon className="font-sans-xl">close</Icon>
      </button>
      {isLargeScreen && <div className="padding-top-2 padding-bottom-2 usa-prose">{backButton}</div>}
      {sidebar}
    </nav>
  );

  const open = () => setSidebarIsOpen(true);
  const close = () => setSidebarIsOpen(false);

  return (
    <>
      <div
        className={`left-nav-overlay ${isVisible()}`}
        aria-hidden="true"
        onClick={() => {
          analytics.event.mobile_menu.click_outside.close_mobile_menu();
          close();
        }}
      />
      {!isLargeScreen && (
        <div className={`usa-nav-container ${scrolled ? "scrolled scrolled-transition" : ""}`}>
          <div className={`usa-navbar ${scrolled ? "bg-white" : ""}`}>
            <button
              className="left-nav-menu-button radius-0"
              onClick={() => {
                analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
                open();
              }}
            >
              <Icon className="font-sans-xl">menu</Icon>
            </button>
            <div className={`usa-logo ${!isLargeScreen && scrolled ? "bg-white" : ""}`}>
              <em className="usa-logo__text">{pageTitle}</em>
            </div>
          </div>
        </div>
      )}
      <div className={`usa-section ${!isLargeScreen && scrolled ? "scrolled-padding" : ""}`}>
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="usa-layout-docs__sidenav desktop:grid-col-4">
              {isLargeScreen ? (
                nav()
              ) : (
                <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
                  {nav()}
                </FocusTrappedSidebar>
              )}
            </div>

            <main className="usa-layout-docs__main desktop:grid-col-8 usa-layout-docs">
              {!isLargeScreen && <div className="padding-top-2 padding-bottom-2 usa-prose">{backButton}</div>}
              <div className="border-1px border-base-light usa-prose minh-40 fdc">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
