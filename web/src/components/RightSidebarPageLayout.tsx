import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement } from "react";

const defaultColor = {
  gutter: "grayRightGutter",
  border: "border-base-lighter",
  mobileBoarder: "border-base-light",
  bgColor: "bg-base-lightest",
};

const blueColor = {
  gutter: "blueRightGutter",
  border: "border-roadmap-blue-dark",
  mobileBoarder: "border-base-light",
  bgColor: "bg-roadmap-blue",
};

export interface RightSidebarPageLayoutProps {
  color: "default" | "blue";
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export const RightSidebarPageLayout = ({
  color,
  mainContent,
  sidebarContent,
}: RightSidebarPageLayoutProps): ReactElement => {
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const selectedColor = color === "blue" ? blueColor : defaultColor;

  return (
    <div
      className={`desktop:margin-top-4 desktop:margin-top-0 ${isDesktopAndUp ? selectedColor.gutter : ""}`}
      data-testid="rightSidebarPageLayout"
    >
      <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100">
        <div className="grid-row">
          <div className="padding-x-2 desktop:padding-left-0 desktop:grid-col-7 usa-prose margin-top-2 tablet:margin-top-6 padding-bottom-7 desktop:padding-bottom-15 desktop:padding-right-5">
            {mainContent}
          </div>
          <div
            className={`desktop:grid-col-5 usa-prose ${selectedColor.border} padding-top-6 ${
              selectedColor.bgColor
            } padding-bottom-15 ${
              !isDesktopAndUp
                ? `padding-x-2 border-top ${selectedColor.mobileBoarder} `
                : "border-left-2px padding-left-5"
            }`}
          >
            {sidebarContent}
          </div>
        </div>
      </div>
    </div>
  );
};
