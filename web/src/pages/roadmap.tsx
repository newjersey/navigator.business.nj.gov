import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import { GraduationBox } from "@/components/roadmap/GraduationBox";
import { MiniProfile } from "@/components/roadmap/MiniProfile";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";
import { Step } from "@/components/Step";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { RoadmapDefaults } from "@/display-defaults/roadmap/RoadmapDefaults";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { OperateReference, RoadmapDisplayContent } from "@/lib/types/types";
import { getSectionNames, templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import { CircularProgress } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
}

const RoadmapPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
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
      userData?.profileData.hasExistingBusiness
    ) {
      router.replace("/dashboard");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.error, userData?.profileData.hasExistingBusiness]);

  useEffect(() => {
    if (!router.isReady) return;
    const success = router.query.success;
    setSuccessAlert(success === "true");
  }, [router.isReady, router.query.success]);

  const getHeader = (): string => {
    return userData?.profileData.businessName
      ? templateEval(RoadmapDefaults.roadmapTitleTemplate, {
          businessName: userData.profileData.businessName,
        })
      : RoadmapDefaults.roadmapTitleNotSet;
  };

  return (
    <PageSkeleton showLegalMessage={true}>
      <NavBar />
      {!userData || userData?.formProgress !== "COMPLETED" ? (
        <SinglePageLayout>
          <div className="fdr fjc fac">
            <CircularProgress />
            <div className="margin-left-2 h3-styling">Loading...</div>
          </div>
        </SinglePageLayout>
      ) : (
        <div className="margin-top-6 desktop:margin-top-0">
          <SinglePageLayout>
            <div className="margin-bottom-205">
              <h1 className="h1-styling-large">{getHeader()}</h1>
            </div>
            <UserDataErrorAlert />
            {(!error || error !== "NO_DATA") && (
              <>
                <div className="allow-long usa-intro">
                  <Content>{props.displayContent.contentMd}</Content>
                </div>
                <MiniProfile profileData={userData.profileData} />
              </>
            )}
            <div className="margin-top-3">
              {!roadmap ? (
                <div className="fdr fjc fac">
                  <CircularProgress />
                  <div className="margin-left-2 h3-styling">Loading...</div>
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
          </SinglePageLayout>
        </div>
      )}
      {successAlert && (
        <ToastAlert
          variant="success"
          isOpen={successAlert}
          close={() => {
            setSuccessAlert(false);
            router.replace({ pathname: "/roadmap" }, undefined, { shallow: true });
          }}
        >
          <div data-testid="toast-alert-SUCCESS" className="h3-styling">
            {Defaults.profileDefaults.successTextHeader}
          </div>
          <div className="padding-top-05">{Defaults.profileDefaults.successTextBody}</div>
        </ToastAlert>
      )}
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
