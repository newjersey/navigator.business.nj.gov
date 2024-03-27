import { CircularIndicator } from "@/components/CircularIndicator";
import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { Header } from "@/components/Header";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import { QuickActionsContainer } from "@/components/dashboard/quick-actions/QuickActionContainer";
import { HomeBasedBusiness } from "@/components/data-fields/HomeBasedBusiness";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { MediaQueries } from "@/lib/PageSizes";
import { usePageWithNeedsAccountSnackbar } from "@/lib/auth/usePageWithNeedsAccountSnackbar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { QUERIES, ROUTES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadRoadmapSideBarDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { loadAllQuickActionLicenseReinstatements } from "@/lib/static/loadQuickActionLicenseReinstatements";
import { loadAllQuickActionLinks } from "@/lib/static/loadQuickActionLinks";
import { loadAllQuickActionTasks } from "@/lib/static/loadQuickActionTasks";
import {
  Certification,
  Funding,
  OperateReference,
  QuickActionLicenseReinstatement,
  QuickActionLink,
  QuickActionTask,
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
  quickActionTasks: QuickActionTask[];
  quickActionLinks: QuickActionLink[];
  quickActionLicenseReinstatements: QuickActionLicenseReinstatement[];
}

const DashboardPage = (props: Props): ReactElement => {
  usePageWithNeedsAccountSnackbar();
  const { business, updateQueue } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

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
            {displayHomedBaseBusinessQuestion() && (
              <div className="margin-bottom-4">
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
              </div>
            )}

            {operatingPhase.displayQuickActions && (
              <QuickActionsContainer
                quickActionLinks={props.quickActionLinks}
                quickActionTasks={props.quickActionTasks}
                quickActionLicenseReinstatements={props.quickActionLicenseReinstatements}
              />
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
          <DashboardAlerts />
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
      quickActionTasks: loadAllQuickActionTasks(),
      quickActionLinks: loadAllQuickActionLinks(),
      quickActionLicenseReinstatements: loadAllQuickActionLicenseReinstatements(),
    },
  };
};

export default DashboardPage;
