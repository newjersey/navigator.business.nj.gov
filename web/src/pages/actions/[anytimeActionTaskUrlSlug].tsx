import {
  type AnytimeActionTaskUrlSlugParameter,
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "@businessnjgovnavigator/shared/static";
import type { AnytimeActionTask } from "@businessnjgovnavigator/shared/types";
import type { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import type { ReactElement } from "react";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { AnytimeActionSwitchComponent } from "@/components/tasks/anytime-action/AnytimeActionSwitchComponent";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";

interface Props {
  anytimeActionTask: AnytimeActionTask;
}

const AnytimeActionTaskPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={getNextSeoTitle(props.anytimeActionTask.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <AnytimeActionSwitchComponent anytimeActionTask={props.anytimeActionTask} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<AnytimeActionTaskUrlSlugParameter> => {
  const paths = loadAllAnytimeActionTaskUrlSlugs(false);
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: AnytimeActionTaskUrlSlugParameter;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      anytimeActionTask: loadAnytimeActionTaskByUrlSlug(params.anytimeActionTaskUrlSlug),
    },
  };
};

export default AnytimeActionTaskPage;
