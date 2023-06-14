import { CircularIndicator } from "@/components/CircularIndicator";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/navbar/NavBar";
import { FieldLabelDescriptionOnly } from "@/components/onboarding/FieldLabelDescriptionOnly";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useAuthAlertPage } from "@/lib/auth/useAuthAlertPage";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useQueryControlledAlert } from "@/lib/data-hooks/useQueryControlledAlert";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { QUERIES, ROUTES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadRoadmapSideBarDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, Funding, OperateReference, RoadmapDisplayContent } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LookupOperatingPhaseById, Municipality } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
  municipalities: Municipality[];
}

const DashboardPage = (props: Props): ReactElement => {
  useAuthAlertPage();
  const { business, updateQueue } = useUserData();
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

  const TaxRegistrationAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromTaxRegistrationCard,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.taxRegistrationSnackbarHeading,
    bodyText: Config.dashboardDefaults.taxRegistrationSnackbarBody,
    variant: "success",
    dataTestId: "tax-registration-alert",
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
    (async (): Promise<void> => {
      if (business?.onboardingFormProgress !== "COMPLETED") {
        await router.replace(ROUTES.onboarding);
      }
    })();
  }, business);

  useMountEffectWhenDefined(() => {
    (async (): Promise<void> => {
      if (isDesktopAndUp && business?.preferences.phaseNewlyChanged) {
        if (!updateQueue || business?.onboardingFormProgress !== "COMPLETED") {
          return;
        }
        await updateQueue.queuePreferences({ phaseNewlyChanged: false }).update();
      }
    })();
  }, updateQueue);

  const displayHomedBaseBusinessQuestion = (): boolean => {
    if (!business) return false;
    return (
      isHomeBasedBusinessApplicable(business.profileData.industryId) &&
      business.profileData.homeBasedBusiness === undefined &&
      LookupOperatingPhaseById(business.profileData.operatingPhase).displayHomeBasedPrompt
    );
  };

  const renderRoadmap = (
    <div className="margin-top-0 desktop:margin-top-0">
      <UserDataErrorAlert />
      <Header />
      <div className="margin-top-3">
        {roadmap ? (
          <>
            <div className="margin-bottom-4">
              {displayHomedBaseBusinessQuestion() && (
                <DeferredOnboardingQuestion
                  label={
                    <FieldLabelDescriptionOnly
                      fieldName="homeBasedBusiness"
                      isAltDescriptionDisplayed={
                        LookupOperatingPhaseById(business?.profileData.operatingPhase)
                          .displayAltHomeBasedBusinessDescription
                      }
                    />
                  }
                  onSave={(): void => routeShallowWithQuery(router, QUERIES.deferredQuestionAnswered, "true")}
                >
                  <OnboardingHomeBasedBusiness />
                </DeferredOnboardingQuestion>
              )}
            </div>
            {LookupOperatingPhaseById(business?.profileData.operatingPhase).displayRoadmapTasks && (
              <>
                <hr className="margin-bottom-3" />
                <Roadmap />
              </>
            )}
            {LookupOperatingPhaseById(business?.profileData.operatingPhase).displayCalendarType !==
              "NONE" && <FilingsCalendar operateReferences={props.operateReferences} />}
            {LookupOperatingPhaseById(business?.profileData.operatingPhase).displayHideableRoadmapTasks && (
              <HideableTasks />
            )}
          </>
        ) : (
          <CircularIndicator />
        )}
      </div>
    </div>
  );

  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <PageSkeleton>
        <NavBar />
        <main id="main">
          {!business || business?.onboardingFormProgress !== "COMPLETED" ? (
            <div className="margin-top-3 desktop:margin-top-0 padding-top-0 desktop:padding-top-6 padding-bottom-15">
              <CircularIndicator />
            </div>
          ) : isDesktopAndUp ? (
            <RightSidebarPageLayout
              mainContent={renderRoadmap}
              sidebarContent={
                <SidebarCardsContainer
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
                <SidebarCardsContainer
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
          <>{TaxRegistrationAlert}</>
          <>{FundingAlert}</>
          <>{HiddenTasksAlert}</>
          <>{DeferredQuestionAnsweredAlert}</>
        </main>
      </PageSkeleton>
    </MunicipalitiesContext.Provider>
  );
};

export const getStaticProps = (): GetStaticPropsResult<Props> => {
  return {
    props: {
      displayContent: loadRoadmapSideBarDisplayContent(),
      operateReferences: loadOperateReferences(),
      fundings: loadAllFundings(),
      certifications: loadAllCertifications(),
      municipalities: loadAllMunicipalities(),
    },
  };
};

export default DashboardPage;
