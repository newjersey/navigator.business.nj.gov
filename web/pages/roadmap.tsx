import React, { ReactElement, useEffect } from "react";
import { GetStaticPropsResult } from "next";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { Step } from "@/components/Step";
import { GreyCallout } from "@/components/njwds-extended/GreyCallout";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { AuthButton } from "@/components/AuthButton";
import { IndustryLookup } from "@/display-content/IndustryLookup";
import { LegalStructureLookup } from "@/display-content/LegalStructureLookup";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { templateEval } from "@/lib/utils/helpers";
import { RoadmapDisplayContent } from "@/lib/types/types";
import { loadRoadmapDisplayContent } from "@/lib/static/loadDisplayContent";
import { Content } from "@/components/Content";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { LegalMessage } from "@/display-content/FooterLegalMessage";
import { useRouter } from "next/router";

interface Props {
  displayContent: RoadmapDisplayContent;
}

const RoadmapPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { userData, isLoading } = useUserData();
  const { roadmap } = useRoadmap();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (userData?.formProgress !== "COMPLETED") {
        await router.replace("/onboarding");
      }
    })();
  }, [userData]);

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
      : RoadmapDefaults.greyBoxNotSetText;
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
    <PageSkeleton>
      <SinglePageLayout>
        <div className="float-right">
          <AuthButton />
        </div>
        <h1>{getHeader()}</h1>
        <div className="allow-long usa-intro">
          <Content>{props.displayContent.contentMd}</Content>
        </div>
        <div>
          <GreyCallout link={{ text: RoadmapDefaults.greyBoxEditText, href: "/onboarding" }}>
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
        {roadmap &&
          roadmap.steps.map((step, index) => (
            <Step key={step.id} step={step} last={index === roadmap.steps.length - 1} />
          ))}
      </SinglePageLayout>
      <div className="grey-bg align-justify">
        <div className="display-flex fjc fac padding-2 line-height-body-2 legal-footer-roadmap legal-footer-roadmap-mobile">
          <p>{LegalMessage.legalMessageText}</p>{" "}
        </div>
      </div>
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
