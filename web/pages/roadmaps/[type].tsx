import React, { ReactElement, useEffect, useState } from "react";
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps, GetStaticPropsResult } from "next";
import cloneDeep from "lodash/cloneDeep";
import { getAllRoadmapTypes, getRoadmapByType, RoadmapTypeParam } from "../../lib/static/loadRoadmaps";
import { Roadmap, TaskLookup } from "../../lib/types/types";
import { removeLiquorLicenseTasks } from "../../lib/roadmap-builders/removeLiquorLicenseTasks";
import { PageSkeleton } from "../../components/PageSkeleton";
import { needsLiquorLicense } from "../../lib/form-helpers/needsLiquorLicense";
import { addLegalStructureStep } from "../../lib/roadmap-builders/addLegalStructureStep";
import { Step } from "../../components/Step";
import { getTasksLookup } from "../../lib/static/loadTasks";
import { useUserData } from "../../lib/data/useUserData";
import { SinglePageLayout } from "../../components/njwds-extended/SinglePageLayout";
import { GreyCallout } from "../../components/njwds-extended/GreyCallout";

interface Props {
  roadmap: Roadmap;
  allTasks: TaskLookup;
}

const RoadmapPage = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const [roadmap, setRoadmap] = useState<Roadmap>(props.roadmap);

  useEffect(() => {
    if (!userData) {
      return;
    }

    let temp = cloneDeep(props.roadmap);

    if (!needsLiquorLicense(userData.formData)) {
      temp = removeLiquorLicenseTasks(temp);
    }

    if (userData.formData.businessStructure) {
      temp = addLegalStructureStep(
        temp,
        userData.formData.businessStructure.businessStructure,
        props.allTasks
      );
      setRoadmap(temp);
    }
  }, [userData]);

  const getHeader = (): string => {
    return userData.formData.businessName?.businessName
      ? `Business Roadmap for ${userData.formData.businessName?.businessName}`
      : "Your Business Roadmap";
  };

  const getBusinessName = (): string => {
    return userData.formData.businessName?.businessName
      ? userData.formData.businessName?.businessName
      : "Not set";
  };

  const getIndustry = (): string => {
    return userData.formData.businessType?.businessType
      ? userData.formData.businessType?.businessType
      : "Not set";
  };

  const getLegalEntity = (): string => {
    return userData.formData.businessStructure?.businessStructure
      ? userData.formData.businessStructure?.businessStructure
      : "Not set";
  };

  if (!userData) {
    return <></>;
  }

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

        {roadmap.steps.map((step, index) => (
          <Step key={step.id} step={step} last={index === roadmap.steps.length - 1} />
        ))}
      </SinglePageLayout>
    </PageSkeleton>
  );
};

export const getStaticPaths: GetStaticPaths = async (): Promise<GetStaticPathsResult> => {
  return {
    paths: getAllRoadmapTypes(),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
}: {
  params: RoadmapTypeParam;
}): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      roadmap: getRoadmapByType(params.type),
      allTasks: getTasksLookup(),
    },
  };
};

export default RoadmapPage;
