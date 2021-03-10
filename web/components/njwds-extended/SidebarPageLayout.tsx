import React, { ReactElement } from "react";
import { useMediaQuery } from "react-responsive";
import { PageSizes } from "../../lib/PageSizes";

interface Props {
  children: React.ReactNode;
  sidebar: ReactElement;
  backButton?: ReactElement;
}

export const SidebarPageLayout = ({ children, sidebar, backButton }: Props): ReactElement => {
  const isLargeScreen = useMediaQuery({
    query: `(min-device-width: ${PageSizes.lg})`,
  });

  return (
    <>
      <div className="usa-overlay"></div>
      <button className="usa-menu-btn">
        <img src="/img/usa-icons/menu.svg" alt="menu" />
      </button>
      <div className="usa-section">
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="usa-layout-docs__sidenav desktop:grid-col-3">
              <nav aria-label="Secondary navigation" className="usa-nav">
                <button className="usa-nav__close fdr fac fjc">
                  <img src="/img/close.svg" alt="close" />
                </button>
                {isLargeScreen && (
                  <div className="padding-top-2 padding-bottom-2 usa-prose">{backButton}</div>
                )}
                {sidebar}
              </nav>
            </div>

            <main className="usa-layout-docs__main desktop:grid-col-9 usa-layout-docs">
              {!isLargeScreen && <div className="padding-top-2 padding-bottom-2 usa-prose">{backButton}</div>}
              <div className="border-1px border-base-lighter padding-3 usa-prose minh-40">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
