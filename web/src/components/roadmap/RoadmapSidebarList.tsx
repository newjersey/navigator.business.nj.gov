import { Content } from "@/components/Content";
import { RoadmapSidebarCard } from "@/components/roadmap/RoadmapSidebarCard";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { RoadmapSideBarContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";

interface Props {
  sideBarDisplayContent: RoadmapSideBarContent;
}

export const RoadmapSidebarList = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);
  const router = useRouter();

  return (
    <>
      <h2>{Config.roadmapDefaults.sideBarHeading}</h2>
      <hr className="bg-roadmap-blue-dark hr-2px margin-bottom-4" />

      {!userData ? (
        <div className="flex flex-justify-center flex-align-center margin-top-3 desktop:margin-top-0 padding-top-0 desktop:padding-top-6 padding-bottom-15">
          <CircularProgress id="roadmapPage" aria-label="roadmap page progress bar" aria-busy={true} />
          <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
        </div>
      ) : (
        <>
          {userData.preferences.hiddenRoadmapSidebarCards.includes("successful-registration") === false && (
            <RoadmapSidebarCard
              color={props.sideBarDisplayContent.guestSuccessfullyRegisteredCard.color}
              shadowColor={props.sideBarDisplayContent.guestSuccessfullyRegisteredCard.shadowColor}
              dataTestid="successful-registeration-card"
              headerText={props.sideBarDisplayContent.guestSuccessfullyRegisteredCard.header}
              imagePath={props.sideBarDisplayContent.guestSuccessfullyRegisteredCard.imgPath}
              onClose={() => {
                update({
                  ...userData,
                  preferences: {
                    ...userData.preferences,
                    hiddenRoadmapSidebarCards: [
                      ...userData.preferences.hiddenRoadmapSidebarCards,
                      "successful-registration",
                    ],
                  },
                });
              }}
            >
              <Content>{props.sideBarDisplayContent.guestSuccessfullyRegisteredCard.contentMd}</Content>
            </RoadmapSidebarCard>
          )}

          {userData.profileData.legalStructureId !== "sole-proprietorship" &&
          userData.profileData.legalStructureId !== "general-partnership" ? (
            <RoadmapSidebarCard
              color={props.sideBarDisplayContent.welcomeCard.color}
              shadowColor={props.sideBarDisplayContent.welcomeCard.shadowColor}
              headerText={props.sideBarDisplayContent.welcomeCard.header}
              imagePath={props.sideBarDisplayContent.welcomeCard.imgPath}
            >
              <Content>{props.sideBarDisplayContent.welcomeCard.contentMd}</Content>
            </RoadmapSidebarCard>
          ) : (
            <RoadmapSidebarCard
              color={props.sideBarDisplayContent.welcomeCard.color}
              shadowColor={props.sideBarDisplayContent.welcomeCard.shadowColor}
              headerText={props.sideBarDisplayContent.welcomeCardGpOrSpCard.header}
              imagePath={props.sideBarDisplayContent.welcomeCardGpOrSpCard.imgPath}
            >
              <Content>{props.sideBarDisplayContent.welcomeCardGpOrSpCard.contentMd}</Content>
            </RoadmapSidebarCard>
          )}

          {userData.preferences.hiddenRoadmapSidebarCards.includes("not-registered") === false && (
            <RoadmapSidebarCard
              color={props.sideBarDisplayContent.guestNotRegisteredCard.color}
              shadowColor={props.sideBarDisplayContent.guestNotRegisteredCard.shadowColor}
              dataTestid="get-registrated-card"
            >
              <div className="text-base">
                <Content
                  onClick={() => {
                    analytics.event.guest_menu.click.go_to_myNJ_registration();
                    onSelfRegister(router.replace, userData, update, setRegistrationAlertStatus);
                  }}
                >
                  {props.sideBarDisplayContent.guestNotRegisteredCard.contentMd}
                </Content>
              </div>
            </RoadmapSidebarCard>
          )}
        </>
      )}
    </>
  );
};
