import React, { ReactElement } from "react";
import { useUserData } from "../lib/data/useUserData";
import { SinglePageLayout } from "../components/njwds-extended/SinglePageLayout";
import { Step } from "../components/Step";
import { GreyCallout } from "../components/njwds-extended/GreyCallout";
import { PageSkeleton } from "../components/PageSkeleton";
import { useRoadmap } from "../lib/data/useRoadmap";

const RoadmapPage = (): ReactElement => {
  const { userData, isLoading } = useUserData();
  const { roadmap } = useRoadmap();

  const getHeader = (): string => {
    return userData?.formData.businessName?.businessName
      ? `Business Roadmap for ${userData.formData.businessName?.businessName}`
      : "Your Business Roadmap";
  };

  const getBusinessName = (): string => {
    if (isLoading) return "Loading...";
    return userData?.formData.businessName?.businessName
      ? userData.formData.businessName?.businessName
      : "Not set";
  };

  const getIndustry = (): string => {
    if (isLoading) return "Loading...";
    return userData?.formData.businessType?.businessType
      ? userData.formData.businessType?.businessType
      : "Not set";
  };

  const getLegalEntity = (): string => {
    if (isLoading) return "Loading...";
    return userData?.formData.businessStructure?.businessStructure
      ? userData.formData.businessStructure?.businessStructure
      : "Not set";
  };

  return (
    <PageSkeleton>
      <SinglePageLayout>
        <h1 className="red">{getHeader()}</h1>
        <p className="allow-long usa-intro">
          To start your business in New Jersey, you’ll need to complete the basic steps below. Here’s what you
          need to do at a glance. Once you’re ready we’ll start to walk you through the process.
        </p>
        <div>
          <GreyCallout link={{ text: "Edit", href: "/onboarding" }}>
            <>
              <div>
                Business Name: <strong>{getBusinessName()}</strong>
              </div>
              <div>
                Industry: <strong>{getIndustry()}</strong>
              </div>
              <div>
                Legal Entity: <strong>{getLegalEntity()}</strong>
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
