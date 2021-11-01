import React, { ReactElement } from "react";
import { GetStaticPropsResult } from "next";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { getSectionNames, templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { FilingReference, RoadmapDisplayContent } from "@/lib/types/types";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { Content, ContentNonProse } from "@/components/Content";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useRouter } from "next/router";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { CircularProgress } from "@mui/material";
import { NavBar } from "@/components/navbar/NavBar";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { OperateSection } from "@/components/roadmap/OperateSection";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";
import { Step } from "@/components/Step";
import { loadFilingsReferences } from "@/lib/static/loadFilings";
import { MiniProfile } from "@/components/roadmap/MiniProfile";

interface Props {
  displayContent: RoadmapDisplayContent;
  filingsReferences: Record<string, FilingReference>;
}

const RoadmapPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { userData, error } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const featureDisableOperate = process.env.FEATURE_DISABLE_OPERATE ?? false;

  useMountEffectWhenDefined(() => {
    (async () => {
      if (userData?.formProgress !== "COMPLETED") {
        await router.replace("/onboarding");
      }
    })();
  }, userData);

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
            <div className="margin-left-2 h3-element">Loading...</div>
          </div>
        </SinglePageLayout>
      ) : (
        <div className="margin-top-6 desktop:margin-top-0">
          <SinglePageLayout>
            <h1>{getHeader()}</h1>
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
                  <div className="margin-left-2 h3-element">Loading...</div>
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
                  {!featureDisableOperate ? (
                    <OperateSection
                      displayContent={props.displayContent.operateDisplayContent}
                      filingsReferences={props.filingsReferences}
                    />
                  ) : (
                    <div className="margin-top-6 font-body-2xs text-center">
                      <ContentNonProse>{RoadmapDefaults.operateComplianceText}</ContentNonProse>
                    </div>
                  )}
                </>
              )}
            </div>
          </SinglePageLayout>
        </div>
      )}
    </PageSkeleton>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      displayContent: loadRoadmapDisplayContent(),
      filingsReferences: loadFilingsReferences(),
    },
  };
};

export default RoadmapPage;
