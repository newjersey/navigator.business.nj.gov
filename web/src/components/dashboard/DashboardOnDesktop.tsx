import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AnytimeActionDropdown } from "@/components/dashboard/AnytimeActionDropdown";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeferredHomeBasedQuestion } from "@/components/dashboard/DeferredHomeBasedQuestion";
import { ElevatorViolationsCard } from "@/components/dashboard/ElevatorViolationsCard";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import { getRoadmapHeadingText } from "@/components/dashboard/dashboardHelpers";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { Heading } from "@/components/njwds-extended/Heading";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionLink,
  AnytimeActionTask,
  Certification,
  Funding,
  LicenseEventType,
  OperateReference,
  RoadmapDisplayContent,
} from "@/lib/types/types";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  anytimeActionLicensesTasks: AnytimeActionTask[];
  anytimeActionAdminTasks: AnytimeActionTask[];
  anytimeActionReinstatementsTasks: AnytimeActionTask[];
  anytimeActionLinks: AnytimeActionLink[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
  elevatorViolations?: boolean;
  licenseEvents: LicenseEventType[];
}

export const DashboardOnDesktop = (props: Props): ReactElement<any> => {
  const { business } = useUserData();
  const router = useRouter();
  const operatingPhase = LookupOperatingPhaseById(business?.profileData.operatingPhase);
  const deferredHomeBasedOnSaveButtonClick = (): void =>
    routeShallowWithQuery(router, QUERIES.deferredQuestionAnswered, "true");

  const renderDeferredHomeBasedQuestion =
    isHomeBasedBusinessApplicable(business?.profileData.industryId) &&
    business?.profileData.homeBasedBusiness === undefined &&
    operatingPhase.displayHomeBasedPrompt;

  return (
    <div className="display-none desktop:display-block" data-testid="desktop">
      <div className="margin-top-0 blueRightGutter" data-testid="rightSidebarPageLayout">
        <div className="grid-container-widescreen padding-x-7 width-100">
          <div className="grid-row">
            <div className="grid-col-7 margin-top-6 padding-bottom-15 padding-right-5">
              <UserDataErrorAlert />
              <DashboardHeader />
              <div className="margin-top-3">
                {renderDeferredHomeBasedQuestion && (
                  <DeferredHomeBasedQuestion
                    business={business}
                    onSave={deferredHomeBasedOnSaveButtonClick}
                  />
                )}

                {props.elevatorViolations && <ElevatorViolationsCard />}

                {operatingPhase.displayAnytimeActions && (
                  <AnytimeActionDropdown
                    anytimeActionLicensesTasks={props.anytimeActionLicensesTasks}
                    anytimeActionAdminTasks={props.anytimeActionAdminTasks}
                    anytimeActionReinstatementsTasks={props.anytimeActionReinstatementsTasks}
                    anytimeActionLinks={props.anytimeActionLinks}
                    anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
                  />
                )}

                {operatingPhase.displayRoadmapTasks && (
                  <>
                    <hr className="margin-bottom-3" />
                    <Heading level={2}>{getRoadmapHeadingText(business?.profileData.industryId)}</Heading>
                    <Roadmap />
                  </>
                )}
                {operatingPhase.displayCalendarType !== "NONE" && (
                  <FilingsCalendar
                    operateReferences={props.operateReferences}
                    licenseEvents={props.licenseEvents}
                  />
                )}
                {operatingPhase.displayHideableRoadmapTasks && <HideableTasks />}
              </div>
            </div>
            <div className="grid-col-5 border-cool-lighter bg-cool-extra-light border-left-1px padding-top-6 padding-bottom-15 padding-left-5">
              <SidebarCardsContainer
                sidebarDisplayContent={props.displayContent.sidebarDisplayContent}
                certifications={props.certifications}
                fundings={props.fundings}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
