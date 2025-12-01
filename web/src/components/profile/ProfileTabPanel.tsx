import { Content } from "@/components/Content";
import { BackButtonForLayout } from "@/components/njwds-layout/BackButtonForLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export interface ProfileTabPanelProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
}

export const ProfileTabPanel = (props: ProfileTabPanelProps): ReactElement => {
  const userDataFromHook = useUserData();
  const business = userDataFromHook.business;
  const { isAuthenticated } = useContext(NeedsAccountContext);
  const { Config } = useConfig();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);

  const titleOverColumns: React.ReactNode = (
    <>
      <ProfileHeader business={business} isAuthenticated={isAuthenticated === "TRUE"} />
      <Content>{Config.profileDefaults.default.yourProfileHelpsWithRecommendationsCallout}</Content>
    </>
  );

  return (
    <>
      <div className={`usa-section padding-top-0 desktop:padding-top-6`}>
        <div className="grid-container-widescreen desktop:padding-x-7">
          {isLargeScreen && (
            <>
              <BackButtonForLayout backButtonText={Config.taskDefaults.backToRoadmapText} />
              {titleOverColumns}
            </>
          )}

          <div className="grid-row grid-gap flex-no-wrap">
            {isLargeScreen && (
              <nav aria-label="Secondary" className="order-first">
                {props.navChildren}
              </nav>
            )}
            <div className="fg1">
              {!isLargeScreen && (
                <div>
                  <BackButtonForLayout backButtonText={Config.taskDefaults.backToRoadmapText} />
                  {titleOverColumns}
                  {props.navChildren}
                </div>
              )}
              <div className="min-height-40rem">{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
