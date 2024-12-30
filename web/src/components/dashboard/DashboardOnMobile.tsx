import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AnytimeActionDropdown } from "@/components/dashboard/AnytimeActionDropdown";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeferredHomeBasedQuestion } from "@/components/dashboard/DeferredHomeBasedQuestion";
import { ElevatorViolationsCard } from "@/components/dashboard/ElevatorViolationsCard";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
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
import { useRouter } from "next/compat/router";
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

export const DashboardOnMobile = (props: Props): ReactElement => {
  const { business } = useUserData();
  const router = useRouter();
  const operatingPhase = LookupOperatingPhaseById(business?.profileData.operatingPhase);

  const deferredHomeBasedOnSaveButtonClick = (): void => {
    router && routeShallowWithQuery(router, QUERIES.deferredQuestionAnswered, "true");
  };

  const renderDeferredHomeBasedQuestion =
    isHomeBasedBusinessApplicable(business?.profileData.industryId) &&
    business?.profileData.homeBasedBusiness === undefined &&
    operatingPhase.displayHomeBasedPrompt;

  return (
    <div className="desktop:display-none" data-testid="mobile">
      <TwoTabDashboardLayout
        aboveTabs={<DashboardHeader />}
        firstTab={
          <div className="margin-top-0 desktop:margin-top-0">
            <UserDataErrorAlert />
            <div className="margin-top-3">
              {props.elevatorViolations && <ElevatorViolationsCard />}

              {renderDeferredHomeBasedQuestion && (
                <DeferredHomeBasedQuestion business={business} onSave={deferredHomeBasedOnSaveButtonClick} />
              )}

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
  );
};
