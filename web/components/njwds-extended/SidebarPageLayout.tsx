import React, { ReactElement } from "react";
import { MediaQueries } from "../../lib/PageSizes";
import { useMediaQuery } from "@material-ui/core";
import { Icon } from "../njwds/Icon";

interface Props {
  children: React.ReactNode;
  sidebar: ReactElement;
  backButton?: ReactElement;
}

export const SidebarPageLayout = ({ children, sidebar, backButton }: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);

  return (
    <>
      <div className="usa-overlay" />
      {!isLargeScreen && (
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <button className="usa-menu-btn">
              <Icon className="font-sans-xl">menu</Icon>
            </button>
            <div className="usa-logo">
              <em className="usa-logo__text">Business Roadmap</em>
            </div>
          </div>
        </div>
      )}
      <div className="usa-section">
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="usa-layout-docs__sidenav desktop:grid-col-4">
              <nav aria-label="Secondary navigation" className="usa-nav left">
                <button className="usa-nav__close fdr fac fjc">
                  <Icon className="font-sans-xl">close</Icon>
                </button>
                {isLargeScreen && (
                  <div className="padding-top-2 padding-bottom-2 usa-prose">{backButton}</div>
                )}
                {sidebar}
              </nav>
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
