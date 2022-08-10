import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { FilingsCalendar } from "@/components/FilingsCalendar";
import { FilingsCalendarAsList } from "@/components/FilingsCalendarAsList";
import { Header } from "@/components/Header";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { Step } from "@/components/Step";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useQueryControlledAlert } from "@/lib/data-hooks/useQueryControlledAlert";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, Funding, OperateReference, RoadmapDisplayContent } from "@/lib/types/types";
import { getSectionNames, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
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

  const ProfileUpdatedAlert = useQueryControlledAlert({
    queryKey: "success",
    pagePath: ROUTES.dashboard,
    headerText: Config.profileDefaults.successTextHeader,
    bodyText: Config.profileDefaults.successTextBody,
    variant: "success",
  });

  const CalendarAlert = useQueryControlledAlert({
    queryKey: "fromFormBusinessEntity",
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.calendarSnackbarHeading,
    bodyText: Config.dashboardDefaults.calendarSnackbarBody,
    variant: "success",
    dataTestId: "snackbar-alert-calendar",
  });

  const CertificationsAlert = useQueryControlledAlert({
    queryKey: "fromTaxRegistration",
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.certificationsSnackbarHeading,
    bodyText: Config.dashboardDefaults.certificationsSnackbarBody,
    variant: "success",
    dataTestId: "toast-alert-certification",
  });

  const FundingAlert = useQueryControlledAlert({
    queryKey: "fromFunding",
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.fundingSnackbarHeading,
    bodyText: Config.dashboardDefaults.fundingSnackbarBody,
    variant: "success",
    dataTestId: "funding-alert",
  });

  const HiddenTasksAlert = useQueryControlledAlert({
    queryKey: "fromFunding",
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.hiddenTasksSnackbarHeading,
    bodyText: Config.dashboardDefaults.hiddenTasksSnackbarBody,
    variant: "success",
    dataTestId: "hiddenTasks-alert",
    delayInMilliseconds: 6000,
  });

  useMountEffectWhenDefined(() => {
    (async () => {
      if (userData?.formProgress !== "COMPLETED") {
        await router.replace(ROUTES.onboarding);
      }
    })();
  }, userData);

  const renderRoadmap = (
    <div className="margin-top-0 desktop:margin-top-0">
      <UserDataErrorAlert />
      <Header />
      <div className="margin-top-3">
        {!roadmap ? (
          <LoadingIndicator />
        ) : (
          <>
            {LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayRoadmapTasks &&
              getSectionNames(roadmap).map((section) => (
                <SectionAccordion key={section} sectionType={section}>
                  {roadmap.steps
                    .filter((step) => step.section === section)
                    .map((step, index, array) => (
                      <Step key={step.stepNumber} step={step} last={index === array.length - 1} />
                    ))}
                </SectionAccordion>
              ))}
            {LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayListCalendar &&
              (userData?.taxFilingData.filings || []).length > 0 && (
                <div className="margin-top-6 bg-roadmap-blue border-base-lightest border-2px padding-top-3 padding-bottom-1 padding-x-4 radius-lg">
                  <div>
                    <div className="h3-styling text-normal">{Config.dashboardDefaults.calendarHeader}</div>
                    <hr className="bg-base-lighter margin-top-0 margin-bottom-4" aria-hidden={true} />
                    <FilingsCalendarAsList operateReferences={props.operateReferences} />
                  </div>
                </div>
              )}
            {LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayFullCalendar && (
              <FilingsCalendar operateReferences={props.operateReferences} />
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
        ) : (
          <RightSidebarPageLayout
            color="blue"
            mainContent={renderRoadmap}
            sidebarContent={
              <SidebarCardsList
                sidebarDisplayContent={props.displayContent.sidebarDisplayContent}
                certifications={props.certifications}
                fundings={props.fundings}
              />
            }
          />
        )}
        <>{ProfileUpdatedAlert}</>
        <>{CalendarAlert}</>
        <>{CertificationsAlert}</>
        <>{FundingAlert}</>
        <>{HiddenTasksAlert}</>
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
