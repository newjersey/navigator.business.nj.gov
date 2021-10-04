import React, { ReactElement } from "react";
import { GetStaticPropsResult } from "next";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { GreyCallout } from "@/components/njwds-extended/GreyCallout";
import { PageSkeleton } from "@/components/PageSkeleton";
import { IndustryLookup } from "@/display-content/IndustryLookup";
import { LegalStructureLookup } from "@/display-content/LegalStructureLookup";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { RoadmapDisplayContent } from "@/lib/types/types";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { Content } from "@/components/Content";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useRouter } from "next/router";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import analytics from "@/lib/utils/analytics";
import { CircularProgress } from "@mui/material";
import { NavBar } from "@/components/navbar/NavBar";
import { RoadmapBySections } from "@/components/roadmap/RoadmapBySections";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { OperateSection } from "@/components/roadmap/OperateSection";

interface Props {
  displayContent: RoadmapDisplayContent;
}

const RoadmapPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { userData, isLoading, error } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();

  useMountEffectWhenDefined(() => {
    (async () => {
      if (userData?.formProgress !== "COMPLETED") {
        await router.replace("/onboarding");
      }
    })();
  }, userData);

  const getHeader = (): string => {
    return userData?.onboardingData.businessName
      ? templateEval(RoadmapDefaults.roadmapTitleTemplate, {
          businessName: userData.onboardingData.businessName,
        })
      : RoadmapDefaults.roadmapTitleNotSet;
  };

  const getBusinessName = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return userData?.onboardingData.businessName
      ? userData.onboardingData.businessName
      : RoadmapDefaults.greyBoxNotSetText;
  };

  const getIndustry = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return userData?.onboardingData.industry && userData?.onboardingData.industry !== "generic"
      ? IndustryLookup[userData.onboardingData.industry].primaryText
      : RoadmapDefaults.greyBoxSomeOtherIndustryText;
  };

  const getLegalStructure = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return userData?.onboardingData.legalStructure
      ? LegalStructureLookup[userData.onboardingData.legalStructure]
      : RoadmapDefaults.greyBoxNotSetText;
  };

  const getMunicipality = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return userData?.onboardingData.municipality
      ? userData.onboardingData.municipality.displayName
      : RoadmapDefaults.greyBoxNotSetText;
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
                <div>
                  <GreyCallout
                    link={{
                      text: RoadmapDefaults.greyBoxEditText,
                      href: "/onboarding",
                      onClick: () => {
                        analytics.event.roadmap_profile_edit_button.click.return_to_onboarding();
                      },
                    }}
                  >
                    <>
                      <div data-business-name={userData?.onboardingData.businessName}>
                        {RoadmapDefaults.greyBoxBusinessNameText}: <strong>{getBusinessName()}</strong>
                      </div>
                      <div data-industry={userData?.onboardingData.industry}>
                        {RoadmapDefaults.greyBoxIndustryText}: <strong>{getIndustry()}</strong>
                      </div>
                      <div data-legal-structure={userData?.onboardingData.legalStructure}>
                        {RoadmapDefaults.greyBoxLegalStructureText}: <strong>{getLegalStructure()}</strong>
                      </div>
                      <div data-municipality={userData?.onboardingData.municipality?.name}>
                        {RoadmapDefaults.greyBoxMunicipalityText}: <strong>{getMunicipality()}</strong>
                      </div>
                    </>
                  </GreyCallout>
                </div>
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
                  <RoadmapBySections />
                  <OperateSection displayContent={props.displayContent.operateDisplayContent} />
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
    },
  };
};

export default RoadmapPage;
