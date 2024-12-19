import { BackButtonForLayout } from "@/components/njwds-layout/BackButtonForLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement } from "react";

export interface SidebarPageLayoutProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
  stackNav?: boolean;
  divider?: boolean;
  outlineBox?: boolean;
  belowBoxComponent?: React.ReactNode;
  titleOverColumns?: React.ReactNode;
  nonWrappingLeftColumn?: boolean;
}

export const SidebarPageLayout = ({
  children,
  navChildren,
  divider = true,
  outlineBox = true,
  stackNav,
  belowBoxComponent,
  titleOverColumns,
  nonWrappingLeftColumn,
}: SidebarPageLayoutProps): ReactElement<any> => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const { Config } = useConfig();

  return (
    <>
      <div className={`usa-section padding-top-0 desktop:padding-top-6`}>
        <div className="grid-container-widescreen desktop:padding-x-7">
          {isLargeScreen && <BackButtonForLayout backButtonText={Config.taskDefaults.backToRoadmapText} />}

          {isLargeScreen && titleOverColumns}
          <div className="grid-row grid-gap flex-no-wrap">
            <div className={nonWrappingLeftColumn ? "fg1" : "desktop:grid-col-9"}>
              {!isLargeScreen && (
                <div>
                  <BackButtonForLayout backButtonText={Config.taskDefaults.backToRoadmapText} />
                  {titleOverColumns}
                  {stackNav && navChildren}
                </div>
              )}
              <div
                className={
                  outlineBox
                    ? "border-1px border-base-light usa-prose min-height-40rem padding-4 radius-lg"
                    : "min-height-40rem"
                }
              >
                {children}
              </div>
              {belowBoxComponent}
            </div>

            {isLargeScreen && (
              <nav
                aria-label="Secondary"
                className={`${nonWrappingLeftColumn ? "" : "desktop:grid-col-3"}  order-first`}
              >
                {divider && <hr className="margin-bottom-1 margin-top-0" aria-hidden={true} />}
                {navChildren}
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
