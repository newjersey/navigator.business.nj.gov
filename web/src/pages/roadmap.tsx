import { Header } from "@/components/Header";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { GraduationBox } from "@/components/roadmap/GraduationBox";
import { RoadmapSidebarList } from "@/components/roadmap/RoadmapSidebarList";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";
import { Step } from "@/components/Step";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { OperateReference, RoadmapDisplayContent } from "@/lib/types/types";
import { getSectionNames, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
}

const RoadmapPage = (props: Props): ReactElement => {
  useAuthAlertPage();
  const { userData } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const [successAlert, setSuccessAlert] = useState<boolean>(false);

  useMountEffectWhenDefined(() => {
    (async () => {
      if (userData?.formProgress !== "COMPLETED") {
        await router.replace("/onboarding");
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.error, userData?.profileData.businessPersona]);

  useEffect(() => {
    if (!router.isReady) return;
    const success = router.query.success;
    setSuccessAlert(success === "true");
  }, [router.isReady, router.query.success]);

  const isForeign = (): boolean => {
    return userData?.profileData.businessPersona === "FOREIGN";
  };

  const renderRoadmap = (
    <div className="margin-top-6 desktop:margin-top-0">
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
                    <Step key={step.step_number} step={step} last={index === array.length - 1} />
                  ))}
              </SectionAccordion>
            ))}
            {!isForeign() && (
              <div className="margin-top-6">
                <GraduationBox />
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
        {successAlert && (
          <ToastAlert
            variant="success"
            isOpen={successAlert}
            close={() => {
              setSuccessAlert(false);
              router.replace({ pathname: "/roadmap" }, undefined, { shallow: true });
            }}
            heading={Config.profileDefaults.successTextHeader}
            dataTestid="toast-alert-SUCCESS"
          >
            {Config.profileDefaults.successTextBody}
          </ToastAlert>
        )}
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
