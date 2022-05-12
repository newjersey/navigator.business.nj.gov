import { Content } from "@/components/Content";
import { RoadmapSidebarCard } from "@/components/roadmap/RoadmapSidebarCard";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useRoadmapSidebarCards } from "@/lib/data-hooks/useRoadmapSidebarCards";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SidebarDisplayContent } from "@/lib/types/types";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useEffect } from "react";

interface Props {
  sidebarDisplayContent: SidebarDisplayContent;
}

export const RoadmapSidebarList = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { setRegistrationAlertStatus, registrationAlertStatus, isAuthenticated } =
    useContext(AuthAlertContext);
  const router = useRouter();
  const { showCard, hideCard } = useRoadmapSidebarCards();

  useEffect(() => {
    if (
      registrationAlertStatus == "SUCCESS" &&
      isAuthenticated == IsAuthenticated.TRUE &&
      userData &&
      userData.preferences.visibleRoadmapSidebarCards.includes("successful-registration") === false
    ) {
      (async () => {
        await showCard("successful-registration");
        await hideCard("not-registered");
      })();
    }
  }, [isAuthenticated, registrationAlertStatus, userData, hideCard, showCard]);

  return (
    <>
      <h2>{Config.roadmapDefaults.sidebarHeading}</h2>
      <hr className="bg-roadmap-blue-dark hr-2px margin-bottom-4" />

      {!userData ? (
        <div className="flex flex-justify-center flex-align-center margin-top-3 desktop:margin-top-0 padding-top-0 desktop:padding-top-6 padding-bottom-15">
          <CircularProgress id="roadmapPage" aria-label="roadmap page progress bar" aria-busy={true} />
          <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
        </div>
      ) : (
        <>
          {userData.preferences.visibleRoadmapSidebarCards.includes("successful-registration") && (
            <RoadmapSidebarCard
              color={props.sidebarDisplayContent.guestSuccessfullyRegisteredCard.color}
              shadowColor={props.sidebarDisplayContent.guestSuccessfullyRegisteredCard.shadowColor}
              dataTestid="successful-registration-card"
              headerText={props.sidebarDisplayContent.guestSuccessfullyRegisteredCard.header}
              imagePath={props.sidebarDisplayContent.guestSuccessfullyRegisteredCard.imgPath}
              onClose={async () => {
                await hideCard("successful-registration");
              }}
            >
              <Content>{props.sidebarDisplayContent.guestSuccessfullyRegisteredCard.contentMd}</Content>
            </RoadmapSidebarCard>
          )}

          {userData.preferences.visibleRoadmapSidebarCards.includes("welcome") && (
            <RoadmapSidebarCard
              color={props.sidebarDisplayContent.welcomeCard.color}
              shadowColor={props.sidebarDisplayContent.welcomeCard.shadowColor}
              headerText={props.sidebarDisplayContent.welcomeCard.header}
              imagePath={props.sidebarDisplayContent.welcomeCard.imgPath}
            >
              <Content>{props.sidebarDisplayContent.welcomeCard.contentMd}</Content>
            </RoadmapSidebarCard>
          )}

          {userData.preferences.visibleRoadmapSidebarCards.includes("not-registered") && (
            <RoadmapSidebarCard
              color={props.sidebarDisplayContent.guestNotRegisteredCard.color}
              shadowColor={props.sidebarDisplayContent.guestNotRegisteredCard.shadowColor}
            >
              <Content
                onClick={() => {
                  onSelfRegister(router.replace, userData, update, setRegistrationAlertStatus);
                }}
              >
                {props.sidebarDisplayContent.guestNotRegisteredCard.contentMd}
              </Content>
            </RoadmapSidebarCard>
          )}
        </>
      )}
    </>
  );
};
