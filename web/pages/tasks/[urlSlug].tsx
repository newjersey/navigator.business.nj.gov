import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { Task } from "@/lib/types/types";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Content } from "@/components/Content";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import { TaskHeader } from "@/components/TaskHeader";
import { TaskCTA } from "@/components/TaskCTA";
import { getModifiedTaskContent, rswitch } from "@/lib/utils/helpers";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NextSeo } from "next-seo";
import { TownMercantileLicenseTask } from "@/components/tasks/TownMercantileLicenseTask";
import { NavBar } from "@/components/navbar/NavBar";

interface Props {
  task: Task;
}

const TaskPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

  const { roadmap } = useRoadmap();

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.task.name}`} />
      <PageSkeleton>
        <NavBar task={props.task} />
        <SidebarPageLayout task={props.task}>
          {rswitch(props.task.id, {
            "search-business-name": (
              <div className="margin-3">
                <SearchBusinessName task={props.task} />
              </div>
            ),
            "apply-for-shop-license": <LicenseTask task={props.task} />,
            "register-consumer-affairs": <LicenseTask task={props.task} />,
            "check-local-requirements": (
              <div className="margin-3">
                <TownMercantileLicenseTask task={props.task} />
              </div>
            ),
            default: (
              <div className="margin-3">
                <TaskHeader task={props.task} />
                <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
                <TaskCTA
                  link={getModifiedTaskContent(roadmap, props.task, "callToActionLink")}
                  text={getModifiedTaskContent(roadmap, props.task, "callToActionText")}
                />
              </div>
            ),
          })}
        </SidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<TaskUrlSlugParam> => {
  const paths = loadAllTaskUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: TaskUrlSlugParam }): GetStaticPropsResult<Props> => {
  return {
    props: {
      task: loadTaskByUrlSlug(params.urlSlug),
    },
  };
};

export default TaskPage;
