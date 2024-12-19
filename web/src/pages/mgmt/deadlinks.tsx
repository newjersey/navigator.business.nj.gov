import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { Heading } from "@/components/njwds-extended/Heading";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { findDeadContextualInfo, findDeadTasks } from "@/lib/static/admin/findDeadLinks";

import { getMergedConfig } from "@/contexts/configContext";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useState } from "react";

interface Props {
  deadTasks: string[];
  deadContextualInfo: string[];
  noAuth: boolean;
}

const DeadLinksPage = (props: Props): ReactElement<any> => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const config = getMergedConfig();

  const authedView = (
    <>
      <h1>Dead Content</h1>
      <Heading level={2} data-testid="dl-task-header">
        Tasks not referenced in any roadmap:
      </Heading>
      <ul>
        {props.deadTasks.map((task, i) => {
          return <li key={i}>{task}</li>;
        })}
      </ul>
      <Heading level={2}>Contextual infos not referenced anywhere:</Heading>
      <ul>
        {props.deadContextualInfo.map((info, i) => {
          return <li key={i}>{info}</li>;
        })}
      </ul>
    </>
  );

  return (
    <PageSkeleton>
      <NextSeo title={getNextSeoTitle(config.pagesMetadata.deadLinksTitle)} noindex={true} />
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
