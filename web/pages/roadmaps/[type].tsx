import { ReactElement, useEffect, useState } from "react";
import Link from "next/link";
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps, GetStaticPropsResult } from "next";
import cloneDeep from "lodash/cloneDeep";
import { getAllRoadmapTypes, getRoadmapByType, RoadmapTypeParam } from "../../lib/static/loadRoadmaps";
import { Roadmap, TasksLookup } from "../../lib/types/Roadmap";
import { removeLiquorLicenseTasks } from "../../lib/roadmap-builders/removeLiquorLicenseTasks";
import { PageSkeleton } from "../../components/PageSkeleton";
import { Layout } from "../../components/Layout";
import { needsLiquorLicense } from "../../lib/form-helpers/needsLiquorLicense";
import { addLegalStructureStep } from "../../lib/roadmap-builders/addLegalStructureStep";
import { Step } from "../../components/Step";
import { getTasksLookup } from "../../lib/static/loadTasks";
import { useUserData } from "../../lib/data/useUserData";

interface Props {
  roadmap: Roadmap;
  allTasks: TasksLookup;
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

  if (!userData) {
    return <></>;
  }

  return (
    <PageSkeleton>
      <Layout>
        <h1>{getHeader()}</h1>
        <p>To start your business in New Jersey, you’ll need to complete the basic steps below.</p>

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
