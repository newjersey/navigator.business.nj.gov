import { ReactElement, useContext, useState } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { Layout } from "../components/Layout";
import Link from "next/link";
import { FormContext } from "./_app";
import { Step } from "../components/Step";
import { useMountEffect } from "../lib/helpers";
import { needsLiquorLicense } from "../lib/form-helpers/needsLiquorLicense";
import { removeLiquorLicenseTasks } from "../lib/roadmap-builders/removeLiquorLicenseTasks";
import { addLegalStructureStep } from "../lib/roadmap-builders/addLegalStructureStep";
import { Roadmap } from "../lib/types/Roadmap";
import { loadInitialRoadmap } from "../lib/roadmap-builders/loadInitialRoadmap";

const RoadmapPage = (): ReactElement => {
  const { formData } = useContext(FormContext);
  const [roadmap, setRoadmap] = useState<Roadmap>(undefined);

  useMountEffect(() => {
    let temp = loadInitialRoadmap(formData.businessType.businessType);

    if (!needsLiquorLicense(formData)) {
      temp = removeLiquorLicenseTasks(temp);
    }

    temp = addLegalStructureStep(temp, formData.businessStructure.businessStructure);
    setRoadmap(temp);
  });

  const getHeader = (): string => {
    return formData.businessName?.businessName
      ? `Business Roadmap for ${formData.businessName?.businessName}`
      : "Your Business Roadmap";
  };

  if (!roadmap) {
    return <></>;
  }

  return (
    <PageSkeleton>
      <Layout>
        <h1>{getHeader()}</h1>
        <p>To start a Restaurant in New Jersey, you’ll need to complete the basic steps below.</p>

        {roadmap.steps.map((step) => (
          <Step key={step.id} step={step} />
        ))}

        <Link href="/onboarding">
          <button className="usa-button">Edit my data</button>
        </Link>
      </Layout>
    </PageSkeleton>
  );
};

export default RoadmapPage;
