import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { findDeadContextualInfo, findDeadTasks } from "@/lib/static/admin/findDeadLinks";

import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useState } from "react";

interface Props {
  deadTasks: string[];
  deadContextualInfo: string[];
  noAuth: boolean;
}

const DeadLinksPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const authedView = (
    <>
      <h1>Dead Content</h1>
      <h2 data-testid="dl-task-header">Tasks not referenced in any roadmap:</h2>
      <ul>
        {props.deadTasks.map((task, i) => {
          return <li key={i}>{task}</li>;
        })}
      </ul>
      <h2>Contextual infos not referenced anywhere:</h2>
      <ul>
        {props.deadContextualInfo.map((info, i) => {
          return <li key={i}>{info}</li>;
        })}
      </ul>
    </>
  );

  return (
    <PageSkeleton>
      <NextSeo noindex={true} />
      <main>
        <SingleColumnContainer>
          {isAuthed ? (
            authedView
          ) : (
            <MgmtAuth password={password} setIsAuthed={setIsAuthed} setPassword={setPassword} />
          )}
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export const getServerSideProps = async (): Promise<GetServerSidePropsResult<Props>> => {
  const buildCheckDeadPages =
    (process.env.CHECK_DEAD_LINKS && process.env.CHECK_DEAD_LINKS === "true") || false;
  return buildCheckDeadPages
    ? {
        props: {
          deadTasks: await findDeadTasks(),
          deadContextualInfo: await findDeadContextualInfo(),
          noAuth: true,
        },
      }
    : { notFound: true };
};

export default DeadLinksPage;
