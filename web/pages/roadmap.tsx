import React, { ReactElement } from "react";
import { useUserData } from "../lib/data-hooks/useUserData";
import { SinglePageLayout } from "../components/njwds-extended/SinglePageLayout";
import { Step } from "../components/Step";
import { GreyCallout } from "../components/njwds-extended/GreyCallout";
import { PageSkeleton } from "../components/PageSkeleton";
import { useRoadmap } from "../lib/data-hooks/useRoadmap";
import { AuthButton } from "../components/AuthButton";
import { IndustryLookup } from "../display-content/IndustryLookup";
import { LegalStructureLookup } from "../display-content/LegalStructureLookup";

const RoadmapPage = (): ReactElement => {
  const { userData, isLoading } = useUserData();
  const { roadmap } = useRoadmap();

  const getHeader = (): string => {
    return userData?.onboardingData.businessName
      ? `Business Roadmap for ${userData.onboardingData.businessName}`
      : "Your Business Roadmap";
  };

  const getBusinessName = (): string => {
    if (isLoading) return "Loading...";
    return userData?.onboardingData.businessName ? userData.onboardingData.businessName : "Not set";
  };

  const getIndustry = (): string => {
    if (isLoading) return "Loading...";
    return userData?.onboardingData.industry && userData?.onboardingData.industry !== "generic"
      ? IndustryLookup[userData.onboardingData.industry]
      : "Not set";
  };

  const getLegalStructure = (): string => {
    if (isLoading) return "Loading...";
    return userData?.onboardingData.legalStructure
      ? LegalStructureLookup[userData.onboardingData.legalStructure]
      : "Not set";
  };

  const getMunicipality = (): string => {
    if (isLoading) return "Loading...";
    return userData?.onboardingData.municipality
      ? userData.onboardingData.municipality.displayName
      : "Not set";
  };

  return (
    <PageSkeleton>
      <SinglePageLayout>
        <div className="float-right">
          <AuthButton />
        </div>
        <h1>{getHeader()}</h1>
        <p className="allow-long usa-intro">
          To start your business in New Jersey, you’ll need to complete the basic steps below. Here’s what you
          need to do at a glance. Once you’re ready we’ll start to walk you through the process.
        </p>
        <div>
          <GreyCallout link={{ text: "Edit", href: "/onboarding" }}>
            <>
              <div data-business-name={userData?.onboardingData.businessName}>
                Business Name: <strong>{getBusinessName()}</strong>
              </div>
              <div data-industry={userData?.onboardingData.industry}>
                Industry: <strong>{getIndustry()}</strong>
              </div>
              <div data-legal-structure={userData?.onboardingData.legalStructure}>
                Legal Structure: <strong>{getLegalStructure()}</strong>
              </div>
              <div data-municipality={userData?.onboardingData.municipality?.name}>
                Location: <strong>{getMunicipality()}</strong>
              </div>
            </>
          </GreyCallout>
        </div>
        {roadmap &&
          roadmap.steps.map((step, index) => (
            <Step key={step.id} step={step} last={index === roadmap.steps.length - 1} />
          ))}
      </SinglePageLayout>
    </PageSkeleton>
  );
};

export default RoadmapPage;
