import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";
import { PageSkeleton } from "../../components/PageSkeleton";
import { loadAllTaskIds, loadTaskById, TaskIdParam } from "../../lib/static/loadTasks";
import { Task, TaskProgress } from "../../lib/types/types";
import Link from "next/link";
import { SidebarPageLayout } from "../../components/njwds-extended/SidebarPageLayout";
import { MiniRoadmap } from "../../components/MiniRoadmap";
import { useRoadmap } from "../../lib/data-hooks/useRoadmap";
import { TaskProgressDropdown } from "../../components/TaskProgressDropdown";
import { useUserData } from "../../lib/data-hooks/useUserData";
import { Content } from "../../components/Content";
import { TaskDefaults } from "../../display-content/tasks/TaskDefaults";
import { Icon } from "../../components/njwds/Icon";
import { useAuthProtectedPage } from "../../lib/auth/useAuthProtectedPage";

interface Props {
  task: Task;
}

const TaskPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const sidebar = <MiniRoadmap activeTaskId={props.task.id} />;
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();

  const backButton = (
    <Link href="/roadmap" passHref>
      <a href="/roadmap" data-back-to-roadmap className="fdr fac">
        <Icon>arrow_back</Icon> {TaskDefaults.backToRoadmapText}
      </a>
    </Link>
  );

  const getTaskFromRoadmap = (): Task | undefined => {
    const stepInRoadmap = roadmap?.steps.find((step) => step.tasks.find((task) => task.id === props.task.id));
    return stepInRoadmap?.tasks.find((task) => task.id === props.task.id);
  };

  const getModifiedTaskContent = (field: keyof Task): string => {
    const taskInRoadmap = getTaskFromRoadmap();
    if (taskInRoadmap && taskInRoadmap[field] !== props.task[field]) {
      return taskInRoadmap[field];
    }
    return props.task[field];
  };

  const updateTaskProgress = (newValue: TaskProgress): void => {
    if (!userData) return;
    update({
      ...userData,
      taskProgress: { ...userData?.taskProgress, [props.task.id]: newValue },
    });
  };

  return (
    <PageSkeleton>
      <SidebarPageLayout sidebar={sidebar} backButton={backButton} pageTitle={TaskDefaults.pageTitle}>
        <div className="grid-container padding-0 margin-bottom-1">
          <div className="grid-row grid-gap">
            <div className="tablet:grid-col-9">
              <h2 className="margin-top-0 margin-bottom-0" data-task-id={props.task.id}>
                {props.task.name}
              </h2>
            </div>
            <div className="tablet:grid-col-3">
              <TaskProgressDropdown
                onSelect={updateTaskProgress}
                initialValue={userData?.taskProgress ? userData.taskProgress[props.task.id] : undefined}
              />
            </div>
          </div>
        </div>
        <Content>{getModifiedTaskContent("contentMd")}</Content>

        {getModifiedTaskContent("callToActionLink") && (
          <div className="fdr">
            <a
              href={getModifiedTaskContent("callToActionLink")}
              target="_blank"
              rel="noreferrer noopener"
              className="mla margin-top-4 margin-bottom-8"
            >
              <button className="usa-button">
                {getModifiedTaskContent("callToActionText") || TaskDefaults.defaultCallToActionText}
              </button>
            </a>
          </div>
        )}
      </SidebarPageLayout>
    </PageSkeleton>
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
