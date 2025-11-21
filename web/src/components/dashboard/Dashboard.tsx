import { PersonalizeMyTasksButton } from "@/components/PersonalizeMyTasksButton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AnytimeActionContainer } from "@/components/dashboard/AnytimeActionContainer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ElevatorViolationsCard } from "@/components/dashboard/ElevatorViolationsCard";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import { getAnytimeActionsFromNonEssentialQuestions } from "@/components/dashboard/anytimeActionsBuilder";
import {
  getPersonalizeTaskButtonTabValue,
  getRoadmapHeadingText,
} from "@/components/dashboard/dashboardHelpers";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { Heading } from "@/components/njwds-extended/Heading";
import { MediaQueries } from "@/lib/PageSizes";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import {
  isDomesticEmployerBusiness,
  isNexusBusiness,
  isStartingBusiness,
} from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Certification,
  Funding,
  LicenseEventType,
  OperateReference,
  RoadmapDisplayContent,
  XrayRenewalCalendarEventType,
} from "@businessnjgovnavigator/shared/types";
import { useMediaQuery } from "@mui/material";
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
  commonBusinessTasks: (AnytimeActionLicenseReinstatement | AnytimeActionTask)[];
}

export const Dashboard = (props: Props): ReactElement => {
  const { business } = useUserData();
  const operatingPhase = LookupOperatingPhaseById(business?.profileData.operatingPhase);

  const isDesktop = useMediaQuery(MediaQueries.desktopAndUp);

  const hidePersonalizeMyTasksButton =
    (isStartingBusiness(business) &&
      !isDomesticEmployerBusiness(business) &&
      business?.profileData.legalStructureId === undefined) ||
    (isNexusBusiness(business) && business?.profileData.legalStructureId === undefined);

  const anytimeActionTasksFromNonEssentialQuestions = getAnytimeActionsFromNonEssentialQuestions(
    business?.profileData,
    props.anytimeActionTasks,
  );
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
                    {props.elevatorViolations && <ElevatorViolationsCard />}

                    {operatingPhase.displayAnytimeActions && (
                      <AnytimeActionContainer
                        anytimeActionTasks={props.anytimeActionTasks}
                        anytimeActionTasksFromNonEssentialQuestions={
                          anytimeActionTasksFromNonEssentialQuestions
                        }
                        anytimeActionLicenseReinstatements={
                          props.anytimeActionLicenseReinstatements
                        }
                        commonBusinessTasks={props.commonBusinessTasks}
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
                  {operatingPhase.displayAnytimeActions && (
                    <AnytimeActionContainer
                      anytimeActionTasks={props.anytimeActionTasks}
                      anytimeActionTasksFromNonEssentialQuestions={
                        anytimeActionTasksFromNonEssentialQuestions
                      }
                      anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
                      commonBusinessTasks={props.commonBusinessTasks}
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
