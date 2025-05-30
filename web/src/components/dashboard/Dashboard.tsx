import { PersonalizeMyTasksButton } from "@/components/PersonalizeMyTasksButton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AnytimeActionDropdown } from "@/components/dashboard/AnytimeActionDropdown";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeferredHomeBasedQuestion } from "@/components/dashboard/DeferredHomeBasedQuestion";
import { ElevatorViolationsCard } from "@/components/dashboard/ElevatorViolationsCard";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import {
  getPersonalizeTaskButtonTabValue,
  getRoadmapHeadingText,
} from "@/components/dashboard/dashboardHelpers";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { Heading } from "@/components/njwds-extended/Heading";
import { MediaQueries } from "@/lib/PageSizes";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Certification,
  Funding,
  LicenseEventType,
  OperateReference,
  RoadmapDisplayContent,
  XrayRenewalCalendarEventType,
} from "@/lib/types/types";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import {
  isDomesticEmployerBusiness,
  isNexusBusiness,
  isStartingBusiness,
} from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

interface Props {
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
  elevatorViolations?: boolean;
  licenseEvents: LicenseEventType[];
  xrayRenewalEvent: XrayRenewalCalendarEventType;
}

export const Dashboard = (props: Props): ReactElement => {
  const { business } = useUserData();
  const router = useRouter();
  const operatingPhase = LookupOperatingPhaseById(business?.profileData.operatingPhase);
  const deferredHomeBasedOnSaveButtonClick = (): void => {
    router && routeShallowWithQuery(router, QUERIES.deferredQuestionAnswered, "true");
  };

  const isDesktop = useMediaQuery(MediaQueries.desktopAndUp);

  const hidePersonalizeMyTasksButton =
    (isStartingBusiness(business) &&
      !isDomesticEmployerBusiness(business) &&
      business?.profileData.legalStructureId === undefined) ||
    (isNexusBusiness(business) && business?.profileData.legalStructureId === undefined);

  const renderDeferredHomeBasedQuestion =
    isHomeBasedBusinessApplicable(business?.profileData.industryId) &&
    business?.profileData.homeBasedBusiness === undefined &&
    operatingPhase.displayHomeBasedPrompt;

  return (
    <>
      {isDesktop ? (
        <div data-testid="desktop">
          <div className="margin-top-0 blueRightGutter" data-testid="rightSidebarPageLayout">
            <div className="grid-container-widescreen padding-x-7 width-100">
              <div className="grid-row">
                <div className="grid-col-7 margin-top-6 padding-bottom-15 padding-right-5">
                  <UserDataErrorAlert />
                  <DashboardHeader />
                  {!hidePersonalizeMyTasksButton && (
                    <PersonalizeMyTasksButton
                      tabValue={getPersonalizeTaskButtonTabValue(business)}
                    />
                  )}
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
                        anytimeActionTasks={props.anytimeActionTasks}
                        anytimeActionLicenseReinstatements={
                          props.anytimeActionLicenseReinstatements
                        }
                      />
                    )}

                    {operatingPhase.displayRoadmapTasks && (
                      <>
                        <hr className="margin-bottom-3" />
                        <Heading level={2}>
                          {getRoadmapHeadingText(business?.profileData.industryId)}
                        </Heading>
                        <Roadmap />
                      </>
                    )}
                    {operatingPhase.displayCalendarType !== "NONE" && (
                      <FilingsCalendar
                        operateReferences={props.operateReferences}
                        licenseEvents={props.licenseEvents}
                        xrayRenewalEvent={props.xrayRenewalEvent}
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
      ) : (
        <div data-testid="mobile">
          <TwoTabDashboardLayout
            aboveTabs={
              <>
                <DashboardHeader />
                {!hidePersonalizeMyTasksButton && (
                  <PersonalizeMyTasksButton tabValue={getPersonalizeTaskButtonTabValue(business)} />
                )}
              </>
            }
            firstTab={
              <div className="margin-top-0 desktop:margin-top-0">
                <UserDataErrorAlert />
                <div className="margin-top-3">
                  {props.elevatorViolations && <ElevatorViolationsCard />}

                  {renderDeferredHomeBasedQuestion && (
                    <DeferredHomeBasedQuestion
                      business={business}
                      onSave={deferredHomeBasedOnSaveButtonClick}
                    />
                  )}

                  {operatingPhase.displayAnytimeActions && (
                    <AnytimeActionDropdown
                      anytimeActionTasks={props.anytimeActionTasks}
                      anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
                    />
                  )}

                  {operatingPhase.displayRoadmapTasks && (
                    <>
                      <hr className="margin-bottom-3" />
                      <Heading level={2}>
                        {getRoadmapHeadingText(business?.profileData.industryId)}
                      </Heading>
                      <Roadmap />
                    </>
                  )}
                  {operatingPhase.displayCalendarType !== "NONE" && (
                    <FilingsCalendar
                      operateReferences={props.operateReferences}
                      licenseEvents={props.licenseEvents}
                      xrayRenewalEvent={props.xrayRenewalEvent}
                    />
                  )}
                  {operatingPhase.displayHideableRoadmapTasks && <HideableTasks />}
                </div>
              </div>
            }
            secondTab={
              <div className="margin-top-3">
                <SidebarCardsContainer
                  sidebarDisplayContent={props.displayContent.sidebarDisplayContent}
                  certifications={props.certifications}
                  fundings={props.fundings}
                />
              </div>
            }
            certifications={props.certifications}
            fundings={props.fundings}
          />
        </div>
      )}
    </>
  );
};
