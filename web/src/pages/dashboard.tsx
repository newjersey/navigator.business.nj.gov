import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { FilingsCalendar } from "@/components/FilingsCalendar";
import { Header } from "@/components/Header";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { FieldLabelDeferred } from "@/components/onboarding/FieldLabelDeferred";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useAuthAlertPage } from "@/lib/auth/useAuthAlertPage";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useQueryControlledAlert } from "@/lib/data-hooks/useQueryControlledAlert";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/essentialQuestions/isHomeBasedBusinessApplicable";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, Funding, OperateReference, RoadmapDisplayContent } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
}

const DashboardPage = (props: Props): ReactElement => {
  useAuthAlertPage();
  const { userData } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  const ProfileUpdatedAlert = useQueryControlledAlert({
    queryKey: QUERIES.success,
    pagePath: ROUTES.dashboard,
    headerText: Config.profileDefaults.successTextHeader,
    bodyText: Config.profileDefaults.successTextBody,
    variant: "success",
  });

  const CalendarAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromFormBusinessEntity,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.calendarSnackbarHeading,
    bodyText: Config.dashboardDefaults.calendarSnackbarBody,
    variant: "success",
    dataTestId: "snackbar-alert-calendar",
  });

  const CertificationsAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromTaxRegistration,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.certificationsSnackbarHeading,
    bodyText: Config.dashboardDefaults.certificationsSnackbarBody,
    variant: "success",
    dataTestId: "certification-alert",
  });

  const FundingAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromFunding,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.fundingSnackbarHeading,
    bodyText: Config.dashboardDefaults.fundingSnackbarBody,
    variant: "success",
    dataTestId: "funding-alert",
  });

  const HiddenTasksAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromFunding,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.hiddenTasksSnackbarHeading,
    bodyText: Config.dashboardDefaults.hiddenTasksSnackbarBody,
    variant: "success",
    dataTestId: "hiddenTasks-alert",
    delayInMilliseconds: 6000,
  });

  const DeferredQuestionAnsweredAlert = useQueryControlledAlert({
    queryKey: QUERIES.deferredQuestionAnswered,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.deferredOnboardingSnackbarHeader,
    bodyText: Config.dashboardDefaults.deferredOnboardingSnackbarBody,
    variant: "success",
    dataTestId: "deferredQuestionAnswered-alert",
  });

  useMountEffectWhenDefined(() => {
    (async () => {
      if (userData?.formProgress !== "COMPLETED") {
        await router.replace(ROUTES.onboarding);
      }
    })();
  }, userData);

  const displayHomedBaseBusinessQuestion = (): boolean => {
    if (!userData) return false;
    return (
      isHomeBasedBusinessApplicable(userData.profileData.industryId) &&
      userData.profileData.homeBasedBusiness === undefined
    );
  };

  const renderRoadmap = (
    <div className="margin-top-0 desktop:margin-top-0">
      <UserDataErrorAlert />
      <Header />
      <div className="margin-top-3">
        {!roadmap ? (
          <LoadingIndicator />
        ) : (
          <>
            <div className="margin-bottom-4">
              {displayHomedBaseBusinessQuestion() && (
                <DeferredOnboardingQuestion>
                  <FieldLabelDeferred fieldName="homeBasedBusiness" />
                  <OnboardingHomeBasedBusiness />
                </DeferredOnboardingQuestion>
              )}
            </div>
            {LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayRoadmapTasks && (
              <>
                <hr />
                <Roadmap />
              </>
            )}
            {LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCalendarType != "NONE" && (
              <FilingsCalendar operateReferences={props.operateReferences} />
            )}
            {LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayHideableRoadmapTasks && (
              <HideableTasks />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <PageSkeleton>
      <NavBar />
      <main id="main">
        {!userData || userData?.formProgress !== "COMPLETED" ? (
          <div className="margin-top-3 desktop:margin-top-0 padding-top-0 desktop:padding-top-6 padding-bottom-15">
            <LoadingIndicator />
          </div>
        ) : isDesktopAndUp ? (
          <RightSidebarPageLayout
            mainContent={renderRoadmap}
            sidebarContent={
              <SidebarCardsList
                sidebarDisplayContent={props.displayContent.sidebarDisplayContent}
                certifications={props.certifications}
                fundings={props.fundings}
              />
            }
          />
        ) : (
          <TwoTabDashboardLayout
            firstTab={renderRoadmap}
            secondTab={
              <SidebarCardsList
                sidebarDisplayContent={props.displayContent.sidebarDisplayContent}
                certifications={props.certifications}
                fundings={props.fundings}
              />
            }
            certifications={props.certifications}
            fundings={props.fundings}
          />
        )}
        <>{ProfileUpdatedAlert}</>
        <>{CalendarAlert}</>
        <>{CertificationsAlert}</>
        <>{FundingAlert}</>
        <>{HiddenTasksAlert}</>
        <>{DeferredQuestionAnsweredAlert}</>
      </main>
    </PageSkeleton>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      displayContent: loadRoadmapDisplayContent(),
      operateReferences: loadOperateReferences(),
      fundings: loadAllFundings(),
      certifications: loadAllCertifications(),
    },
  };
};

export default DashboardPage;
