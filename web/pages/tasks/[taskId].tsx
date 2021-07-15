import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";
import Link from "next/link";
import { PageSkeleton } from "@/components/PageSkeleton";
import { loadAllTaskIds, loadTaskById, TaskIdParam } from "@/lib/static/loadTasks";
import { Task } from "@/lib/types/types";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { MiniRoadmap } from "@/components/MiniRoadmap";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Content } from "@/components/Content";
import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import { Icon } from "@/components/njwds/Icon";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import { TaskHeader } from "@/components/TaskHeader";
import { TaskCTA } from "@/components/TaskCTA";
import { getModifiedTaskContent, rswitch } from "@/lib/utils/helpers";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NextSeo } from "next-seo";

interface Props {
  task: Task;
}

const TaskPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const sidebar = <MiniRoadmap activeTaskId={props.task.id} />;
  const { roadmap } = useRoadmap();

  const backButton = (
    <Link href="/roadmap" passHref>
      <a href="/roadmap" data-back-to-roadmap className="fdr fac">
        <Icon>arrow_back</Icon> {TaskDefaults.backToRoadmapText}
      </a>
    </Link>
  );

  return (
    <>
      <NextSeo title={`Business.NJ.gov Dashboard - ${props.task.name}`} />
      <PageSkeleton>
        <SidebarPageLayout sidebar={sidebar} backButton={backButton} pageTitle={TaskDefaults.pageTitle}>
          {rswitch(props.task.id, {
            "search-business-name": (
              <div className="margin-3">
                <SearchBusinessName task={props.task} />
              </div>
            ),
            "apply-for-shop-license": <LicenseTask task={props.task} />,
            "register-consumer-affairs": <LicenseTask task={props.task} />,
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

export const getStaticPaths = async (): Promise<GetStaticPathsResult<TaskIdParam>> => {
  const paths = loadAllTaskIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: TaskIdParam;
}): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      task: await loadTaskById(params.taskId),
    },
  };
};

export default TaskPage;
