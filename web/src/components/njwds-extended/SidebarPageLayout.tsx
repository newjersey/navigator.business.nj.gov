import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import React, { ReactElement } from "react";

export interface SidebarPageLayoutProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
  stackNav?: boolean;
  divider?: boolean;
  outlineBox?: boolean;
  belowBoxComponent?: React.ReactNode;
}

export const SidebarPageLayout = ({
  children,
  navChildren,
  divider = true,
  outlineBox = true,
  stackNav,
  belowBoxComponent,
}: SidebarPageLayoutProps): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const { Config } = useConfig();

  const backButton = (
    <Link href={ROUTES.dashboard} passHref>
      <a
        href={ROUTES.dashboard}
        data-testid="back-to-dashboard"
        className="usa-link fdr fac margin-top-3 margin-bottom-3 usa-link-hover-override desktop:margin-top-0 desktop:margin-bottom-4"
        onClick={analytics.event.task_back_to_roadmap.click.view_roadmap}
      >
        <div className="circle-3 bg-accent-cool-darkest icon-blue-bg-color-hover">
          <Icon className="text-white usa-icon--size-3">arrow_back</Icon>
        </div>
        <div className="margin-left-2 margin-y-auto text-accent-cool-darkest font-sans-xs usa-link text-blue-color-hover">
          {Config.taskDefaults.backToRoadmapText}
        </div>
      </a>
    </Link>
  );

  return (
    <>
      <div className={`usa-section padding-top-0 desktop:padding-top-6`}>
        <div className="grid-container-widescreen desktop:padding-x-7">
          <div className="grid-row grid-gap">
            <div className="desktop:grid-col-9">
              {!isLargeScreen && (
                <div>
                  {backButton}
                  {stackNav && navChildren}
                </div>
              )}
              <div
                className={
                  outlineBox
                    ? "border-1px border-base-light usa-prose minh-40 padding-4 radius-lg"
                    : "minh-40 padding-y-205"
                }
              >
                {children}
              </div>
              {belowBoxComponent}
            </div>
            <div className="desktop:grid-col-3 order-first">
              {isLargeScreen && (
                <nav aria-label="Secondary">
                  {backButton}
                  {divider && <hr className="margin-bottom-1 margin-top-0" aria-hidden={true} />}
                  {navChildren}
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
