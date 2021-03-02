import { GetStaticPaths, GetStaticPathsResult, GetStaticProps, GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";
import { PageSkeleton } from "../../components/PageSkeleton";
import { getAllTaskIds, getTaskById, TaskIdParam } from "../../lib/static/loadTasks";
import { TasksEntity } from "../../lib/types/Roadmap";
import { TaskLayout } from "../../components/TaskLayout";
import Link from "next/link";

interface Props {
  task: TasksEntity;
}

const TaskPage = (props: Props): ReactElement => {
  return (
    <PageSkeleton>
      <TaskLayout>
        <h1>{props.task.name}</h1>
        <p>{props.task.description}</p>

        <p>To complete this step, you must have:</p>
        <ul>
          {props.task.to_complete_must_have.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>

        <p>After you complete this step, you will have:</p>
        <ul>
          {props.task.after_completing_will_have.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>

        <Link href={props.task.destination.link}>
          <button className="usa-button">Complete form</button>
        </Link>
      </TaskLayout>
    </PageSkeleton>
  );
};

export const getStaticPaths: GetStaticPaths = async (): Promise<GetStaticPathsResult<TaskIdParam>> => {
  const paths = getAllTaskIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({
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
