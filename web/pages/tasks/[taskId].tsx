import { GetStaticPaths, GetStaticPathsResult, GetStaticProps, GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";
import { PageSkeleton } from "../../components/PageSkeleton";
import { getAllTaskIds, getTaskById, TaskIdParam } from "../../lib/static/loadTasks";
import { Task } from "../../lib/types/types";
import Link from "next/link";
import { SidebarPageLayout } from "../../components/njwds-extended/SidebarPageLayout";
import { useUserData } from "../../lib/data/useUserData";
import { getRoadmapUrl } from "../../lib/form-helpers/getRoadmapUrl";

interface Props {
  task: Task;
}

const TaskPage = (props: Props): ReactElement => {
  const { userData } = useUserData();

  const roadmapUrl = userData ? getRoadmapUrl(userData.formData) : "/";

  const sidebar = <></>;

  const backButton = (
    <Link href={roadmapUrl} passHref>
      <a href={roadmapUrl}>← Back to Roadmap</a>
    </Link>
  );

  return (
    <PageSkeleton>
      <SidebarPageLayout sidebar={sidebar} backButton={backButton}>
        <h1>{props.task.name}</h1>
        <p>{props.task.description}</p>

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
          <div className="padding-2 border-base-lightest border-1px">
            Destination: <strong>{props.task.destination.name}</strong>
          </div>
        )}

        {props.task.destination.link && (
          <Link href={props.task.destination.link}>
            <button className="usa-button float-right">Start Application</button>
          </Link>
        )}
      </SidebarPageLayout>
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
