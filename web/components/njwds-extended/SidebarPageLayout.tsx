import React, { ReactElement, useState } from "react";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@material-ui/core";
import { Icon } from "@/components/njwds/Icon";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";

interface Props {
  children: React.ReactNode;
  sidebar: ReactElement;
  backButton?: ReactElement;
  pageTitle: string;
}

export const SidebarPageLayout = ({ children, sidebar, backButton, pageTitle }: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  const isVisible = () => (sidebarIsOpen ? "is-visible" : "");

  const nav = () => (
    <nav aria-label="Secondary navigation" className={`left-nav ${isVisible()}`}>
      <button className="left-nav-close fdr fac fjc" onClick={() => setSidebarIsOpen(false)}>
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
      <div aria-hidden="true" onClick={close} className={`left-nav-overlay ${isVisible()}`} />
      {!isLargeScreen && (
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <button className="left-nav-menu-button radius-0" onClick={open}>
              <Icon className="font-sans-xl">menu</Icon>
            </button>
            <div className="usa-logo">
              <em className="usa-logo__text">{pageTitle}</em>
            </div>
          </div>
        </div>
      )}
      <div className="usa-section">
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
              <div className="border-1px border-base-light padding-3 usa-prose minh-40">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
