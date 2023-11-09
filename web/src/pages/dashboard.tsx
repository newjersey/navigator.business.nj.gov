import { CircularIndicator } from "@/components/CircularIndicator";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { QuickActionTile } from "@/components/dashboard/QuickActionTile";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import { HomeBasedBusiness } from "@/components/data-fields/HomeBasedBusiness";
import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { usePageWithNeedsAccountSnackbar } from "@/lib/auth/usePageWithNeedsAccountSnackbar";
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
import { loadAllQuickActions } from "@/lib/static/loadQuickActions";
import {
  Certification,
  Funding,
  OperateReference,
  QuickAction,
  RoadmapDisplayContent,
} from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LookupOperatingPhaseById, Municipality } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
  municipalities: Municipality[];
  quickActions: QuickAction[];
}

const DashboardPage = (props: Props): ReactElement => {
  usePageWithNeedsAccountSnackbar();
  const { business, updateQueue } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  const ProfileUpdatedAlert = useQueryControlledAlert({
    queryKey: QUERIES.success,
    pagePath: ROUTES.dashboard,
    headerText: Config.profileDefaults.default.successTextHeader,
    bodyText: Config.profileDefaults.default.successTextBody,
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

  const AdditionalBusinessAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromAdditionalBusiness,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.additionalBusinessSnackbarHeader,
    bodyText: Config.dashboardDefaults.additionalBusinessSnackbarBody,
    variant: "success",
    dataTestId: "fromAdditionalBusiness-alert",
  });

  const operatingPhase = LookupOperatingPhaseById(business?.profileData.operatingPhase);

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
      operatingPhase.displayHomeBasedPrompt
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
                      isAltDescriptionDisplayed={operatingPhase.displayAltHomeBasedBusinessDescription}
                    />
                  }
                  onSave={(): void => routeShallowWithQuery(router, QUERIES.deferredQuestionAnswered, "true")}
                >
                  <HomeBasedBusiness />
                </DeferredOnboardingQuestion>
              )}
            </div>
            {operatingPhase.displayQuickActions && (
              <div className="grid-row margin-bottom-4">
                {props.quickActions.map((quickAction) => (
                  <QuickActionTile key={quickAction.id} name={quickAction.name} url={quickAction.urlSlug} />
                ))}
              </div>
            )}
            {operatingPhase.displayRoadmapTasks && (
              <>
                <hr className="margin-bottom-3" />
                <Roadmap />
              </>
            )}
            {operatingPhase.displayCalendarType !== "NONE" && (
              <FilingsCalendar operateReferences={props.operateReferences} />
            )}
            {operatingPhase.displayHideableRoadmapTasks && <HideableTasks />}
          </>
        ) : (
          <CircularIndicator />
        )}
      </div>
    </div>
  );

  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <NextSeo title={`${Config.pagesMetadata.titlePrefix} - ${Config.pagesMetadata.dashboard.title}`} />
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
          <>{AdditionalBusinessAlert}</>
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
      quickActions: loadAllQuickActions(),
    },
  };
};

export default DashboardPage;
