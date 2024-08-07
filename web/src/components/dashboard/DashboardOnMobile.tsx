import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeferredHomeBasedQuestion } from "@/components/dashboard/DeferredHomeBasedQuestion";
import { ElevatorViolationsCard } from "@/components/dashboard/ElevatorViolationsCard";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import { AnytimeActionDropdown } from "@/components/dashboard/anytime-actions/AnytimeActionDropdown";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionLink,
  AnytimeActionTask,
  Certification,
  Funding,
  OperateReference,
  RoadmapDisplayContent,
} from "@/lib/types/types";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionLinks: AnytimeActionLink[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
  elevatorViolations?: boolean;
}

export const DashboardOnMobile = (props: Props): ReactElement => {
  const { business } = useUserData();
  const router = useRouter();
  const operatingPhase = LookupOperatingPhaseById(business?.profileData.operatingPhase);
  const { Config } = useConfig();

  const deferredHomeBasedOnSaveButtonClick = (): void =>
    routeShallowWithQuery(router, QUERIES.deferredQuestionAnswered, "true");

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
                  anytimeActionTasks={props.anytimeActionTasks}
                  anytimeActionLinks={props.anytimeActionLinks}
                  anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
                />
              )}

              {operatingPhase.displayRoadmapTasks && (
                <>
                  <hr className="margin-bottom-3" />
                  <Heading level={2}>{Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText}</Heading>
                  <Roadmap />
                </>
              )}
              {operatingPhase.displayCalendarType !== "NONE" && (
                <FilingsCalendar operateReferences={props.operateReferences} />
              )}
              {operatingPhase.displayHideableRoadmapTasks && <HideableTasks />}
            </div>
          </div>
        }
        secondTab={
          <SidebarCardsContainer
            sidebarDisplayContent={props.displayContent.sidebarDisplayContent}
            certifications={props.certifications}
            fundings={props.fundings}
          />
        }
        certifications={props.certifications}
        fundings={props.fundings}
      />
    </div>
  );
};
