import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { GraduationBox } from "@/components/roadmap/GraduationBox";
import { MiniProfile } from "@/components/roadmap/MiniProfile";
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
import { getSectionNames, templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { CircularProgress } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
}

const RoadmapPage = (props: Props): ReactElement => {
  useAuthAlertPage();
  const { userData, error } = useUserData();
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

  const getHeader = (): string => {
    if (userData?.user.name) {
      return templateEval(Config.roadmapDefaults.roadmapTitleTemplateForUserName, {
        name: userData.user.name,
      });
    } else {
      return Config.roadmapDefaults.roadmapTitleBusinessAndUserMissing;
    }
  };

  const renderRoadmap = (
    <div className="margin-top-6 desktop:margin-top-0">
      <div className="margin-bottom-205 bg-white">
        <h1 className="h1-styling-large">{getHeader()}</h1>
      </div>
      <UserDataErrorAlert />
      {(!error || error !== "NO_DATA") && (
        <>
          <div className="allow-long usa-intro bg-white">
            <Content>{props.displayContent.contentMd}</Content>
          </div>
          {!userData ? (
            <div className="flex flex-justify-center flex-align-center">
              <CircularProgress
                id="roadmapSection"
                aria-label="roadmap section progress bar"
                aria-busy={true}
              />
              <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
            </div>
          ) : (
            <MiniProfile profileData={userData.profileData} />
          )}
        </>
      )}
      <div className="margin-top-3">
        {!roadmap ? (
          <div className="flex flex-justify-center flex-align-center">
            <CircularProgress
              id="roadmapSection"
              aria-label="roadmap section progress bar"
              aria-busy={true}
            />
            <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
          </div>
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
            <div className="margin-top-6">
              <GraduationBox />
            </div>
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
          <div className="flex flex-justify-center flex-align-center margin-top-3 desktop:margin-top-0 padding-top-0 desktop:padding-top-6 padding-bottom-15">
            <CircularProgress id="roadmapPage" aria-label="roadmap page progress bar" aria-busy={true} />
            <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
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
