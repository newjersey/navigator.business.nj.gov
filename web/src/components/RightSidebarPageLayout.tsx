import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement } from "react";
export interface RightSidebarPageLayoutProps {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export const RightSidebarPageLayout = ({
  mainContent,
  sidebarContent
}: RightSidebarPageLayoutProps): ReactElement => {
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  return (
    <div
      className={`desktop:margin-top-4 desktop:margin-top-0 ${isDesktopAndUp ? "blueRightGutter" : ""}`}
      data-testid="rightSidebarPageLayout"
    >
      <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100">
        <div className="grid-row">
          <div className="padding-x-2 desktop:padding-left-0 desktop:grid-col-7 usa-prose margin-top-2 tablet:margin-top-6 padding-bottom-7 desktop:padding-bottom-15 desktop:padding-right-5">
            {mainContent}
          </div>
          <div
            className={`desktop:grid-col-5 usa-prose border-cool-lighter padding-top-6 bg-cool-extra-light padding-bottom-15 ${
              isDesktopAndUp ? "border-left-2px padding-left-5" : "padding-x-2 border-top border-base-light"
            }`}
          >
            {sidebarContent}
          </div>
        </div>
      </div>
    </div>
  );
};
