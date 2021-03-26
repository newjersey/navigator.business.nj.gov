import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";
import { PageSkeleton } from "../../components/PageSkeleton";
import { getAllTaskIds, getTaskById, TaskIdParam } from "../../lib/static/loadTasks";
import { Task } from "../../lib/types/types";
import Link from "next/link";
import { SidebarPageLayout } from "../../components/njwds-extended/SidebarPageLayout";
import { MiniRoadmap } from "../../components/MiniRoadmap";
import { useRoadmap } from "../../lib/data/useRoadmap";

interface Props {
  task: Task;
}

const TaskPage = (props: Props): ReactElement => {
  const sidebar = <MiniRoadmap activeTaskId={props.task.id} />;
  const { roadmap } = useRoadmap();

  const backButton = (
    <Link href="/roadmap" passHref>
      <a href="/roadmap">← Back to Roadmap</a>
    </Link>
  );

  const getDescription = (): string => {
    const stepInRoadmap = roadmap?.steps.find((step) => step.tasks.find((task) => task.id === props.task.id));
    const taskInRoadmap = stepInRoadmap?.tasks.find((task) => task.id === props.task.id);

    if (taskInRoadmap && taskInRoadmap.description !== props.task.description) {
      return taskInRoadmap.description;
    }

    return props.task.description;
  };

  return (
    <PageSkeleton>
      <SidebarPageLayout sidebar={sidebar} backButton={backButton}>
        <h2>{props.task.name}</h2>
        <p>{getDescription()}</p>

        {props.task.to_complete_must_have.length > 0 && (
          <>
            <p>To complete this step, you must have:</p>
            <ul>
              {props.task.to_complete_must_have.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </>
        )}

        {props.task.after_completing_will_have.length > 0 && (
          <>
            <p>After you complete this step, you will have:</p>
            <ul>
              {props.task.after_completing_will_have.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </>
        )}

        {props.task.destination.name && (
          <div className="padding-2 border-base-lighter border-1px font-body-2xs">
            Destination: <strong>{props.task.destination.name}</strong>
          </div>
        )}

        {props.task.destination.link && (
          <div className="fdr">
            <Link href={props.task.destination.link}>
              <button className="usa-button mla margin-top-4 margin-bottom-8">Start Application</button>
            </Link>
          </div>
        )}
      </SidebarPageLayout>
    </PageSkeleton>
  );
};

export const getStaticPaths = async (): Promise<GetStaticPathsResult<TaskIdParam>> => {
  const paths = getAllTaskIds();
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
      task: getTaskById(params.taskId),
    },
  };
};

export default TaskPage;
