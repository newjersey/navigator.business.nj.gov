import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { StarterKitsBody } from "@/components/starter-kits/StarterKitsBody";
import {
  createStarterKitProfileData,
  insertIndustryContent,
  insertRoadmapSteps,
} from "@/lib/domain-logic/starterKits";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import {
  getAllStarterKitUrls,
  STARTER_KITS_GENERIC_SLUG,
  StarterKitsUrl,
} from "@/lib/utils/starterKits";
import { emptyRoadmapTaskData, Industry } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/index";
import { Roadmap } from "@businessnjgovnavigator/shared/types";
import type { GetStaticPathsResult } from "next";
import type { ReactElement } from "react";

interface Props {
  noAuth: boolean;
  roadmap: Roadmap;
  industry: Industry;
}

const StarterKitsPage = (props: Props): ReactElement => {
  const Config = getMergedConfig();

  const heroTitle = insertIndustryContent(
    Config.starterKits.hero.title,
    props.industry.id,
    props.industry.name,
  );

  const solutionsTitle = insertIndustryContent(
    Config.starterKits.solutions.title,
    props.industry.id,
    props.industry.name,
  );

  const stepsTitle = insertRoadmapSteps(
    insertIndustryContent(Config.starterKits.steps.title, props.industry.id, props.industry.name),
    props.roadmap.steps.length,
  );

  return (
    <PageSkeleton landingPage={true}>
      <NavBar isSeoStarterKit={true} />
      <main className="desktop:grid-container-widescreen desktop:padding-x-7">
        <StarterKitsBody
          stepsTitle={stepsTitle}
          solutionsTitle={solutionsTitle}
          heroTitle={heroTitle}
          roadmap={props.roadmap}
          industry={props.industry}
        />
      </main>
    </PageSkeleton>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<StarterKitsUrl> => {
  const paths = getAllStarterKitUrls();

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: StarterKitsUrl;
}): Promise<{ props: Props }> => {
  let industry;
  if (params.starterKitsUrl === STARTER_KITS_GENERIC_SLUG) {
    industry = LookupIndustryById("generic");
  } else {
    industry = LookupIndustryById(params.starterKitsUrl);
  }

  const newProfileData = createStarterKitProfileData(industry);

  const roadmap = await buildUserRoadmap(newProfileData, emptyRoadmapTaskData);

  return {
    props: { noAuth: true, roadmap, industry },
  };
};

export default StarterKitsPage;
