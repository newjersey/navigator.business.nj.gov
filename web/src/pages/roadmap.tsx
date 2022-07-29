import { FilingsCalendarAsList } from "@/components/FilingsCalendarAsList";
import { Header } from "@/components/Header";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { RoadmapSidebarList } from "@/components/roadmap/RoadmapSidebarList";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";
import { Step } from "@/components/Step";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useQueryControlledAlert } from "@/lib/data-hooks/useQueryControlledAlert";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { ROUTES } from "@/lib/domain-logic/routes";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { OperateReference, RoadmapDisplayContent } from "@/lib/types/types";
import { getSectionNames, getTaxFilings, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
}

const RoadmapPage = (props: Props): ReactElement => {
  useAuthAlertPage();
  const { userData } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();

  const ProfileUpdatedAlert = useQueryControlledAlert({
    queryKey: "success",
    pagePath: ROUTES.roadmap,
    headerText: Config.profileDefaults.successTextHeader,
    bodyText: Config.profileDefaults.successTextBody,
    variant: "success",
  });

  const CalendarAlert = useQueryControlledAlert({
    queryKey: "fromFormBusinessEntity",
    pagePath: ROUTES.roadmap,
    headerText: Config.roadmapDefaults.calendarSnackbarHeading,
    bodyText: Config.roadmapDefaults.calendarSnackbarBody,
    variant: "success",
    dataTestId: "snackbar-alert-calendar",
  });

  useMountEffectWhenDefined(() => {
    (async () => {
      if (userData?.formProgress !== "COMPLETED") {
        await router.replace(ROUTES.onboarding);
      }
    })();
  }, userData);

  useEffect(() => {
    if (!router.isReady) return;
    if (
      (router.query.error === "true" || (router.query?.code && router.query?.state)) &&
      userData?.profileData.businessPersona === "OWNING"
    ) {
      router.replace(routeForPersona(userData?.profileData.businessPersona));
    }
  }, [router, userData?.profileData.businessPersona]);

  const taxFilings = getTaxFilings(userData);

  const renderRoadmap = (
    <div className="margin-top-0 desktop:margin-top-0">
      <UserDataErrorAlert />
      <Header />
      <div className="margin-top-3">
        {!roadmap ? (
          <LoadingIndicator />
        ) : (
          <>
            {getSectionNames(roadmap).map((section) => (
              <SectionAccordion key={section} sectionType={section}>
                {roadmap.steps
                  .filter((step) => step.section === section)
                  .map((step, index, array) => (
                    <Step key={step.stepNumber} step={step} last={index === array.length - 1} />
                  ))}
              </SectionAccordion>
            ))}
            {taxFilings.length > 0 && (
              <div className="margin-top-6 bg-roadmap-blue border-base-lightest border-2px padding-top-3 padding-bottom-1 padding-x-4 radius-lg">
                <div>
                  <div className="h3-styling text-normal">{Config.roadmapDefaults.calendarHeader}</div>
                  <hr className="bg-base-lighter margin-top-0 margin-bottom-4" aria-hidden={true} />
                  <FilingsCalendarAsList operateReferences={props.operateReferences} />
                </div>
              </div>
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
              <RoadmapSidebarList sidebarDisplayContent={props.displayContent.sidebarDisplayContent} />
            }
          />
        )}
        <>{ProfileUpdatedAlert}</>
        <>{CalendarAlert}</>
      </main>
    </PageSkeleton>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      displayContent: loadRoadmapDisplayContent(),
      operateReferences: loadOperateReferences(),
    },
  };
};

export default RoadmapPage;
