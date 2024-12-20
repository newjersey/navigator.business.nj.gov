import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { AnytimeActionSwitchComponent } from "@/components/tasks/anytime-action/AnytimeActionSwitchComponent";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import {
  AnytimeActionTaskUrlSlugParam,
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "@/lib/static/loadAnytimeActionTasks";
import { AnytimeActionTask } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  anytimeActionTask: AnytimeActionTask;
}

const AnytimeActionTaskPage = (props: Props): ReactElement<any> => {
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

export const getStaticPaths = (): GetStaticPathsResult<AnytimeActionTaskUrlSlugParam> => {
  const paths = loadAllAnytimeActionTaskUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: AnytimeActionTaskUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      anytimeActionTask: loadAnytimeActionTaskByUrlSlug(params.anytimeActionTaskUrlSlug),
    },
  };
};

export default AnytimeActionTaskPage;
